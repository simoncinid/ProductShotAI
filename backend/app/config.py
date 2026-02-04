import json
from pydantic import Field, AliasChoices, field_validator
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
    storage_type: str = "auto"  # "auto" | "database" | "local" | "s3". auto = S3 se configurato, altrimenti database (persistente, gratis)
    storage_path: str = "./storage"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    s3_bucket_name: str = ""
    # URL pubblici per API esterne (es. WaveSpeed). Obbligatori per evitare "image url is not allowed":
    # - LOCAL: public_base_url = https://tuo-backend.onrender.com (URL assoluto /storage/...)
    # - S3: cloudfront_domain = d1q70pf5vjeyhc.cloudfront.net (opzionale, altrimenti si usa URL S3 diretto)
    public_base_url: str = ""   # per storage_type=local
    cloudfront_domain: str = "" # per storage_type=s3 (es. d1q70pf5vjeyhc.cloudfront.net, senza https://)
    
    # App
    environment: str = "development"
    cors_origins: str = Field(
        default="http://localhost:3000",
        validation_alias=AliasChoices("CORS_ORIGIN", "CORS_ORIGINS"),
    )

    def get_cors_origins_list(self) -> List[str]:
        return _parse_list_str(self.cors_origins)

    def is_s3_configured(self) -> bool:
        """True se le variabili S3 sono tutte impostate (per storage persistente)."""
        return bool(
            self.s3_bucket_name and self.aws_access_key_id and self.aws_secret_access_key
        )

    def get_effective_storage_type(self) -> str:
        """'database' = persistente nel DB (gratis), 's3' = S3, 'local' = filesystem (effimero su Render)."""
        if self.storage_type in ("database", "db"):
            return "database"
        if self.storage_type == "s3" or (
            self.storage_type == "auto" and self.is_s3_configured()
        ):
            return "s3"
        if self.storage_type == "local":
            return "local"
        # auto senza S3: database (persistente e senza costi)
        return "database"
    
    # Free tier
    free_generations_per_month: int = 1
    
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

    # Gmail SMTP (verification OTP)
    gmail_user: str = ""
    gmail_pass: str = ""

    def get_allowed_image_types_list(self) -> List[str]:
        return _parse_list_str(self.allowed_image_types)
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
