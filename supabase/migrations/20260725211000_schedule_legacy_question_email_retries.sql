-- Migration: 20260725211000_schedule_legacy_question_email_retries.sql
-- Description: Idempotent pg_cron & pg_net schedule for legacy question email retries using Supabase Vault

DO $$
BEGIN
  -- 1. Ensure pg_cron and pg_net extensions exist
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  CREATE EXTENSION IF NOT EXISTS pg_net;
END;
$$;

-- Function: Trigger onboarding email cron via pg_net with Vault CRON_SECRET authorization
CREATE OR REPLACE FUNCTION public.trigger_legacy_question_email_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, extensions, pg_temp
AS $$
DECLARE
  cron_secret_val text;
BEGIN
  -- Retrieve CRON_SECRET securely from Supabase Vault
  SELECT decrypted_secret INTO cron_secret_val
  FROM vault.decrypted_secrets
  WHERE name = 'CRON_SECRET'
  LIMIT 1;

  IF cron_secret_val IS NULL OR cron_secret_val = '' THEN
    RAISE WARNING 'CRON_SECRET not found in Supabase Vault. Skipping legacy question email retry cron execution.';
    RETURN;
  END IF;

  -- Dispatch HTTP GET request via pg_net
  PERFORM net.http_get(
    url := 'https://thelifearchive.vip/api/cron/legacy-question-emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || cron_secret_val,
      'Content-Type', 'application/json'
    ),
    timeout_milliseconds := 15000
  );
END;
$$;

-- Idempotently schedule or update cron job to run every 5 minutes
SELECT cron.unschedule('legacy-question-email-retries-cron')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'legacy-question-email-retries-cron'
);

SELECT cron.schedule(
  'legacy-question-email-retries-cron',
  '*/5 * * * *',
  $$SELECT public.trigger_legacy_question_email_cron();$$
);

REVOKE ALL ON FUNCTION public.trigger_legacy_question_email_cron() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_legacy_question_email_cron() TO service_role;
