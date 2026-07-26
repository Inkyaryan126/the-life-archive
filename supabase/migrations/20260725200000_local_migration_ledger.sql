-- Migration: 20260725200000_local_migration_ledger.sql
-- Description: Idempotent migration ledger for tracking local JSON import records

CREATE TABLE IF NOT EXISTS public.local_migration_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_system TEXT NOT NULL DEFAULT 'local_json',
  source_type TEXT NOT NULL,
  source_key TEXT NOT NULL,
  destination_table TEXT NOT NULL,
  destination_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  source_hash TEXT NOT NULL,
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  verified_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  migration_run_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT local_migration_records_source_key_unique UNIQUE (source_system, source_type, source_key, owner_id)
);

ALTER TABLE public.local_migration_records ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.local_migration_records FROM public, anon, authenticated;
GRANT ALL ON public.local_migration_records TO service_role;

CREATE INDEX IF NOT EXISTS idx_lmr_owner_id ON public.local_migration_records (owner_id);
CREATE INDEX IF NOT EXISTS idx_lmr_dest ON public.local_migration_records (destination_table, destination_id);
CREATE INDEX IF NOT EXISTS idx_lmr_source ON public.local_migration_records (source_system, source_type, source_key);
CREATE INDEX IF NOT EXISTS idx_lmr_last_seen ON public.local_migration_records (last_seen_at);
