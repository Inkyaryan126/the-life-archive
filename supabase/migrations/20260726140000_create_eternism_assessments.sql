-- Migration: 20260726140000_create_eternism_assessments.sql
-- Description: Create eternism_assessments table for storing authenticated user resilience assessments

CREATE TABLE IF NOT EXISTS public.eternism_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archive_id UUID REFERENCES public.archives(id) ON DELETE SET NULL,
  overall_score INT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  dimension_scores JSONB NOT NULL,
  archetype TEXT NOT NULL,
  strongest_dimension TEXT NOT NULL,
  growth_dimension TEXT NOT NULL,
  challenge JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_eternism_assessments_user_id ON public.eternism_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_eternism_assessments_archive_id ON public.eternism_assessments(archive_id);

-- Enable RLS
ALTER TABLE public.eternism_assessments ENABLE ROW LEVEL SECURITY;

-- Owner-only SELECT policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'eternism_assessments' AND policyname = 'Users can select own eternism assessments'
  ) THEN
    CREATE POLICY "Users can select own eternism assessments"
      ON public.eternism_assessments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Owner-only INSERT policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'eternism_assessments' AND policyname = 'Users can insert own eternism assessments'
  ) THEN
    CREATE POLICY "Users can insert own eternism assessments"
      ON public.eternism_assessments FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Grants
REVOKE ALL ON public.eternism_assessments FROM PUBLIC;
GRANT SELECT, INSERT ON public.eternism_assessments TO authenticated;
GRANT ALL ON public.eternism_assessments TO service_role;
