"""
Smoke tests contro il Managed MySQL (tabelle *_photoshotai).

Richiede DATABASE_URL oppure MY_PASSWORD (+ opzionale MY_HOST).
Non cancellano dati di produzione: usano ID/device_id sintetici e li ripuliscono a fine test.
"""

from __future__ import annotations

import os
import ssl
import uuid
from urllib.parse import quote_plus

import pytest
import pytest_asyncio
from sqlalchemy import delete, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

_PASSWORD = os.environ.get("MY_PASSWORD")
_HOST = os.environ.get(
    "MY_HOST", "db-mysql-fra1-09501-do-user-24280960-0.l.db.ondigitalocean.com"
)

if os.environ.get("DATABASE_URL"):
    _DB_URL = os.environ["DATABASE_URL"]
elif _PASSWORD:
    _DB_URL = (
        f"mysql+aiomysql://doadmin:{quote_plus(_PASSWORD)}"
        f"@{_HOST}:25060/defaultdb?charset=utf8mb4"
    )
    os.environ.setdefault("DATABASE_URL", _DB_URL)
else:
    pytest.skip(
        "Imposta DATABASE_URL oppure MY_PASSWORD per i smoke test MySQL",
        allow_module_level=True,
    )

os.environ.setdefault("DATABASE_SSL_REJECT_UNAUTHORIZED", "false")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-mysql-smoke")
os.environ.setdefault("WAVESPEED_API_KEY", "test-wavespeed-key")
os.environ.setdefault("ENVIRONMENT", "development")

from app.models import (  # noqa: E402
    FreeGenerationLog,
    Generation,
    Product,
    ProductShooting,
    StoredFile,
    User,
    generate_uuid,
)
from app.utils import check_free_generation_limit, reserve_free_generation_slot  # noqa: E402


def _ssl_ctx() -> ssl.SSLContext:
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


@pytest_asyncio.fixture
async def db():
    engine = create_async_engine(
        _DB_URL if _DB_URL.startswith("mysql+aiomysql://") else _DB_URL.replace(
            "mysql://", "mysql+aiomysql://", 1
        ),
        poolclass=NullPool,
        connect_args={"ssl": _ssl_ctx()},
    )
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        try:
            yield session
        finally:
            await session.rollback()
    await engine.dispose()


@pytest.mark.asyncio
async def test_connect_and_select_one(db):
    result = await db.execute(text("SELECT 1 AS n"))
    assert result.scalar() == 1


@pytest.mark.asyncio
async def test_photoshotai_tables_have_migrated_data(db):
    users = await db.scalar(select(func.count()).select_from(User))
    gens = await db.scalar(select(func.count()).select_from(Generation))
    products = await db.scalar(select(func.count()).select_from(Product))
    files = await db.scalar(select(func.count()).select_from(StoredFile))
    assert users and users >= 200
    assert gens and gens >= 100
    assert products and products >= 10
    assert files and files >= 400


@pytest.mark.asyncio
async def test_read_user_and_json_product_shooting(db):
    user = (await db.execute(select(User).limit(1))).scalar_one()
    assert user.id
    assert "@" in user.email

    shooting = (await db.execute(select(ProductShooting).limit(1))).scalar_one_or_none()
    if shooting is not None:
        assert isinstance(shooting.prompts, (list, dict))


@pytest.mark.asyncio
async def test_stored_file_blob_readable(db):
    row = (
        await db.execute(select(StoredFile.content_type, StoredFile.id).limit(1))
    ).one()
    assert row[0]
    length = await db.scalar(
        select(func.length(StoredFile.content)).where(StoredFile.id == row[1])
    )
    assert length and length > 0


@pytest.mark.asyncio
async def test_reserve_free_generation_slot_atomic(db):
    device_id = f"test-device-{uuid.uuid4()}"
    ip_address = "203.0.113.99"

    try:
        ok1 = await reserve_free_generation_slot(db, device_id, ip_address)
        assert ok1 is True
        await db.flush()

        ok2 = await reserve_free_generation_slot(db, device_id, ip_address)
        assert ok2 is False

        can, count = await check_free_generation_limit(db, device_id, ip_address)
        assert can is False
        assert count == 1
    finally:
        await db.execute(
            delete(FreeGenerationLog).where(
                FreeGenerationLog.device_id == device_id,
                FreeGenerationLog.ip_address == ip_address,
            )
        )
        await db.commit()


@pytest.mark.asyncio
async def test_create_and_delete_temp_user(db):
    email = f"mysql-smoke-{uuid.uuid4().hex[:10]}@example.com"
    user = User(
        id=generate_uuid(),
        email=email,
        password_hash="not-a-real-hash",
        credits_balance=0,
        email_verified=False,
    )
    db.add(user)
    await db.commit()

    found = (await db.execute(select(User).where(User.email == email))).scalar_one()
    assert found.email == email

    await db.execute(delete(User).where(User.email == email))
    await db.commit()
    gone = (
        await db.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    assert gone is None
