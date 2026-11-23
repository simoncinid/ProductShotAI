"""Activation email keeps the existing OTP and never verifies through a GET."""
import os
from email import message_from_string
from urllib.parse import urlparse, parse_qs
from unittest.mock import MagicMock

os.environ.setdefault('DATABASE_URL', 'mysql+aiomysql://test:test@localhost/test')
os.environ.setdefault('JWT_SECRET_KEY', 'isolated-regression-test-secret')
os.environ.setdefault('WAVESPEED_API_KEY', 'test')

from app import email_sender


def test_email_contains_one_explicit_confirmation_link_and_code(monkeypatch):
    monkeypatch.setattr(email_sender.settings, 'gmail_user', 'sender@example.com')
    monkeypatch.setattr(email_sender.settings, 'gmail_pass', 'fake-for-test')
    smtp = MagicMock()
    monkeypatch.setattr(email_sender.smtplib, 'SMTP', lambda *a, **kw: smtp)
    email_sender.send_verification_otp('shop+mobile@example.com', '012345')
    server = smtp.__enter__.return_value
    server.starttls.assert_called_once()
    message = message_from_string(server.sendmail.call_args.args[2])
    plain, html = [part.get_payload(decode=True).decode('utf-8') for part in message.get_payload()]
    link = next(line for line in plain.splitlines() if line.startswith('https://'))
    url = urlparse(link)
    assert url.netloc == 'www.productshotai.com'
    assert url.path == '/verifyEmail'
    assert not url.query
    assert parse_qs(url.fragment) == {'email': ['shop+mobile@example.com'], 'code': ['012345']}
    assert '012345' in plain and '012345' in html
    assert '15 minutes' in plain
    assert 'press Verify' in plain
    assert '&amp;code=' in html
    assert 'Activate my account' in html
    assert '<script' not in html
