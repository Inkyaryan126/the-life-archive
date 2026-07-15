-- Move Time Capsule delivery cadence off Vercel Cron so Hobby deployments do
-- not depend on unsupported five-minute schedules. The CRON_SECRET value must
-- be stored in Supabase Vault as a secret named CRON_SECRET before this job can
-- authorize against the existing Next.js endpoint.

create schema if not exists extensions;
create schema if not exists vault;

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

create or replace function public.invoke_time_capsule_cron()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  cron_secret text;
  request_id bigint;
begin
  select decrypted_secret
    into cron_secret
  from vault.decrypted_secrets
  where name = 'CRON_SECRET'
    and nullif(btrim(decrypted_secret), '') is not null
  order by updated_at desc nulls last, created_at desc
  limit 1;

  if cron_secret is null then
    raise warning 'Time Capsule Supabase Cron skipped because Vault secret CRON_SECRET is missing.';
    return null;
  end if;

  select net.http_get(
    url := 'https://thelifearchive.vip/api/cron/time-capsules',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || cron_secret
    ),
    timeout_milliseconds := 15000
  )
    into request_id;

  return request_id;
end;
$$;

revoke all on function public.invoke_time_capsule_cron() from public, anon, authenticated;

do $$
begin
  if exists (
    select 1
    from cron.job
    where jobname = 'time-capsule-deliveries-every-five-minutes'
  ) then
    perform cron.unschedule('time-capsule-deliveries-every-five-minutes');
  end if;
end;
$$;

select cron.schedule(
  'time-capsule-deliveries-every-five-minutes',
  '*/5 * * * *',
  $$ select public.invoke_time_capsule_cron(); $$
);
