"""Invio email via SMTP Gmail (OTP verifica ProductShotAI)."""
import smtplib
from html import escape
from urllib.parse import urlencode
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings

SUBJECT = "Your ProductShotAI Verification Code"
BODY_HTML = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
  .wrap { max-width: 480px; margin: 0 auto; padding: 32px 24px; }
  .brand { font-size: 22px; font-weight: 700; color: #0d9488; letter-spacing: -0.5px; }
  h1 { font-size: 20px; font-weight: 600; margin: 24px 0 16px; }
  p { margin: 0 0 16px; font-size: 15px; color: #4b5563; }
  .otp { font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #0d9488; margin: 24px 0; font-family: ui-monospace, monospace; }
  .muted { font-size: 13px; color: #9ca3af; margin-top: 24px; }
  a { color: #0d9488; text-decoration: none; }
</style></head>
<body>
<div class="wrap">
  <div class="brand">ProductShotAI</div>
  <h1>Verify your email address</h1>
  <p>Your photo studio is almost ready. Open the link below, then press Verify to activate your account.</p>
  <p><a href="{activation_url}" style="display:inline-block;background:#0d9488;color:#ffffff;padding:14px 22px;border-radius:8px;font-weight:600">Activate my account</a></p>
  <p>Or enter this code on the verification page:</p>
  <div class="otp">{otp}</div>
  <p>This code expires in 15 minutes. If you didn't create an account, you can ignore this email.</p>
  <p class="muted">— The ProductShotAI Team</p>
</div>
</body>
</html>
"""

BODY_PLAIN = """ProductShotAI - Verify your email

Your photo studio is almost ready. Open this link, then press Verify:
{activation_url}

Or enter this code on the verification page:

  {otp}

This code expires in 15 minutes. If you didn't create an account, you can ignore this email.

— The ProductShotAI Team
"""


def send_verification_otp(to_email: str, otp: str) -> None:
    """Invia email con OTP di verifica (SMTP Gmail). Solleva in caso di errore SMTP."""
    if not settings.gmail_user or not settings.gmail_pass:
        raise RuntimeError("GMAIL_USER and GMAIL_PASS must be set to send verification emails")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = SUBJECT
    msg["From"] = settings.gmail_user
    msg["To"] = to_email

    # Fragment stays out of HTTP requests and referrer logs. Opening the link
    # only prefills the form; email preview scanners cannot consume the OTP.
    activation_url = "https://www.productshotai.com/verifyEmail#" + urlencode({"email": to_email, "code": otp})
    plain = BODY_PLAIN.replace("{otp}", otp).replace("{activation_url}", activation_url)
    html = BODY_HTML.replace("{otp}", escape(otp)).replace("{activation_url}", escape(activation_url, quote=True))
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as smtp:
        smtp.starttls()
        smtp.login(settings.gmail_user, settings.gmail_pass)
        smtp.sendmail(settings.gmail_user, to_email, msg.as_string())
