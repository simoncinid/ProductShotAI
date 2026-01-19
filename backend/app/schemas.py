from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


# Auth schemas
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    verify_password: str
    
    @validator("verify_password")
    def passwords_match(cls, v, values):
        if "password" in values and v != values.get("password"):
            raise ValueError("Passwords do not match")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SignupResponse(BaseModel):
    """Dopo signup: richiede verifica OTP via email."""
    require_verification: bool = True
    email: str


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^[0-9]{6}$")


class ResendOtpRequest(BaseModel):
    email: EmailStr


# User schemas
class UserResponse(BaseModel):
    id: str
    email: str
    credits_balance: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Upload schemas
class UploadResponse(BaseModel):
    image_url: str


# Generation schemas
class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    image_url: str
    aspect_ratio: str = Field(default="1:1", pattern="^(1:1|4:5|16:9)$")
    resolution: str = Field(default="8k", pattern="^(4k|8k)$")
    device_id: Optional[str] = None


class GenerateResponse(BaseModel):
    generation_id: str
    status: str
    output_image_url: Optional[str] = None
    error_message: Optional[str] = None


# Credit schemas
class CreditPack(BaseModel):
    id: str
    name: str
    credits: int
    price_per_credit: float
    total_price: float


class PurchaseRequest(BaseModel):
    pack_id: str = Field(..., pattern="^(starter|standard|pro|power)$")
    success_url: str  # URL a cui Stripe reindirizza dopo pagamento (es. https://tuosito.com/pricing?success=1)
    cancel_url: str   # URL a cui Stripe reindirizza se l'utente annulla (es. https://tuosito.com/pricing)


class PurchaseResponse(BaseModel):
    checkout_url: str  # URL Stripe Checkout per completare il pagamento


# Generation history
class GenerationHistoryItem(BaseModel):
    id: str
    input_image_url: str
    output_image_url: Optional[str]
    prompt: str
    resolution: str
    aspect_ratio: str
    is_free: bool
    status: str
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class GenerationHistoryResponse(BaseModel):
    items: list[GenerationHistoryItem]
    total: int
    page: int
    page_size: int
