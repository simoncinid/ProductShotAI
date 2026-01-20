from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID
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


class CreditTransaction(Base):
    __tablename__ = "credit_transactions_photoshotai"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users_photoshotai.id"), nullable=False)
    change_amount = Column(Integer, nullable=False)  # Positive for purchase, negative for usage
    type = Column(String, nullable=False)  # "purchase", "generation", "adjust"
    reference_id = Column(String, nullable=True)  # Links to generation_id or purchase_id
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="credit_transactions")


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
    
    user = relationship("User", back_populates="generations")
    
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
