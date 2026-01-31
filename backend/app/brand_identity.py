"""
API Brand Identity: CRUD e immagini (max 3), analisi stile.
Solo utenti autenticati; ownership verificata su ogni route.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.auth import get_current_user
from app.models import User, BrandIdentity, BrandIdentityImage
from app import schemas
from app.storage import get_storage_adapter
from app.config import settings
from app import analysis
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/brand-identity", tags=["brand-identity"])
MAX_IMAGES = 3


def _check_allowed_file(file: UploadFile) -> None:
    allowed = settings.get_allowed_image_types_list()
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed)}",
        )
    max_size = settings.max_upload_size_mb * 1024 * 1024
    # size checked after read


@router.get("", response_model=schemas.BrandIdentityResponse)
async def get_brand_identity(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Restituisce la brand identity dell'utente (se esiste) con immagini e analysis."""
    r = await db.execute(
        select(BrandIdentity).where(BrandIdentity.user_id == current_user.id)
    )
    bi = r.scalar_one_or_none()
    if not bi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand identity not found")
    # Load images
    r2 = await db.execute(
        select(BrandIdentityImage).where(BrandIdentityImage.brand_identity_id == bi.id).order_by(BrandIdentityImage.created_at)
    )
    images = r2.scalars().all()
    return schemas.BrandIdentityResponse(
        id=bi.id,
        user_id=bi.user_id,
        average_customer=bi.average_customer,
        sales_channels=bi.sales_channels,
        price_range=bi.price_range,
        lighting_style=bi.lighting_style,
        photo_style=bi.photo_style,
        color_palette=bi.color_palette,
        brand_notes=bi.brand_notes,
        analysis_text=bi.analysis_text,
        analysis_version=bi.analysis_version,
        images=[schemas.BrandIdentityImageOut(id=img.id, image_url=img.image_url, created_at=img.created_at) for img in images],
        created_at=bi.created_at,
        updated_at=bi.updated_at,
    )


@router.post("", response_model=schemas.BrandIdentityResponse)
async def create_or_update_brand_identity(
    body: schemas.BrandIdentityUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Crea o aggiorna la brand identity (campi testuali). Un solo record per utente."""
    r = await db.execute(select(BrandIdentity).where(BrandIdentity.user_id == current_user.id))
    bi = r.scalar_one_or_none()
    if bi:
        if body.average_customer is not None:
            bi.average_customer = body.average_customer
        if body.sales_channels is not None:
            bi.sales_channels = body.sales_channels
        if body.price_range is not None:
            bi.price_range = body.price_range
        if body.lighting_style is not None:
            bi.lighting_style = body.lighting_style
        if body.photo_style is not None:
            bi.photo_style = body.photo_style
        if body.color_palette is not None:
            bi.color_palette = body.color_palette
        if body.brand_notes is not None:
            bi.brand_notes = body.brand_notes
        if body.analysis_text is not None:
            bi.analysis_text = body.analysis_text
        db.add(bi)
    else:
        bi = BrandIdentity(
            user_id=current_user.id,
            average_customer=body.average_customer,
            sales_channels=body.sales_channels,
            price_range=body.price_range,
            lighting_style=body.lighting_style,
            photo_style=body.photo_style,
            color_palette=body.color_palette,
            brand_notes=body.brand_notes,
        )
        db.add(bi)
    await db.commit()
    await db.refresh(bi)
    r2 = await db.execute(
        select(BrandIdentityImage).where(BrandIdentityImage.brand_identity_id == bi.id).order_by(BrandIdentityImage.created_at)
    )
    images = r2.scalars().all()
    return schemas.BrandIdentityResponse(
        id=bi.id,
        user_id=bi.user_id,
        average_customer=bi.average_customer,
        sales_channels=bi.sales_channels,
        price_range=bi.price_range,
        lighting_style=bi.lighting_style,
        photo_style=bi.photo_style,
        color_palette=bi.color_palette,
        brand_notes=bi.brand_notes,
        analysis_text=bi.analysis_text,
        analysis_version=bi.analysis_version,
        images=[schemas.BrandIdentityImageOut(id=img.id, image_url=img.image_url, created_at=img.created_at) for img in images],
        created_at=bi.created_at,
        updated_at=bi.updated_at,
    )


@router.post("/images")
async def upload_brand_identity_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Carica un'immagine per la brand identity. Max 3 immagini totali."""
    _check_allowed_file(file)
    content = await file.read()
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.max_upload_size_mb}MB",
        )
    r = await db.execute(select(BrandIdentity).where(BrandIdentity.user_id == current_user.id))
    bi = r.scalar_one_or_none()
    if not bi:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create brand identity first before uploading images",
        )
    r2 = await db.execute(select(BrandIdentityImage).where(BrandIdentityImage.brand_identity_id == bi.id))
    existing = r2.scalars().all()
    if len(existing) >= MAX_IMAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_IMAGES} reference images allowed. Remove one before uploading.",
        )
    ext = ".jpg" if file.content_type == "image/jpeg" else ".png"
    subpath = f"users/{current_user.id}/brand"
    storage = get_storage_adapter()
    image_url = await storage.upload_file(content, ext, subpath=subpath)
    img = BrandIdentityImage(brand_identity_id=bi.id, user_id=current_user.id, image_url=image_url)
    db.add(img)
    await db.commit()
    await db.refresh(img)
    return {"id": img.id, "image_url": img.image_url, "created_at": img.created_at.isoformat()}


@router.delete("/images/{image_id}")
async def delete_brand_identity_image(
    image_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Rimuove un'immagine dalla brand identity. Ownership verificata."""
    r = await db.execute(
        select(BrandIdentityImage).join(BrandIdentity).where(
            BrandIdentityImage.id == image_id,
            BrandIdentity.user_id == current_user.id,
        )
    )
    img = r.scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    await db.delete(img)
    await db.commit()
    return {"message": "Image deleted"}


@router.post("/analyze", response_model=schemas.BrandIdentityResponse)
async def analyze_brand_identity(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Esegue l'analisi sulle immagini correnti e salva analysis_text."""
    r = await db.execute(select(BrandIdentity).where(BrandIdentity.user_id == current_user.id))
    bi = r.scalar_one_or_none()
    if not bi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand identity not found")
    r2 = await db.execute(select(BrandIdentityImage).where(BrandIdentityImage.brand_identity_id == bi.id))
    images = r2.scalars().all()
    urls = [img.image_url for img in images]
    if not urls:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload at least one reference image before analyzing",
        )
    from app.utils import ensure_absolute_image_url
    abs_urls = [ensure_absolute_image_url(u) for u in urls]
    analysis_text = await analysis.analyze_reference_images(abs_urls)
    bi.analysis_text = analysis_text
    bi.analysis_version = (bi.analysis_version or 1) + 1
    db.add(bi)
    await db.commit()
    await db.refresh(bi)
    r3 = await db.execute(
        select(BrandIdentityImage).where(BrandIdentityImage.brand_identity_id == bi.id).order_by(BrandIdentityImage.created_at)
    )
    imgs = r3.scalars().all()
    return schemas.BrandIdentityResponse(
        id=bi.id,
        user_id=bi.user_id,
        average_customer=bi.average_customer,
        sales_channels=bi.sales_channels,
        price_range=bi.price_range,
        lighting_style=bi.lighting_style,
        photo_style=bi.photo_style,
        color_palette=bi.color_palette,
        brand_notes=bi.brand_notes,
        analysis_text=bi.analysis_text,
        analysis_version=bi.analysis_version,
        images=[schemas.BrandIdentityImageOut(id=i.id, image_url=i.image_url, created_at=i.created_at) for i in imgs],
        created_at=bi.created_at,
        updated_at=bi.updated_at,
    )


@router.delete("")
async def delete_brand_identity(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Elimina la brand identity e tutte le immagini. Le generazioni esistenti mantengono lo snapshot."""
    r = await db.execute(select(BrandIdentity).where(BrandIdentity.user_id == current_user.id))
    bi = r.scalar_one_or_none()
    if not bi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand identity not found")
    await db.delete(bi)
    await db.commit()
    return {"message": "Brand identity deleted"}
