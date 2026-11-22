"""A studio reload/retry must not create or charge for a second provider job."""
import os
os.environ.setdefault('DATABASE_URL','mysql+aiomysql://test:test@localhost/test')
os.environ.setdefault('JWT_SECRET_KEY','isolated-regression-test-secret')
os.environ.setdefault('WAVESPEED_API_KEY','test')
os.environ.setdefault('STORAGE_TYPE','database')
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError
from app import main

@pytest.fixture
def setup(monkeypatch):
    user=SimpleNamespace(id='owner',credits_balance=5)
    db=SimpleNamespace(get=AsyncMock(return_value=None),commit=AsyncMock(),rollback=AsyncMock(),refresh=AsyncMock(),add=lambda _:None)
    async def session():yield db
    main.app.dependency_overrides[main.get_db]=session
    main.app.dependency_overrides[main.get_current_user]=lambda:user
    provider=SimpleNamespace(create_edit_task=AsyncMock(return_value={'id':'provider-job'}))
    monkeypatch.setattr(main.wavespeed,'get_wavespeed_client',lambda:provider)
    monkeypatch.setattr(main,'_get_wavespeed_webhook_url',lambda:'https://example.com/webhook')
    with TestClient(main.app) as client:yield client,user,db,provider
    main.app.dependency_overrides.clear()

def body():return {'request_id':str(uuid4()),'prompt':'Clean white background','image_url':'https://www.productshotai.com/images/product1.png','resolution':'4k','aspect_ratio':'1:1'}

def test_existing_request_is_returned_even_after_credits_have_been_used(setup):
    client,user,db,provider=setup;payload=body();user.credits_balance=0
    db.get.return_value=SimpleNamespace(id=payload['request_id'],user_id='owner',status='completed',output_image_url='https://example.com/result.jpg',error_message=None)
    response=client.post('/api/generate-paid',json=payload)
    assert response.status_code==200 and response.json()['generation_id']==payload['request_id']
    provider.create_edit_task.assert_not_awaited();db.commit.assert_not_awaited()

def test_request_id_cannot_read_another_accounts_generation(setup):
    client,user,db,provider=setup
    db.get.return_value=SimpleNamespace(user_id='someone-else')
    assert client.post('/api/generate-paid',json=body()).status_code==404
    provider.create_edit_task.assert_not_awaited()

def test_concurrent_insert_conflict_returns_existing_job_without_another_provider_call(setup):
    client,user,db,provider=setup;payload=body()
    job=SimpleNamespace(id=payload['request_id'],user_id='owner',status='processing',output_image_url=None,error_message=None)
    db.get.side_effect=[None,job]
    db.commit.side_effect=IntegrityError('duplicate',{},Exception('duplicate primary key'))
    response=client.post('/api/generate-paid',json=payload)
    assert response.status_code==202 and response.json()['generation_id']==payload['request_id']
    db.rollback.assert_awaited_once();provider.create_edit_task.assert_not_awaited()

def test_new_request_uses_provided_id_and_starts_provider_once(setup):
    client,user,db,provider=setup;payload=body();added=[];db.add=added.append
    response=client.post('/api/generate-paid',json=payload)
    assert response.status_code==202 and response.json()['generation_id']==payload['request_id']
    assert added[0].id==payload['request_id'];provider.create_edit_task.assert_awaited_once()

def test_invalid_request_id_rejected_before_provider(setup):
    client,user,db,provider=setup;payload=body();payload['request_id']='not-a-uuid'
    assert client.post('/api/generate-paid',json=payload).status_code==422
    provider.create_edit_task.assert_not_awaited()
