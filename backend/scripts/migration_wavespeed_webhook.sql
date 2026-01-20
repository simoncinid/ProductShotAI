-- Aggiunge wavespeed_request_id per collegare il task WaveSpeed alla Generation (webhook)
-- Eseguire: psql "$DATABASE_URL" -f backend/scripts/migration_wavespeed_webhook.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generations_photoshotai'
      AND column_name = 'wavespeed_request_id'
  ) THEN
    ALTER TABLE generations_photoshotai ADD COLUMN wavespeed_request_id VARCHAR(255);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_generations_wavespeed_request_id_photoshotai
  ON generations_photoshotai (wavespeed_request_id)
  WHERE wavespeed_request_id IS NOT NULL;
