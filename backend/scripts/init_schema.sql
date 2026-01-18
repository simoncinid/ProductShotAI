-- Schema PostgreSQL per ProductShotAI (DB condiviso: prefisso _photoshotai su tabelle e indici)
-- Eseguire una sola volta, a mano: psql "$DATABASE_URL" -f backend/scripts/init_schema.sql
--
-- Se users_photoshotai esiste già con id VARCHAR (non UUID), migrare prima:
--   ALTER TABLE users_photoshotai ALTER COLUMN id TYPE UUID USING id::uuid;

-- 1. users_photoshotai (nessuna FK)
CREATE TABLE IF NOT EXISTS users_photoshotai (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  credits_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_login_at TIMESTAMPTZ
);

-- 2. credit_transactions_photoshotai (dipende da users_photoshotai)
CREATE TABLE IF NOT EXISTS credit_transactions_photoshotai (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users_photoshotai(id),
  change_amount INTEGER NOT NULL,
  type VARCHAR NOT NULL,
  reference_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. generations_photoshotai (dipende da users_photoshotai)
CREATE TABLE IF NOT EXISTS generations_photoshotai (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users_photoshotai(id),
  device_id VARCHAR,
  ip_address VARCHAR,
  input_image_url VARCHAR NOT NULL,
  output_image_url VARCHAR,
  prompt TEXT NOT NULL,
  model_name VARCHAR DEFAULT 'nano-banana-pro/edit-ultra',
  resolution VARCHAR DEFAULT '8k',
  aspect_ratio VARCHAR DEFAULT '1:1',
  is_free BOOLEAN DEFAULT false,
  status VARCHAR DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_generations_user_created_photoshotai ON generations_photoshotai (user_id, created_at);

-- 4. free_generation_log_photoshotai (nessuna FK)
CREATE TABLE IF NOT EXISTS free_generation_log_photoshotai (
  id UUID PRIMARY KEY,
  device_id VARCHAR NOT NULL,
  ip_address VARCHAR NOT NULL,
  month_year VARCHAR NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_free_gen_device_ip_month_photoshotai ON free_generation_log_photoshotai (device_id, ip_address, month_year);
