from datetime import datetime
from typing import Optional
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from sqlalchemy.dialects.mysql import insert as mysql_insert
from app.models import FreeGenerationLog, generate_uuid
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
    """
    DEPRECATO: non usare. Incrementa il contatore senza atomicità (rischio race).
    L'unico punto che deve aggiornare il contatore è reserve_free_generation_slot (UPDATE atomico).
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
    Riserva atomicamente uno slot free per (device_id, ip_address) nel mese corrente.
    Usa un unico UPDATE condizionale (count < limit) così che solo una richiesta alla volta
    possa incrementare oltre il limite: niente race anche con richieste concorrenti.
    NON fa commit; usare nella stessa transazione in cui si crea la Generation.
    Returns True se lo slot è stato riservato, False se limite già raggiunto.
    """
    month_year = get_current_month_year()
    limit = settings.free_generations_per_month

    # Garantire che esista una riga (count=0) per il mese (MySQL INSERT IGNORE)
    stmt_insert = mysql_insert(FreeGenerationLog).values(
        id=generate_uuid(),
        device_id=device_id,
        ip_address=ip_address,
        month_year=month_year,
        count=0,
    ).prefix_with("IGNORE")
    await db.execute(stmt_insert)

    # Un solo UPDATE atomico: incrementa solo se count < limit. Solo una richiesta "vince".
    stmt_update = (
        update(FreeGenerationLog)
        .where(
            FreeGenerationLog.device_id == device_id,
            FreeGenerationLog.ip_address == ip_address,
            FreeGenerationLog.month_year == month_year,
            FreeGenerationLog.count < limit,
        )
        .values(count=FreeGenerationLog.count + 1)
    )
    result = await db.execute(stmt_update)
    return (result.rowcount or 0) > 0
