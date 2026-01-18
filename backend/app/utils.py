from datetime import datetime
from typing import Optional
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models import FreeGenerationLog
from app.config import settings


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    # Check X-Forwarded-For header (for proxies)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the first IP in the chain
        return forwarded_for.split(",")[0].strip()
    
    # Fallback to remote address
    if request.client:
        return request.client.host
    
    return "unknown"


def get_current_month_year() -> str:
    """Get current month-year string in format YYYY-MM"""
    now = datetime.now()
    return now.strftime("%Y-%m")


async def check_free_generation_limit(
    db: AsyncSession,
    device_id: str,
    ip_address: str
) -> tuple[bool, int]:
    """
    Check if user can make a free generation.
    Returns (can_generate, current_count)
    """
    month_year = get_current_month_year()
    
    # Try to get existing record
    result = await db.execute(
        select(FreeGenerationLog).where(
            FreeGenerationLog.device_id == device_id,
            FreeGenerationLog.ip_address == ip_address,
            FreeGenerationLog.month_year == month_year
        )
    )
    log_entry = result.scalar_one_or_none()
    
    if log_entry is None:
        # First generation this month
        return True, 0
    
    if log_entry.count >= settings.free_generations_per_month:
        return False, log_entry.count
    
    return True, log_entry.count


async def increment_free_generation_count(
    db: AsyncSession,
    device_id: str,
    ip_address: str
) -> None:
    """Increment free generation count for device+IP"""
    month_year = get_current_month_year()
    
    # Try to get existing record
    result = await db.execute(
        select(FreeGenerationLog).where(
            FreeGenerationLog.device_id == device_id,
            FreeGenerationLog.ip_address == ip_address,
            FreeGenerationLog.month_year == month_year
        )
    )
    log_entry = result.scalar_one_or_none()
    
    if log_entry is None:
        # Create new record
        log_entry = FreeGenerationLog(
            device_id=device_id,
            ip_address=ip_address,
            month_year=month_year,
            count=1
        )
        db.add(log_entry)
    else:
        log_entry.count += 1
    
    await db.commit()
