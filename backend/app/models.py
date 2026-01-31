from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users_photoshotai"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    credits_balance = Column(Integer, default=0, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    verification_otp_hash = Column(String(255), nullable=True)
    verification_otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    credit_transactions = relationship("CreditTransaction", back_populates="user")
    generations = relationship("Generation", back_populates="user")
    brand_identity = relationship("BrandIdentity", back_populates="user", uselist=False)
    products = relationship("Product", back_populates="user")
    product_shootings = relationship("ProductShooting", back_populates="user")


class CreditTransaction(Base):
    __tablename__ = "credit_transactions_photoshotai"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users_photoshotai.id"), nullable=False)
    change_amount = Column(Integer, nullable=False)  # Positive for purchase, negative for usage
    type = Column(String, nullable=False)  # "purchase", "generation", "adjust"
    reference_id = Column(String, nullable=True)  # Links to generation_id or purchase_id
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="credit_transactions")


class BrandIdentity(Base):
    __tablename__ = "brand_identities_photoshotai"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users_photoshotai.id"), nullable=False, unique=True)
    average_customer = Column(Text, nullable=True)
    sales_channels = Column(Text, nullable=True)
    price_range = Column(Text, nullable=True)
    lighting_style = Column(Text, nullable=True)
    photo_style = Column(JSONB, nullable=True)
    color_palette = Column(JSONB, nullable=True)
    brand_notes = Column(Text, nullable=True)
    analysis_text = Column(Text, nullable=True)
    analysis_version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="brand_identity")
    images = relationship("BrandIdentityImage", back_populates="brand_identity", cascade="all, delete-orphan")


class BrandIdentityImage(Base):
    __tablename__ = "brand_identity_images_photoshotai"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    brand_identity_id = Column(UUID(as_uuid=False), ForeignKey("brand_identities_photoshotai.id"), nullable=False)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users_photoshotai.id"), nullable=False)
    image_url = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    brand_identity = relationship("BrandIdentity", back_populates="images")


class Product(Base):
    __tablename__ = "products_photoshotai"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users_photoshotai.id"), nullable=False)
    name = Column(Text, nullable=False)
    sku = Column(Text, nullable=True)
    category = Column(Text, nullable=True)
    default_apply_brand_identity = Column(Boolean, default=True, nullable=False)
    product_prompt = Column(Text, nullable=False)
    analysis_text = Column(Text, nullable=True)
    analysis_version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    generations = relationship("Generation", back_populates="product")
    product_shootings = relationship("ProductShooting", back_populates="product")


class ProductImage(Base):
    __tablename__ = "product_images_photoshotai"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    product_id = Column(UUID(as_uuid=False), ForeignKey("products_photoshotai.id"), nullable=False)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users_photoshotai.id"), nullable=False)
    image_url = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    product = relationship("Product", back_populates="images")


class ProductShooting(Base):
    __tablename__ = "product_shootings_photoshotai"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users_photoshotai.id"), nullable=False)
    product_id = Column(UUID(as_uuid=False), ForeignKey("products_photoshotai.id", ondelete="SET NULL"), nullable=True)
    reference_image_url = Column(Text, nullable=False)
    shooting_style = Column(Text, nullable=True)
    prompts = Column(JSONB, nullable=False)  # list of strings
    status = Column(String, default="pending")  # pending, processing, completed, partial, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="product_shootings")
    product = relationship("Product", back_populates="product_shootings")
    generations = relationship("Generation", back_populates="shooting_session", foreign_keys="Generation.shooting_session_id")


class Generation(Base):
    __tablename__ = "generations_photoshotai"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users_photoshotai.id"), nullable=True)
    device_id = Column(String, nullable=True, index=True)
    ip_address = Column(String, nullable=True, index=True)
    input_image_url = Column(String, nullable=False)
    output_image_url = Column(String, nullable=True)
    prompt = Column(Text, nullable=False)
    model_name = Column(String, default="nano-banana-pro/edit-ultra")
    resolution = Column(String, default="8k")
    aspect_ratio = Column(String, default="1:1")
    is_free = Column(Boolean, default=False)
    status = Column(String, default="pending")  # "pending", "processing", "completed", "failed"
    error_message = Column(Text, nullable=True)
    wavespeed_request_id = Column(String, nullable=True, index=True)  # id WaveSpeed per webhook
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    # Brand Identity & Product (migration)
    product_id = Column(UUID(as_uuid=False), ForeignKey("products_photoshotai.id", ondelete="SET NULL"), nullable=True)
    product_name_snapshot = Column(Text, nullable=True)
    apply_brand_identity = Column(Boolean, default=False, nullable=False)
    brand_identity_snapshot = Column(JSONB, nullable=True)
    product_prompt_snapshot = Column(Text, nullable=True)
    final_prompt = Column(Text, nullable=True)
    input_params = Column(JSONB, nullable=True)
    shooting_session_id = Column(UUID(as_uuid=False), ForeignKey("product_shootings_photoshotai.id", ondelete="SET NULL"), nullable=True)

    user = relationship("User", back_populates="generations")
    product = relationship("Product", back_populates="generations")
    shooting_session = relationship("ProductShooting", back_populates="generations", foreign_keys=[shooting_session_id])
    
    __table_args__ = (
        Index("idx_generations_user_created_photoshotai", "user_id", "created_at"),
    )


class FreeGenerationLog(Base):
    __tablename__ = "free_generation_log_photoshotai"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    device_id = Column(String, nullable=False, index=True)
    ip_address = Column(String, nullable=False, index=True)
    month_year = Column(String, nullable=False)  # Format: "2024-01"
    count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index("idx_free_gen_device_ip_month_photoshotai", "device_id", "ip_address", "month_year", unique=True),
    )
