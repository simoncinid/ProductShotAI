"""Account-bound recovery invitations. GET requests never activate accounts."""
import asyncio
import hashlib
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import stripe

from app import auth
from app.auth import get_current_user
from app.database import get_db
from app.models import RecoveryInvitation, User
from app.time_utils import as_utc

router = APIRouter(prefix="/api/recovery", tags=["account recovery"])
COUPON_ID = "productshotai_recovery_20261122_30"


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class TokenRequest(BaseModel):
    token: str = Field(min_length=32, max_length=200)


@router.post("/activate")
async def activate(body: TokenRequest, db: AsyncSession = Depends(get_db)):
    # Email scanners can open the page without consuming its invitation.
    invitation = await db.scalar(select(RecoveryInvitation).where(
        RecoveryInvitation.token_hash == token_hash(body.token)))
    now = datetime.now(timezone.utc)
    if not invitation or as_utc(invitation.expires_at) <= now or invitation.activated_at:
        raise HTTPException(400, "This personal link has expired or has already been used. Please sign in, or request a verification code on the verification page.")
    # Match the webhook's lock order: user, then invitation.
    user = await db.scalar(select(User).where(User.id == invitation.user_id).with_for_update())
    invitation = await db.scalar(select(RecoveryInvitation).where(
        RecoveryInvitation.id == invitation.id).with_for_update().execution_options(populate_existing=True))
    if invitation.activated_at or as_utc(invitation.expires_at) <= now:
        raise HTTPException(400, "This personal link has expired or has already been used. Please sign in.")
    if not user:
        raise HTTPException(400, "This account is no longer available.")
    user.email_verified = True
    user.verification_otp_hash = None
    user.verification_otp_expires_at = None
    user.last_login_at = now
    invitation.activated_at = now
    await db.commit()
    return {"access_token": auth.create_access_token(data={"sub": user.id}), "token_type": "bearer"}


@router.get("/offer")
async def offer(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    invitation = await db.scalar(select(RecoveryInvitation).where(RecoveryInvitation.user_id == user.id))
    available = bool(invitation and invitation.sent_at and not invitation.used_at
                     and as_utc(invitation.expires_at) > datetime.now(timezone.utc))
    return {"available": available, "percent_off": 30 if available else 0,
            "expires_at": as_utc(invitation.expires_at).isoformat() if available else None}


@router.post("/unsubscribe")
async def unsubscribe(body: TokenRequest, db: AsyncSession = Depends(get_db)):
    invitation = await db.scalar(select(RecoveryInvitation).where(
        RecoveryInvitation.unsubscribe_hash == token_hash(body.token)).with_for_update())
    if invitation:
        invitation.unsubscribed_at = datetime.now(timezone.utc)
        await db.commit()
    return {"unsubscribed": True}


async def discounted_checkout(db, user, pack_id, create_parameters):
    """Serialize offer checkout creation; only one payable discounted session exists.

    Persist a Stripe idempotency key BEFORE calling Stripe so a network failure or
    process restart cannot create two redeemable discounted sessions.
    """
    invitation = await db.scalar(select(RecoveryInvitation).where(
        RecoveryInvitation.user_id == user.id).with_for_update())
    if not invitation or not invitation.sent_at or invitation.used_at or as_utc(invitation.expires_at) <= datetime.now(timezone.utc):
        return None
    parameters = {**create_parameters, "discounts": [{"coupon": COUPON_ID}]}
    parameters["metadata"] = {**parameters["metadata"], "recovery_id": invitation.id}
    # An interrupted creation is retried with exactly the same parameters/key.
    if invitation.checkout_session_id:
        previous = await asyncio.to_thread(stripe.checkout.Session.retrieve, invitation.checkout_session_id)
        if previous.status == "complete":
            raise HTTPException(409, "Your previous payment is being confirmed. Please refresh shortly.")
        if previous.status == "open":
            if invitation.checkout_pack_id == pack_id:
                return previous
            await asyncio.to_thread(stripe.checkout.Session.expire, previous.id)
        invitation.checkout_session_id = None
        invitation.checkout_key = None
    if invitation.checkout_key and invitation.checkout_pack_id != pack_id:
        raise HTTPException(409, "Your previous checkout is being prepared. Please retry the same pack.")
    if not invitation.checkout_key:
        import secrets
        invitation.checkout_key = secrets.token_hex(24)
        invitation.checkout_pack_id = pack_id
        invitation.checkout_success_url = parameters["success_url"]
        invitation.checkout_cancel_url = parameters["cancel_url"]
        await db.commit()
        # Re-lock after committing the durable idempotency key.
        invitation = await db.scalar(select(RecoveryInvitation).where(RecoveryInvitation.id == invitation.id).with_for_update())
        if invitation.used_at:
            raise HTTPException(409, "This offer has already been used.")
    parameters["success_url"] = invitation.checkout_success_url
    parameters["cancel_url"] = invitation.checkout_cancel_url
    session = await asyncio.to_thread(stripe.checkout.Session.create,
        **parameters, idempotency_key=f"recovery-{invitation.id}-{invitation.checkout_key}")
    invitation.checkout_session_id = session.id
    await db.commit()
    return session
