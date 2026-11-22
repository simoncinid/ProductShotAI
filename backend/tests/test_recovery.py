import os
os.environ.setdefault('DATABASE_URL','mysql+aiomysql://test:test@localhost/test')
os.environ.setdefault('JWT_SECRET_KEY','isolated-regression-test-secret')
os.environ.setdefault('WAVESPEED_API_KEY','test')
os.environ.setdefault('STORAGE_TYPE','database')
from datetime import datetime,timedelta,timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock
import pytest
from fastapi.testclient import TestClient
from app import main,recovery

@pytest.fixture
def context():
    invitation=SimpleNamespace(id='invite',user_id='owner',activated_at=None,expires_at=datetime.utcnow()+timedelta(days=14),sent_at=datetime.utcnow(),used_at=None,checkout_session_id=None,checkout_key=None,checkout_pack_id=None)
    user=SimpleNamespace(id='owner',email_verified=False,verification_otp_hash='old',verification_otp_expires_at=None,last_login_at=None)
    async def scalar(query):
        return user if query.column_descriptions[0]['entity'] is main.User else invitation
    db=SimpleNamespace(scalar=AsyncMock(side_effect=scalar),get=AsyncMock(return_value=user),commit=AsyncMock())
    async def session():yield db
    main.app.dependency_overrides[main.get_db]=session
    main.app.dependency_overrides[main.get_current_user]=lambda:user
    with TestClient(main.app) as client:yield client,db,invitation,user
    main.app.dependency_overrides.clear()

def test_get_cannot_activate_and_post_consumes_once(context):
    client,db,i,u=context
    assert client.get('/api/recovery/activate').status_code==405
    assert not u.email_verified
    assert client.post('/api/recovery/activate',json={'token':'a'*54}).status_code==200
    assert u.email_verified and i.activated_at and u.verification_otp_hash is None
    assert client.post('/api/recovery/activate',json={'token':'a'*54}).status_code==400

@pytest.mark.parametrize('reason',['expired','unknown','already_used'])
def test_recovery_rejects_unusable_links(context,reason):
    client,db,i,u=context
    if reason=='expired':i.expires_at=datetime.utcnow()-timedelta(seconds=1)
    if reason=='unknown':db.scalar.side_effect=None;db.scalar.return_value=None
    if reason=='already_used':i.activated_at=datetime.utcnow()
    assert client.post('/api/recovery/activate',json={'token':'a'*54}).status_code==400
    assert not u.email_verified

def test_get_cannot_unsubscribe_and_post_records_suppression(context):
    c,db,i,u=context
    assert c.get('/api/recovery/unsubscribe').status_code==405
    assert c.post('/api/recovery/unsubscribe',json={'token':'a'*54}).status_code==200
    assert i.unsubscribed_at

@pytest.mark.parametrize('reason',['not_invited','not_sent','used','expired'])
def test_offer_not_available_to_ineligible_accounts(context,reason):
    c,db,i,u=context
    if reason=='not_invited':db.scalar.side_effect=None;db.scalar.return_value=None
    if reason=='not_sent':i.sent_at=None
    if reason=='used':i.used_at=datetime.utcnow()
    if reason=='expired':i.expires_at=datetime.utcnow()-timedelta(seconds=1)
    assert c.get('/api/recovery/offer').json()['available'] is False
    # Query is bound to authenticated owner, no invite ID supplied by client.
    assert 'user_id' in str(db.scalar.call_args.args[0])

@pytest.mark.asyncio
async def test_checkout_reuses_open_discount_session(context,monkeypatch):
    c,db,i,u=context
    i.checkout_session_id='cs_open';i.checkout_pack_id='starter'
    previous=SimpleNamespace(id='cs_open',status='open',url='https://checkout.stripe.com/test')
    monkeypatch.setattr(recovery.stripe.checkout.Session,'retrieve',lambda _:previous)
    monkeypatch.setattr(recovery.stripe.checkout.Session,'create',lambda **_:pytest.fail('must reuse checkout'))
    result=await recovery.discounted_checkout(db,u,'starter',{'metadata':{'user_id':'owner'}})
    assert result.id=='cs_open'

@pytest.mark.asyncio
async def test_checkout_uses_durable_idempotency_key(context,monkeypatch):
    c,db,i,u=context
    calls=[]
    def create(**kw):calls.append(kw);return SimpleNamespace(id='cs_new',url='https://checkout.stripe.com/test')
    monkeypatch.setattr(recovery.stripe.checkout.Session,'create',create)
    await recovery.discounted_checkout(db,u,'starter',{'metadata':{'user_id':'owner'},'success_url':'https://www.productshotai.com/pricing','cancel_url':'https://www.productshotai.com/pricing'})
    assert calls[0]['discounts']==[{'coupon':recovery.COUPON_ID}]
    assert calls[0]['metadata']['recovery_id']=='invite'
    assert calls[0]['idempotency_key'].endswith(i.checkout_key)
    assert i.checkout_session_id=='cs_new' and db.commit.await_count==2
