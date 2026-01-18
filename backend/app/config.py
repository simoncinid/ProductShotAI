import json
from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import List


def _parse_list_str(s: str) -> List[str]:
    """Parse CORS_ORIGINS / ALLOWED_IMAGE_TYPES: comma-separated o JSON array."""
    if not s or not s.strip():
        return []
    s = s.strip()
    if s.startswith("["):
        try:
            return list(json.loads(s))
        except json.JSONDecodeError:
            pass
    return [x.strip() for x in s.split(",") if x.strip()]


class Settings(BaseSettings):
    # Database
    database_url: str
    ca_certificate: str = ""  # Optional CA certificate for SSL connection (full cert content with BEGIN/END)
    database_ssl_reject_unauthorized: bool = True  # Se False, accetta certificati self-signed (es. Render)

    @field_validator("database_ssl_reject_unauthorized", mode="before")
    @classmethod
    def _parse_reject_unauthorized(cls, v):
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.strip().lower() not in ("false", "0", "no", "off", "")
        return True

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # WaveSpeed API
    wavespeed_api_key: str
    
    # Storage
    storage_type: str = "local"  # "local" or "s3"
    storage_path: str = "./storage"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    s3_bucket_name: str = ""
    
    # App
    environment: str = "development"
    cors_origins: str = "http://localhost:3000"

    def get_cors_origins_list(self) -> List[str]:
        return _parse_list_str(self.cors_origins)
    
    # Free tier
    free_generations_per_month: int = 3
    
    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_starter: str = ""
    stripe_price_standard: str = ""
    stripe_price_pro: str = ""
    stripe_price_power: str = ""
    
    # Upload limits
    max_upload_size_mb: int = 10
    allowed_image_types: str = "image/jpeg,image/png"

    def get_allowed_image_types_list(self) -> List[str]:
        return _parse_list_str(self.allowed_image_types)
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
