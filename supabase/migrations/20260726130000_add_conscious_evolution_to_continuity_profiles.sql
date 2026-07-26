-- Migration: 20260726130000_add_conscious_evolution_to_continuity_profiles.sql
-- Description: Add conscious_evolution JSONB column to continuity_profiles for the 6th dimension

ALTER TABLE public.continuity_profiles
  ADD COLUMN IF NOT EXISTS conscious_evolution JSONB NOT NULL DEFAULT '{}'::jsonb;
