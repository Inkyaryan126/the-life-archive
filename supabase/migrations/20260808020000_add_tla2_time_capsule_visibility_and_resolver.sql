-- Phase 1 TLA 2.0 Time Capsule Pre-Unlock Visibility & Hardened Resolver RPC

ALTER TABLE public.scheduled_memory_deliveries
  ADD COLUMN IF NOT EXISTS pre_unlock_visibility TEXT NOT NULL DEFAULT 'countdown';

ALTER TABLE public.scheduled_memory_deliveries
  DROP CONSTRAINT IF EXISTS scheduled_memory_deliveries_visibility_check;

ALTER TABLE public.scheduled_memory_deliveries
  ADD CONSTRAINT scheduled_memory_deliveries_visibility_check CHECK (
    pre_unlock_visibility IN ('hidden', 'teaser', 'countdown')
  );

-- Legacy Share Pass Resolver Helper (Security Definer)
CREATE OR REPLACE FUNCTION public.resolve_legacy_share_pass(p_pass_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_pass record;
  v_archive record;
  v_memories jsonb;
BEGIN
  SELECT * INTO v_pass FROM public.archive_share_passes WHERE id = p_pass_id AND status = 'active';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'KEEPSAKE_INACTIVE_OR_REVOKED');
  END IF;

  SELECT * INTO v_archive FROM public.archives WHERE id = v_pass.archive_id;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'title', m.title,
      'type', m.type,
      'content', m.content,
      'mediaUrl', m.media_url,
      'date', m.memory_date
    )
  ), '[]'::jsonb) INTO v_memories
  FROM public.archive_share_pass_memories spm
  JOIN public.memories m ON m.id = spm.memory_id
  WHERE spm.share_pass_id = v_pass.id;

  RETURN jsonb_build_object(
    'ok', true,
    'personName', v_archive.person_name,
    'archiveName', v_archive.archive_name,
    'experienceMode', 'legacy_pass',
    'memories', v_memories,
    'timeCapsules', '[]'::jsonb
  );
END;
$$;

-- Primary Hardened Keepsake Bearer Resolver RPC Function
CREATE OR REPLACE FUNCTION public.resolve_keepsake_guest_experience(p_keepsake_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_keepsake record;
  v_mapping record;
  v_connection record;
  v_memories jsonb;
  v_time_capsules jsonb;
BEGIN
  -- 1. Bearer Token Input Validation
  IF p_keepsake_code IS NULL OR p_keepsake_code = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_KEEPSAKE_CODE');
  END IF;

  -- 2. Query Physical Keepsake Record
  SELECT * INTO v_keepsake FROM public.keepsakes WHERE keepsake_code = trim(p_keepsake_code);
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_KEEPSAKE_CODE');
  END IF;

  -- 3. Query Active Hardware Mapping (Enforced single active destination via partial index)
  SELECT * INTO v_mapping FROM public.keepsake_mappings
  WHERE keepsake_id = v_keepsake.id AND status = 'active'
  LIMIT 1;

  -- Step 3 Fallback: Legacy Share Pass Compatibility
  IF NOT FOUND THEN
    IF v_keepsake.active_share_pass_id IS NOT NULL THEN
      RETURN public.resolve_legacy_share_pass(v_keepsake.active_share_pass_id);
    END IF;
    RETURN jsonb_build_object('ok', false, 'error', 'KEEPSAKE_INACTIVE_OR_REVOKED');
  END IF;

  -- 4. Query Recipient Connection
  SELECT * INTO v_connection FROM public.people_connections WHERE id = v_mapping.connection_id;
  IF NOT FOUND THEN
    IF v_keepsake.active_share_pass_id IS NOT NULL THEN
      RETURN public.resolve_legacy_share_pass(v_keepsake.active_share_pass_id);
    END IF;
    RETURN jsonb_build_object('ok', false, 'error', 'CONNECTION_NOT_FOUND');
  END IF;

  -- 5. Query Explicitly Authorized Connection Memories
  --    EXCLUDING any memory with an unreleased/failed/canceled/scheduled Time Capsule delivery
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'title', m.title,
      'type', m.type,
      'content', m.content,
      'mediaUrl', m.media_url,
      'date', m.memory_date,
      'categories', (
        SELECT coalesce(jsonb_agg(ec.slug), '[]'::jsonb)
        FROM public.memory_experience_categories mec
        JOIN public.experience_categories ec ON ec.id = mec.category_id
        WHERE mec.memory_id = m.id
      )
    )
  ), '[]'::jsonb) INTO v_memories
  FROM public.connection_memories cm
  JOIN public.memories m ON m.id = cm.memory_id
  WHERE cm.connection_id = v_connection.id
    AND cm.access_status = 'released'
    AND NOT EXISTS (
      -- Memory is strictly locked if it has a scheduled, processing, failed, or undelivered delivery
      SELECT 1 FROM public.scheduled_memory_deliveries d
      WHERE d.memory_id = m.id
        AND (
          d.status IN ('scheduled', 'processing', 'failed', 'canceled')
          OR d.delivered_at IS NULL
          OR d.canceled_at IS NOT NULL
          OR d.deliver_at > NOW()
        )
    );

  -- 6. Query Time Capsule Pre-Unlock Metadata
  --    Excludes hidden capsules; NEVER returns content or mediaUrl before release
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', d.id,
      'deliverAt', d.deliver_at,
      'visibility', d.pre_unlock_visibility,
      'title', CASE WHEN d.pre_unlock_visibility = 'hidden' THEN NULL ELSE m.title END
    )
  ), '[]'::jsonb) INTO v_time_capsules
  FROM public.scheduled_memory_deliveries d
  JOIN public.memories m ON m.id = d.memory_id
  JOIN public.connection_memories cm ON cm.memory_id = m.id
  WHERE cm.connection_id = v_connection.id
    AND d.status IN ('scheduled', 'processing')
    AND d.canceled_at IS NULL
    AND d.pre_unlock_visibility != 'hidden';

  -- Record Scanned Audit Stats
  IF v_mapping.active_share_pass_id IS NOT NULL THEN
    UPDATE public.archive_share_passes
    SET use_count = use_count + 1, last_scanned_at = NOW()
    WHERE id = v_mapping.active_share_pass_id;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'personName', v_connection.person_name,
    'relationshipType', v_connection.relationship_type,
    'subjectStatus', v_connection.subject_status,
    'experienceMode', v_mapping.experience_mode,
    'memories', v_memories,
    'timeCapsules', v_time_capsules
  );
END;
$$;

-- Security Grants
ALTER FUNCTION public.resolve_legacy_share_pass(UUID) OWNER TO postgres;
ALTER FUNCTION public.resolve_keepsake_guest_experience(TEXT) OWNER TO postgres;

REVOKE EXECUTE ON FUNCTION public.resolve_legacy_share_pass(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.resolve_keepsake_guest_experience(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.resolve_legacy_share_pass(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.resolve_keepsake_guest_experience(TEXT) TO anon, authenticated, service_role;
