from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import httpx
from datetime import datetime
import logging
import stripe

from app.config import settings
from app.database import get_db
from app import models, schemas, auth, storage, wavespeed, watermark, utils, credit_packs
from app.auth import get_current_user, get_current_user_optional
from app.models import User, Generation, CreditTransaction
from app.storage import get_storage_adapter

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="ProductShotAI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Mount static files for local storage
if settings.storage_type == "local":
    import os
    storage_dir = os.path.abspath(settings.storage_path)
    os.makedirs(storage_dir, exist_ok=True)
    app.mount("/storage", StaticFiles(directory=storage_dir), name="storage")


# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}


# Auth endpoints
@app.post("/api/auth/signup", response_model=schemas.TokenResponse)
async def signup(
    request: schemas.SignupRequest,
    db: AsyncSession = Depends(get_db)
):
    """Sign up a new user"""
    # Check if user exists
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    password_hash = auth.get_password_hash(request.password)
    user = User(
        email=request.email,
        password_hash=password_hash
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Create access token
    access_token = auth.create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
async def login(
    request: schemas.LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login user"""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user or not auth.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    await db.commit()
    
    # Create access token
    access_token = auth.create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/logout")
async def logout():
    """Logout user (client should discard token)"""
    return {"message": "Logged out successfully"}


# User endpoints
@app.get("/api/user/me", response_model=schemas.UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user info"""
    return current_user


@app.get("/api/user/generations", response_model=schemas.GenerationHistoryResponse)
async def get_user_generations(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's generation history"""
    offset = (page - 1) * page_size
    
    # Get total count
    count_result = await db.execute(
        select(func.count(Generation.id)).where(Generation.user_id == current_user.id)
    )
    total = count_result.scalar_one()
    
    # Get generations
    result = await db.execute(
        select(Generation)
        .where(Generation.user_id == current_user.id)
        .order_by(Generation.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    generations = result.scalars().all()
    
    return {
        "items": generations,
        "total": total,
        "page": page,
        "page_size": page_size
    }


# Upload endpoint
@app.post("/api/upload", response_model=schemas.UploadResponse)
@limiter.limit("10/minute")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload product image"""
    # Validate file type
    allowed = settings.get_allowed_image_types_list()
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed)}"
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size (max 10MB)
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.max_upload_size_mb}MB"
        )
    
    # Determine file extension
    file_extension = ".jpg" if file.content_type == "image/jpeg" else ".png"
    
    # Upload to storage
    storage_adapter = get_storage_adapter()
    image_url = await storage_adapter.upload_file(content, file_extension)
    
    logger.info(f"Image uploaded: {image_url}")
    return {"image_url": image_url}


# Free generation endpoint
@app.post("/api/generate-free", response_model=schemas.GenerateResponse)
@limiter.limit("5/minute")
async def generate_free(
    request: Request,
    generate_request: schemas.GenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate image for free (with watermark)"""
    # Get client IP
    ip_address = utils.get_client_ip(request)
    
    # Validate device_id
    if not generate_request.device_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="device_id is required"
        )
    
    # Check free generation limit
    can_generate, current_count = await utils.check_free_generation_limit(
        db, generate_request.device_id, ip_address
    )
    
    if not can_generate:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Free generation limit reached ({settings.free_generations_per_month} per month). Please sign up and purchase credits for unlimited generations."
        )
    
    # Create generation record
    generation = Generation(
        device_id=generate_request.device_id,
        ip_address=ip_address,
        input_image_url=generate_request.image_url,
        prompt=generate_request.prompt,
        resolution=generate_request.resolution,
        aspect_ratio=generate_request.aspect_ratio,
        is_free=True,
        status="pending"
    )
    db.add(generation)
    await db.commit()
    await db.refresh(generation)
    
    try:
        # Call WaveSpeed API
        wavespeed_client = wavespeed.get_wavespeed_client()
        
        logger.info(f"Creating WaveSpeed task for generation {generation.id}")
        task_result = await wavespeed_client.create_edit_task(
            image_url=generate_request.image_url,
            prompt=generate_request.prompt,
            resolution=generate_request.resolution,
            aspect_ratio=generate_request.aspect_ratio
        )
        request_id = task_result["id"]
        
        # Update generation status
        generation.status = "processing"
        await db.commit()
        
        # Poll for completion
        logger.info(f"Polling for completion of generation {generation.id}")
        final_result = await wavespeed_client.poll_for_completion(request_id)
        
        if final_result.get("status") == "completed":
            output_url = final_result["outputs"][0]
            
            # Download output image
            async with httpx.AsyncClient() as client:
                response = await client.get(output_url)
                response.raise_for_status()
                output_image_bytes = response.content
            
            # Apply watermark
            watermarked_bytes = await watermark.apply_watermark(output_image_bytes)
            
            # Upload watermarked image
            storage_adapter = get_storage_adapter()
            final_image_url = await storage_adapter.upload_file(watermarked_bytes, ".jpg")
            
            # Update generation
            generation.status = "completed"
            generation.output_image_url = final_image_url
            generation.completed_at = datetime.utcnow()
            await db.commit()
            
            # Increment free generation count
            await utils.increment_free_generation_count(db, generate_request.device_id, ip_address)
            
            logger.info(f"Generation {generation.id} completed successfully")
            return {
                "generation_id": generation.id,
                "status": "completed",
                "output_image_url": final_image_url
            }
        else:
            error_msg = final_result.get("error", "Unknown error")
            generation.status = "failed"
            generation.error_message = error_msg
            generation.completed_at = datetime.utcnow()
            await db.commit()
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Generation failed: {error_msg}"
            )
    
    except Exception as e:
        logger.error(f"Error in generation {generation.id}: {str(e)}")
        generation.status = "failed"
        generation.error_message = str(e)
        generation.completed_at = datetime.utcnow()
        await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}"
        )


# Paid generation endpoint
@app.post("/api/generate-paid", response_model=schemas.GenerateResponse)
@limiter.limit("10/minute")
async def generate_paid(
    request: Request,
    generate_request: schemas.GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate image for paid users (no watermark)"""
    # Check credits
    if current_user.credits_balance < 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient credits. Please purchase credits to continue."
        )
    
    # Get client IP
    ip_address = utils.get_client_ip(request)
    
    # Create generation record
    generation = Generation(
        user_id=current_user.id,
        device_id=generate_request.device_id,
        ip_address=ip_address,
        input_image_url=generate_request.image_url,
        prompt=generate_request.prompt,
        resolution=generate_request.resolution,
        aspect_ratio=generate_request.aspect_ratio,
        is_free=False,
        status="pending"
    )
    db.add(generation)
    await db.commit()
    await db.refresh(generation)
    
    try:
        # Call WaveSpeed API
        wavespeed_client = wavespeed.get_wavespeed_client()
        
        logger.info(f"Creating WaveSpeed task for paid generation {generation.id}")
        task_result = await wavespeed_client.create_edit_task(
            image_url=generate_request.image_url,
            prompt=generate_request.prompt,
            resolution=generate_request.resolution,
            aspect_ratio=generate_request.aspect_ratio
        )
        request_id = task_result["id"]
        
        # Update generation status
        generation.status = "processing"
        await db.commit()
        
        # Poll for completion
        logger.info(f"Polling for completion of generation {generation.id}")
        final_result = await wavespeed_client.poll_for_completion(request_id)
        
        if final_result.get("status") == "completed":
            output_url = final_result["outputs"][0]
            
            # Download output image
            async with httpx.AsyncClient() as client:
                response = await client.get(output_url)
                response.raise_for_status()
                output_image_bytes = response.content
            
            # Upload final image (no watermark)
            storage_adapter = get_storage_adapter()
            final_image_url = await storage_adapter.upload_file(output_image_bytes, ".jpg")
            
            # Update generation
            generation.status = "completed"
            generation.output_image_url = final_image_url
            generation.completed_at = datetime.utcnow()
            
            # Deduct credit and create transaction
            current_user.credits_balance -= 1
            transaction = CreditTransaction(
                user_id=current_user.id,
                change_amount=-1,
                type="generation",
                reference_id=generation.id
            )
            db.add(transaction)
            await db.commit()
            
            logger.info(f"Paid generation {generation.id} completed successfully")
            return {
                "generation_id": generation.id,
                "status": "completed",
                "output_image_url": final_image_url
            }
        else:
            error_msg = final_result.get("error", "Unknown error")
            generation.status = "failed"
            generation.error_message = error_msg
            generation.completed_at = datetime.utcnow()
            await db.commit()
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Generation failed: {error_msg}"
            )
    
    except Exception as e:
        logger.error(f"Error in paid generation {generation.id}: {str(e)}")
        generation.status = "failed"
        generation.error_message = str(e)
        generation.completed_at = datetime.utcnow()
        await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}"
        )


# Credit endpoints
@app.get("/api/credits/packs")
async def get_credit_packs():
    """Get available credit packs"""
    return {"packs": credit_packs.get_all_credit_packs()}


@app.post("/api/credits/purchase", response_model=schemas.PurchaseResponse)
async def purchase_credits(
    request: schemas.PurchaseRequest,
    current_user: User = Depends(get_current_user),
):
    """Crea una Stripe Checkout Session: l'utente viene reindirizzato a Stripe per pagare.
    I crediti vengono accreditati solo quando Stripe invia il webhook checkout.session.completed."""
    try:
        pack = credit_packs.get_credit_pack(request.pack_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pack_id"
        )
    price_ids = {
        "starter": settings.stripe_price_starter,
        "standard": settings.stripe_price_standard,
        "pro": settings.stripe_price_pro,
        "power": settings.stripe_price_power,
    }
    price_id = price_ids.get(request.pack_id)
    if not settings.stripe_secret_key or not price_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe non configurato per questo pack. Imposta STRIPE_SECRET_KEY e STRIPE_PRICE_*."
        )
    stripe.api_key = settings.stripe_secret_key
    session = stripe.checkout.Session.create(
        line_items=[{"price": price_id, "quantity": 1}],
        mode="payment",
        success_url=request.success_url,
        cancel_url=request.cancel_url,
        metadata={
            "user_id": str(current_user.id),
            "pack_id": request.pack_id,
            "credits": str(pack.credits),
        },
    )
    logger.info(f"Checkout session created for user {current_user.id} pack={request.pack_id} session={session.id}")
    return {"checkout_url": session.url}


# Webhook Stripe: elabora checkout.session.completed e accredita i crediti
@app.post("/api/webhooks/stripe")
async def stripe_webhook(raw_request: Request, db: AsyncSession = Depends(get_db)):
    """Riceve gli eventi Stripe. Verifica la firma, su checkout.session.completed accredita i crediti.
    Non usa autenticazione JWT: Stripe firma il payload con STRIPE_WEBHOOK_SECRET."""
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="STRIPE_WEBHOOK_SECRET non configurato")
    body = await raw_request.body()
    sig = raw_request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(body, sig, settings.stripe_webhook_secret)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Payload non valido: {e}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Firma webhook non valida: {e}")
    if event["type"] != "checkout.session.completed":
        return {"received": True}
    session = event["data"]["object"]
    session_id = session.get("id")
    metadata = session.get("metadata") or {}
    user_id = metadata.get("user_id")
    pack_id = metadata.get("pack_id")
    credits_s = metadata.get("credits", "0")
    try:
        credits = int(credits_s)
    except ValueError:
        logger.error(f"Webhook Stripe: credits non numerico in metadata: {credits_s}")
        return {"received": True}
    if not user_id or not pack_id or credits <= 0:
        logger.error(f"Webhook Stripe: metadata mancanti o non validi session={session_id} metadata={metadata}")
        return {"received": True}
    # Idempotenza: evita di accreditare due volte per lo stesso checkout
    r = await db.execute(select(CreditTransaction).where(CreditTransaction.reference_id == session_id))
    if r.scalar_one_or_none():
        logger.info(f"Webhook Stripe: checkout già elaborato session={session_id}")
        return {"received": True}
    r = await db.execute(select(User).where(User.id == user_id))
    user = r.scalar_one_or_none()
    if not user:
        logger.error(f"Webhook Stripe: user non trovato user_id={user_id} session={session_id}")
        return {"received": True}
    user.credits_balance += credits
    t = CreditTransaction(
        user_id=user.id,
        change_amount=credits,
        type="purchase",
        reference_id=session_id,
    )
    db.add(t)
    await db.commit()
    logger.info(f"Webhook Stripe: accreditati {credits} crediti a user={user_id} pack={pack_id} session={session_id}")
    return {"received": True}
