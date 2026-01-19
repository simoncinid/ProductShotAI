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

### Storage Configuration

**Opzione 1: Storage Locale (CONSIGLIATO per iniziare - funziona anche in produzione)**
```
STORAGE_TYPE=local
STORAGE_PATH=./storage
```
**Nota:** Render ha storage persistente per i servizi web, quindi lo storage locale funziona perfettamente anche in produzione. Usa questa opzione se non vuoi configurare AWS.

**Opzione 2: AWS S3 (opzionale - solo se hai bisogno di scalabilità avanzata)**
```
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=il-tuo-aws-access-key-id
AWS_SECRET_ACCESS_KEY=il-tuo-aws-secret-access-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=nome-del-tuo-bucket-s3
```

### App Configuration
```
ENVIRONMENT=production
CORS_ORIGINS=https://tuo-dominio-vercel.vercel.app,https://www.tuo-dominio.com
```
**Nota:** Aggiungi tutti i domini Vercel che userai (preview, production, etc.)

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

### Gmail SMTP (invio OTP verifica email al signup)
```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=xxxx-xxxx-xxxx-xxxx
```
**Nota:**
- Usa l’indirizzo Gmail che invierà le email (es. `noreply@tuodominio.com` se usi Google Workspace).
- **GMAIL_PASS:** se hai la 2FA attiva, genera una **App Password** in [Google Account → Sicurezza → Verifica in 2 passaggi → Password per le app](https://myaccount.google.com/apppasswords). Inserisci la password a 16 caratteri (es. `abcd efgh ijkl mnop`).
- Se `GMAIL_USER` o `GMAIL_PASS` non sono impostati, la registrazione risponderà con errore 503.

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
- [ ] `STORAGE_TYPE` - `local` (consigliato) o `s3` (opzionale)
- [ ] Se `STORAGE_TYPE=local`:
  - [ ] `STORAGE_PATH` - `./storage` (default, funziona su Render)
- [ ] Se `STORAGE_TYPE=s3` (solo se necessario):
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_REGION`
  - [ ] `S3_BUCKET_NAME`
- [ ] `ENVIRONMENT` - `production`
- [ ] `CORS_ORIGINS` - URL del frontend Vercel (separati da virgola)
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
3. **CORS_ORIGINS** deve includere tutti i domini che userai:
   - Production: `https://tuo-dominio.com`
   - Preview: `https://productshotai-git-main-tuo-username.vercel.app`
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
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000
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
**Nota:** Lo storage locale funziona anche in produzione su Render (hanno storage persistente). Per Stripe in locale usa `stripe listen --forward-to localhost:8000/api/webhooks/stripe` per ricevere i webhook. Per le email in sviluppo imposta `GMAIL_USER` e `GMAIL_PASS` (App Password da Google se hai 2FA).

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
4. ✅ Storage configurato (locale o S3 - locale è più semplice per iniziare)
5. ✅ CORS_ORIGINS include tutti i domini necessari
6. ✅ JWT_SECRET_KEY generato e sicuro
7. ✅ WaveSpeed API key valida
8. ✅ Test di connessione backend-frontend
9. ✅ Stripe: webhook `checkout.session.completed` su `https://tuo-backend.onrender.com/api/webhooks/stripe`
