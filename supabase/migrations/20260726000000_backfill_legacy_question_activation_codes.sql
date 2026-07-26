-- Migration: 20260726000000_backfill_legacy_question_activation_codes.sql
-- Description: Idempotently backfill unique TLA-XXXX-XXXX-XXXX activation codes for living Legacy Question starter archives missing codes

CREATE OR REPLACE FUNCTION pg_temp.generate_unique_tla_activation_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  part1 text;
  part2 text;
  part3 text;
  attempts integer := 0;
  exists_count integer;
BEGIN
  LOOP
    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Failed to generate unique activation code after 100 attempts.';
    END IF;

    -- Generate 3 blocks of 4 characters each from allowed alphabet
    part1 := SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1) ||
             SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1) ||
             SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1) ||
             SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1);

    part2 := SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1) ||
             SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1) ||
             SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1) ||
             SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1);

    part3 := SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1) ||
             SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1) ||
             SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1) ||
             SUBSTRING(alphabet FROM floor(random() * 32 + 1)::int FOR 1);

    candidate := 'TLA-' || part1 || '-' || part2 || '-' || part3;

    SELECT COUNT(*) INTO exists_count
    FROM public.archives
    WHERE legacy_activation_code = candidate;

    IF exists_count = 0 THEN
      RETURN candidate;
    END IF;
  END LOOP;
END;
$$;

DO $$
DECLARE
  arch_rec RECORD;
  new_code text;
  updated_count integer := 0;
BEGIN
  FOR arch_rec IN
    SELECT id
    FROM public.archives
    WHERE legacy_question_submission_id IS NOT NULL
      AND memorial_mode = false
      AND (legacy_activation_code IS NULL OR TRIM(legacy_activation_code) = '')
    FOR UPDATE
  LOOP
    new_code := pg_temp.generate_unique_tla_activation_code();

    UPDATE public.archives
    SET legacy_activation_code = new_code
    WHERE id = arch_rec.id
      AND (legacy_activation_code IS NULL OR TRIM(legacy_activation_code) = '');

    updated_count := updated_count + 1;
  END LOOP;

  RAISE NOTICE 'Backfilled % living starter archive activation codes.', updated_count;
END;
$$;
