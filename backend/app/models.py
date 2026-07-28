from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    Text,
    Index,
    LargeBinary,
    CheckConstraint,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users_photoshotai"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(512), unique=True, index=True, nullable=False)
    password_hash = Column(String(512), nullable=False)
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

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users_photoshotai.id"), nullable=False)
    change_amount = Column(Integer, nullable=False)  # Positive for purchase, negative for usage
    type = Column(String(512), nullable=False)  # "purchase", "generation", "adjust"
    reference_id = Column(String(512), nullable=True)  # Links to generation_id or purchase_id
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="credit_transactions")


class BrandIdentity(Base):
    __tablename__ = "brand_identities_photoshotai"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users_photoshotai.id"), nullable=False, unique=True)
    average_customer = Column(Text, nullable=True)
    sales_channels = Column(Text, nullable=True)
    price_range = Column(Text, nullable=True)
    lighting_style = Column(Text, nullable=True)
    photo_style = Column(JSON, nullable=True)
    color_palette = Column(JSON, nullable=True)
    brand_notes = Column(Text, nullable=True)
    analysis_text = Column(Text, nullable=True)
    analysis_version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="brand_identity")
    images = relationship(
        "BrandIdentityImage", back_populates="brand_identity", cascade="all, delete-orphan"
    )


class BrandIdentityImage(Base):
    __tablename__ = "brand_identity_images_photoshotai"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    brand_identity_id = Column(
        String(36), ForeignKey("brand_identities_photoshotai.id"), nullable=False
    )
    user_id = Column(String(36), ForeignKey("users_photoshotai.id"), nullable=False)
    image_url = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    brand_identity = relationship("BrandIdentity", back_populates="images")


class Product(Base):
    __tablename__ = "products_photoshotai"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users_photoshotai.id"), nullable=False)
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

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products_photoshotai.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users_photoshotai.id"), nullable=False)
    image_url = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="images")


class ProductShooting(Base):
    __tablename__ = "product_shootings_photoshotai"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users_photoshotai.id"), nullable=False)
    product_id = Column(
        String(36), ForeignKey("products_photoshotai.id", ondelete="SET NULL"), nullable=True
    )
    reference_image_url = Column(Text, nullable=False)
    shooting_style = Column(Text, nullable=True)
    prompts = Column(JSON, nullable=False)  # list of strings
    status = Column(String(50), default="pending")  # pending, processing, completed, partial, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="product_shootings")
    product = relationship("Product", back_populates="product_shootings")
    generations = relationship(
        "Generation",
        back_populates="shooting_session",
        foreign_keys="Generation.shooting_session_id",
    )


class Generation(Base):
    __tablename__ = "generations_photoshotai"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users_photoshotai.id"), nullable=True)
    device_id = Column(String(512), nullable=True, index=True)
    ip_address = Column(String(512), nullable=True, index=True)
    input_image_url = Column(String(512), nullable=False)
    output_image_url = Column(String(512), nullable=True)
    prompt = Column(Text, nullable=False)
    model_name = Column(String(512), default="nano-banana-pro/edit-ultra")
    resolution = Column(String(512), default="8k")
    aspect_ratio = Column(String(512), default="1:1")
    is_free = Column(Boolean, default=False)
    status = Column(String(512), default="pending")  # "pending", "processing", "completed", "failed"
    error_message = Column(Text, nullable=True)
    wavespeed_request_id = Column(String(255), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    product_id = Column(
        String(36), ForeignKey("products_photoshotai.id", ondelete="SET NULL"), nullable=True
    )
    product_name_snapshot = Column(Text, nullable=True)
    apply_brand_identity = Column(Boolean, default=False, nullable=False)
    brand_identity_snapshot = Column(JSON, nullable=True)
    product_prompt_snapshot = Column(Text, nullable=True)
    final_prompt = Column(Text, nullable=True)
    input_params = Column(JSON, nullable=True)
    shooting_session_id = Column(
        String(36),
        ForeignKey("product_shootings_photoshotai.id", ondelete="SET NULL"),
        nullable=True,
    )

    user = relationship("User", back_populates="generations")
    product = relationship("Product", back_populates="generations")
    shooting_session = relationship(
        "ProductShooting", back_populates="generations", foreign_keys=[shooting_session_id]
    )

    __table_args__ = (
        Index("idx_generations_user_created_photoshotai", "user_id", "created_at"),
    )


class FreeGenerationLog(Base):
    """
    Contatore generazioni free per (device_id, ip_address, month_year).
    L'unico incremento ammesso è via reserve_free_generation_slot (UPDATE atomico).
    Vincolo DB: count <= 1 (allineato a free_generations_per_month) come rete di sicurezza.
    """

    __tablename__ = "free_generation_log_photoshotai"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    device_id = Column(String(255), nullable=False, index=True)
    ip_address = Column(String(64), nullable=False, index=True)
    month_year = Column(String(7), nullable=False)  # Format: "2024-01"
    count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index(
            "idx_free_gen_device_ip_month_photoshotai",
            "device_id",
            "ip_address",
            "month_year",
            unique=True,
        ),
        CheckConstraint("count <= 1", name="chk_free_gen_count_max_photoshotai"),
    )


class StoredFile(Base):
    """File salvati nel DB (foto prodotti, generazioni, brand identity) per persistenza senza S3."""

    __tablename__ = "stored_files_photoshotai"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    path_key = Column(Text, nullable=True)
    content = Column(LargeBinary, nullable=False)
    content_type = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
