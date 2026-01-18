from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    database_url: str
    ca_certificate: str = ""  # Optional CA certificate for SSL connection (full cert content with BEGIN/END)
    
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
    cors_origins: List[str] = ["http://localhost:3000"]
    
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
    allowed_image_types: List[str] = ["image/jpeg", "image/png"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
