import tempfile
import ssl
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings


def get_ssl_config():
    """SSL con CA personalizzato: solo se ca_certificate è impostato e vogliamo verificare."""
    if not settings.ca_certificate or not settings.database_ssl_reject_unauthorized:
        return {}
    temp_cert_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.pem')
    temp_cert_file.write(settings.ca_certificate)
    temp_cert_file.flush()
    temp_cert_file.close()
    ssl_context = ssl.create_default_context(cafile=temp_cert_file.name)
    return {"ssl": ssl_context}


# Build connection args for asyncpg
connect_args = get_ssl_config()

# Render fornisce DATABASE_URL come postgresql:// → usiamo asyncpg (postgresql+asyncpg://).
_db_url = settings.database_url
if _db_url.startswith("postgresql://") and not _db_url.startswith("postgresql+"):
    _db_url = "postgresql+asyncpg://" + _db_url[len("postgresql://"):]

# Rimuovi parametri SSL dalla URL per evitar conflitti con connect_args (come in Node/pg).
# asyncpg non usa sslmode; gestiamo SSL solo via connect_args.
_SSL_PARAMS = ("sslmode", "ssl_mode", "ssl", "sslcert", "sslkey", "sslrootcert", "sslcrl")
need_ssl = False
parsed = urlparse(_db_url)
if parsed.query:
    q = parse_qs(parsed.query, keep_blank_values=True)
    for k in ("sslmode", "ssl_mode"):
        if k in q:
            v = (q.pop(k) or [""])[0]
            if str(v).lower() in ("require", "verify-full", "verify-ca"):
                need_ssl = True
            break
    for k in _SSL_PARAMS:
        q.pop(k, None)
    new_q = urlencode(q, doseq=True)
    _db_url = urlunparse(parsed._replace(query=new_q))

# In produzione abilita sempre SSL (es. Render)
if settings.environment == "production":
    need_ssl = True

if need_ssl and "ssl" not in connect_args:
    if not settings.database_ssl_reject_unauthorized:
        # Accetta certificati self-signed (es. PostgreSQL su Render)
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        connect_args = {**connect_args, "ssl": ctx}
    else:
        connect_args = {**connect_args, "ssl": True}

engine = create_async_engine(
    _db_url,
    echo=settings.environment == "development",
    future=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
