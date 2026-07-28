import os
import uuid
from typing import Optional
from pathlib import Path
from urllib.parse import urlparse
import aiofiles
from app.config import settings
import boto3

# Mappa estensione -> Content-Type per upload S3
_EXTENSION_TO_CONTENT_TYPE = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def _content_type_for_extension(ext: str) -> str:
    return _EXTENSION_TO_CONTENT_TYPE.get(ext.lower(), "application/octet-stream")

from botocore.exceptions import ClientError


class StorageAdapter:
    """Abstract storage adapter for S3-compatible storage"""
    
    async def upload_file(self, file_content: bytes, file_extension: str, subpath: Optional[str] = None) -> str:
        """Upload file and return public URL. subpath: optional prefix (e.g. users/{user_id}/brand)."""
        raise NotImplementedError
    
    async def download_file(self, url: str) -> bytes:
        """Download file from URL and return bytes"""
        raise NotImplementedError
    
    async def delete_file(self, url: str) -> None:
        """Delete file from storage"""
        raise NotImplementedError


class LocalStorageAdapter(StorageAdapter):
    """Local filesystem storage adapter"""
    
    def __init__(self, base_path: str = "./storage"):
        self.base_path = Path(base_path).resolve()
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.base_url = "/storage"
    
    def _get_file_path(self, filename: str, subpath: Optional[str] = None) -> Path:
        if subpath:
            full = self.base_path / subpath.replace("..", "").strip("/")
            full.mkdir(parents=True, exist_ok=True)
            return full / filename
        return self.base_path / filename
    
    async def upload_file(self, file_content: bytes, file_extension: str, subpath: Optional[str] = None) -> str:
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = self._get_file_path(filename, subpath)
        
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(file_content)
        
        # Per WaveSpeed e altre API esterne servono URL assoluti e pubblici.
        # Con public_base_url (es. https://tuo-backend.onrender.com) si evita "image url is not allowed".
        url_path = f"{subpath}/{filename}" if subpath else filename
        if settings.public_base_url:
            base = settings.public_base_url.rstrip("/")
            return f"{base}/storage/{url_path}"
        return f"{self.base_url}/{url_path}"
    
    async def download_file(self, url: str) -> bytes:
        # Extract filename from URL
        filename = url.split("/")[-1]
        file_path = self._get_file_path(filename)
        
        async with aiofiles.open(file_path, "rb") as f:
            return await f.read()
    
    async def delete_file(self, url: str) -> None:
        filename = url.split("/")[-1]
        file_path = self._get_file_path(filename)
        if file_path.exists():
            file_path.unlink()


class S3StorageAdapter(StorageAdapter):
    """AWS S3 storage adapter"""
    
    def __init__(
        self,
        bucket_name: str,
        access_key_id: str,
        secret_access_key: str,
        region: str = "us-east-1"
    ):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name=region
        )
        self.base_url = f"https://{bucket_name}.s3.{region}.amazonaws.com"
    
    async def upload_file(self, file_content: bytes, file_extension: str, subpath: Optional[str] = None) -> str:
        filename = f"{uuid.uuid4()}{file_extension}"
        key = f"{subpath}/{filename}" if subpath else filename
        
        content_type = _content_type_for_extension(file_extension)
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=file_content,
            ContentType=content_type,
        )
        
        # CloudFront: URL pubblico tipo https://d1q70pf5vjeyhc.cloudfront.net/key (richiesto da WaveSpeed).
        # If not set, use direct S3 URL (already public).
        if settings.cloudfront_domain:
            domain = settings.cloudfront_domain.strip().rstrip("/")
            return f"https://{domain}/{key}"
        return f"{self.base_url}/{key}"
    
    def _url_to_key(self, url: str) -> str:
        """Estrae la key S3 da URL S3 (s3...amazonaws.com/key) o CloudFront (dxxx.cloudfront.net/key)."""
        return urlparse(url).path.lstrip("/")

    async def download_file(self, url: str) -> bytes:
        key = self._url_to_key(url)
        response = self.s3_client.get_object(Bucket=self.bucket_name, Key=key)
        return response["Body"].read()

    async def delete_file(self, url: str) -> None:
        key = self._url_to_key(url)
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
        except ClientError:
            pass


class DatabaseStorageAdapter(StorageAdapter):
    """Storage nel DB MySQL: foto persistenti senza costi S3 (ideale su Render)."""

    def _url_to_id(self, url: str) -> Optional[str]:
        """Estrae l'id del file da URL tipo .../api/storage/{id}."""
        if "/api/storage/" not in url:
            return None
        part = url.split("/api/storage/")[-1].strip("/").split("/")[0]
        return part if part else None

    async def upload_file(self, file_content: bytes, file_extension: str, subpath: Optional[str] = None) -> str:
        from app.database import AsyncSessionLocal
        from app.models import StoredFile

        content_type = _content_type_for_extension(file_extension)
        filename = f"{uuid.uuid4()}{file_extension}"
        path_key = f"{subpath}/{filename}" if subpath else filename

        async with AsyncSessionLocal() as db:
            row = StoredFile(
                path_key=path_key,
                content=file_content,
                content_type=content_type,
            )
            db.add(row)
            await db.commit()
            # expire_on_commit=False: id resta disponibile senza refresh
            # (refresh riaprirebbe una connessione e con aiomysql+pre_ping poteva crashare)
            file_id = row.id

        base = (settings.public_base_url or "").rstrip("/")
        if not base:
            return f"/api/storage/{file_id}"
        return f"{base}/api/storage/{file_id}"

    async def download_file(self, url: str) -> bytes:
        from app.database import AsyncSessionLocal
        from app.models import StoredFile
        from sqlalchemy import select

        file_id = self._url_to_id(url)
        if not file_id:
            raise FileNotFoundError(f"URL non valido per storage DB: {url}")
        async with AsyncSessionLocal() as db:
            r = await db.execute(select(StoredFile).where(StoredFile.id == file_id))
            row = r.scalar_one_or_none()
        if not row:
            raise FileNotFoundError(f"File non trovato: {file_id}")
        return bytes(row.content)

    async def delete_file(self, url: str) -> None:
        from app.database import AsyncSessionLocal
        from app.models import StoredFile
        from sqlalchemy import select

        file_id = self._url_to_id(url)
        if not file_id:
            return
        async with AsyncSessionLocal() as db:
            r = await db.execute(select(StoredFile).where(StoredFile.id == file_id))
            row = r.scalar_one_or_none()
            if row:
                await db.delete(row)
                await db.commit()


def get_storage_adapter() -> StorageAdapter:
    """Factory: database (persistente, gratis) > S3 se configurato > local (effimero su Render)."""
    effective = settings.get_effective_storage_type()
    if effective == "database":
        return DatabaseStorageAdapter()
    if effective == "s3":
        return S3StorageAdapter(
            bucket_name=settings.s3_bucket_name,
            access_key_id=settings.aws_access_key_id,
            secret_access_key=settings.aws_secret_access_key,
            region=settings.aws_region
        )
    return LocalStorageAdapter(base_path=settings.storage_path)
