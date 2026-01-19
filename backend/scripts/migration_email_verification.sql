-- Migration: Email verification con OTP per ProductShotAI
-- Eseguire a mano: psql "$DATABASE_URL" -f backend/scripts/migration_email_verification.sql
--
-- Aggiunge a users_photoshotai:
--   email_verified         : se l'email è stata verificata con OTP
--   verification_otp_hash  : hash bcrypt dell'OTP in attesa (NULL quando verificato o scaduto)
--   verification_otp_expires_at : scadenza OTP (NULL se non in attesa)
--
-- Gli utenti esistenti vengono marcati come email_verified=TRUE per non bloccarli.

-- 1. Aggiungi le colonne (default per nuove righe)
ALTER TABLE users_photoshotai ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users_photoshotai ADD COLUMN IF NOT EXISTS verification_otp_hash VARCHAR(255);
ALTER TABLE users_photoshotai ADD COLUMN IF NOT EXISTS verification_otp_expires_at TIMESTAMPTZ;

-- 2. Utenti già presenti: marca come verificati (non hanno mai avuto OTP)
UPDATE users_photoshotai SET email_verified = TRUE WHERE verification_otp_hash IS NULL AND verification_otp_expires_at IS NULL;
