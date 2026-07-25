-- Migration: Create Visitor Rate Limit Events Table and Atomic Rolling Window RPC Function

create table if not exists public.visitor_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  rate_key text not null,
  action_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_visitor_rate_limit_events_lookup
  on public.visitor_rate_limit_events (rate_key, action_type, created_at);

-- Atomic RPC function to evaluate multiple rolling window checks in a single transaction
create or replace function public.check_and_record_visitor_rate_limits(
  p_checks jsonb
) returns table (allowed boolean, violating_key text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_check jsonb;
  v_rate_key text;
  v_action_type text;
  v_max_requests integer;
  v_window_seconds integer;
  v_count integer;
  v_cutoff timestamptz;
begin
  -- Probabilistic cleanup (1% sampling) of events older than 7 days
  if random() < 0.01 then
    delete from public.visitor_rate_limit_events
    where created_at < now() - interval '7 days';
  end if;

  -- Phase 1: Evaluate all checks
  for v_check in select * from jsonb_array_elements(p_checks)
  loop
    v_rate_key := v_check->>'rate_key';
    v_action_type := v_check->>'action_type';
    v_max_requests := (v_check->>'max_requests')::integer;
    v_window_seconds := (v_check->>'window_seconds')::integer;
    v_cutoff := now() - (v_window_seconds || ' seconds')::interval;

    select count(*)::integer into v_count
    from public.visitor_rate_limit_events
    where rate_key = v_rate_key
      and action_type = v_action_type
      and created_at >= v_cutoff;

    if v_count >= v_max_requests then
      return query select false, v_rate_key;
      return;
    end if;
  end loop;

  -- Phase 2: If all checks pass, record the events for this execution
  for v_check in select * from jsonb_array_elements(p_checks)
  loop
    v_rate_key := v_check->>'rate_key';
    v_action_type := v_check->>'action_type';

    insert into public.visitor_rate_limit_events (rate_key, action_type, created_at)
    values (v_rate_key, v_action_type, now());
  end loop;

  return query select true, null::text;
end;
$$;

-- Security hardening: revoke public execution and grant exclusively to service_role
revoke all on function public.check_and_record_visitor_rate_limits(jsonb) from public, anon, authenticated;
grant execute on function public.check_and_record_visitor_rate_limits(jsonb) to service_role;
