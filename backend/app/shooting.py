"""
API Product Shooting: genera prompt via OpenAI, crea shooting e N generations (WaveSpeed).
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from typing import List, Optional

from app.database import get_db
from app.auth import get_current_user
from app.models import User, Product, BrandIdentity, Generation, ProductShooting
from app.prompt_composer import compose_final_prompt, brand_identity_to_snapshot
from app import wavespeed, utils
from app.storage import get_storage_adapter
from app.config import settings
from app.shooting_prompts import generate_shooting_prompts

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/shooting", tags=["shooting"])


def _ensure_absolute_image_url(url: str) -> str:
    return utils.ensure_absolute_image_url(url)


def _get_wavespeed_webhook_url() -> str:
    base = (settings.public_base_url or "").rstrip("/")
    if not base or not base.startswith("https://"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PUBLIC_BASE_URL non configurato (HTTPS).",
        )
    return f"{base}/api/webhooks/wavespeed"


class ShootingPromptsRequest(BaseModel):
    product_id: str
    shooting_style: str = Field(default="Mix: studio, detail zooms, lifestyle", max_length=500)
    count: int = Field(default=4, ge=2, le=10)


class ShootingPromptsResponse(BaseModel):
    prompts: List[str]


class ShootingGenerateRequest(BaseModel):
    product_id: str
    reference_image_url: str
    prompts: List[str] = Field(..., min_length=2, max_length=10)
    aspect_ratio: str = Field(default="1:1", pattern="^(1:1|4:5|16:9)$")


class ShootingGenerateResponse(BaseModel):
    shooting_id: str
    generation_ids: List[str]


@router.post("/prompts", response_model=ShootingPromptsResponse)
async def create_shooting_prompts(
    body: ShootingPromptsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Genera N prompt dettagliati in inglese via OpenAI (product + brand identity + shooting_style)."""
    r = await db.execute(
        select(Product).where(Product.id == body.product_id, Product.user_id == current_user.id)
    )
    product = r.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    brand_snapshot = None
    brand_analysis = None
    if product.default_apply_brand_identity:
        rbi = await db.execute(select(BrandIdentity).where(BrandIdentity.user_id == current_user.id))
        bi = rbi.scalar_one_or_none()
        if bi:
            brand_snapshot = brand_identity_to_snapshot(bi)
            brand_analysis = bi.analysis_text

    prompts = await generate_shooting_prompts(
        product_name=product.name,
        product_prompt=product.product_prompt,
        product_analysis=product.analysis_text,
        brand_identity_snapshot=brand_snapshot,
        shooting_style=body.shooting_style,
        count=body.count,
    )
    return ShootingPromptsResponse(prompts=prompts[: body.count])


@router.post("/generate", response_model=ShootingGenerateResponse)
async def generate_shooting(
    request: Request,
    body: ShootingGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Crea un ProductShooting e N Generation, avvia N task WaveSpeed. Richiede N crediti."""
    n = len(body.prompts)
    if current_user.credits_balance < n:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient credits. Need {n} credits, you have {current_user.credits_balance}.",
        )

    r = await db.execute(
        select(Product).where(Product.id == body.product_id, Product.user_id == current_user.id)
    )
    product = r.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    apply_bi = product.default_apply_brand_identity
    brand_snapshot = None
    brand_analysis = None
    if apply_bi:
        rbi = await db.execute(select(BrandIdentity).where(BrandIdentity.user_id == current_user.id))
        bi = rbi.scalar_one_or_none()
        if not bi:
            apply_bi = False
        else:
            brand_snapshot = brand_identity_to_snapshot(bi)
            brand_analysis = bi.analysis_text

    ip_address = utils.get_client_ip(request)
    ref_url_abs = _ensure_absolute_image_url(body.reference_image_url)
    webhook_url = _get_wavespeed_webhook_url()
    ws = wavespeed.get_wavespeed_client()

    shooting = ProductShooting(
        user_id=current_user.id,
        product_id=product.id,
        reference_image_url=body.reference_image_url,
        shooting_style=None,
        prompts=body.prompts,
        status="processing",
    )
    db.add(shooting)
    await db.flush()

    generation_ids = []
    for i, prompt_text in enumerate(body.prompts):
        final_prompt = compose_final_prompt(
            user_prompt_input=None,
            product_prompt=product.product_prompt,
            product_analysis_text=product.analysis_text,
            brand_identity_snapshot=brand_snapshot if apply_bi else None,
            brand_analysis_text=brand_analysis if apply_bi else None,
            base_prompt=prompt_text,
        )
        gen = Generation(
            user_id=current_user.id,
            ip_address=ip_address,
            input_image_url=body.reference_image_url,
            prompt=final_prompt,
            resolution="8k",
            aspect_ratio=body.aspect_ratio,
            is_free=False,
            status="pending",
            product_id=product.id,
            product_name_snapshot=product.name,
            apply_brand_identity=apply_bi,
            brand_identity_snapshot=brand_snapshot if apply_bi else None,
            product_prompt_snapshot=product.product_prompt,
            final_prompt=final_prompt,
            shooting_session_id=shooting.id,
        )
        db.add(gen)
        await db.flush()
        generation_ids.append(str(gen.id))

        try:
            gen.status = "processing"
            task_result = await ws.create_edit_task(
                image_url=ref_url_abs,
                prompt=final_prompt,
                resolution="8k",
                aspect_ratio=body.aspect_ratio,
                webhook_url=webhook_url,
            )
            gen.wavespeed_request_id = task_result.get("id")
        except Exception as e:
            logger.exception("WaveSpeed task %s failed for shooting %s: %s", i, shooting.id, e)
            gen.status = "failed"
            gen.error_message = str(e)

    await db.commit()

    return ShootingGenerateResponse(shooting_id=str(shooting.id), generation_ids=generation_ids)


@router.get("/{shooting_id}")
async def get_shooting(
    shooting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Dettaglio shooting con lista generations (id, status, output_image_url, prompt)."""
    r = await db.execute(
        select(ProductShooting).where(
            ProductShooting.id == shooting_id,
            ProductShooting.user_id == current_user.id,
        )
    )
    shooting = r.scalar_one_or_none()
    if not shooting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shooting not found")

    r2 = await db.execute(
        select(Generation)
        .where(Generation.shooting_session_id == shooting_id)
        .order_by(Generation.created_at)
    )
    generations = r2.scalars().all()

    completed = sum(1 for g in generations if g.status == "completed")
    failed = sum(1 for g in generations if g.status == "failed")
    if completed + failed == len(generations) and len(generations) > 0:
        shooting.status = "completed" if failed == 0 else "partial" if completed > 0 else "failed"
        await db.commit()

    return {
        "id": str(shooting.id),
        "product_id": str(shooting.product_id) if shooting.product_id else None,
        "reference_image_url": shooting.reference_image_url,
        "prompts": shooting.prompts,
        "status": shooting.status,
        "created_at": shooting.created_at,
        "generations": [
            {
                "id": str(g.id),
                "status": g.status,
                "output_image_url": g.output_image_url,
                "error_message": g.error_message,
                "prompt": g.final_prompt or g.prompt,
                "created_at": g.created_at,
            }
            for g in generations
        ],
    }
