import os
import tempfile
import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings


def get_ssl_config():
    """Get SSL configuration for database connection with asyncpg"""
    if not settings.ca_certificate:
        return {}
    
    # Create temporary file for CA certificate
    # asyncpg requires a file path for CA certificate
    temp_cert_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.pem')
    temp_cert_file.write(settings.ca_certificate)
    temp_cert_file.flush()
    temp_cert_file.close()
    
    # Create SSL context for asyncpg
    # asyncpg accepts ssl as SSLContext or dict
    ssl_context = ssl.create_default_context(cafile=temp_cert_file.name)
    
    return {
        'ssl': ssl_context
    }


# Build connection args for asyncpg
connect_args = get_ssl_config()

engine = create_async_engine(
    settings.database_url,
    echo=settings.environment == "development",
    future=True,
    connect_args=connect_args
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
