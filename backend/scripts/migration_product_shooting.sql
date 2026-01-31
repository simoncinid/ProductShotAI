-- Tabella product_shootings e colonna shooting_session_id su generations
-- Eseguire: psql "$DATABASE_URL" -f backend/scripts/migration_product_shooting.sql

CREATE TABLE IF NOT EXISTS product_shootings_photoshotai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_photoshotai(id),
  product_id UUID REFERENCES products_photoshotai(id) ON DELETE SET NULL,
  reference_image_url TEXT NOT NULL,
  shooting_style TEXT,
  prompts JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_shootings_user_photoshotai
  ON product_shootings_photoshotai (user_id);
CREATE INDEX IF NOT EXISTS idx_product_shootings_created_photoshotai
  ON product_shootings_photoshotai (created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generations_photoshotai'
      AND column_name = 'shooting_session_id'
  ) THEN
    ALTER TABLE generations_photoshotai
      ADD COLUMN shooting_session_id UUID REFERENCES product_shootings_photoshotai(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_generations_shooting_session_photoshotai
  ON generations_photoshotai (shooting_session_id)
  WHERE shooting_session_id IS NOT NULL;
