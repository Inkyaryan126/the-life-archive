-- Phase 1 TLA 2.0 Additive Data Foundation: People Connections & Recipient Allowlist

CREATE TABLE IF NOT EXISTS public.people_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  archive_id UUID NOT NULL REFERENCES public.archives(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'other',
  subject_status TEXT NOT NULL DEFAULT 'living',
  avatar_url TEXT,
  bio_notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT connection_relationship_type_check CHECK (
    relationship_type IN (
      'partner', 'child', 'parent', 'grandparent',
      'grandchild', 'friend', 'sibling', 'self', 'other'
    )
  ),
  CONSTRAINT connection_subject_status_check CHECK (
    subject_status IN ('living', 'memorial')
  ),
  CONSTRAINT connection_creator_demo_check CHECK (
    (is_demo = true AND creator_user_id IS NULL)
    OR
    (is_demo = false AND creator_user_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.connection_memories (
  connection_id UUID NOT NULL REFERENCES public.people_connections(id) ON DELETE CASCADE,
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  access_status TEXT NOT NULL DEFAULT 'released',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (connection_id, memory_id),
  CONSTRAINT connection_memories_status_check CHECK (
    access_status IN ('released', 'restricted', 'archived')
  )
);

CREATE TABLE IF NOT EXISTS public.experience_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT experience_category_slug_format CHECK (slug ~ '^[a-z0-9_-]+$')
);

CREATE TABLE IF NOT EXISTS public.memory_experience_categories (
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.experience_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (memory_id, category_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS people_connections_creator_user_id_idx ON public.people_connections(creator_user_id);
CREATE INDEX IF NOT EXISTS people_connections_archive_id_idx ON public.people_connections(archive_id);
CREATE INDEX IF NOT EXISTS connection_memories_connection_idx ON public.connection_memories(connection_id);
CREATE INDEX IF NOT EXISTS connection_memories_memory_idx ON public.connection_memories(memory_id);
CREATE INDEX IF NOT EXISTS memory_experience_categories_memory_idx ON public.memory_experience_categories(memory_id);
CREATE INDEX IF NOT EXISTS memory_experience_categories_category_idx ON public.memory_experience_categories(category_id);

-- RLS Enablement
ALTER TABLE public.people_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_experience_categories ENABLE ROW LEVEL SECURITY;

-- Owner Management RLS Policies
DROP POLICY IF EXISTS "Owners can view own connections" ON public.people_connections;
CREATE POLICY "Owners can view own connections" ON public.people_connections
  FOR SELECT TO authenticated
  USING (creator_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.archives WHERE id = people_connections.archive_id AND owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage own connections" ON public.people_connections;
CREATE POLICY "Owners can manage own connections" ON public.people_connections
  FOR ALL TO authenticated
  USING (creator_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.archives WHERE id = people_connections.archive_id AND owner_id = auth.uid()))
  WITH CHECK (creator_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.archives WHERE id = people_connections.archive_id AND owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage connection memories" ON public.connection_memories;
CREATE POLICY "Owners can manage connection memories" ON public.connection_memories
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.people_connections pc
    JOIN public.archives a ON a.id = pc.archive_id
    WHERE pc.id = connection_memories.connection_id AND a.owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Public can view experience categories" ON public.experience_categories;
CREATE POLICY "Public can view experience categories" ON public.experience_categories
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS "Owners can manage memory experience categories" ON public.memory_experience_categories;
CREATE POLICY "Owners can manage memory experience categories" ON public.memory_experience_categories
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.memories m
    JOIN public.archives a ON a.id = m.archive_id
    WHERE m.id = memory_experience_categories.memory_id AND a.owner_id = auth.uid()
  ));

-- Grants
GRANT SELECT ON public.experience_categories TO public;
GRANT SELECT ON public.people_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.people_connections TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connection_memories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_experience_categories TO service_role;

-- Conservative Legacy Backfill Function
-- Backfills people_connections for all existing archives.
-- Backfills connection_memories ONLY from explicit share pass memories (archive_share_pass_memories) where proof of sharing exists.
DO $$
BEGIN
  -- 1. Backfill people_connections from existing archives
  INSERT INTO public.people_connections (
    creator_user_id,
    archive_id,
    person_name,
    relationship_type,
    subject_status,
    is_demo,
    created_at
  )
  SELECT
    a.owner_id,
    a.id,
    a.person_name,
    CASE
      WHEN a.relationship_to_owner IN ('partner', 'child', 'parent', 'grandparent', 'grandchild', 'friend', 'sibling', 'self')
      THEN a.relationship_to_owner
      ELSE 'other'
    END,
    CASE WHEN a.memorial_mode = true THEN 'memorial' ELSE 'living' END,
    a.is_demo,
    a.created_at
  FROM public.archives a
  WHERE NOT EXISTS (
    SELECT 1 FROM public.people_connections pc WHERE pc.archive_id = a.id
  );

  -- 2. Conservative backfill of connection_memories ONLY from explicit share passes
  INSERT INTO public.connection_memories (connection_id, memory_id, access_status, created_at)
  SELECT DISTINCT
    pc.id,
    spm.memory_id,
    'released',
    spm.created_at
  FROM public.archive_share_pass_memories spm
  JOIN public.archive_share_passes asp ON asp.id = spm.share_pass_id
  JOIN public.people_connections pc ON pc.archive_id = asp.archive_id
  WHERE asp.status = 'active'
  ON CONFLICT (connection_id, memory_id) DO NOTHING;
END $$;

-- Seed Initial Experience Categories
INSERT INTO public.experience_categories (slug, label, description, icon_name, sort_order) VALUES
  ('miss_you', 'I Miss You', 'Messages to listen to when you miss me', 'heart', 1),
  ('bad_day', 'Bad Day', 'Encouragement when things are hard', 'sun', 2),
  ('love', 'Love Notes', 'Reminders of how deeply you are loved', 'sparkles', 3),
  ('advice', 'Life Advice', 'Wisdom and guidance for big moments', 'compass', 4),
  ('make_me_laugh', 'Make Me Laugh', 'Stories, jokes, and funny moments', 'smile', 5),
  ('anniversary', 'Anniversary', 'Memories for celebrating our bond', 'gift', 6),
  ('birthday', 'Birthday', 'Special wishes for your birthday', 'cake', 7),
  ('surprise', 'Surprise Me', 'Unexpected notes and secret moments', 'star', 8),
  ('time_capsule', 'Future Capsule', 'Messages set to unlock in the future', 'clock', 9)
ON CONFLICT (slug) DO NOTHING;
