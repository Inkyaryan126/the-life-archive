-- Lightweight public visit tracking for the admin dashboard.

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  user_agent text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  constraint site_visits_path_check check (nullif(btrim(path), '') is not null)
);

create index if not exists site_visits_created_at_idx
  on public.site_visits (created_at desc);

create index if not exists site_visits_path_idx
  on public.site_visits (path);

create index if not exists site_visits_public_created_at_idx
  on public.site_visits (created_at desc)
  where is_admin = false;

alter table public.site_visits enable row level security;

drop policy if exists "App can insert public site visits" on public.site_visits;
create policy "App can insert public site visits"
on public.site_visits
for insert
to anon, authenticated
with check (is_admin = false);

create or replace function public.get_site_visit_top_paths(limit_count integer default 5)
returns table(path text, visit_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select site_visits.path, count(*)::bigint as visit_count
  from public.site_visits
  where site_visits.is_admin = false
  group by site_visits.path
  order by visit_count desc, site_visits.path asc
  limit greatest(least(limit_count, 50), 1);
$$;

revoke all on function public.get_site_visit_top_paths(integer) from public;
revoke all on function public.get_site_visit_top_paths(integer) from anon;
revoke all on function public.get_site_visit_top_paths(integer) from authenticated;
grant execute on function public.get_site_visit_top_paths(integer) to service_role;
