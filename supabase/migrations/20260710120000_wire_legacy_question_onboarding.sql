-- Wire /legacy-question submissions to the starter-archive onboarding pipeline.

alter table public.legacy_question_submissions
  add column if not exists starter_archive_slug text,
  add column if not exists archive_created_at timestamptz,
  add column if not exists first_memory_id uuid references public.memories(id) on delete set null,
  add column if not exists first_memory_created_at timestamptz,
  add column if not exists invitation_sent_at timestamptz,
  add column if not exists welcome_email_sent_at timestamptz,
  add column if not exists processing_status text not null default 'captured',
  add column if not exists processing_stage text,
  add column if not exists processing_error text,
  add column if not exists processing_attempts integer not null default 0,
  add column if not exists last_processing_attempt_at timestamptz;

alter table public.archives
  add column if not exists legacy_question_submission_id uuid
    references public.legacy_question_submissions(id) on delete set null;

alter table public.memories
  add column if not exists legacy_question_submission_id uuid
    references public.legacy_question_submissions(id) on delete set null;

alter table public.legacy_question_submissions
  drop constraint if exists legacy_question_submissions_processing_status_check;

alter table public.legacy_question_submissions
  add constraint legacy_question_submissions_processing_status_check
    check (
      processing_status in (
        'captured',
        'archive_created',
        'memory_created',
        'claim_link_created',
        'email_sent',
        'media_pending',
        'failed'
      )
    );

alter table public.legacy_question_submissions
  drop constraint if exists legacy_question_submissions_processing_attempts_check;

alter table public.legacy_question_submissions
  add constraint legacy_question_submissions_processing_attempts_check
    check (processing_attempts >= 0);

create unique index if not exists legacy_question_submissions_starter_archive_id_key
  on public.legacy_question_submissions (starter_archive_id)
  where starter_archive_id is not null;

create unique index if not exists legacy_question_submissions_first_memory_id_key
  on public.legacy_question_submissions (first_memory_id)
  where first_memory_id is not null;

create unique index if not exists archives_legacy_question_submission_id_key
  on public.archives (legacy_question_submission_id)
  where legacy_question_submission_id is not null;

create unique index if not exists memories_legacy_question_submission_id_key
  on public.memories (legacy_question_submission_id)
  where legacy_question_submission_id is not null;

create index if not exists legacy_question_submissions_processing_status_idx
  on public.legacy_question_submissions (processing_status);

create index if not exists legacy_question_submissions_processing_stage_idx
  on public.legacy_question_submissions (processing_stage);

create index if not exists legacy_question_submissions_starter_archive_slug_idx
  on public.legacy_question_submissions (starter_archive_slug);

update public.legacy_question_submissions
set starter_archive_slug = mock_archive_slug
where starter_archive_slug is null
  and mock_archive_slug is not null;

alter table public.legacy_question_submissions
  drop column if exists mock_archive_slug;
