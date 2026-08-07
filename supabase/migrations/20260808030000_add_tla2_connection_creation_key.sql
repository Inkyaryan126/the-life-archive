-- ============================================================================
-- TLA 2.0 Phase 3 Additive Migration: Dedicated Connection Creation Key
-- Sequence: 20260808030000
-- Description: Adds creation_key column and unique constraint for wizard idempotency
-- ============================================================================

ALTER TABLE public.people_connections
ADD COLUMN IF NOT EXISTS creation_key UUID NULL;

-- Unique constraint ensuring (creator_user_id, creation_key) idempotency
CREATE UNIQUE INDEX IF NOT EXISTS people_connections_creator_creation_key_idx
ON public.people_connections (creator_user_id, creation_key)
WHERE (creation_key IS NOT NULL AND creator_user_id IS NOT NULL);

COMMENT ON COLUMN public.people_connections.creation_key IS
  'Cryptographic UUID (randomUUID) generated per wizard session to ensure gift creation idempotency without relying on recipient name or bio notes.';
