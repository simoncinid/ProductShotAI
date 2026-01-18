import os
import uuid
from typing import Optional
from pathlib import Path
import aiofiles
from app.config import settings
import boto3
from botocore.exceptions import ClientError


class StorageAdapter:
    """Abstract storage adapter for S3-compatible storage"""
    
    async def upload_file(self, file_content: bytes, file_extension: str) -> str:
        """Upload file and return public URL"""
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
    
    def _get_file_path(self, filename: str) -> Path:
        return self.base_path / filename
    
    async def upload_file(self, file_content: bytes, file_extension: str) -> str:
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = self._get_file_path(filename)
        
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(file_content)
        
        return f"{self.base_url}/{filename}"
    
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
    
    async def upload_file(self, file_content: bytes, file_extension: str) -> str:
        filename = f"{uuid.uuid4()}{file_extension}"
        
        # boto3 is synchronous, but we can run it in executor if needed
        # For now, using sync calls as boto3 doesn't have async support
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=filename,
            Body=file_content,
            ContentType="image/jpeg" if file_extension == ".jpg" else "image/png"
        )
        
        return f"{self.base_url}/{filename}"
    
    async def download_file(self, url: str) -> bytes:
        # Extract key from URL
        key = url.split(".com/")[-1]
        
        response = self.s3_client.get_object(Bucket=self.bucket_name, Key=key)
        return response["Body"].read()
    
    async def delete_file(self, url: str) -> None:
        key = url.split(".com/")[-1]
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
        except ClientError:
            pass


def get_storage_adapter() -> StorageAdapter:
    """Factory function to get the appropriate storage adapter"""
    if settings.storage_type == "s3":
        return S3StorageAdapter(
            bucket_name=settings.s3_bucket_name,
            access_key_id=settings.aws_access_key_id,
            secret_access_key=settings.aws_secret_access_key,
            region=settings.aws_region
        )
    else:
        return LocalStorageAdapter(base_path=settings.storage_path)
