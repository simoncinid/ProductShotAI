# Variabili d'Ambiente - ProductShotAI

## 🟢 RENDER.COM (Backend)

Configura queste variabili d'ambiente nella dashboard di Render per il servizio backend:

### Database
```
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
CA_CERTIFICATE=-----BEGIN CERTIFICATE-----
...certificato completo...
-----END CERTIFICATE-----
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```
**Nota:** 
- Render fornisce automaticamente `DATABASE_URL` (formato `postgresql://`). L'app lo converte in `postgresql+asyncpg://` in automatico, non serve modificarlo.
- Se usi un database esterno (es. DigitalOcean), inserisci `postgresql+asyncpg://user:password@host:5432/dbname`.
- `CA_CERTIFICATE` è opzionale ma richiesto per database che richiedono SSL con certificato CA personalizzato. Inserisci il certificato completo incluso `-----BEGIN CERTIFICATE-----` e `-----END CERTIFICATE-----`.
- **`DATABASE_SSL_REJECT_UNAUTHORIZED`**: su **Render** (PostgreSQL con certificati self-signed) imposta `false` per evitare `SSL: CERTIFICATE_VERIFY_FAILED`. Default: `true`.

### JWT Authentication
```
JWT_SECRET_KEY=genera-una-chiave-segreta-lunga-e-casuale-qui
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```
**Nota:** Genera `JWT_SECRET_KEY` con un comando tipo: `openssl rand -hex 32`

### WaveSpeed API
```
WAVESPEED_API_KEY=il-tuo-api-key-wavespeed
```

### Storage Configuration (foto persistenti senza AWS)

**Opzione 1: Database – CONSIGLIATO (persistente, gratis)**
```
STORAGE_TYPE=auto
PUBLIC_BASE_URL=https://tuo-backend.onrender.com
```
**Nota:** Le foto vanno nel DB (persistente, gratis). Esegui una sola volta: `psql "$DATABASE_URL" -f backend/scripts/migration_stored_files.sql`  
**`PUBLIC_BASE_URL`** è **obbligatorio** se usi WaveSpeed (e altre API che devono scaricare l’immagine da URL): evita l’errore *"image url is not allowed"*. Inserisci l’URL del backend (es. `https://productshotai-backend.onrender.com`, senza slash finale).

**Opzione 2: AWS S3 (opzionale - solo se hai bisogno di scalabilità avanzata)**
```
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=il-tuo-aws-access-key-id
AWS_SECRET_ACCESS_KEY=il-tuo-aws-secret-access-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=nome-del-tuo-bucket-s3
CLOUDFRONT_DOMAIN=d1q70pf5vjeyhc.cloudfront.net
```
**Opzione 3: Storage locale** (solo sviluppo; su Render i file in `./storage` si perdono a redeploy). **Nota su CloudFront:** `CLOUDFRONT_DOMAIN` è opzionale. Se lo imposti (solo il dominio, es. `d1q70pf5vjeyhc.cloudfront.net`, senza `https://`), gli URL delle immagini useranno CloudFront invece dell’URL S3 diretto. Utile per CDN e per soddisfare requisiti di URL “pubblici” come WaveSpeed. CloudFront ha un free tier.

### App Configuration
```
ENVIRONMENT=production
CORS_ORIGIN=https://product-shot-ai.vercel.app
```
Oppure (equivalente), per più domini separati da virgola:
```
CORS_ORIGINS=https://product-shot-ai.vercel.app,https://www.tuo-dominio.com,https://tuo-progetto-preview.vercel.app
```
**Note:**
- Puoi usare **CORS_ORIGIN** (un solo URL) o **CORS_ORIGINS** (più URL separati da virgola). Stesso formato: **senza trailing slash** (es. `https://product-shot-ai.vercel.app`).
- Includi tutti i domini frontend (production, preview Vercel, ecc.). In sviluppo: `http://localhost:3000`.
- **Dopo aver modificato CORS su Render, esegui un redeploy** del servizio backend.

### Python Version (solo se serve override)
```
PYTHON_VERSION=3.11.9
```
**Nota:** Opzionale. Il file `.python-version` nella root del repo imposta già 3.11.9. Usa questa variabile se Render ignora il file o per forzare una versione diversa. **Non usare 3.13** (causa errori di build con le dipendenze).

### Free Tier
```
FREE_GENERATIONS_PER_MONTH=3
```

### Stripe (pagamenti e accredito crediti)
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_STANDARD=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_POWER=price_xxxxxxxxxxxxxxxx
```
**Nota:**
- **STRIPE_SECRET_KEY:** chiave segreta Stripe (Dashboard → Developers → API keys). Usa `sk_test_...` in sviluppo, `sk_live_...` in produzione.
- **STRIPE_WEBHOOK_SECRET:** signing secret dell’endpoint webhook (Dashboard → Developers → Webhooks). Crea un endpoint che punta a `https://tuo-backend.onrender.com/api/webhooks/stripe` e seleziona l’evento `checkout.session.completed`. Copia il “Signing secret” (inizia con `whsec_`).
- **STRIPE_PRICE_***: Price ID Stripe per ogni pack (Starter, Standard, Pro, Power). Crea in Dashboard → Products i 4 prodotti con i rispettivi prezzi (es. $4.95, $13.35, $31.60, $69.00) e incolla i Price ID (iniziano con `price_`).

### Upload Limits (opzionali, hanno valori di default)
```
MAX_UPLOAD_SIZE_MB=10
ALLOWED_IMAGE_TYPES=image/jpeg,image/png
```

### Email OTP verifica (signup / resend-otp)

**Su Render l'SMTP (Gmail) è bloccato.** Usa **Resend** (API HTTP su porta 443).

**Opzione 1: Resend (consigliato su Render)**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM=ProductShotAI <onboarding@resend.dev>
```
- Crea un account su [resend.com](https://resend.com), ricava la API key nel Dashboard.
- `EMAIL_FROM` è opzionale: di default `ProductShotAI <onboarding@resend.dev>`. In produzione, dopo aver verificato il dominio su Resend, usa es. `noreply@tuodominio.com`.

**Opzione 2: Gmail SMTP (solo in locale, non su Render)**
```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=xxxx-xxxx-xxxx-xxxx
```
- **GMAIL_PASS:** con 2FA, genera una **App Password** in [Google Account → Sicurezza → Password per le app](https://myaccount.google.com/apppasswords).

L'app usa **Resend** se `RESEND_API_KEY` è impostato, altrimenti **Gmail** se entrambi `GMAIL_USER` e `GMAIL_PASS` sono impostati. Se nessuno dei due è configurato: errore 503.

---

## 🔵 VERCEL (Frontend)

**IMPORTANTE:** Nelle impostazioni del progetto Vercel:
- Vai su **Settings** → **General**
- Imposta **Root Directory:** `frontend`

⚠️ Deve essere configurato manualmente - non è supportato in `vercel.json`.

Configura queste variabili d'ambiente nella dashboard di Vercel:

### API Backend URL
```
NEXT_PUBLIC_API_URL=https://tuo-backend.onrender.com
```
**Nota:** Sostituisci con l'URL effettivo del tuo backend su Render (es. `https://productshotai-backend.onrender.com`)

### Sito (Sitemap / SEO)
```
NEXT_PUBLIC_SITE_URL=https://productshotai.com
```
**Nota:** (Opzionale) URL pubblico del frontend. Usato nella sitemap (`/sitemap.xml`) per Google Search Console. Se non impostato, si usa `https://productshotai.com`.

---

## 📋 Checklist Completa

### Render.com Backend
- [ ] `DATABASE_URL` - Connection string PostgreSQL
- [ ] `CA_CERTIFICATE` - (Opzionale) Certificato CA per connessione SSL al database
- [ ] `DATABASE_SSL_REJECT_UNAUTHORIZED` - Su Render: `false` (certificati self-signed). Default: `true`
- [ ] `JWT_SECRET_KEY` - Chiave segreta per JWT (genera una nuova!)
- [ ] `JWT_ALGORITHM` - `HS256`
- [ ] `JWT_EXPIRATION_HOURS` - `24`
- [ ] `WAVESPEED_API_KEY` - API key da WaveSpeed
- [ ] `STORAGE_TYPE` - `auto` (default: foto nel DB, persistente e gratis) oppure `database` | `s3` | `local`
- [ ] `PUBLIC_BASE_URL` - `https://tuo-backend.onrender.com` (obbligatorio per WaveSpeed)
- [ ] Migrazione per storage nel DB (una sola volta): `psql "$DATABASE_URL" -f backend/scripts/migration_stored_files.sql`
- [ ] Opzionale S3: se imposti variabili AWS e `STORAGE_TYPE=s3` (o `auto` con S3 configurato)
- [ ] `ENVIRONMENT` - `production`
- [ ] `CORS_ORIGIN` o `CORS_ORIGINS` - URL del frontend Vercel (es. `https://product-shot-ai.vercel.app` senza slash finale; più domini separati da virgola con CORS_ORIGINS)
- [ ] `FREE_GENERATIONS_PER_MONTH` - `3`
- [ ] `STRIPE_SECRET_KEY` - chiave segreta Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` - signing secret del webhook (evento `checkout.session.completed`)
- [ ] `STRIPE_PRICE_STARTER` - Price ID pack Starter
- [ ] `STRIPE_PRICE_STANDARD` - Price ID pack Standard
- [ ] `STRIPE_PRICE_PRO` - Price ID pack Pro
- [ ] `STRIPE_PRICE_POWER` - Price ID pack Power
- [ ] `GMAIL_USER` - Indirizzo Gmail per invio OTP
- [ ] `GMAIL_PASS` - Password Gmail o App Password (se 2FA)

### Vercel Frontend
- [ ] `NEXT_PUBLIC_API_URL` - URL completo del backend Render (con https://)

---

## 🔐 Generazione Chiavi Segrete

### JWT Secret Key
```bash
# Linux/Mac
openssl rand -hex 32

# Oppure online
# https://www.grc.com/passwords.htm
```

### AWS Credentials
1. Vai su AWS Console → IAM
2. Crea un nuovo utente con permessi S3
3. Genera Access Key e Secret Key
4. Crea un bucket S3 e nota il nome e la regione

---

## ⚠️ Note Importanti

1. **NON committare mai** file `.env` nel repository
2. **JWT_SECRET_KEY** deve essere diverso per ogni ambiente (dev, staging, production)
3. **CORS_ORIGIN** o **CORS_ORIGINS** devono includere tutti i domini frontend (senza trailing slash). Dopo una modifica su Render, fare **redeploy** del backend:
   - Production: `https://product-shot-ai.vercel.app` o `https://tuo-dominio.com`
   - Preview: `https://tuo-progetto-preview.vercel.app`
   - Development: `http://localhost:3000` (solo per test locali)
4. **DATABASE_URL** su Render viene fornita automaticamente se usi il loro PostgreSQL
5. **NEXT_PUBLIC_API_URL** deve essere pubblico (prefisso `NEXT_PUBLIC_`) perché viene usato nel browser

---

## 🧪 Test Locale

Per testare localmente, crea questi file:

### `backend/.env`
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/productshotai
JWT_SECRET_KEY=test-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
WAVESPEED_API_KEY=your-wavespeed-api-key
STORAGE_TYPE=local
STORAGE_PATH=./storage
PUBLIC_BASE_URL=http://localhost:8000
ENVIRONMENT=development
CORS_ORIGIN=http://localhost:3000
FREE_GENERATIONS_PER_MONTH=3

# Stripe (usa sk_test_ e price_ di test in sviluppo)
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
STRIPE_PRICE_STARTER=price_xxxxxxxx
STRIPE_PRICE_STANDARD=price_xxxxxxxx
STRIPE_PRICE_PRO=price_xxxxxxxx
STRIPE_PRICE_POWER=price_xxxxxxxx

# Gmail SMTP (OTP verifica email; in locale usa App Password se 2FA)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=xxxx-xxxx-xxxx-xxxx
```
**Nota:** Con `STORAGE_TYPE=auto` (default) le foto vanno nel DB (persistente, gratis). In locale puoi usare `local` o `auto`. Per Stripe in locale: `stripe listen --forward-to localhost:8000/api/webhooks/stripe`. Per le email in sviluppo: `GMAIL_USER` e `GMAIL_PASS` (App Password da Google se hai 2FA).

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Deploy Checklist

Prima del deploy finale:

1. ✅ Tutte le variabili d'ambiente configurate su Render
2. ✅ Tutte le variabili d'ambiente configurate su Vercel
3. ✅ Database PostgreSQL creato e accessibile
4. ✅ Storage: con `auto` (default) le foto sono nel DB (persistente, gratis). Eseguita migrazione `migration_stored_files.sql`
5. ✅ CORS_ORIGIN / CORS_ORIGINS includono tutti i domini necessari (e redeploy dopo eventuali modifiche)
6. ✅ JWT_SECRET_KEY generato e sicuro
7. ✅ WaveSpeed API key valida
8. ✅ Test di connessione backend-frontend
9. ✅ Stripe: webhook `checkout.session.completed` su `https://tuo-backend.onrender.com/api/webhooks/stripe`
