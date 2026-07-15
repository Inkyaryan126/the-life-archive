-- Recover stale Time Capsule processing leases without weakening duplicate-send
-- protection. A stored resend_email_id is treated as provider acceptance and
-- must be finalized to delivered by application code instead of sending again.

create index if not exists scheduled_memory_deliveries_stale_processing_idx
  on public.scheduled_memory_deliveries (
    status,
    processing_started_at,
    resend_email_id,
    created_at
  )
  where status = 'processing'
    and delivered_at is null
    and canceled_at is null;

create or replace function public.claim_due_scheduled_memory_deliveries(
  target_limit integer default 10
)
returns table (
  id uuid,
  archive_id uuid,
  memory_id uuid,
  owner_id uuid,
  recipient_name text,
  recipient_email text,
  personal_note text,
  timezone text,
  scheduled_for timestamptz,
  attempt_count integer,
  max_attempts integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  processing_timeout constant interval := interval '20 minutes';
begin
  -- Exhausted stale processing rows without provider acceptance are finalized
  -- separately so the RETURN QUERY statement never updates the same row twice.
  with stale_unaccepted_exhausted_candidates as (
    select scheduled_memory_deliveries.id
    from public.scheduled_memory_deliveries
    where scheduled_memory_deliveries.status = 'processing'
      and scheduled_memory_deliveries.resend_email_id is null
      and scheduled_memory_deliveries.processing_started_at <= now() - processing_timeout
      and scheduled_memory_deliveries.attempt_count >= scheduled_memory_deliveries.max_attempts
      and scheduled_memory_deliveries.canceled_at is null
      and scheduled_memory_deliveries.delivered_at is null
    order by scheduled_memory_deliveries.processing_started_at asc,
      scheduled_memory_deliveries.created_at asc
    limit greatest(1, least(coalesce(target_limit, 10), 50))
    for update skip locked
  )
  update public.scheduled_memory_deliveries
  set
    status = 'failed',
    processing_started_at = null,
    failed_at = now(),
    next_attempt_at = null,
    token_hash = null,
    token_created_at = null,
    last_error_code = 'processing_timeout',
    last_error_message = 'Time capsule processing timed out before provider acceptance.',
    updated_at = now()
  from stale_unaccepted_exhausted_candidates
  where scheduled_memory_deliveries.id = stale_unaccepted_exhausted_candidates.id;

  return query
  with claim_candidates as (
    select
      scheduled_memory_deliveries.id,
      case
        when scheduled_memory_deliveries.status = 'processing'
          and scheduled_memory_deliveries.resend_email_id is not null
          then true
        else false
      end as provider_accepted_recovery,
      case
        when scheduled_memory_deliveries.status = 'processing'
          and scheduled_memory_deliveries.resend_email_id is null
          then true
        else false
      end as stale_unaccepted_retry
    from public.scheduled_memory_deliveries
    where (
        (
          scheduled_memory_deliveries.status in ('scheduled', 'failed')
          and scheduled_memory_deliveries.scheduled_for <= now()
          and scheduled_memory_deliveries.attempt_count < scheduled_memory_deliveries.max_attempts
          and (
            scheduled_memory_deliveries.status = 'scheduled'
            or scheduled_memory_deliveries.next_attempt_at is null
            or scheduled_memory_deliveries.next_attempt_at <= now()
          )
        )
        or (
          scheduled_memory_deliveries.status = 'processing'
          and scheduled_memory_deliveries.resend_email_id is null
          and scheduled_memory_deliveries.processing_started_at <= now() - processing_timeout
          and scheduled_memory_deliveries.attempt_count < scheduled_memory_deliveries.max_attempts
        )
        or (
          scheduled_memory_deliveries.status = 'processing'
          and scheduled_memory_deliveries.resend_email_id is not null
          and scheduled_memory_deliveries.processing_started_at <= now() - processing_timeout
        )
      )
      and scheduled_memory_deliveries.canceled_at is null
      and scheduled_memory_deliveries.delivered_at is null
    order by
      case
        when scheduled_memory_deliveries.status = 'processing'
          and scheduled_memory_deliveries.resend_email_id is not null
          then 0
        when scheduled_memory_deliveries.status = 'processing'
          and scheduled_memory_deliveries.resend_email_id is null
          then 1
        else 1
      end,
      scheduled_memory_deliveries.scheduled_for asc,
      scheduled_memory_deliveries.created_at asc
    limit greatest(1, least(coalesce(target_limit, 10), 50))
    for update skip locked
  ),
  claimed_deliveries as (
    update public.scheduled_memory_deliveries
    set
      status = 'processing',
      processing_started_at = now(),
      last_attempt_at = case
        when claim_candidates.provider_accepted_recovery
          then scheduled_memory_deliveries.last_attempt_at
        else now()
      end,
      attempt_count = case
        when claim_candidates.provider_accepted_recovery
          then scheduled_memory_deliveries.attempt_count
        else scheduled_memory_deliveries.attempt_count + 1
      end,
      next_attempt_at = null,
      last_error_code = null,
      last_error_message = null,
      token_hash = case
        when claim_candidates.stale_unaccepted_retry
          then null
        else scheduled_memory_deliveries.token_hash
      end,
      token_created_at = case
        when claim_candidates.stale_unaccepted_retry
          then null
        else scheduled_memory_deliveries.token_created_at
      end,
      updated_at = now()
    from claim_candidates
    where scheduled_memory_deliveries.id = claim_candidates.id
      and scheduled_memory_deliveries.canceled_at is null
      and scheduled_memory_deliveries.delivered_at is null
      and (
        claim_candidates.provider_accepted_recovery
        or scheduled_memory_deliveries.attempt_count < scheduled_memory_deliveries.max_attempts
      )
    returning
      scheduled_memory_deliveries.id,
      scheduled_memory_deliveries.archive_id,
      scheduled_memory_deliveries.memory_id,
      scheduled_memory_deliveries.owner_id,
      scheduled_memory_deliveries.recipient_name,
      scheduled_memory_deliveries.recipient_email,
      scheduled_memory_deliveries.personal_note,
      scheduled_memory_deliveries.timezone,
      scheduled_memory_deliveries.scheduled_for,
      scheduled_memory_deliveries.attempt_count,
      scheduled_memory_deliveries.max_attempts
  )
  select
    claimed_deliveries.id,
    claimed_deliveries.archive_id,
    claimed_deliveries.memory_id,
    claimed_deliveries.owner_id,
    claimed_deliveries.recipient_name,
    claimed_deliveries.recipient_email,
    claimed_deliveries.personal_note,
    claimed_deliveries.timezone,
    claimed_deliveries.scheduled_for,
    claimed_deliveries.attempt_count,
    claimed_deliveries.max_attempts
  from claimed_deliveries;
end;
$$;

revoke all on function public.claim_due_scheduled_memory_deliveries(integer)
  from public, anon, authenticated;
grant execute on function public.claim_due_scheduled_memory_deliveries(integer)
  to service_role;
