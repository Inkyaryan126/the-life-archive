-- Store coarse visitor location derived from hosting/CDN geo headers.
-- Raw IP addresses are intentionally not stored.

alter table public.site_visits
  add column if not exists visitor_city text,
  add column if not exists visitor_region text,
  add column if not exists visitor_country text;

alter table public.site_visits
  drop constraint if exists site_visits_visitor_city_check,
  drop constraint if exists site_visits_visitor_region_check,
  drop constraint if exists site_visits_visitor_country_check;

alter table public.site_visits
  add constraint site_visits_visitor_city_check
  check (visitor_city is null or length(visitor_city) <= 120),
  add constraint site_visits_visitor_region_check
  check (visitor_region is null or length(visitor_region) <= 120),
  add constraint site_visits_visitor_country_check
  check (visitor_country is null or length(visitor_country) <= 80);
