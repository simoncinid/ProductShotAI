"""
API Products: CRUD, immagini (max 3 per prodotto), analisi stile.
Solo utenti autenticati; ownership verificata su ogni route.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.auth import get_current_user
from app.models import User, Product, ProductImage, Generation
from app import schemas
from app.storage import get_storage_adapter
from app.config import settings
from app import analysis
from app.utils import ensure_absolute_image_url
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/products", tags=["products"])
MAX_IMAGES_PER_PRODUCT = 3


def _check_allowed_file(file: UploadFile) -> None:
    allowed = settings.get_allowed_image_types_list()
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed)}",
        )


async def _get_product_owned(db: AsyncSession, product_id: str, user_id: str):
    r = await db.execute(
        select(Product).where(Product.id == product_id, Product.user_id == user_id)
    )
    return r.scalar_one_or_none()


@router.get("", response_model=list[schemas.ProductListItem])
async def list_products(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Elenco prodotti dell'utente."""
    r = await db.execute(
        select(Product).where(Product.user_id == current_user.id).order_by(Product.created_at.desc())
    )
    products = r.scalars().all()
    return [schemas.ProductListItem(
        id=p.id,
        name=p.name,
        sku=p.sku,
        category=p.category,
        default_apply_brand_identity=p.default_apply_brand_identity,
        created_at=p.created_at,
    ) for p in products]


@router.post("", response_model=schemas.ProductDetailResponse)
async def create_product(
    body: schemas.ProductCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Crea un nuovo prodotto."""
    product = Product(
        user_id=current_user.id,
        name=body.name.strip(),
        sku=body.sku.strip() if body.sku else None,
        category=body.category.strip() if body.category else None,
        default_apply_brand_identity=body.default_apply_brand_identity,
        product_prompt=body.product_prompt.strip() or "Product photo, professional lighting.",
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return schemas.ProductDetailResponse(
        id=product.id,
        user_id=product.user_id,
        name=product.name,
        sku=product.sku,
        category=product.category,
        default_apply_brand_identity=product.default_apply_brand_identity,
        product_prompt=product.product_prompt,
        analysis_text=product.analysis_text,
        analysis_version=product.analysis_version,
        images=[],
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


@router.get("/{product_id}", response_model=schemas.ProductDetailResponse)
async def get_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Dettaglio prodotto. Solo proprietario."""
    product = await _get_product_owned(db, product_id, current_user.id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    r2 = await db.execute(
        select(ProductImage).where(ProductImage.product_id == product.id).order_by(ProductImage.created_at)
    )
    images = r2.scalars().all()
    return schemas.ProductDetailResponse(
        id=product.id,
        user_id=product.user_id,
        name=product.name,
        sku=product.sku,
        category=product.category,
        default_apply_brand_identity=product.default_apply_brand_identity,
        product_prompt=product.product_prompt,
        analysis_text=product.analysis_text,
        analysis_version=product.analysis_version,
        images=[schemas.ProductImageOut(id=i.id, image_url=i.image_url, created_at=i.created_at) for i in images],
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


@router.put("/{product_id}", response_model=schemas.ProductDetailResponse)
async def update_product(
    product_id: str,
    body: schemas.ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Aggiorna prodotto. Solo proprietario."""
    product = await _get_product_owned(db, product_id, current_user.id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if body.name is not None:
        product.name = body.name.strip()
    if body.sku is not None:
        product.sku = body.sku.strip() or None
    if body.category is not None:
        product.category = body.category.strip() or None
    if body.default_apply_brand_identity is not None:
        product.default_apply_brand_identity = body.default_apply_brand_identity
    if body.product_prompt is not None:
        product.product_prompt = body.product_prompt.strip() or product.product_prompt
    if body.analysis_text is not None:
        product.analysis_text = body.analysis_text
    db.add(product)
    await db.commit()
    await db.refresh(product)
    r2 = await db.execute(
        select(ProductImage).where(ProductImage.product_id == product.id).order_by(ProductImage.created_at)
    )
    images = r2.scalars().all()
    return schemas.ProductDetailResponse(
        id=product.id,
        user_id=product.user_id,
        name=product.name,
        sku=product.sku,
        category=product.category,
        default_apply_brand_identity=product.default_apply_brand_identity,
        product_prompt=product.product_prompt,
        analysis_text=product.analysis_text,
        analysis_version=product.analysis_version,
        images=[schemas.ProductImageOut(id=i.id, image_url=i.image_url, created_at=i.created_at) for i in images],
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Elimina prodotto. Le generazioni esistenti mantengono product_name_snapshot (product_id -> NULL)."""
    product = await _get_product_owned(db, product_id, current_user.id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted"}


@router.post("/{product_id}/images")
async def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Carica un'immagine per il prodotto. Max 3 per prodotto."""
    _check_allowed_file(file)
    content = await file.read()
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.max_upload_size_mb}MB",
        )
    product = await _get_product_owned(db, product_id, current_user.id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    r2 = await db.execute(select(ProductImage).where(ProductImage.product_id == product.id))
    existing = r2.scalars().all()
    if len(existing) >= MAX_IMAGES_PER_PRODUCT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_IMAGES_PER_PRODUCT} reference images per product. Remove one before uploading.",
        )
    ext = ".jpg" if file.content_type == "image/jpeg" else ".png"
    subpath = f"users/{current_user.id}/products/{product.id}"
    storage = get_storage_adapter()
    image_url = await storage.upload_file(content, ext, subpath=subpath)
    img = ProductImage(product_id=product.id, user_id=current_user.id, image_url=image_url)
    db.add(img)
    await db.commit()
    await db.refresh(img)
    return {"id": img.id, "image_url": img.image_url, "created_at": img.created_at.isoformat()}


@router.delete("/{product_id}/images/{image_id}")
async def delete_product_image(
    product_id: str,
    image_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Rimuove un'immagine dal prodotto. Ownership verificata."""
    product = await _get_product_owned(db, product_id, current_user.id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    r = await db.execute(
        select(ProductImage).where(
            ProductImage.id == image_id,
            ProductImage.product_id == product.id,
        )
    )
    img = r.scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    await db.delete(img)
    await db.commit()
    return {"message": "Image deleted"}


@router.get("/{product_id}/generations")
async def get_product_generations(
    product_id: str,
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Elenco generazioni per questo prodotto. Solo proprietario."""
    product = await _get_product_owned(db, product_id, current_user.id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    offset = (page - 1) * page_size
    count_result = await db.execute(
        select(func.count(Generation.id)).where(
            Generation.user_id == current_user.id,
            Generation.product_id == product.id,
        )
    )
    total = count_result.scalar_one()
    result = await db.execute(
        select(Generation)
        .where(
            Generation.user_id == current_user.id,
            Generation.product_id == product.id,
        )
        .order_by(Generation.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    generations = result.scalars().all()
    items = [
        {
            "id": g.id,
            "input_image_url": g.input_image_url,
            "output_image_url": g.output_image_url,
            "prompt": g.prompt,
            "final_prompt": getattr(g, "final_prompt", None),
            "apply_brand_identity": getattr(g, "apply_brand_identity", False),
            "status": g.status,
            "created_at": g.created_at.isoformat() if g.created_at else None,
            "completed_at": g.completed_at.isoformat() if g.completed_at else None,
        }
        for g in generations
    ]
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("/{product_id}/analyze", response_model=schemas.ProductDetailResponse)
async def analyze_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Esegue l'analisi sulle immagini del prodotto e salva analysis_text."""
    product = await _get_product_owned(db, product_id, current_user.id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    r2 = await db.execute(select(ProductImage).where(ProductImage.product_id == product.id))
    images = r2.scalars().all()
    urls = [img.image_url for img in images]
    if not urls:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload at least one reference image before analyzing",
        )
    abs_urls = [ensure_absolute_image_url(u) for u in urls]
    analysis_text = await analysis.analyze_reference_images(abs_urls)
    product.analysis_text = analysis_text
    product.analysis_version = (product.analysis_version or 1) + 1
    db.add(product)
    await db.commit()
    await db.refresh(product)
    r3 = await db.execute(
        select(ProductImage).where(ProductImage.product_id == product.id).order_by(ProductImage.created_at)
    )
    imgs = r3.scalars().all()
    return schemas.ProductDetailResponse(
        id=product.id,
        user_id=product.user_id,
        name=product.name,
        sku=product.sku,
        category=product.category,
        default_apply_brand_identity=product.default_apply_brand_identity,
        product_prompt=product.product_prompt,
        analysis_text=product.analysis_text,
        analysis_version=product.analysis_version,
        images=[schemas.ProductImageOut(id=i.id, image_url=i.image_url, created_at=i.created_at) for i in imgs],
        created_at=product.created_at,
        updated_at=product.updated_at,
    )
