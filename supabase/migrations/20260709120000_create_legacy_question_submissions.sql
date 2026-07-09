-- Lead-generation submissions from /legacy-question physical card scans.

create table if not exists public.legacy_question_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  email text not null,
  first_name text,
  wants_reminders boolean not null default false,

  entry_type text not null,
  text_content text,
  media_storage_path text,
  media_mime_type text,
  duration_seconds integer,

  source text not null default 'legacy_question_page',
  card_batch text,
  referrer text,
  user_agent text,

  starter_archive_id uuid,
  mock_archive_slug text,

  submission_status text not null default 'captured',
  visibility text not null default 'private',
  consent_private_default boolean not null default true,
  consent_contact boolean not null default true,

  notes text,

  constraint legacy_question_submissions_email_check
    check (nullif(btrim(email), '') is not null),
  constraint legacy_question_submissions_entry_type_check
    check (entry_type in ('voice', 'text', 'video')),
  constraint legacy_question_submissions_visibility_check
    check (visibility in ('private', 'family', 'public')),
  constraint legacy_question_submissions_status_check
    check (submission_status in ('captured', 'emailed', 'archived', 'failed')),
  constraint legacy_question_submissions_text_length_check
    check (text_content is null or char_length(text_content) <= 2000),
  constraint legacy_question_submissions_duration_check
    check (duration_seconds is null or duration_seconds >= 0),
  constraint legacy_question_submissions_source_check
    check (nullif(btrim(source), '') is not null)
);

create index if not exists legacy_question_submissions_created_at_idx
  on public.legacy_question_submissions (created_at desc);

create index if not exists legacy_question_submissions_source_idx
  on public.legacy_question_submissions (source);

create index if not exists legacy_question_submissions_card_batch_idx
  on public.legacy_question_submissions (card_batch);

create index if not exists legacy_question_submissions_entry_type_idx
  on public.legacy_question_submissions (entry_type);

create index if not exists legacy_question_submissions_status_idx
  on public.legacy_question_submissions (submission_status);

create or replace function public.set_legacy_question_submissions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_legacy_question_submissions_updated_at
  on public.legacy_question_submissions;

create trigger set_legacy_question_submissions_updated_at
before update on public.legacy_question_submissions
for each row execute function public.set_legacy_question_submissions_updated_at();

alter table public.legacy_question_submissions enable row level security;

grant insert on public.legacy_question_submissions to anon, authenticated;
grant insert, select, update, delete on public.legacy_question_submissions to service_role;

drop policy if exists "Anyone can insert legacy question submissions"
  on public.legacy_question_submissions;

create policy "Anyone can insert legacy question submissions"
on public.legacy_question_submissions
for insert
to anon, authenticated
with check (
  visibility = 'private'
  and consent_private_default = true
  and consent_contact = true
);

-- Admin review access is intentionally handled by the app's ADMIN_EMAILS gate,
-- then performed server-side with the service role client, matching current
-- admin dashboard patterns. The service role bypasses RLS by design.
