-- Owner-held single-use legacy activation codes for memorial review.

alter table public.archives
  add column if not exists legacy_activation_code text,
  add column if not exists legacy_code_used_at timestamptz,
  add column if not exists legacy_activated_by text,
  add column if not exists memorial_activated_at timestamptz,
  add column if not exists memorial_activated_by text;

create unique index if not exists archives_legacy_activation_code_unique
  on public.archives (legacy_activation_code)
  where legacy_activation_code is not null;

alter table public.archives
  drop constraint if exists archives_legacy_activation_code_format_check;

alter table public.archives
  add constraint archives_legacy_activation_code_format_check
  check (
    legacy_activation_code is null
    or legacy_activation_code ~ '^(TLA|LAC)-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$'
  );

alter table public.archives
  drop constraint if exists archives_memorial_has_no_activation_code_check;

alter table public.archives
  add constraint archives_memorial_has_no_activation_code_check
  check (memorial_mode = false or legacy_activation_code is null);

update public.archives
set legacy_activation_code =
  'TLA-' ||
  upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 4)) || '-' ||
  upper(substr(encode(gen_random_bytes(6), 'hex'), 5, 4)) || '-' ||
  upper(substr(encode(gen_random_bytes(6), 'hex'), 9, 4))
where legacy_activation_code is null
  and owner_id is not null
  and memorial_mode = false;

create table if not exists public.legacy_activation_requests (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.archives(id) on delete cascade,
  requester_name text not null,
  relationship_to_owner text not null,
  message text,
  status text not null default 'pending_memorial_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint legacy_activation_requests_requester_name_check
    check (nullif(btrim(requester_name), '') is not null),
  constraint legacy_activation_requests_relationship_check
    check (nullif(btrim(relationship_to_owner), '') is not null),
  constraint legacy_activation_requests_status_check
    check (status in ('pending_memorial_review', 'memorial_activated', 'review_closed'))
);

create index if not exists legacy_activation_requests_archive_id_idx
  on public.legacy_activation_requests (archive_id);

create index if not exists legacy_activation_requests_status_idx
  on public.legacy_activation_requests (status);

create or replace function public.set_legacy_activation_requests_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_legacy_activation_requests_updated_at
  on public.legacy_activation_requests;
create trigger set_legacy_activation_requests_updated_at
before update on public.legacy_activation_requests
for each row execute function public.set_legacy_activation_requests_updated_at();

alter table public.legacy_activation_requests enable row level security;

drop policy if exists "Owners can read legacy activation requests"
  on public.legacy_activation_requests;
create policy "Owners can read legacy activation requests"
on public.legacy_activation_requests
for select
to authenticated
using (public.is_archive_owner(archive_id));
