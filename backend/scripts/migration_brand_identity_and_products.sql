-- Migration: Brand Identity e Products per ProductShotAI
-- Eseguire a mano in DBeaver (o: psql "$DATABASE_URL" -f backend/scripts/migration_brand_identity_and_products.sql)
--
-- Crea:
--   brand_identities_photoshotai   : identità di brand per utente (1:1 con user)
--   brand_identity_images_photoshotai : max 3 immagini per brand (controllo in app)
--   products_photoshotai           : prodotti per utente
--   product_images_photoshotai     : max 3 immagini per prodotto (controllo in app)
-- Estende generations_photoshotai con: product_id, product_name_snapshot, apply_brand_identity,
--   brand_identity_snapshot, product_prompt_snapshot, final_prompt, input_params
--
-- Nessuna modifica distruttiva alle tabelle esistenti.

-- =============================================================================
-- 1. brand_identities_photoshotai (1 riga per utente)
-- =============================================================================
CREATE TABLE IF NOT EXISTS brand_identities_photoshotai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users_photoshotai(id) ON DELETE CASCADE,
  average_customer TEXT,
  sales_channels TEXT,
  price_range TEXT,
  lighting_style TEXT,
  photo_style JSONB,
  color_palette JSONB,
  brand_notes TEXT,
  analysis_text TEXT,
  analysis_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_identities_user_photoshotai
  ON brand_identities_photoshotai (user_id);

-- =============================================================================
-- 2. brand_identity_images_photoshotai (max 3 per brand_identity_id, enforced in app)
-- =============================================================================
CREATE TABLE IF NOT EXISTS brand_identity_images_photoshotai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_identity_id UUID NOT NULL REFERENCES brand_identities_photoshotai(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_photoshotai(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_identity_images_brand_id_photoshotai
  ON brand_identity_images_photoshotai (brand_identity_id);
CREATE INDEX IF NOT EXISTS idx_brand_identity_images_user_photoshotai
  ON brand_identity_images_photoshotai (user_id);

-- =============================================================================
-- 3. products_photoshotai
-- =============================================================================
CREATE TABLE IF NOT EXISTS products_photoshotai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_photoshotai(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  default_apply_brand_identity BOOLEAN NOT NULL DEFAULT true,
  product_prompt TEXT NOT NULL,
  analysis_text TEXT,
  analysis_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_user_created_photoshotai
  ON products_photoshotai (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_products_user_name_photoshotai
  ON products_photoshotai (user_id, name);

-- =============================================================================
-- 4. product_images_photoshotai (max 3 per product_id, enforced in app)
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_images_photoshotai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products_photoshotai(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_photoshotai(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id_photoshotai
  ON product_images_photoshotai (product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_user_photoshotai
  ON product_images_photoshotai (user_id);

-- =============================================================================
-- 5. Estensione generations_photoshotai (product, brand identity, final prompt)
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generations_photoshotai'
      AND column_name = 'product_id'
  ) THEN
    ALTER TABLE generations_photoshotai
      ADD COLUMN product_id UUID REFERENCES products_photoshotai(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generations_photoshotai'
      AND column_name = 'product_name_snapshot'
  ) THEN
    ALTER TABLE generations_photoshotai ADD COLUMN product_name_snapshot TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generations_photoshotai'
      AND column_name = 'apply_brand_identity'
  ) THEN
    ALTER TABLE generations_photoshotai ADD COLUMN apply_brand_identity BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generations_photoshotai'
      AND column_name = 'brand_identity_snapshot'
  ) THEN
    ALTER TABLE generations_photoshotai ADD COLUMN brand_identity_snapshot JSONB;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generations_photoshotai'
      AND column_name = 'product_prompt_snapshot'
  ) THEN
    ALTER TABLE generations_photoshotai ADD COLUMN product_prompt_snapshot TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generations_photoshotai'
      AND column_name = 'final_prompt'
  ) THEN
    ALTER TABLE generations_photoshotai ADD COLUMN final_prompt TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generations_photoshotai'
      AND column_name = 'input_params'
  ) THEN
    ALTER TABLE generations_photoshotai ADD COLUMN input_params JSONB;
  END IF;
END $$;

-- Indice per filtrare generazioni "no product" (product_id IS NULL) per user
CREATE INDEX IF NOT EXISTS idx_generations_user_product_created_photoshotai
  ON generations_photoshotai (user_id, product_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Fine migration
