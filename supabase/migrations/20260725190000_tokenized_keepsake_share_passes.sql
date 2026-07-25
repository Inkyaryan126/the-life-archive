-- Migration: Tokenized Keepsake Share Passes with High-Entropy Token Hashing & Rotation

ALTER TABLE public.archive_share_passes
  ADD COLUMN IF NOT EXISTS token_hash TEXT,
  ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS token_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS token_rotated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_share_passes_token_hash
  ON public.archive_share_passes(token_hash)
  WHERE token_hash IS NOT NULL;

-- Security Definer Guest Retrieval RPC by Token Hash
CREATE OR REPLACE FUNCTION public.get_share_pass_memories_by_token_hash(
  p_token_hash TEXT
)
RETURNS TABLE (
  archive_name TEXT,
  person_name TEXT,
  memory_id UUID,
  title TEXT,
  type TEXT,
  content TEXT,
  media_url TEXT,
  storage_media_path TEXT,
  memory_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_pass RECORD;
BEGIN
  IF p_token_hash IS NULL OR TRIM(p_token_hash) = '' THEN
    RETURN;
  END IF;

  SELECT p.id AS pass_id, p.archive_id, a.archive_name, a.person_name
    INTO v_pass
    FROM public.archive_share_passes p
    JOIN public.archives a ON a.id = p.archive_id
    JOIN public.keepsakes k ON k.id = p.keepsake_id AND k.active_share_pass_id = p.id
   WHERE p.token_hash = TRIM(p_token_hash)
     AND p.status = 'active'
     AND (p.expires_at IS NULL OR p.expires_at > NOW());

  IF v_pass.pass_id IS NULL THEN
    RETURN;
  END IF;

  -- Probabilistic scan count increment (5% sampling to avoid write amplification)
  IF random() < 0.05 THEN
    UPDATE public.archive_share_passes
       SET use_count = use_count + 1,
           last_scanned_at = NOW(),
           updated_at = NOW()
     WHERE id = v_pass.pass_id;
  END IF;

  RETURN QUERY
  SELECT v_pass.archive_name, v_pass.person_name, m.id, m.title, m.type, m.content, m.media_url, m.photo_path, m.memory_date
    FROM public.memories m
    JOIN public.archive_share_pass_memories pm ON pm.memory_id = m.id
   WHERE pm.share_pass_id = v_pass.pass_id
     AND m.archive_id = v_pass.archive_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_share_pass_memories_by_token_hash(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_share_pass_memories_by_token_hash(TEXT) TO service_role;
