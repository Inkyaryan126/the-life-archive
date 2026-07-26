-- Migration: 20260726120000_create_continuity_profiles.sql
-- Description: Create continuity_profiles table and RLS policies for Eternism Continuity Capsules

CREATE TABLE IF NOT EXISTS public.continuity_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archive_id UUID NOT NULL REFERENCES public.archives(id) ON DELETE CASCADE,
  present_self JSONB NOT NULL DEFAULT '{}'::jsonb,
  refused_self JSONB NOT NULL DEFAULT '{}'::jsonb,
  future_self JSONB NOT NULL DEFAULT '{}'::jsonb,
  continuity_practices JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence_memory_ids TEXT[] NOT NULL DEFAULT '{}',
  continuity_declaration TEXT,
  current_stage TEXT NOT NULL DEFAULT 'present_self',
  annual_reviews JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT continuity_profiles_archive_id_key UNIQUE (archive_id)
);

-- Index for fast user_id and archive_id lookup
CREATE INDEX IF NOT EXISTS idx_continuity_profiles_user_id ON public.continuity_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_continuity_profiles_archive_id ON public.continuity_profiles(archive_id);

-- Enable RLS
ALTER TABLE public.continuity_profiles ENABLE ROW LEVEL SECURITY;

-- Owner-only RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'continuity_profiles' AND policyname = 'Users can select own continuity profiles'
  ) THEN
    CREATE POLICY "Users can select own continuity profiles"
      ON public.continuity_profiles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'continuity_profiles' AND policyname = 'Users can insert own continuity profiles'
  ) THEN
    CREATE POLICY "Users can insert own continuity profiles"
      ON public.continuity_profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'continuity_profiles' AND policyname = 'Users can update own continuity profiles'
  ) THEN
    CREATE POLICY "Users can update own continuity profiles"
      ON public.continuity_profiles FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'continuity_profiles' AND policyname = 'Users can delete own continuity profiles'
  ) THEN
    CREATE POLICY "Users can delete own continuity profiles"
      ON public.continuity_profiles FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_continuity_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_continuity_profiles_updated_at ON public.continuity_profiles;
CREATE TRIGGER set_continuity_profiles_updated_at
  BEFORE UPDATE ON public.continuity_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_continuity_profile_updated_at();

-- Grant permissions
REVOKE ALL ON public.continuity_profiles FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.continuity_profiles TO authenticated;
GRANT ALL ON public.continuity_profiles TO service_role;
