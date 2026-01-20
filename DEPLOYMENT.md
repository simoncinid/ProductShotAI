# Guida al Deployment - ProductShotAI

## 🚀 Deploy su Render (Backend)

1. Vai su [Render.com](https://render.com) e crea un account
2. Clicca su "New +" → "Web Service"
3. Connetti il repository GitHub: `simoncinid/ProductShotAI`
4. Configura il servizio:
   - **Name:** `productshotai-backend` (o il nome che preferisci)
   - **Environment:** `Python 3`
   - **Python Version:** `3.11` — I file `.python-version` (root del repo e `backend/`, contenuto: `3.11.9`) forzano Render a usare Python 3.11. In alternativa, imposta `PYTHON_VERSION=3.11.9` in Environment. ⚠️ **Non usare Python 3.13**: alcune dipendenze (es. Pillow) causano `KeyError: '__version__'` durante il build. `runtime.txt` **non è supportato** da Render.
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory:** `backend` (IMPORTANTE!)

5. Aggiungi un database PostgreSQL:
   - Clicca "New +" → "PostgreSQL"
   - Render genererà automaticamente la variabile `DATABASE_URL`

6. **Crea le tabelle a mano (una sola volta):** l'app non esegue DDL all’avvio. Dalla root del repo:
   ```bash
   psql "$DATABASE_URL" -f backend/scripts/init_schema.sql
   ```
   (Su Render: Dashboard del DB → Connect → copia External Database URL e usalo come `DATABASE_URL`.)

7. Configura le variabili d'ambiente (vedi `ENV_VARIABLES.md`)

8. Clicca "Create Web Service"

---

## 🎨 Deploy su Vercel (Frontend)

1. Vai su [Vercel.com](https://vercel.com) e crea un account
2. Clicca "Add New..." → "Project"
3. Importa il repository GitHub: `simoncinid/ProductShotAI`
4. Configura il progetto:
   - **Framework Preset:** Next.js (dovrebbe essere rilevato automaticamente)
   - **Root Directory:** `frontend` ⚠️ **IMPORTANTE!**
   - **Build Command:** `npm run build` (o lascia default)
   - **Output Directory:** `.next` (o lascia default)
   - **Install Command:** `npm install` (o lascia default)

5. Aggiungi la variabile d'ambiente:
   - `NEXT_PUBLIC_API_URL` = URL del tuo backend Render (es. `https://productshotai-backend.onrender.com`)

6. Clicca "Deploy"

---

## ⚙️ Configurazione Root Directory

### Render (Backend)
Nelle impostazioni del servizio Render:
- **Root Directory:** `backend`

Questo dice a Render di eseguire i comandi dalla cartella `backend/`.

### Vercel (Frontend)
**IMPORTANTE:** Devi impostare manualmente nelle impostazioni del progetto Vercel:
- Vai su **Settings** → **General**
- Imposta **Root Directory:** `frontend`

Il file `vercel.json` non supporta la proprietà `rootDirectory` - va configurata manualmente nel dashboard.

---

## 🔗 Collegare Backend e Frontend

1. **Backend URL:** Dopo il deploy su Render, ottieni l'URL (es. `https://productshotai-backend.onrender.com`)

2. **Frontend:** Aggiungi in Vercel la variabile:
   ```
   NEXT_PUBLIC_API_URL=https://productshotai-backend.onrender.com
   ```

3. **CORS:** Nel backend Render, assicurati che `CORS_ORIGINS` includa:
   ```
   https://tuo-progetto.vercel.app
   https://www.tuo-dominio.com (se hai un dominio custom)
   ```

---

## 📝 Checklist Pre-Deploy

### Backend (Render)
- [ ] Repository connesso
- [ ] Root Directory impostata su `backend`
- [ ] Build Command: `cd backend && pip install -r requirements.txt`
- [ ] Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Database PostgreSQL creato
- [ ] Tutte le variabili d'ambiente configurate (vedi `ENV_VARIABLES.md`)
- [ ] Storage configurato (locale o S3)

### Frontend (Vercel)
- [ ] Repository connesso
- [ ] Root Directory impostata su `frontend`
- [ ] Framework: Next.js
- [ ] Variabile `NEXT_PUBLIC_API_URL` configurata con URL backend Render

---

## 🐛 Troubleshooting

### Backend non si avvia
- Verifica che `Root Directory` sia `backend`
- Controlla i log su Render per errori
- Verifica che tutte le variabili d'ambiente siano configurate

### Frontend non trova il backend
- Verifica che `NEXT_PUBLIC_API_URL` sia corretto
- Controlla che il backend sia online su Render
- Verifica CORS_ORIGINS nel backend

### Errori di build
- **Backend:** Verifica che `requirements.txt` sia nella cartella `backend/`
- **Frontend:** Verifica che `package.json` sia nella cartella `frontend/`
- Controlla i log di build per dettagli

### `KeyError: '__version__'` durante il build del backend
Succede se Render usa **Python 3.13**. Soluzione: assicurati che esista `.python-version` con `3.11.9` nella root del repo (o in `backend/`) oppure imposta `PYTHON_VERSION=3.11.9` in Environment su Render. `runtime.txt` **non** è supportato da Render.

### Immagini non si caricano
- Se usi storage locale, verifica che la cartella `storage/` esista
- Se usi S3, verifica le credenziali AWS
- Controlla i permessi del filesystem su Render

### "Generation failed" / "error generating image" benché il backend completi
La generazione free/paid resta in attesa 30–60+ secondi (polling WaveSpeed). Se il **request timeout** del servizio Render è troppo basso (es. 30s di default), il proxy chiude la connessione **prima** che il backend risponda: il frontend va in timeout e mostra l’errore, mentre il backend termina in secondo piano.

**Soluzioni:**
1. **Aumentare il Request timeout su Render:** Dashboard del servizio → **Settings** → **Advanced** → **Request timeout** (o equivalente). Impostalo ad almeno **120–180 secondi**.
2. Il frontend ha già un timeout axios di 3 minuti per le chiamate di generazione; il collo di bottiglia è in genere il proxy Render.
3. (Futuro) Passare a un flusso asincrono: `POST /generate-free` risponde subito con `generation_id` e `status: "processing"`, e il frontend fa polling su `GET /api/generations/{id}` fino a `completed`. Così nessuna richiesta resta aperta per oltre 1–2 secondi.

---

## 🔄 Aggiornamenti

Dopo ogni push su GitHub:
- **Render:** Si aggiorna automaticamente (se hai abilitato auto-deploy)
- **Vercel:** Si aggiorna automaticamente (default)

Per forzare un nuovo deploy:
- Render: Dashboard → Manual Deploy
- Vercel: Dashboard → Redeploy

---

## 🌐 Domini Custom

### Render
1. Dashboard → Settings → Custom Domain
2. Aggiungi il tuo dominio
3. Segui le istruzioni per configurare DNS

### Vercel
1. Dashboard → Settings → Domains
2. Aggiungi il tuo dominio
3. Configura DNS come indicato

**Ricorda:** Aggiorna `CORS_ORIGINS` nel backend con il nuovo dominio!
