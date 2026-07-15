-- Extend existing public visit tracking with a privacy-conscious first-party
-- visitor identifier for admin-only unique/new/returning estimates.

alter table public.site_visits
  add column if not exists anonymous_visitor_id text;

create index if not exists site_visits_public_visitor_created_at_idx
  on public.site_visits (anonymous_visitor_id, created_at desc)
  where is_admin = false and anonymous_visitor_id is not null;

create index if not exists site_visits_public_path_created_at_idx
  on public.site_visits (path, created_at desc)
  where is_admin = false;

alter table public.site_visits
  drop constraint if exists site_visits_anonymous_visitor_id_check;

alter table public.site_visits
  add constraint site_visits_anonymous_visitor_id_check
  check (
    anonymous_visitor_id is null
    or (
      length(anonymous_visitor_id) between 16 and 80
      and anonymous_visitor_id ~ '^[a-zA-Z0-9-]+$'
    )
  );
