-- Restore the admin-only legacy-question cleanup RPC in a later migration.
-- After applying this migration in a live project, refresh the Supabase
-- schema cache so PostgREST exposes the new function immediately.

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

revoke all on function public.delete_legacy_question_test_submission(uuid)
  from public, anon, authenticated;

grant execute on function public.delete_legacy_question_test_submission(uuid)
  to service_role;
