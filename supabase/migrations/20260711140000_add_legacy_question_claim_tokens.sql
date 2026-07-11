-- Add local claim-token handoff for legacy-question onboarding.

create table if not exists public.legacy_question_claim_tokens (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submission_id uuid not null references public.legacy_question_submissions(id) on delete cascade,
  archive_id uuid not null references public.archives(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  claimed_at timestamptz,
  revoked_at timestamptz
);

create unique index if not exists legacy_question_claim_tokens_token_hash_key
  on public.legacy_question_claim_tokens (token_hash);

create unique index if not exists legacy_question_claim_tokens_active_submission_key
  on public.legacy_question_claim_tokens (submission_id)
  where claimed_at is null and revoked_at is null;

create index if not exists legacy_question_claim_tokens_submission_id_idx
  on public.legacy_question_claim_tokens (submission_id);

create index if not exists legacy_question_claim_tokens_archive_id_idx
  on public.legacy_question_claim_tokens (archive_id);

create index if not exists legacy_question_claim_tokens_user_id_idx
  on public.legacy_question_claim_tokens (user_id);

create index if not exists legacy_question_claim_tokens_expires_at_idx
  on public.legacy_question_claim_tokens (expires_at);

create index if not exists legacy_question_claim_tokens_claimed_at_idx
  on public.legacy_question_claim_tokens (claimed_at);

create index if not exists legacy_question_claim_tokens_revoked_at_idx
  on public.legacy_question_claim_tokens (revoked_at);

alter table public.legacy_question_claim_tokens enable row level security;

grant select, insert, update, delete on public.legacy_question_claim_tokens to service_role;

create or replace function public.issue_legacy_question_claim_token(
  target_submission_id uuid,
  target_archive_id uuid,
  target_user_id uuid,
  target_email text,
  target_token_hash text,
  target_expires_at timestamptz
)
returns public.legacy_question_claim_tokens
language plpgsql
security definer
set search_path = public
as $$
declare
  submission_row public.legacy_question_submissions%rowtype;
  claim_row public.legacy_question_claim_tokens%rowtype;
begin
  select *
  into submission_row
  from public.legacy_question_submissions
  where id = target_submission_id
  for update;

  if not found then
    raise exception 'Legacy question submission was not found.';
  end if;

  if submission_row.starter_archive_id is not null
     and submission_row.starter_archive_id <> target_archive_id then
    raise exception 'Starter archive does not match the submission.';
  end if;

  update public.legacy_question_claim_tokens
    set revoked_at = now()
    where submission_id = target_submission_id
      and claimed_at is null
      and revoked_at is null;

  insert into public.legacy_question_claim_tokens (
    submission_id,
    archive_id,
    user_id,
    email,
    token_hash,
    expires_at,
    created_at
  )
  values (
    target_submission_id,
    target_archive_id,
    target_user_id,
    target_email,
    target_token_hash,
    target_expires_at,
    now()
  )
  returning * into claim_row;

  return claim_row;
end;
$$;

create or replace function public.mark_legacy_question_claim_token_claimed(
  target_claim_token_id uuid
)
returns public.legacy_question_claim_tokens
language plpgsql
security definer
set search_path = public
as $$
declare
  claim_row public.legacy_question_claim_tokens%rowtype;
begin
  select *
  into claim_row
  from public.legacy_question_claim_tokens
  where id = target_claim_token_id
  for update;

  if not found then
    raise exception 'Claim token was not found.';
  end if;

  if claim_row.claimed_at is not null then
    raise exception 'That claim link has already been used.';
  end if;

  if claim_row.revoked_at is not null then
    raise exception 'That claim link has been revoked.';
  end if;

  if claim_row.expires_at <= now() then
    raise exception 'That claim link has expired.';
  end if;

  update public.legacy_question_claim_tokens
    set claimed_at = now()
    where id = target_claim_token_id
      and claimed_at is null
      and revoked_at is null
      and expires_at > now()
    returning * into claim_row;

  if not found then
    raise exception 'That claim link has already been used.';
  end if;

  return claim_row;
end;
$$;

revoke all on function public.issue_legacy_question_claim_token(uuid, uuid, uuid, text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.issue_legacy_question_claim_token(uuid, uuid, uuid, text, text, timestamptz)
  to service_role;

revoke all on function public.mark_legacy_question_claim_token_claimed(uuid)
  from public, anon, authenticated;
grant execute on function public.mark_legacy_question_claim_token_claimed(uuid)
  to service_role;

-- After applying this migration in a live project, refresh the Supabase schema
-- cache so PostgREST exposes the new claim-token RPCs immediately.
