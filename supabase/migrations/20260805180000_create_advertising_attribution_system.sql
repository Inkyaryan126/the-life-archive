-- Advertising Attribution & Visitor Intelligence Upgrade Migration

-- 1. Extend site_visits table with campaign attribution & bot confidence scoring
alter table public.site_visits
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists tla_campaign_id text,
  add column if not exists tla_link_id text,
  add column if not exists tla_qr_id text,
  add column if not exists tla_channel text,
  add column if not exists tla_placement text,
  add column if not exists tla_variant text,
  add column if not exists tla_material text,
  add column if not exists tla_location text,
  add column if not exists tla_partner text,
  add column if not exists first_touch_utm_source text,
  add column if not exists first_touch_utm_medium text,
  add column if not exists first_touch_utm_campaign text,
  add column if not exists first_touch_tla_campaign_id text,
  add column if not exists bot_score integer default 0,
  add column if not exists bot_classification text default 'likely_human',
  add column if not exists bot_reasons text[] default '{}';

create index if not exists site_visits_campaign_idx
  on public.site_visits (utm_campaign, created_at desc);

create index if not exists site_visits_tla_campaign_idx
  on public.site_visits (tla_campaign_id, created_at desc);

create index if not exists site_visits_tla_qr_idx
  on public.site_visits (tla_qr_id, created_at desc);

-- 2. Create advertising_campaigns table
create table if not exists public.advertising_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  name text not null,
  slug text not null unique,
  platform text not null,
  channel text,
  medium text,
  objective text,
  destination_url text not null,
  start_date date,
  end_date date,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  budget numeric(12,2),
  actual_cost numeric(12,2),
  impressions bigint default 0,
  platform_clicks bigint default 0,
  manual_leads integer default 0,
  manual_sales integer default 0,
  target_audience text,
  is_physical boolean not null default false,
  placement text,
  geographic_location text,
  partner_name text,
  creative_variant text,
  offer text,
  notes text,
  campaign_owner text
);

create index if not exists advertising_campaigns_status_idx
  on public.advertising_campaigns (status, created_at desc);

create index if not exists advertising_campaigns_platform_idx
  on public.advertising_campaigns (platform);

alter table public.advertising_campaigns enable row level security;
grant select, insert, update, delete on public.advertising_campaigns to service_role;

-- 3. Create advertising_links table
create table if not exists public.advertising_links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  campaign_id uuid references public.advertising_campaigns(id) on delete set null,
  link_name text not null,
  slug text not null unique,
  destination_path text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  tla_channel text,
  tla_placement text,
  tla_variant text,
  tla_material text,
  tla_location text,
  tla_partner text,
  is_disabled boolean not null default false,
  click_count bigint not null default 0,
  unique_visitor_count bigint not null default 0
);

create index if not exists advertising_links_slug_idx
  on public.advertising_links (slug);

create index if not exists advertising_links_campaign_idx
  on public.advertising_links (campaign_id);

alter table public.advertising_links enable row level security;
grant select, insert, update, delete on public.advertising_links to service_role;

-- 4. Create advertising_qr_codes table
create table if not exists public.advertising_qr_codes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  link_id uuid references public.advertising_links(id) on delete cascade,
  qr_name text not null,
  slug text not null unique,
  error_correction_level text not null default 'H',
  print_suitable boolean not null default true,
  engraving_suitable boolean not null default true,
  material_target text,
  scan_count bigint not null default 0
);

create index if not exists advertising_qr_codes_slug_idx
  on public.advertising_qr_codes (slug);

create index if not exists advertising_qr_codes_link_idx
  on public.advertising_qr_codes (link_id);

alter table public.advertising_qr_codes enable row level security;
grant select, insert, update, delete on public.advertising_qr_codes to service_role;

-- 5. Create analytics_visitor_notes table
create table if not exists public.analytics_visitor_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  visitor_id text not null,
  note text,
  tags text[] default '{}',
  manual_classification text check (manual_classification in ('human', 'bot', 'internal', 'ignored')),
  is_ignored boolean not null default false,
  is_internal boolean not null default false,
  is_blocked boolean not null default false,
  created_by text
);

create unique index if not exists analytics_visitor_notes_visitor_idx
  on public.analytics_visitor_notes (visitor_id);

alter table public.analytics_visitor_notes enable row level security;
grant select, insert, update, delete on public.analytics_visitor_notes to service_role;

-- 6. Create advertising_conversions table
create table if not exists public.advertising_conversions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  visitor_id text not null,
  session_id text,
  conversion_type text not null,
  conversion_value numeric(12,2),
  first_touch_campaign_id uuid references public.advertising_campaigns(id) on delete set null,
  latest_touch_campaign_id uuid references public.advertising_campaigns(id) on delete set null,
  link_id uuid references public.advertising_links(id) on delete set null,
  qr_id uuid references public.advertising_qr_codes(id) on delete set null,
  details jsonb
);

create index if not exists advertising_conversions_visitor_idx
  on public.advertising_conversions (visitor_id);

create index if not exists advertising_conversions_type_idx
  on public.advertising_conversions (conversion_type);

create index if not exists advertising_conversions_campaign_idx
  on public.advertising_conversions (latest_touch_campaign_id);

alter table public.advertising_conversions enable row level security;
grant select, insert, update, delete on public.advertising_conversions to service_role;
