-- Make legacy-question onboarding pipeline states explicit and retry-friendly.

alter table public.legacy_question_submissions
  add column if not exists processing_stage text;

alter table public.legacy_question_submissions
  drop constraint if exists legacy_question_submissions_processing_status_check;

update public.legacy_question_submissions
set processing_status = case processing_status
  when 'submission_captured' then 'captured'
  when 'first_memory_created' then 'memory_created'
  when 'account_invitation_requested' then 'claim_link_created'
  when 'welcome_email_sent' then 'email_sent'
  else processing_status
end;

update public.legacy_question_submissions
set processing_stage = coalesce(processing_stage, processing_status)
where processing_stage is null;

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

create index if not exists legacy_question_submissions_processing_stage_idx
  on public.legacy_question_submissions (processing_stage);

create or replace function public.delete_legacy_question_test_submission(
  target_submission_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_submission public.legacy_question_submissions%rowtype;
  deleted_memories integer := 0;
  deleted_archives integer := 0;
  deleted_submissions integer := 0;
begin
  select *
  into target_submission
  from public.legacy_question_submissions
  where id = target_submission_id
  for update;

  if not found then
    raise exception 'Legacy question submission was not found.';
  end if;

  delete from public.memories
  where id = target_submission.first_memory_id
     or legacy_question_submission_id = target_submission.id;
  get diagnostics deleted_memories = row_count;

  delete from public.archives
  where id = target_submission.starter_archive_id
     or legacy_question_submission_id = target_submission.id;
  get diagnostics deleted_archives = row_count;

  delete from public.legacy_question_submissions
  where id = target_submission.id;
  get diagnostics deleted_submissions = row_count;

  return jsonb_build_object(
    'submission_id', target_submission.id,
    'deleted_memories', deleted_memories,
    'deleted_archives', deleted_archives,
    'deleted_submissions', deleted_submissions
  );
end;
$$;
