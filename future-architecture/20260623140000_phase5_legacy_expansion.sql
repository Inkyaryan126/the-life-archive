-- Phase 5 Database Schema Expansion
-- Supports Trustee Roles, Soft Deletes, Access Links, Archive status, and Simple Provenance.

-- 1. Trustee role support in archive_members
alter table public.archive_members
  drop constraint if exists archive_members_role_check;

alter table public.archive_members
  add constraint archive_members_role_check
  check (role in ('viewer', 'editor', 'trustee'));

-- 2. Soft deletion and simple provenance support in memories
alter table public.memories
  add column if not exists deleted_at timestamptz default null,
  add column if not exists deleted_by uuid references auth.users(id) on delete set null,
  add column if not exists source_type text not null default 'original';

alter table public.memories
  drop constraint if exists memories_source_type_check;

alter table public.memories
  add constraint memories_source_type_check
  check (source_type in ('original', 'restored', 'enhanced', 'ai_generated'));

-- Create index on deleted_at for query performance
create index if not exists memories_deleted_at_idx
  on public.memories (deleted_at);

-- 3. Archive status foundation
alter table public.archives
  add column if not exists status text not null default 'living';

alter table public.archives
  drop constraint if exists archives_status_check;

alter table public.archives
  add constraint archives_status_check
  check (status in ('living', 'memorial_pending', 'memorial', 'archived'));

-- Create index on status for lifecycle checks
create index if not exists archives_status_idx
  on public.archives (status);

-- Migrate existing archives with memorial_mode = true to status = 'memorial'
update public.archives
set status = 'memorial'
where memorial_mode = true;

-- 4. Access Links Table for secure QR/Private Archive sharing
create table if not exists public.access_links (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.archives(id) on delete cascade,
  token text not null unique,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to auto-update updated_at for access_links
drop trigger if exists set_access_links_updated_at on public.access_links;
create trigger set_access_links_updated_at
before update on public.access_links
for each row
execute function public.set_updated_at();

-- Indexes for access_links performance
create index if not exists access_links_archive_id_idx
  on public.access_links (archive_id);

create index if not exists access_links_token_idx
  on public.access_links (token);

-- Enable RLS on access_links
alter table public.access_links enable row level security;

-- Policies for access_links: Only archive owners can manage access links
create or replace function public.is_access_link_owner(target_archive_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.archives
    where id = target_archive_id
      and owner_id = auth.uid()
  );
$$;

drop policy if exists "Owners can manage access links" on public.access_links;
create policy "Owners can manage access links"
on public.access_links
for all
to authenticated
using (public.is_access_link_owner(archive_id))
with check (public.is_access_link_owner(archive_id));
