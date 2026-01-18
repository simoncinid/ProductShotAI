# Variabili d'Ambiente - ProductShotAI

## 🟢 RENDER.COM (Backend)

Configura queste variabili d'ambiente nella dashboard di Render per il servizio backend:

### Database
```
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
```
**Nota:** Render fornisce automaticamente questa variabile se usi il loro PostgreSQL. Se usi un database esterno (es. DigitalOcean), inserisci manualmente la connection string completa.

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

### Free Tier
```
FREE_GENERATIONS_PER_MONTH=3
```

### Upload Limits (opzionali, hanno valori di default)
```
MAX_UPLOAD_SIZE_MB=10
ALLOWED_IMAGE_TYPES=image/jpeg,image/png
```

---

## 🔵 VERCEL (Frontend)

**IMPORTANTE:** Nelle impostazioni del progetto Vercel, imposta:
- **Root Directory:** `frontend`

Oppure Vercel lo rileverà automaticamente dal file `vercel.json` nella root.

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
```
**Nota:** Lo storage locale funziona anche in produzione su Render (hanno storage persistente).

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
