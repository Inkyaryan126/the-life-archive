-- Phase 1 TLA 2.0 Keepsake Mappings & Data-Driven Prompt System

CREATE TABLE IF NOT EXISTS public.keepsake_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keepsake_id UUID NOT NULL REFERENCES public.keepsakes(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.people_connections(id) ON DELETE CASCADE,
  archive_id UUID NOT NULL REFERENCES public.archives(id) ON DELETE CASCADE,
  experience_mode TEXT NOT NULL DEFAULT 'interactive_hub',
  status TEXT NOT NULL DEFAULT 'active',
  active_share_pass_id UUID REFERENCES public.archive_share_passes(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disabled_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT keepsake_mapping_experience_mode_check CHECK (
    experience_mode IN ('interactive_hub', 'time_capsule_locked', 'curated_pass', 'memorial_view')
  ),
  CONSTRAINT keepsake_mapping_status_check CHECK (
    status IN ('active', 'disabled', 'revoked')
  )
);

-- Partial Unique Index: Enforce EXACTLY ONE active mapping per physical keepsake_id
CREATE UNIQUE INDEX IF NOT EXISTS keepsakes_single_active_mapping_idx
  ON public.keepsake_mappings (keepsake_id)
  WHERE (status = 'active');

CREATE INDEX IF NOT EXISTS keepsake_mappings_keepsake_idx ON public.keepsake_mappings(keepsake_id);
CREATE INDEX IF NOT EXISTS keepsake_mappings_connection_idx ON public.keepsake_mappings(connection_id);
CREATE INDEX IF NOT EXISTS keepsake_mappings_archive_idx ON public.keepsake_mappings(archive_id);
CREATE INDEX IF NOT EXISTS keepsake_mappings_status_idx ON public.keepsake_mappings(status);

-- Data-Driven Prompts Architecture
CREATE TABLE IF NOT EXISTS public.prompt_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  relationship_type TEXT NOT NULL,
  occasion TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guided_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_set_id UUID NOT NULL REFERENCES public.prompt_sets(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  helper_text TEXT,
  suggested_memory_type TEXT NOT NULL DEFAULT 'voice',
  default_category_slugs TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS guided_prompts_prompt_set_idx ON public.guided_prompts(prompt_set_id);

-- RLS Enablement
ALTER TABLE public.keepsake_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guided_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view prompt sets" ON public.prompt_sets;
CREATE POLICY "Public can view prompt sets" ON public.prompt_sets
  FOR SELECT TO public
  USING (is_enabled = true);

DROP POLICY IF EXISTS "Public can view guided prompts" ON public.guided_prompts;
CREATE POLICY "Public can view guided prompts" ON public.guided_prompts
  FOR SELECT TO public
  USING (is_enabled = true);

DROP POLICY IF EXISTS "Owners can manage keepsake mappings" ON public.keepsake_mappings;
CREATE POLICY "Owners can manage keepsake mappings" ON public.keepsake_mappings
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.archives a WHERE a.id = keepsake_mappings.archive_id AND a.owner_id = auth.uid()
  ));

GRANT SELECT ON public.prompt_sets TO public;
GRANT SELECT ON public.guided_prompts TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.keepsake_mappings TO service_role;

-- Backfill Keepsake Mappings from Existing Keepsakes and Active Share Passes
DO $$
BEGIN
  INSERT INTO public.keepsake_mappings (
    keepsake_id,
    connection_id,
    archive_id,
    experience_mode,
    status,
    active_share_pass_id,
    activated_at,
    created_at
  )
  SELECT
    k.id,
    pc.id,
    k.archive_id,
    'interactive_hub',
    'active',
    k.active_share_pass_id,
    k.created_at,
    k.created_at
  FROM public.keepsakes k
  LEFT JOIN public.people_connections pc ON pc.archive_id = k.archive_id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.keepsake_mappings km WHERE km.keepsake_id = k.id AND km.status = 'active'
  );
END $$;

-- Seed Initial Prompt Sets & Prompts
INSERT INTO public.prompt_sets (id, slug, title, description, relationship_type, occasion, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'partner-love', 'For Your Partner', 'Love notes, memories, and encouragement', 'partner', 'anytime', 1),
  ('00000000-0000-0000-0000-000000000002', 'parent-child', 'For Your Child', 'Stories, advice, and guidance as they grow', 'child', 'anytime', 2),
  ('00000000-0000-0000-0000-000000000003', 'long-distance', 'Long Distance', 'Stay connected across the miles', 'friend', 'travel', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.guided_prompts (prompt_set_id, prompt_text, helper_text, suggested_memory_type, default_category_slugs, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'A story about when I first knew I loved you', 'Record a short voice note describing that exact moment.', 'voice', ARRAY['love', 'miss_you'], 1),
  ('00000000-0000-0000-0000-000000000001', 'What I want you to remember on a hard day', 'Share a warm message of reassurance and comfort.', 'voice', ARRAY['bad_day', 'love'], 2),
  ('00000000-0000-0000-0000-000000000002', 'The story of the day you were born', 'Tell them what you felt when you first held them.', 'journal', ARRAY['love', 'birthday'], 1),
  ('00000000-0000-0000-0000-000000000002', 'My biggest piece of advice for your future', 'Share an essential lesson you learned in your life.', 'lesson', ARRAY['advice'], 2)
ON CONFLICT DO NOTHING;
