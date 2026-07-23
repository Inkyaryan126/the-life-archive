-- Permanent tracking for Prologue Part 2 and Prologue Part 3 onboarding playback state.

alter table public.legacy_question_submissions
  add column if not exists prologue_part2_seen_at timestamptz default null,
  add column if not exists prologue_part2_status text default null,
  add column if not exists prologue_part3_seen_at timestamptz default null,
  add column if not exists prologue_part3_status text default null,
  add column if not exists claimed_user_id uuid references auth.users(id) on delete set null default null;

alter table public.profiles
  add column if not exists legacy_question_eligible boolean not null default false,
  add column if not exists prologue_part3_seen_at timestamptz default null,
  add column if not exists prologue_part3_status text default null;

-- Add check constraints for status values
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'legacy_question_submissions_part2_status_check'
  ) then
    alter table public.legacy_question_submissions
      add constraint legacy_question_submissions_part2_status_check
      check (prologue_part2_status is null or prologue_part2_status in ('completed', 'skipped'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'legacy_question_submissions_part3_status_check'
  ) then
    alter table public.legacy_question_submissions
      add constraint legacy_question_submissions_part3_status_check
      check (prologue_part3_status is null or prologue_part3_status in ('completed', 'skipped'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_part3_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_part3_status_check
      check (prologue_part3_status is null or prologue_part3_status in ('completed', 'skipped'));
  end if;
end $$;

-- Indexes for efficient lookup
create index if not exists legacy_question_submissions_claimed_user_idx
  on public.legacy_question_submissions (claimed_user_id)
  where claimed_user_id is not null;

create index if not exists profiles_legacy_question_eligible_idx
  on public.profiles (id)
  where legacy_question_eligible = true;
