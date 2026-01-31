-- Storage nel DB: foto persistenti senza S3 (Render ha filesystem effimero).
-- Esegui una sola volta: psql "$DATABASE_URL" -f backend/scripts/migration_stored_files.sql

CREATE TABLE IF NOT EXISTS stored_files_photoshotai (
    id UUID PRIMARY KEY,
    path_key TEXT,
    content BYTEA NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stored_files_created_photoshotai ON stored_files_photoshotai (created_at);
