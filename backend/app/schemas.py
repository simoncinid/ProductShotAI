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
    resolution: str = Field(default="4k", pattern="^(4k|8k)$")  # 4k=1 credito, 8k=2 crediti
    device_id: Optional[str] = None
    # Brand Identity & Product (solo per utenti loggati)
    product_id: Optional[str] = None
    apply_brand_identity: Optional[bool] = None  # usato solo quando product_id è null (NO PRODUCT)
    user_prompt_input: Optional[str] = None     # testo libero aggiuntivo in /create


class GenerateResponse(BaseModel):
    generation_id: str
    status: str
    output_image_url: Optional[str] = None
    error_message: Optional[str] = None


class PromptEditRequest(BaseModel):
    original_prompt: str = Field(..., max_length=8000)
    edit_instructions: str = Field(..., min_length=1, max_length=2000)


class PromptEditResponse(BaseModel):
    edited_prompt: str


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
    product_id: Optional[str] = None
    product_name_snapshot: Optional[str] = None
    apply_brand_identity: bool = False
    final_prompt: Optional[str] = None
    
    class Config:
        from_attributes = True


class GenerationHistoryResponse(BaseModel):
    items: list[GenerationHistoryItem]
    total: int
    page: int
    page_size: int


# --- Brand Identity ---
class BrandIdentityImageOut(BaseModel):
    id: str
    image_url: str
    created_at: datetime
    class Config:
        from_attributes = True


class BrandIdentityUpdate(BaseModel):
    average_customer: Optional[str] = None
    sales_channels: Optional[str] = None
    price_range: Optional[str] = None
    lighting_style: Optional[str] = None
    photo_style: Optional[dict] = None
    color_palette: Optional[dict] = None
    brand_notes: Optional[str] = None
    analysis_text: Optional[str] = None


class BrandIdentityResponse(BaseModel):
    id: str
    user_id: str
    average_customer: Optional[str] = None
    sales_channels: Optional[str] = None
    price_range: Optional[str] = None
    lighting_style: Optional[str] = None
    photo_style: Optional[dict] = None
    color_palette: Optional[dict] = None
    brand_notes: Optional[str] = None
    analysis_text: Optional[str] = None
    analysis_version: int = 1
    images: list[BrandIdentityImageOut] = []
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# --- Products ---
class ProductImageOut(BaseModel):
    id: str
    image_url: str
    created_at: datetime
    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    default_apply_brand_identity: bool = True
    product_prompt: str


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    default_apply_brand_identity: Optional[bool] = None
    product_prompt: Optional[str] = None
    analysis_text: Optional[str] = None


class ProductListItem(BaseModel):
    id: str
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    default_apply_brand_identity: bool
    created_at: datetime
    class Config:
        from_attributes = True


class ProductDetailResponse(BaseModel):
    id: str
    user_id: str
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    default_apply_brand_identity: bool
    product_prompt: str
    analysis_text: Optional[str] = None
    analysis_version: int = 1
    images: list[ProductImageOut] = []
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
