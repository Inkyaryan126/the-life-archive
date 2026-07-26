-- Migration: 20260725210000_add_onboarding_email_retry_tracking.sql
-- Description: Onboarding email retry tracking columns, status constraints, and service-role RPCs

ALTER TABLE public.legacy_question_submissions
  ADD COLUMN IF NOT EXISTS email_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_attempt_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS email_max_attempts INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS email_next_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_last_attempted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_processing_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resend_message_id TEXT,
  ADD COLUMN IF NOT EXISTS email_error_category TEXT,
  ADD COLUMN IF NOT EXISTS email_error_code TEXT,
  ADD COLUMN IF NOT EXISTS email_error_message TEXT,
  ADD COLUMN IF NOT EXISTS email_template_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.legacy_question_submissions
  DROP CONSTRAINT IF EXISTS legacy_question_submissions_email_status_check,
  ADD CONSTRAINT legacy_question_submissions_email_status_check
    CHECK (email_status IN ('pending', 'sending', 'sent', 'transient_failure', 'permanent_failure'));

ALTER TABLE public.legacy_question_submissions
  DROP CONSTRAINT IF EXISTS legacy_question_submissions_email_attempts_check,
  ADD CONSTRAINT legacy_question_submissions_email_attempts_check
    CHECK (email_attempt_count >= 0 AND email_max_attempts >= 0);

-- Backfill existing rows safely
UPDATE public.legacy_question_submissions
SET email_status = 'sent',
    email_sent_at = COALESCE(email_sent_at, welcome_email_sent_at)
WHERE welcome_email_sent_at IS NOT NULL
  AND email_status = 'pending';

UPDATE public.legacy_question_submissions
SET email_status = 'transient_failure',
    email_next_attempt_at = NULL -- Requires manual review, prevents surprise email flood
WHERE processing_status = 'failed'
  AND welcome_email_sent_at IS NULL
  AND email_status = 'pending';

-- Add token_version to claim tokens table idempotently
ALTER TABLE public.legacy_question_claim_tokens
  ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_lqs_email_due
  ON public.legacy_question_submissions (email_next_attempt_at)
  WHERE email_status IN ('pending', 'transient_failure');

-- RPC: Recover stale sending locks (over 10 minutes old)
CREATE OR REPLACE FUNCTION public.recover_stale_onboarding_email_locks(
  lock_timeout_minutes INT DEFAULT 10
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  recovered_count INT := 0;
BEGIN
  UPDATE public.legacy_question_submissions
  SET email_status = 'transient_failure',
      email_error_category = 'lock_timeout',
      email_error_message = 'Sending lock expired without result.'
  WHERE email_status = 'sending'
    AND email_processing_started_at < (NOW() - (lock_timeout_minutes || ' minutes')::INTERVAL);

  GET DIAGNOSTICS recovered_count = ROW_COUNT;
  RETURN recovered_count;
END;
$$;

-- RPC: Claim due onboarding email retries
CREATE OR REPLACE FUNCTION public.claim_due_onboarding_email_retries(
  batch_size INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  starter_archive_id UUID,
  starter_archive_slug TEXT,
  first_memory_id UUID,
  email_attempt_count INT,
  email_max_attempts INT,
  email_template_version INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  bounded_batch INT := LEAST(GREATEST(batch_size, 1), 50);
BEGIN
  RETURN QUERY
  WITH due_rows AS (
    SELECT lqs.id
    FROM public.legacy_question_submissions lqs
    WHERE lqs.email_status IN ('pending', 'transient_failure')
      AND lqs.email_attempt_count < lqs.email_max_attempts
      AND (lqs.email_next_attempt_at IS NULL OR lqs.email_next_attempt_at <= NOW())
    ORDER BY lqs.created_at ASC
    LIMIT bounded_batch
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.legacy_question_submissions target
  SET email_status = 'sending',
      email_processing_started_at = NOW(),
      email_last_attempted_at = NOW(),
      email_attempt_count = target.email_attempt_count + 1
  FROM due_rows
  WHERE target.id = due_rows.id
  RETURNING
    target.id,
    target.email,
    target.first_name,
    target.starter_archive_id,
    target.starter_archive_slug,
    target.first_memory_id,
    target.email_attempt_count,
    target.email_max_attempts,
    target.email_template_version;
END;
$$;

-- RPC: Record onboarding email execution result
CREATE OR REPLACE FUNCTION public.record_onboarding_email_result(
  target_submission_id UUID,
  target_status TEXT,
  target_resend_message_id TEXT DEFAULT NULL,
  target_next_attempt_at TIMESTAMPTZ DEFAULT NULL,
  target_error_category TEXT DEFAULT NULL,
  target_error_code TEXT DEFAULT NULL,
  target_error_message TEXT DEFAULT NULL
)
RETURNS public.legacy_question_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  updated_row public.legacy_question_submissions%ROWTYPE;
  clean_message TEXT;
BEGIN
  clean_message := SUBSTRING(COALESCE(target_error_message, ''), 1, 500);

  UPDATE public.legacy_question_submissions
  SET email_status = target_status,
      resend_message_id = COALESCE(target_resend_message_id, resend_message_id),
      email_next_attempt_at = target_next_attempt_at,
      email_sent_at = CASE WHEN target_status = 'sent' THEN NOW() ELSE email_sent_at END,
      welcome_email_sent_at = CASE WHEN target_status = 'sent' THEN NOW() ELSE welcome_email_sent_at END,
      invitation_sent_at = CASE WHEN target_status = 'sent' THEN NOW() ELSE invitation_sent_at END,
      processing_status = CASE WHEN target_status = 'sent' THEN 'email_sent' ELSE processing_status END,
      submission_status = CASE WHEN target_status = 'sent' THEN 'archived' ELSE submission_status END,
      email_error_category = target_error_category,
      email_error_code = target_error_code,
      email_error_message = CASE WHEN target_status = 'sent' THEN NULL ELSE clean_message END
  WHERE id = target_submission_id
  RETURNING * INTO updated_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found.';
  END IF;

  RETURN updated_row;
END;
$$;

-- Secure RPC permissions
REVOKE ALL ON FUNCTION public.recover_stale_onboarding_email_locks(INT) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recover_stale_onboarding_email_locks(INT) TO service_role;

REVOKE ALL ON FUNCTION public.claim_due_onboarding_email_retries(INT) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_due_onboarding_email_retries(INT) TO service_role;

REVOKE ALL ON FUNCTION public.record_onboarding_email_result(UUID, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_onboarding_email_result(UUID, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT) TO service_role;
