from datetime import datetime
from typing import Optional
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.dialects.postgresql import insert as pg_insert
from app.models import FreeGenerationLog
from app.config import settings


def ensure_absolute_image_url(url: str) -> str:
    """WaveSpeed richiede URL assoluti e pubblici. Converte /storage/... in base+url se serve."""
    if not url:
        return url
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("/") and settings.public_base_url:
        return settings.public_base_url.rstrip("/") + url
    return url


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
    """Increment free generation count for device+IP (standalone; prefer reserve_free_generation_slot for atomicity)."""
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


async def reserve_free_generation_slot(
    db: AsyncSession,
    device_id: str,
    ip_address: str
) -> bool:
    """
    Riserva atomically uno slot free per (device_id, ip_address) nel mese corrente.
    Esegue tutto nella transazione corrente (NON fa commit).
    Returns True se lo slot è stato riservato, False se limite già raggiunto.
    Usare nella stessa transazione in cui si crea la Generation per evitare race condition.
    """
    month_year = get_current_month_year()

    # Garantire che esista una riga da bloccare (INSERT count=0; poi incrementiamo sotto lock)
    stmt = pg_insert(FreeGenerationLog).values(
        device_id=device_id,
        ip_address=ip_address,
        month_year=month_year,
        count=0,
    ).on_conflict_do_nothing(index_elements=["device_id", "ip_address", "month_year"])
    await db.execute(stmt)

    # Blocca la riga e leggi/incrementa (SELECT FOR UPDATE)
    result = await db.execute(
        select(FreeGenerationLog)
        .where(
            FreeGenerationLog.device_id == device_id,
            FreeGenerationLog.ip_address == ip_address,
            FreeGenerationLog.month_year == month_year,
        )
        .with_for_update()
    )
    log_entry = result.scalar_one_or_none()
    if not log_entry:
        # Rara: riga inserita da un altro subito dopo l'insert; retry non richiesto, consideriamo limite raggiunto
        return False
    if log_entry.count >= settings.free_generations_per_month:
        return False
    log_entry.count += 1
    return True
