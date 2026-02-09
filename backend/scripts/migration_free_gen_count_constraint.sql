-- Migrazione: vincolo count <= 1 su free_generation_log_photoshotai
-- Previene count=2 (o superiori) anche in caso di bug. Eseguire dopo il deploy del fix in utils.reserve_free_generation_slot.
--
-- Eseguire: psql "$DATABASE_URL" -f backend/scripts/migration_free_gen_count_constraint.sql

-- 1. Correggere eventuali righe già con count > 1 (dovute a race pre-fix)
UPDATE free_generation_log_photoshotai
SET count = 1
WHERE count > 1;

-- 2. Aggiungere vincolo: il DB rifiuta qualsiasi insert/update che porti count > 1 (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_free_gen_count_max_photoshotai'
  ) THEN
    ALTER TABLE free_generation_log_photoshotai
    ADD CONSTRAINT chk_free_gen_count_max_photoshotai CHECK (count <= 1);
  END IF;
END $$;
