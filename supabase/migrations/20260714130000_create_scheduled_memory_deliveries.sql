-- Date-based Time Capsules for scheduled memory delivery.
-- Public delivery access is resolved server-side with token hashes; no raw
-- delivery tokens are stored.

create table if not exists public.scheduled_memory_deliveries (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.archives(id) on delete cascade,
  memory_id uuid references public.memories(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  recipient_name text not null,
  recipient_email text not null,
  personal_note text,
  timezone text not null,
  scheduled_for timestamptz not null,
  status text not null default 'scheduled',
  token_hash text,
  token_created_at timestamptz,
  processing_started_at timestamptz,
  delivered_at timestamptz,
  canceled_at timestamptz,
  failed_at timestamptz,
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  last_attempt_at timestamptz,
  next_attempt_at timestamptz,
  resend_email_id text,
  last_error_code text,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_memory_deliveries_status_check
    check (status in ('scheduled', 'processing', 'delivered', 'failed', 'canceled')),
  constraint scheduled_memory_deliveries_recipient_name_check
    check (
      nullif(btrim(recipient_name), '') is not null
      and char_length(btrim(recipient_name)) <= 120
    ),
  constraint scheduled_memory_deliveries_recipient_email_check
    check (
      nullif(btrim(recipient_email), '') is not null
      and char_length(btrim(recipient_email)) <= 320
    ),
  constraint scheduled_memory_deliveries_personal_note_length_check
    check (personal_note is null or char_length(btrim(personal_note)) <= 500),
  constraint scheduled_memory_deliveries_timezone_check
    check (
      nullif(btrim(timezone), '') is not null
      and char_length(btrim(timezone)) <= 100
    ),
  constraint scheduled_memory_deliveries_token_hash_check
    check (
      token_hash is null
      or (
        nullif(btrim(token_hash), '') is not null
        and char_length(btrim(token_hash)) <= 128
      )
    ),
  constraint scheduled_memory_deliveries_attempt_count_check
    check (attempt_count >= 0),
  constraint scheduled_memory_deliveries_max_attempts_check
    check (max_attempts >= 1),
  constraint scheduled_memory_deliveries_attempt_limit_check
    check (attempt_count <= max_attempts),
  constraint scheduled_memory_deliveries_resend_email_id_check
    check (resend_email_id is null or char_length(btrim(resend_email_id)) <= 160),
  constraint scheduled_memory_deliveries_last_error_code_check
    check (last_error_code is null or char_length(btrim(last_error_code)) <= 80),
  constraint scheduled_memory_deliveries_last_error_message_check
    check (last_error_message is null or char_length(btrim(last_error_message)) <= 300),
  constraint scheduled_memory_deliveries_delivered_at_check
    check (status <> 'delivered' or delivered_at is not null),
  constraint scheduled_memory_deliveries_delivered_token_check
    check (status <> 'delivered' or (token_hash is not null and token_created_at is not null)),
  constraint scheduled_memory_deliveries_canceled_at_check
    check (status <> 'canceled' or canceled_at is not null)
);

drop trigger if exists set_scheduled_memory_deliveries_updated_at
  on public.scheduled_memory_deliveries;
create trigger set_scheduled_memory_deliveries_updated_at
before update on public.scheduled_memory_deliveries
for each row
execute function public.set_updated_at();

create index if not exists scheduled_memory_deliveries_owner_created_at_idx
  on public.scheduled_memory_deliveries (owner_id, created_at desc);

create index if not exists scheduled_memory_deliveries_archive_id_idx
  on public.scheduled_memory_deliveries (archive_id);

create index if not exists scheduled_memory_deliveries_memory_id_idx
  on public.scheduled_memory_deliveries (memory_id);

create unique index if not exists scheduled_memory_deliveries_token_hash_key
  on public.scheduled_memory_deliveries (token_hash)
  where token_hash is not null;

create index if not exists scheduled_memory_deliveries_due_processing_idx
  on public.scheduled_memory_deliveries (
    status,
    scheduled_for,
    next_attempt_at,
    created_at
  )
  where status in ('scheduled', 'failed')
    and attempt_count < max_attempts;

alter table public.scheduled_memory_deliveries enable row level security;

grant select, insert on public.scheduled_memory_deliveries
  to authenticated;
grant select, insert, update, delete on public.scheduled_memory_deliveries
  to service_role;

drop policy if exists "Owners can read scheduled memory deliveries"
  on public.scheduled_memory_deliveries;
create policy "Owners can read scheduled memory deliveries"
on public.scheduled_memory_deliveries
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Owners can create scheduled memory deliveries"
  on public.scheduled_memory_deliveries;
create policy "Owners can create scheduled memory deliveries"
on public.scheduled_memory_deliveries
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and status = 'scheduled'
  and token_hash is null
  and token_created_at is null
  and processing_started_at is null
  and delivered_at is null
  and canceled_at is null
  and failed_at is null
  and attempt_count = 0
  and max_attempts = 3
  and last_attempt_at is null
  and next_attempt_at is null
  and resend_email_id is null
  and last_error_code is null
  and last_error_message is null
  and exists (
    select 1
    from public.archives
    where archives.id = scheduled_memory_deliveries.archive_id
      and archives.owner_id = auth.uid()
  )
  and exists (
    select 1
    from public.memories
    where memories.id = scheduled_memory_deliveries.memory_id
      and memories.archive_id = scheduled_memory_deliveries.archive_id
  )
);

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
begin
  return query
  with due_deliveries as (
    select scheduled_memory_deliveries.id
    from public.scheduled_memory_deliveries
    where scheduled_memory_deliveries.status in ('scheduled', 'failed')
      and scheduled_memory_deliveries.scheduled_for <= now()
      and scheduled_memory_deliveries.attempt_count < scheduled_memory_deliveries.max_attempts
      and scheduled_memory_deliveries.canceled_at is null
      and scheduled_memory_deliveries.delivered_at is null
      and (
        scheduled_memory_deliveries.status = 'scheduled'
        or scheduled_memory_deliveries.next_attempt_at is null
        or scheduled_memory_deliveries.next_attempt_at <= now()
      )
    order by scheduled_memory_deliveries.scheduled_for asc,
      scheduled_memory_deliveries.created_at asc
    limit greatest(1, least(coalesce(target_limit, 10), 50))
    for update skip locked
  ),
  claimed_deliveries as (
    update public.scheduled_memory_deliveries
    set
      status = 'processing',
      processing_started_at = now(),
      last_attempt_at = now(),
      attempt_count = scheduled_memory_deliveries.attempt_count + 1,
      last_error_code = null,
      last_error_message = null,
      updated_at = now()
    from due_deliveries
    where scheduled_memory_deliveries.id = due_deliveries.id
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
