"""Regression tests for the production OTP crash and Stripe credit confirmation.

All database and Stripe dependencies are replaced. No production data or email.
"""
import os
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "mysql+aiomysql://test:test@localhost/test")
os.environ.setdefault("JWT_SECRET_KEY", "isolated-regression-test-secret")
os.environ.setdefault("WAVESPEED_API_KEY", "test")
os.environ.setdefault("STORAGE_TYPE", "database")

from app import main


@pytest.fixture
def setup(monkeypatch):
    user = SimpleNamespace(id="test-user", email="audit@example.com", email_verified=False,
                           verification_otp_hash="hash", credits_balance=0,
                           verification_otp_expires_at=datetime.utcnow() + timedelta(minutes=10))
    db = SimpleNamespace(execute=AsyncMock(), commit=AsyncMock(), scalar=AsyncMock(return_value=None), add=lambda _: None)
    db.execute.return_value = SimpleNamespace(scalar_one_or_none=lambda: user)

    async def session():
        yield db

    main.app.dependency_overrides[main.get_db] = session
    main.app.dependency_overrides[main.get_current_user] = lambda: user
    monkeypatch.setattr(main.auth, "verify_password", lambda code, _: code == "123456")
    monkeypatch.setattr(main.settings, "stripe_webhook_secret", "test-signature")
    monkeypatch.setattr(main.settings, "stripe_secret_key", "test-key")
    with TestClient(main.app) as client:
        yield client, user, db
    main.app.dependency_overrides.clear()


@pytest.mark.parametrize("aware", [False, True])
def test_verification_accepts_mysql_and_timezone_aware_dates(setup, aware):
    client, user, db = setup
    user.verification_otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    if not aware:
        user.verification_otp_expires_at = user.verification_otp_expires_at.replace(tzinfo=None)
    response = client.post("/api/auth/verify-otp", json={"email": user.email, "otp": "123456"})
    assert response.status_code == 200
    assert response.json()["access_token"]
    assert user.email_verified and user.verification_otp_hash is None
    assert user.last_login_at
    db.commit.assert_awaited_once()


def test_expired_mysql_otp_returns_actionable_error_instead_of_500(setup):
    client, user, _ = setup
    user.verification_otp_expires_at = datetime.utcnow() - timedelta(minutes=1)
    response = client.post("/api/auth/verify-otp", json={"email": user.email, "otp": "123456"})
    assert response.status_code == 400
    assert "expired" in response.json()["detail"]
    assert not user.email_verified


def test_wrong_otp_does_not_verify_user(setup):
    client, user, db = setup
    response = client.post("/api/auth/verify-otp", json={"email": user.email, "otp": "111111"})
    assert response.status_code == 400
    assert not user.email_verified
    db.commit.assert_not_awaited()


@pytest.mark.parametrize("paid,duplicate,credits,status", [(False, False, 5, 200), (True, True, 5, 200), (True, False, 5, 200), (True, False, 500, 400)])
def test_webhook_only_credits_valid_paid_sessions_once(setup, monkeypatch, paid, duplicate, credits, status):
    client, user, db = setup
    event = {"type": "checkout.session.completed", "data": {"object": {
        "id": "cs_test", "payment_status": "paid" if paid else "unpaid",
        "metadata": {"user_id": user.id, "pack_id": "starter", "credits": str(credits)},
    }}}
    monkeypatch.setattr(main.stripe.Webhook, "construct_event", lambda *args: event)
    db.execute.side_effect = [SimpleNamespace(scalar_one_or_none=lambda: user),
                             SimpleNamespace(scalar_one_or_none=lambda: object() if duplicate else None)]
    response = client.post("/api/webhooks/stripe", content=b"{}")
    assert response.status_code == status
    assert user.credits_balance == (5 if paid and not duplicate and status == 200 else 0)
    assert db.commit.await_count == (1 if paid and not duplicate and status == 200 else 0)


def test_checkout_confirmation_requires_matching_user_and_credit_transaction(setup, monkeypatch):
    client, user, db = setup
    session = {"metadata": {"user_id": user.id}, "payment_status": "paid"}
    monkeypatch.setattr(main.stripe.checkout.Session, "retrieve", lambda _: session)
    response = client.get("/api/credits/checkout/cs_test")
    assert response.json()["payment_status"] == "paid"
    assert response.json()["credited"] is False
    db.scalar.return_value = "transaction-id"
    assert client.get("/api/credits/checkout/cs_test").json()["credited"] is True
    session["metadata"] = {"user_id": "another-user"}
    assert client.get("/api/credits/checkout/cs_test").status_code == 404
    session["metadata"] = {}
    assert client.get("/api/credits/checkout/cs_test").status_code == 404
