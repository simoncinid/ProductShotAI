"""Resumable, individual recovery mail. Prepare, pilot, then explicitly --send.

Credentials: root .env.audit.local (DB) and .env.campaign.local (Gmail).
Private raw links: ignored db_backup/recovery-20261122/manifest.json (0600).
SMTP acceptance is recorded; it does not prove inbox delivery. Ambiguous sends
are NEVER retried automatically. Existing campaigns/templates are untouched.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import formataddr, make_msgid
from html import escape
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import smtplib
import ssl
import time
from urllib.parse import unquote, urlsplit
import uuid

import dns.resolver
import pymysql
from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[2]
DIR = ROOT / 'db_backup/recovery-20261122'
CAMPAIGN = 'recovery_20261122'
SITE = 'https://www.productshotai.com'


def connect():
    cfg = dotenv_values(ROOT / '.env.audit.local')
    u = urlsplit(cfg['DATABASE_URL'])
    return pymysql.connect(host=u.hostname, port=u.port, user=unquote(u.username),
        password=unquote(u.password), database=u.path.lstrip('/'),
        ssl=ssl.create_default_context(cadata=cfg['CA_CERTIFICATE']),
        cursorclass=pymysql.cursors.DictCursor, autocommit=True, connect_timeout=15)


def secure_json(path, value):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w') as f:
        json.dump(value, f, indent=2)


def domain_status(domain):
    if domain in {'example.com','example.org','example.net','test.com','localhost'} or domain.endswith(('.invalid','.test','.local')):
        return 'reserved/test domain'
    try:
        answers = dns.resolver.resolve(domain, 'MX', lifetime=8)
        return 'null MX' if all(str(x.exchange) == '.' for x in answers) else 'ok'
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
        return 'no MX'
    except Exception:
        return 'DNS uncertain'


def prepare():
    DIR.mkdir(parents=True, exist_ok=True, mode=0o700)
    path = DIR / 'manifest.json'
    if path.exists():
        manifest=json.loads(path.read_text())
        with connect() as conn, conn.cursor() as c:
            insert_invitations(c,manifest['recipients'])
        print(json.dumps({'prepared':len(manifest['recipients']),'skipped':manifest['skipped']}))
        return
    with connect() as conn, conn.cursor() as c:
        c.execute('SELECT id,email,email_verified FROM users_photoshotai ORDER BY created_at,id')
        users = c.fetchall()
        domains = {u['email'].strip().rsplit('@',1)[-1].lower() for u in users}
        with ThreadPoolExecutor(max_workers=12) as pool:
            statuses = dict(zip(domains, pool.map(domain_status, domains)))
        rows, skipped, seen = [], {}, set()
        for user in users:
            email = user['email'].strip()
            reason = None
            if not re.fullmatch(r'[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+', email) or any(x in email for x in '\r\n'):
                reason = 'invalid syntax'
            elif email.casefold() in seen:
                reason = 'duplicate'
            else:
                reason = statuses[email.rsplit('@',1)[1].lower()]
                if reason == 'ok': reason = None
            if reason:
                skipped[reason] = skipped.get(reason,0)+1
                continue
            seen.add(email.casefold())
            token, unsub = secrets.token_urlsafe(40), secrets.token_urlsafe(40)
            rows.append({'id':str(uuid.uuid4()), 'user_id':user['id'], 'email':email,
                'verified':bool(user['email_verified']), 'token':token, 'unsubscribe':unsub,
                'expires_at':(datetime.now(timezone.utc)+timedelta(days=14)).isoformat(), 'status':'prepared'})
        # Write raw links securely BEFORE inserting any hashed invitations.
        secure_json(path, {'campaign':CAMPAIGN, 'skipped':skipped, 'recipients':rows})
        insert_invitations(c,rows)
    print(json.dumps({'database_accounts':len(users),'prepared':len(rows),'skipped':skipped}))


def insert_invitations(c, rows):
    for row in rows:
        c.execute('''INSERT IGNORE INTO recovery_invitations_photoshotai
                (id,user_id,campaign,token_hash,unsubscribe_hash,expires_at,send_status)
                VALUES (%s,%s,%s,%s,%s,%s,'prepared')''',
                (row['id'],row['user_id'],CAMPAIGN,hashlib.sha256(row['token'].encode()).hexdigest(),
                 hashlib.sha256(row['unsubscribe'].encode()).hexdigest(),datetime.fromisoformat(row['expires_at']).replace(tzinfo=None)))


def message(row, sender, to=None):
    link = SITE+'/recover#token='+row['token']
    unsubscribe = SITE+'/unsubscribe#token='+row['unsubscribe']
    deadline = datetime.fromisoformat(row['expires_at']).strftime('%d %B %Y at %H:%M UTC')
    msg=EmailMessage()
    msg['Subject'] = 'We’re sorry — your ProductShotAI account + a personal 30% offer'
    msg['From'] = formataddr(('Diego at ProductShotAI',sender))
    msg['To'] = to or row['email']
    msg['Reply-To'] = sender
    msg['Message-ID'] = make_msgid(domain=sender.split('@')[1])
    msg['List-Unsubscribe'] = '<'+unsubscribe+'>'
    text=f'''Hi,

You signed up for ProductShotAI, and we owe you an apology. An account verification issue prevented some users from completing activation. We’ve fixed that issue and improved the mobile experience. We’re sorry for the frustration.

As a thank-you for giving us another chance, your account has a personal 30% discount on one credit-pack purchase — including if you have purchased before.

Activate your account and view your offer:
{link}

Click the button on that page to verify your email and sign in. The discount is attached to your account and applied automatically at Stripe checkout. No code is needed. It can be used once, on any credit pack, until {deadline}. Credits never expire; there is no subscription. No purchase is required to reactivate your account.

This private link signs in to your account. Please don’t forward it. Once you’ve used it, you can sign in normally and your offer will still be there until used or expired. If you didn’t create this account, ignore the activation link and unsubscribe below.

If anything still gets in your way, reply to this email — I’d like to help.

Diego
ProductShotAI
{SITE}

You’re receiving this because this email address was used to create a ProductShotAI account.
Stop recovery campaign emails: {unsubscribe}
'''
    msg.set_content(text)
    msg.add_alternative(f'''<!doctype html><html><body style="margin:0;background:#f3f5f6;font-family:Arial,sans-serif;color:#17212b;line-height:1.6"><div style="max-width:560px;margin:24px auto;background:white;padding:28px;border-radius:16px"><p style="font-weight:bold;color:#0f766e">ProductShotAI</p><h1 style="font-size:27px;line-height:1.2">We’re sorry for the trouble.</h1><p>You signed up for ProductShotAI, and we owe you an apology. An account verification issue prevented some users from completing activation. <strong>We’ve fixed that issue and improved the mobile experience.</strong> We’re sorry for the frustration.</p><div style="padding:20px;background:#e8faf5;border-radius:12px"><p style="font-size:24px;font-weight:bold;margin:0">Your personal 30% off</p><p style="margin-bottom:0">One credit pack, automatically discounted at checkout. Valid even if you’ve purchased before.</p></div><p style="margin:28px 0"><a href="{escape(link)}" style="display:inline-block;background:#0f766e;color:white;padding:15px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Activate my account &amp; get 30% off</a></p><p>Click the button on the page to verify your email and sign in. Your offer is tied to your account: no code needed, one use on any credit pack, until <strong>{deadline}</strong>. Credits never expire. No subscription. No purchase needed to reactivate.</p><p style="font-size:13px;color:#475569">This private link signs in to your account. Please don’t forward it. Once used, you can sign in normally and still find your offer until used or expired. If you didn’t create this account, ignore the activation link.</p><p>Still having trouble? Reply to this email — I’d like to help.</p><p>Diego<br>ProductShotAI</p><hr style="border:0;border-top:1px solid #e2e8f0"><p style="font-size:12px;color:#64748b">You’re receiving this because this email address was used to create a ProductShotAI account.<br><a href="{escape(unsubscribe)}" style="color:#475569">Stop recovery campaign emails</a></p></div></body></html>''',subtype='html')
    return msg


def smtp():
    cfg=dotenv_values(ROOT/'.env.campaign.local')
    client=smtplib.SMTP_SSL('smtp.gmail.com',465,timeout=35)
    client.login(cfg['GMAIL_USER'],cfg['GMAIL_PASS'].replace(' ',''))
    return client,cfg['GMAIL_USER']


def send(pilot=False):
    path=DIR/'manifest.json'
    manifest=json.loads(path.read_text())
    client,sender=smtp()
    if pilot:
        row=manifest['recipients'][0]
        # Pilot template has no real recipient activation token.
        row={**row,'token':'preview-link-not-for-activation','unsubscribe':'preview-only'}
        client.send_message(message(row,sender,to=sender));client.quit()
        print('Pilot accepted by Gmail SMTP, sent to the sending mailbox only.');return
    with connect() as conn, conn.cursor() as c:
        for row in manifest['recipients']:
            c.execute('SELECT send_status,unsubscribed_at FROM recovery_invitations_photoshotai WHERE id=%s',(row['id'],))
            state=c.fetchone()
            if not state or state['send_status']!='prepared' or state['unsubscribed_at']:continue
            # Mark in-flight durably before SMTP. Never automatically retry an ambiguous send.
            c.execute("UPDATE recovery_invitations_photoshotai SET send_status='sending',sent_at=UTC_TIMESTAMP() WHERE id=%s AND send_status='prepared'",(row['id'],))
            if c.rowcount!=1:continue
            row['status']='sending';secure_json(path,manifest)
            try:
                refused=client.send_message(message(row,sender))
                state='accepted' if not refused else 'refused'
            except smtplib.SMTPRecipientsRefused:
                state='refused'
            except (smtplib.SMTPException,OSError):
                row['status']='unknown';secure_json(path,manifest)
                c.execute("UPDATE recovery_invitations_photoshotai SET send_status='unknown' WHERE id=%s",(row['id'],))
                print('SMTP interrupted; stopped to avoid duplicate or uncertain deliveries.',flush=True);raise
            c.execute('UPDATE recovery_invitations_photoshotai SET send_status=%s WHERE id=%s',(state,row['id']))
            row['status']=state;secure_json(path,manifest)
            counts={s:sum(r['status']==s for r in manifest['recipients']) for s in ['accepted','refused','prepared','unknown']}
            print(json.dumps(counts),flush=True)
            time.sleep(2)
    client.quit()


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--prepare',action='store_true');parser.add_argument('--pilot',action='store_true');parser.add_argument('--send',action='store_true');args=parser.parse_args()
    if args.prepare:prepare()
    elif args.pilot:send(pilot=True)
    elif args.send:send()
    else:parser.error('Choose --prepare, --pilot or --send')
