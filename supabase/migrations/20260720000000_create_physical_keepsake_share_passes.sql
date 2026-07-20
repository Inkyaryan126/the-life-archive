-- Additive migration for Physical Keepsake Share Passes

CREATE TABLE IF NOT EXISTS public.keepsakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archive_id UUID NOT NULL REFERENCES public.archives(id) ON DELETE CASCADE,
  keepsake_code TEXT NOT NULL UNIQUE,
  product_type TEXT NOT NULL DEFAULT 'member_card',
  active_share_pass_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT keepsakes_code_format CHECK (keepsake_code ~ '^[A-Z0-9_-]{4,32}$')
);

CREATE TABLE IF NOT EXISTS public.archive_share_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keepsake_id UUID NOT NULL REFERENCES public.keepsakes(id) ON DELETE CASCADE,
  archive_id UUID NOT NULL REFERENCES public.archives(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pass_name TEXT NOT NULL DEFAULT 'Physical Keepsake Pass',
  status TEXT NOT NULL DEFAULT 'disabled',
  use_count INT NOT NULL DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT share_passes_status_check CHECK (status IN ('active', 'disabled', 'revoked')),
  CONSTRAINT share_passes_use_count_check CHECK (use_count >= 0)
);

ALTER TABLE public.keepsakes
  DROP CONSTRAINT IF EXISTS fk_keepsakes_active_share_pass;

ALTER TABLE public.keepsakes
  ADD CONSTRAINT fk_keepsakes_active_share_pass
  FOREIGN KEY (active_share_pass_id) REFERENCES public.archive_share_passes(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.archive_share_pass_memories (
  share_pass_id UUID NOT NULL REFERENCES public.archive_share_passes(id) ON DELETE CASCADE,
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (share_pass_id, memory_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS keepsakes_archive_id_idx ON public.keepsakes(archive_id);
CREATE INDEX IF NOT EXISTS keepsakes_active_pass_idx ON public.keepsakes(active_share_pass_id);
CREATE INDEX IF NOT EXISTS share_passes_keepsake_id_idx ON public.archive_share_passes(keepsake_id);
CREATE INDEX IF NOT EXISTS share_passes_archive_id_idx ON public.archive_share_passes(archive_id);
CREATE INDEX IF NOT EXISTS pass_memories_pass_id_idx ON public.archive_share_pass_memories(share_pass_id);
CREATE INDEX IF NOT EXISTS pass_memories_memory_id_idx ON public.archive_share_pass_memories(memory_id);

-- RLS Enablement
ALTER TABLE public.keepsakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_share_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_share_pass_memories ENABLE ROW LEVEL SECURITY;

-- Owner Read Policies (Authenticated clients read-only)
DROP POLICY IF EXISTS "Owners can view own keepsakes" ON public.keepsakes;
CREATE POLICY "Owners can view own keepsakes" ON public.keepsakes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.archives WHERE id = keepsakes.archive_id AND owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can view own share passes" ON public.archive_share_passes;
CREATE POLICY "Owners can view own share passes" ON public.archive_share_passes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.archives WHERE id = archive_share_passes.archive_id AND owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can view own pass memories" ON public.archive_share_pass_memories;
CREATE POLICY "Owners can view own pass memories" ON public.archive_share_pass_memories
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.archive_share_passes p
    JOIN public.archives a ON a.id = p.archive_id
    WHERE p.id = archive_share_pass_memories.share_pass_id AND a.owner_id = auth.uid()
  ));

-- Owner Keepsake Insertion Policy (Must be unassigned on initial insert)
DROP POLICY IF EXISTS "Owners can insert keepsakes" ON public.keepsakes;
CREATE POLICY "Owners can insert keepsakes" ON public.keepsakes
  FOR INSERT TO authenticated
  WITH CHECK (
    active_share_pass_id IS NULL AND
    EXISTS (SELECT 1 FROM public.archives WHERE id = keepsakes.archive_id AND owner_id = auth.uid())
  );

-- Remove old open FOR ALL policies
DROP POLICY IF EXISTS "Owners can manage own keepsakes" ON public.keepsakes;
DROP POLICY IF EXISTS "Owners can manage own share passes" ON public.archive_share_passes;
DROP POLICY IF EXISTS "Owners can manage own pass memories" ON public.archive_share_pass_memories;

-- Explicit Table Grants:
REVOKE ALL ON public.keepsakes FROM authenticated;
REVOKE ALL ON public.archive_share_passes FROM authenticated;
REVOKE ALL ON public.archive_share_pass_memories FROM authenticated;

GRANT SELECT, INSERT ON public.keepsakes TO authenticated;
GRANT SELECT ON public.archive_share_passes TO authenticated;
GRANT SELECT ON public.archive_share_pass_memories TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.keepsakes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.archive_share_passes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.archive_share_pass_memories TO service_role;

-- Database Integrity Triggers for Immediate Checks
CREATE OR REPLACE FUNCTION public.check_pass_keepsake_archive_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_keepsake_archive_id UUID;
BEGIN
  SELECT archive_id INTO v_keepsake_archive_id FROM public.keepsakes WHERE id = NEW.keepsake_id;
  IF v_keepsake_archive_id IS NULL OR v_keepsake_archive_id != NEW.archive_id THEN
    RAISE EXCEPTION 'Pass archive_id must match keepsake archive_id';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_pass_keepsake_archive_match ON public.archive_share_passes;
CREATE TRIGGER trigger_check_pass_keepsake_archive_match
  BEFORE INSERT OR UPDATE ON public.archive_share_passes
  FOR EACH ROW EXECUTE FUNCTION public.check_pass_keepsake_archive_match();

CREATE OR REPLACE FUNCTION public.check_pass_memory_archive_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_pass_archive_id UUID;
  v_memory_archive_id UUID;
BEGIN
  SELECT archive_id INTO v_pass_archive_id FROM public.archive_share_passes WHERE id = NEW.share_pass_id;
  SELECT archive_id INTO v_memory_archive_id FROM public.memories WHERE id = NEW.memory_id;
  IF v_pass_archive_id IS NULL OR v_memory_archive_id IS NULL OR v_pass_archive_id != v_memory_archive_id THEN
    RAISE EXCEPTION 'Selected memory must belong to the same archive as the share pass';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_pass_memory_archive_match ON public.archive_share_pass_memories;
CREATE TRIGGER trigger_check_pass_memory_archive_match
  BEFORE INSERT OR UPDATE ON public.archive_share_pass_memories
  FOR EACH ROW EXECUTE FUNCTION public.check_pass_memory_archive_match();

-- Deferred Transaction-End Invariant Enforcement Trigger
CREATE OR REPLACE FUNCTION public.enforce_share_pass_invariants()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invalid_bound RECORD;
  v_unbound_active RECORD;
  v_multi_active RECORD;
BEGIN
  -- Invariants 1, 2, 3: Bound active_share_pass_id must point to an active, non-empty pass belonging to the same keepsake & archive
  SELECT k.id AS keepsake_id, k.active_share_pass_id, p.status
    INTO v_invalid_bound
    FROM public.keepsakes k
    JOIN public.archive_share_passes p ON p.id = k.active_share_pass_id
   WHERE (
     p.status != 'active' OR
     p.keepsake_id != k.id OR
     p.archive_id != k.archive_id OR
     NOT EXISTS (SELECT 1 FROM public.archive_share_pass_memories pm WHERE pm.share_pass_id = p.id)
   )
   LIMIT 1;

  IF v_invalid_bound.keepsake_id IS NOT NULL THEN
    RAISE EXCEPTION 'Invariant Violation: Bound active_share_pass_id must point to an active, non-empty pass belonging to the same keepsake and archive.';
  END IF;

  -- Invariant 4: No more than 1 active pass per keepsake
  SELECT keepsake_id, COUNT(*) AS active_count
    INTO v_multi_active
    FROM public.archive_share_passes
   WHERE status = 'active'
   GROUP BY keepsake_id
  HAVING COUNT(*) > 1
   LIMIT 1;

  IF v_multi_active.keepsake_id IS NOT NULL THEN
    RAISE EXCEPTION 'Invariant Violation: Keepsake cannot have more than one active share pass.';
  END IF;

  -- Invariant 5: Any pass with status = 'active' MUST be bound as its keepsake active_share_pass_id
  SELECT p.id AS pass_id
    INTO v_unbound_active
    FROM public.archive_share_passes p
    LEFT JOIN public.keepsakes k ON k.id = p.keepsake_id AND k.active_share_pass_id = p.id
   WHERE p.status = 'active'
     AND k.id IS NULL
   LIMIT 1;

  IF v_unbound_active.pass_id IS NOT NULL THEN
    RAISE EXCEPTION 'Invariant Violation: Active share pass must be bound as its keepsake active_share_pass_id.';
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enforce_share_pass_invariants_keepsakes ON public.keepsakes;
CREATE CONSTRAINT TRIGGER trigger_enforce_share_pass_invariants_keepsakes
  AFTER INSERT OR UPDATE OR DELETE ON public.keepsakes
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION public.enforce_share_pass_invariants();

DROP TRIGGER IF EXISTS trigger_enforce_share_pass_invariants_passes ON public.archive_share_passes;
CREATE CONSTRAINT TRIGGER trigger_enforce_share_pass_invariants_passes
  AFTER INSERT OR UPDATE OR DELETE ON public.archive_share_passes
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION public.enforce_share_pass_invariants();

DROP TRIGGER IF EXISTS trigger_enforce_share_pass_invariants_memories ON public.archive_share_pass_memories;
CREATE CONSTRAINT TRIGGER trigger_enforce_share_pass_invariants_memories
  AFTER INSERT OR UPDATE OR DELETE ON public.archive_share_pass_memories
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION public.enforce_share_pass_invariants();

-- SECURITY DEFINER Retrieval RPC for Guests
CREATE OR REPLACE FUNCTION public.get_keepsake_pass_memories(
  p_keepsake_code TEXT,
  p_is_prefetch BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  type TEXT,
  content TEXT,
  media_url TEXT,
  storage_media_path TEXT,
  memory_date DATE,
  tags TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_keepsake RECORD;
  v_pass RECORD;
BEGIN
  SELECT k.id AS keepsake_id, k.archive_id, k.active_share_pass_id
    INTO v_keepsake
    FROM public.keepsakes k
   WHERE k.keepsake_code = UPPER(TRIM(p_keepsake_code));

  IF v_keepsake.keepsake_id IS NULL OR v_keepsake.active_share_pass_id IS NULL THEN
    RETURN;
  END IF;

  SELECT p.id AS pass_id, p.status, p.archive_id
    INTO v_pass
    FROM public.archive_share_passes p
   WHERE p.id = v_keepsake.active_share_pass_id
     AND p.keepsake_id = v_keepsake.keepsake_id
     AND p.archive_id = v_keepsake.archive_id
     AND p.status = 'active';

  IF v_pass.pass_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.archive_share_pass_memories pm WHERE pm.share_pass_id = v_pass.pass_id
  ) THEN
    RETURN;
  END IF;

  IF NOT p_is_prefetch THEN
    UPDATE public.archive_share_passes
       SET use_count = use_count + 1,
           last_scanned_at = NOW(),
           updated_at = NOW()
     WHERE id = v_pass.pass_id;
  END IF;

  RETURN QUERY
  SELECT m.id, m.title, m.type, m.content, m.media_url, m.storage_media_path, m.memory_date, m.tags
    FROM public.memories m
    JOIN public.archive_share_pass_memories pm ON pm.memory_id = m.id
   WHERE pm.share_pass_id = v_pass.pass_id
     AND m.archive_id = v_pass.archive_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_keepsake_pass_memories(TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_keepsake_pass_memories(TEXT, BOOLEAN) TO service_role;

-- SECURITY DEFINER Mutation RPCs for Owner Actions

-- 1. Create Disabled Share Pass (Authorized RPC)
CREATE OR REPLACE FUNCTION public.create_disabled_share_pass(
  p_keepsake_id UUID,
  p_archive_id UUID,
  p_pass_name TEXT DEFAULT 'Physical Keepsake Pass'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_keepsake RECORD;
  v_pass_id UUID;
  v_clean_name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id, archive_id INTO v_keepsake
    FROM public.keepsakes
   WHERE id = p_keepsake_id;

  IF v_keepsake.id IS NULL OR v_keepsake.archive_id != p_archive_id THEN
    RAISE EXCEPTION 'Keepsake does not belong to specified archive';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.archives WHERE id = p_archive_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_clean_name := SUBSTRING(COALESCE(NULLIF(TRIM(p_pass_name), ''), 'Physical Keepsake Pass') FROM 1 FOR 100);

  INSERT INTO public.archive_share_passes (
    keepsake_id,
    archive_id,
    created_by,
    pass_name,
    status
  ) VALUES (
    p_keepsake_id,
    p_archive_id,
    auth.uid(),
    v_clean_name,
    'disabled'
  )
  RETURNING id INTO v_pass_id;

  RETURN v_pass_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_disabled_share_pass(UUID, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_disabled_share_pass(UUID, UUID, TEXT) TO authenticated, service_role;

-- 2. Atomic Memory Replacement
CREATE OR REPLACE FUNCTION public.manage_share_pass_memories(
  p_pass_id UUID,
  p_memory_ids UUID[]
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_pass RECORD;
  v_input_ids UUID[];
  v_dedup_ids UUID[];
  v_dedup_count INT;
  v_valid_count INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_input_ids := COALESCE(p_memory_ids, '{}');

  SELECT id, archive_id, keepsake_id, status INTO v_pass
    FROM public.archive_share_passes
   WHERE id = p_pass_id
     FOR UPDATE;

  IF v_pass.id IS NULL THEN
    RAISE EXCEPTION 'Share pass not found';
  END IF;

  IF v_pass.status = 'revoked' THEN
    RAISE EXCEPTION 'Cannot modify memories of a revoked pass';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.archives WHERE id = v_pass.archive_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT ARRAY(SELECT DISTINCT unnest(v_input_ids) ORDER BY 1) INTO v_dedup_ids;
  v_dedup_count := COALESCE(ARRAY_LENGTH(v_dedup_ids, 1), 0);

  IF v_dedup_count > 0 THEN
    SELECT COUNT(*) INTO v_valid_count
      FROM public.memories
     WHERE id = ANY(v_dedup_ids)
       AND archive_id = v_pass.archive_id;

    IF v_valid_count != v_dedup_count THEN
      RAISE EXCEPTION 'All selected memories must belong to the pass archive';
    END IF;
  END IF;

  DELETE FROM public.archive_share_pass_memories WHERE share_pass_id = p_pass_id;

  IF v_dedup_count > 0 THEN
    INSERT INTO public.archive_share_pass_memories (share_pass_id, memory_id)
    SELECT p_pass_id, unnest(v_dedup_ids);
  ELSE
    UPDATE public.archive_share_passes
       SET status = 'disabled', updated_at = NOW()
     WHERE id = p_pass_id;

    UPDATE public.keepsakes
       SET active_share_pass_id = NULL, updated_at = NOW()
     WHERE active_share_pass_id = p_pass_id;
  END IF;

  RETURN v_dedup_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.manage_share_pass_memories(UUID, UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.manage_share_pass_memories(UUID, UUID[]) TO authenticated, service_role;

-- 3. Atomic Activate & Bind (Consistent deterministic lock ordering)
CREATE OR REPLACE FUNCTION public.activate_keepsake_share_pass(
  p_keepsake_id UUID,
  p_pass_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_keepsake RECORD;
  v_pass RECORD;
  v_mem_count INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id, archive_id INTO v_keepsake
    FROM public.keepsakes
   WHERE id = p_keepsake_id
     FOR UPDATE;

  IF v_keepsake.id IS NULL THEN
    RAISE EXCEPTION 'Keepsake not found';
  END IF;

  PERFORM id FROM public.archive_share_passes
   WHERE keepsake_id = p_keepsake_id
   ORDER BY id
     FOR UPDATE;

  SELECT id, keepsake_id, archive_id, status INTO v_pass
    FROM public.archive_share_passes
   WHERE id = p_pass_id;

  IF v_pass.id IS NULL OR v_pass.keepsake_id != p_keepsake_id THEN
    RAISE EXCEPTION 'Pass does not belong to specified keepsake';
  END IF;

  IF v_pass.status = 'revoked' THEN
    RAISE EXCEPTION 'Cannot activate a revoked pass';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.archives WHERE id = v_keepsake.archive_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COUNT(*) INTO v_mem_count
    FROM public.archive_share_pass_memories
   WHERE share_pass_id = p_pass_id;

  IF v_mem_count = 0 THEN
    RAISE EXCEPTION 'Pass must have at least one selected memory before activation';
  END IF;

  UPDATE public.archive_share_passes
     SET status = 'disabled', updated_at = NOW()
   WHERE keepsake_id = p_keepsake_id
     AND id != p_pass_id
     AND status = 'active';

  UPDATE public.archive_share_passes
     SET status = 'active', updated_at = NOW()
   WHERE id = p_pass_id;

  UPDATE public.keepsakes
     SET active_share_pass_id = p_pass_id, updated_at = NOW()
   WHERE id = p_keepsake_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.activate_keepsake_share_pass(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_keepsake_share_pass(UUID, UUID) TO authenticated, service_role;

-- 4. Atomic Disable / Revoke / Unbind
CREATE OR REPLACE FUNCTION public.set_share_pass_status(
  p_pass_id UUID,
  p_new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_pass RECORD;
  v_keepsake RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_new_status NOT IN ('disabled', 'revoked') THEN
    RAISE EXCEPTION 'Invalid status for unbind operation. Use activate_keepsake_share_pass for activation.';
  END IF;

  SELECT id, keepsake_id, archive_id INTO v_pass
    FROM public.archive_share_passes
   WHERE id = p_pass_id;

  IF v_pass.id IS NULL THEN
    RAISE EXCEPTION 'Share pass not found';
  END IF;

  -- Consistent lock ordering: lock keepsake first, then passes
  SELECT id, archive_id INTO v_keepsake
    FROM public.keepsakes
   WHERE id = v_pass.keepsake_id
     FOR UPDATE;

  PERFORM id FROM public.archive_share_passes
   WHERE keepsake_id = v_pass.keepsake_id
   ORDER BY id
     FOR UPDATE;

  IF NOT EXISTS (
    SELECT 1 FROM public.archives WHERE id = v_pass.archive_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.archive_share_passes
     SET status = p_new_status, updated_at = NOW()
   WHERE id = p_pass_id;

  UPDATE public.keepsakes
     SET active_share_pass_id = NULL, updated_at = NOW()
   WHERE id = v_pass.keepsake_id
     AND active_share_pass_id = p_pass_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_share_pass_status(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_share_pass_status(UUID, TEXT) TO authenticated, service_role;
