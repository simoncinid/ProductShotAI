import asyncio
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
from datetime import datetime, timedelta, timezone
import logging
import secrets
import stripe

from app.config import settings
from app.database import get_db, AsyncSessionLocal
from app import models, schemas, auth, storage, wavespeed, watermark, utils, credit_packs, email_sender
from app.auth import get_current_user, get_current_user_optional
from app.models import User, Generation, CreditTransaction
from app.storage import get_storage_adapter

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="ProductShotAI API", version="1.0.0")

# CORS: allow_origins da CORS_ORIGINS env; allow_origin_regex come fallback per *.vercel.app
# (su Render a volte l'env non è disponibile all'avvio o il cold start risponde prima di FastAPI)
_cors_origins = settings.get_cors_origins_list()
if _cors_origins:
    logger.info("CORS allow_origins: %s", _cors_origins)
else:
    logger.warning("CORS_ORIGINS vuota o non impostata; si usa solo allow_origin_regex per *.vercel.app")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins if _cors_origins else [],
    allow_origin_regex=r"^https://([a-zA-Z0-9-]+\.)*vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
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
OTP_EXPIRY_MINUTES = 15


@app.post("/api/auth/signup", response_model=schemas.SignupResponse)
async def signup(
    request: schemas.SignupRequest,
    db: AsyncSession = Depends(get_db)
):
    """Sign up: crea utente, invia OTP via email, richiede verifica su /verifyEmail."""
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    otp = "".join(secrets.choice("0123456789") for _ in range(6))
    otp_hash = auth.get_password_hash(otp)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    user = User(
        email=request.email,
        password_hash=auth.get_password_hash(request.password),
        email_verified=False,
        verification_otp_hash=otp_hash,
        verification_otp_expires_at=expires_at,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    try:
        email_sender.send_verification_otp(request.email, otp)
    except Exception as e:
        logger.exception("Failed to send verification email")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not send verification email. Check GMAIL_USER and GMAIL_PASS."
        ) from e

    return schemas.SignupResponse(require_verification=True, email=request.email)


@app.post("/api/auth/verify-otp", response_model=schemas.TokenResponse)
@limiter.limit("10/minute")
async def verify_otp(
    request: Request,
    body: schemas.VerifyOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verifica OTP: se valido imposta email_verified e restituisce JWT."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")
    if user.email_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already verified")
    if not user.verification_otp_hash or not user.verification_otp_expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No OTP pending. Request a new one.")
    if user.verification_otp_expires_at < datetime.now(timezone.utc):
        user.verification_otp_hash = None
        user.verification_otp_expires_at = None
        await db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired. Request a new one.")
    if not auth.verify_password(body.otp, user.verification_otp_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")

    user.email_verified = True
    user.verification_otp_hash = None
    user.verification_otp_expires_at = None
    await db.commit()

    access_token = auth.create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/resend-otp")
@limiter.limit("3/minute")
async def resend_otp(
    request: Request,
    body: schemas.ResendOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    """Invia un nuovo OTP all'email (solo se utente non ancora verificato)."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")
    if user.email_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already verified")

    otp = "".join(secrets.choice("0123456789") for _ in range(6))
    user.verification_otp_hash = auth.get_password_hash(otp)
    user.verification_otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)
    await db.commit()

    try:
        email_sender.send_verification_otp(body.email, otp)
    except Exception as e:
        logger.exception("Failed to resend verification email")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not send verification email."
        ) from e

    return {"message": "OTP sent"}


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
async def login(
    request: schemas.LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login user. Richiede email verificata."""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not auth.verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email first. Check your inbox for the verification code."
        )

    user.last_login_at = datetime.utcnow()
    await db.commit()

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


@app.get("/api/generations/{generation_id}")
async def get_generation_status(
    generation_id: str,
    device_id: str | None = None,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Stato di una generation (per polling dopo 202). Paid: auth. Free: device_id in query."""
    r = await db.execute(select(Generation).where(Generation.id == generation_id))
    gen = r.scalar_one_or_none()
    if not gen:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")
    if current_user:
        if gen.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")
    else:
        if not gen.is_free or not device_id or gen.device_id != device_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")
    return {
        "id": str(gen.id),
        "status": gen.status,
        "output_image_url": gen.output_image_url,
        "error_message": gen.error_message,
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


def _ensure_absolute_image_url(url: str) -> str:
    """WaveSpeed richiede URL assoluti e pubblici. Converte /storage/... in base+url se serve."""
    if not url:
        return url
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("/") and settings.public_base_url:
        return settings.public_base_url.rstrip("/") + url
    return url


def _get_wavespeed_webhook_url() -> str:
    """URL pubblico HTTPS per il webhook WaveSpeed. Richiede PUBLIC_BASE_URL."""
    base = (settings.public_base_url or "").rstrip("/")
    if not base or not base.startswith("https://"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PUBLIC_BASE_URL non configurato (HTTPS). Necessario per webhook WaveSpeed.",
        )
    return f"{base}/api/webhooks/wavespeed"


async def _process_wavespeed_webhook_task(
    wavespeed_id: str,
    status: str,
    output_url: str | None,
    error: str | None,
) -> None:
    """
    Elabora il risultato del webhook WaveSpeed in background. Scorre output, watermark (free),
    upload, aggiorna Generation. Idempotente: se già completed/failed non fa nulla.
    """
    async with AsyncSessionLocal() as db:
        try:
            r = await db.execute(select(Generation).where(Generation.wavespeed_request_id == wavespeed_id))
            gen = r.scalar_one_or_none()
            if not gen:
                logger.warning(f"Webhook WaveSpeed: generation non trovata per wavespeed_id={wavespeed_id}")
                return
            if gen.status in ("completed", "failed"):
                return  # idempotenza

            if status == "failed":
                gen.status = "failed"
                gen.error_message = error or "WaveSpeed task failed"
                gen.completed_at = datetime.now(timezone.utc)
                await db.commit()
                logger.info(f"Webhook WaveSpeed: generation {gen.id} failed: {error}")
                return

            if status != "completed" or not output_url:
                return

            # completed: download, (watermark se free), upload, aggiorna
            async with httpx.AsyncClient(timeout=httpx.Timeout(60.0)) as client:
                resp = await client.get(output_url)
                resp.raise_for_status()
                output_bytes = resp.content

            if gen.is_free:
                output_bytes = await watermark.apply_watermark(output_bytes)

            storage_adapter = get_storage_adapter()
            final_url = await storage_adapter.upload_file(output_bytes, ".jpg")

            gen.status = "completed"
            gen.output_image_url = final_url
            gen.completed_at = datetime.now(timezone.utc)
            await db.commit()

            if gen.is_free and gen.device_id and gen.ip_address:
                try:
                    await utils.increment_free_generation_count(db, gen.device_id, gen.ip_address)
                except Exception as inc:
                    logger.warning(f"increment_free_generation_count failed (gen {gen.id}): {inc}")

            if not gen.is_free and gen.user_id:
                r2 = await db.execute(select(User).where(User.id == gen.user_id))
                user = r2.scalar_one_or_none()
                if user:
                    user.credits_balance -= 1
                    db.add(CreditTransaction(
                        user_id=user.id,
                        change_amount=-1,
                        type="generation",
                        reference_id=gen.id,
                    ))
                    await db.commit()

            logger.info(f"Webhook WaveSpeed: generation {gen.id} completed")
        except Exception as e:
            logger.exception(f"Webhook WaveSpeed: errore elaborazione wavespeed_id={wavespeed_id}: {e}")
            try:
                r = await db.execute(select(Generation).where(Generation.wavespeed_request_id == wavespeed_id))
                gen = r.scalar_one_or_none()
                if gen:
                    gen.status = "failed"
                    gen.error_message = str(e)
                    gen.completed_at = datetime.now(timezone.utc)
                    await db.commit()
            except Exception:
                pass


# Free generation: WaveSpeed con webhook. POST ritorna 202, frontend fa polling su GET /api/generations/{id}.
@app.post("/api/generate-free")
@limiter.limit("10/minute")
async def generate_free(
    request: Request,
    generate_request: schemas.GenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate image for free (with watermark). Crea task WaveSpeed con webhook, ritorna 202."""
    ip_address = utils.get_client_ip(request)
    if not generate_request.device_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="device_id is required")
    can_generate, _ = await utils.check_free_generation_limit(db, generate_request.device_id, ip_address)
    if not can_generate:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Free generation limit reached ({settings.free_generations_per_month} per month). Please sign up and purchase credits for unlimited generations.",
        )
    generation = Generation(
        device_id=generate_request.device_id,
        ip_address=ip_address,
        input_image_url=generate_request.image_url,
        prompt=generate_request.prompt,
        resolution="4k",  # Free: sempre 4k per ridurre costi WaveSpeed (paid può usare 8k)
        aspect_ratio=generate_request.aspect_ratio,
        is_free=True,
        status="pending",
    )
    db.add(generation)
    await db.commit()
    await db.refresh(generation)
    try:
        image_url = _ensure_absolute_image_url(generate_request.image_url)
        generation.status = "processing"
        webhook_url = _get_wavespeed_webhook_url()
        ws = wavespeed.get_wavespeed_client()
        task_result = await ws.create_edit_task(
            image_url=image_url,
            prompt=generate_request.prompt,
            resolution="4k",
            aspect_ratio=generate_request.aspect_ratio or "1:1",
            webhook_url=webhook_url,
        )
        generation.wavespeed_request_id = task_result.get("id")
        await db.commit()

        logger.info(f"WaveSpeed task created for free generation {generation.id} wavespeed_id={generation.wavespeed_request_id}")
        return JSONResponse(
            content={"generation_id": str(generation.id), "status": "processing", "output_image_url": None, "error_message": None},
            status_code=202,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error in free generation {generation.id}: {e}")
        generation.status = "failed"
        generation.error_message = str(e)
        generation.completed_at = datetime.utcnow()
        await db.commit()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Generation failed: {str(e)}")


# Paid generation: WaveSpeed con webhook. POST ritorna 202, frontend fa polling su GET /api/generations/{id}.
@app.post("/api/generate-paid")
@limiter.limit("10/minute")
async def generate_paid(
    request: Request,
    generate_request: schemas.GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate image for paid users (no watermark). Crea task WaveSpeed con webhook, ritorna 202."""
    if current_user.credits_balance < 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient credits. Please purchase credits to continue."
        )
    ip_address = utils.get_client_ip(request)
    generation = Generation(
        user_id=current_user.id,
        device_id=generate_request.device_id,
        ip_address=ip_address,
        input_image_url=generate_request.image_url,
        prompt=generate_request.prompt,
        resolution=generate_request.resolution or "8k",
        aspect_ratio=generate_request.aspect_ratio,
        is_free=False,
        status="pending"
    )
    db.add(generation)
    await db.commit()
    await db.refresh(generation)
    try:
        image_url = _ensure_absolute_image_url(generate_request.image_url)
        generation.status = "processing"
        webhook_url = _get_wavespeed_webhook_url()
        ws = wavespeed.get_wavespeed_client()
        task_result = await ws.create_edit_task(
            image_url=image_url,
            prompt=generate_request.prompt,
            resolution=generate_request.resolution or "8k",
            aspect_ratio=generate_request.aspect_ratio or "1:1",
            webhook_url=webhook_url,
        )
        generation.wavespeed_request_id = task_result.get("id")
        await db.commit()

        logger.info(f"WaveSpeed task created for paid generation {generation.id} wavespeed_id={generation.wavespeed_request_id}")
        return JSONResponse(
            content={"generation_id": str(generation.id), "status": "processing", "output_image_url": None, "error_message": None},
            status_code=202,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error in paid generation {generation.id}: {e}")
        generation.status = "failed"
        generation.error_message = str(e)
        generation.completed_at = datetime.utcnow()
        await db.commit()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Generation failed: {str(e)}")


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


# Webhook WaveSpeed: riceve completed/failed, ritorna 2xx subito, elabora in background.
# Requisiti: HTTPS, 2xx entro 20 min (noi rispondiamo in ms), pubblico.
# Vedi https://wavespeed.ai/docs/how-to-use-webhooks
@app.post("/api/webhooks/wavespeed")
async def wavespeed_webhook(raw: Request):
    """Riceve POST da WaveSpeed con id, status, outputs?, error?. Risponde 200 subito, elabora in background."""
    try:
        body = await raw.json()
    except Exception:
        return JSONResponse(content={"received": False}, status_code=400)
    wid = body.get("id")
    stat = body.get("status")
    if not wid or not stat:
        return JSONResponse(content={"received": True}, status_code=200)
    outputs = body.get("outputs") or []
    output_url = outputs[0] if outputs and stat == "completed" else None
    error = body.get("error")

    asyncio.create_task(_process_wavespeed_webhook_task(wid, stat, output_url, error))
    return JSONResponse(content={"received": True}, status_code=200)


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
