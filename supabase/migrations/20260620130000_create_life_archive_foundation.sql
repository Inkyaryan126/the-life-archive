-- Life Archive database foundation.
-- This migration creates schema, constraints, indexes, updated_at handling, and
-- row-level security policies only. The Next.js app is not wired to Supabase yet.

create extension if not exists pgcrypto;

create table if not exists public.archives (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  slug text not null unique,
  archive_name text not null,
  person_name text not null,
  bio text,
  profile_photo_url text,
  visibility text not null default 'private',
  memorial_mode boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint archives_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint archives_visibility_check
    check (visibility in ('private', 'public')),
  constraint archives_demo_owner_check
    check (
      (is_demo = true and owner_id is null)
      or
      (is_demo = false and owner_id is not null)
    )
);

create table if not exists public.archive_members (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.archives(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer',
  created_at timestamptz not null default now(),
  constraint archive_members_role_check
    check (role in ('viewer', 'editor')),
  constraint archive_members_unique_user_per_archive
    unique (archive_id, user_id)
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.archives(id) on delete cascade,
  title text not null,
  type text not null,
  content text,
  media_url text,
  memory_date date,
  tags text[] not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memories_type_check
    check (type in ('song', 'journal', 'photo', 'video', 'voice', 'lesson')),
  constraint memories_content_or_media_check
    check (
      nullif(btrim(coalesce(content, '')), '') is not null
      or
      nullif(btrim(coalesce(media_url, '')), '') is not null
    )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_archives_updated_at on public.archives;
create trigger set_archives_updated_at
before update on public.archives
for each row
execute function public.set_updated_at();

drop trigger if exists set_memories_updated_at on public.memories;
create trigger set_memories_updated_at
before update on public.memories
for each row
execute function public.set_updated_at();

create index if not exists archives_owner_id_idx
  on public.archives (owner_id);

create index if not exists archives_visibility_idx
  on public.archives (visibility);

create index if not exists archives_is_demo_idx
  on public.archives (is_demo);

create index if not exists archive_members_archive_id_idx
  on public.archive_members (archive_id);

create index if not exists archive_members_user_id_idx
  on public.archive_members (user_id);

create index if not exists memories_archive_id_idx
  on public.memories (archive_id);

create index if not exists memories_created_by_idx
  on public.memories (created_by);

create index if not exists memories_memory_date_idx
  on public.memories (memory_date);

alter table public.archives enable row level security;
alter table public.archive_members enable row level security;
alter table public.memories enable row level security;

-- Helper predicates keep RLS policies readable.
create or replace function public.is_archive_owner(target_archive_id uuid)
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

create or replace function public.is_archive_member(target_archive_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.archive_members
    where archive_id = target_archive_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.can_edit_archive_memories(target_archive_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_archive_owner(target_archive_id)
    or exists (
      select 1
      from public.archive_members
      where archive_id = target_archive_id
        and user_id = auth.uid()
        and role = 'editor'
    );
$$;

-- Archives
drop policy if exists "Public can read public archives" on public.archives;
create policy "Public can read public archives"
on public.archives
for select
to anon, authenticated
using (visibility = 'public');

drop policy if exists "Owners can read own archives" on public.archives;
create policy "Owners can read own archives"
on public.archives
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Members can read shared archives" on public.archives;
create policy "Members can read shared archives"
on public.archives
for select
to authenticated
using (public.is_archive_member(id));

drop policy if exists "Authenticated users can create own archives" on public.archives;
create policy "Authenticated users can create own archives"
on public.archives
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and is_demo = false
);

drop policy if exists "Owners can update own non-demo archives" on public.archives;
create policy "Owners can update own non-demo archives"
on public.archives
for update
to authenticated
using (
  owner_id = auth.uid()
  and is_demo = false
)
with check (
  owner_id = auth.uid()
  and is_demo = false
);

drop policy if exists "Owners can delete own non-demo archives" on public.archives;
create policy "Owners can delete own non-demo archives"
on public.archives
for delete
to authenticated
using (
  owner_id = auth.uid()
  and is_demo = false
);

-- Archive members
drop policy if exists "Owners can read archive members" on public.archive_members;
create policy "Owners can read archive members"
on public.archive_members
for select
to authenticated
using (public.is_archive_owner(archive_id));

drop policy if exists "Members can read own membership" on public.archive_members;
create policy "Members can read own membership"
on public.archive_members
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Owners can add archive members" on public.archive_members;
create policy "Owners can add archive members"
on public.archive_members
for insert
to authenticated
with check (public.is_archive_owner(archive_id));

drop policy if exists "Owners can update archive members" on public.archive_members;
create policy "Owners can update archive members"
on public.archive_members
for update
to authenticated
using (public.is_archive_owner(archive_id))
with check (public.is_archive_owner(archive_id));

drop policy if exists "Owners can delete archive members" on public.archive_members;
create policy "Owners can delete archive members"
on public.archive_members
for delete
to authenticated
using (public.is_archive_owner(archive_id));

-- Memories
drop policy if exists "Public can read memories from public archives" on public.memories;
create policy "Public can read memories from public archives"
on public.memories
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.archives
    where archives.id = memories.archive_id
      and archives.visibility = 'public'
  )
);

drop policy if exists "Owners can read memories from own archives" on public.memories;
create policy "Owners can read memories from own archives"
on public.memories
for select
to authenticated
using (public.is_archive_owner(archive_id));

drop policy if exists "Members can read memories from shared archives" on public.memories;
create policy "Members can read memories from shared archives"
on public.memories
for select
to authenticated
using (public.is_archive_member(archive_id));

drop policy if exists "Owners and editors can create memories" on public.memories;
create policy "Owners and editors can create memories"
on public.memories
for insert
to authenticated
with check (
  public.can_edit_archive_memories(archive_id)
  and created_by = auth.uid()
);

drop policy if exists "Owners and editors can update memories" on public.memories;
create policy "Owners and editors can update memories"
on public.memories
for update
to authenticated
using (public.can_edit_archive_memories(archive_id))
with check (public.can_edit_archive_memories(archive_id));

drop policy if exists "Owners and editors can delete memories" on public.memories;
create policy "Owners and editors can delete memories"
on public.memories
for delete
to authenticated
using (public.can_edit_archive_memories(archive_id));

-- Private QR behavior:
-- Public QR routes may read public archives and all memories attached to those
-- public archives through the anon policies above. Private archive QR scans
-- should require login in the application layer. After login, RLS only allows
-- owners or archive members to read private archive rows and memories.
-- No public token/share-link table is included in this MVP migration.
