-- Migration: Archive Contributors Invitation System
-- Create archive_contributors table and sync with archive_members as canonical active access layer.

create table if not exists public.archive_contributors (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.archives(id) on delete cascade,
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  role text not null default 'contributor',
  status text not null default 'pending',
  invited_by uuid not null references auth.users(id) on delete cascade,
  invite_token_hash text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  declined_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint archive_contributors_role_check
    check (role in ('viewer', 'contributor', 'manager')),
  constraint archive_contributors_status_check
    check (status in ('pending', 'accepted', 'declined', 'revoked', 'expired')),
  constraint archive_contributors_email_normalized_check
    check (email = lower(trim(email)))
);

-- Partial unique index: prevent multiple pending or accepted invitations for the same archive and email
create unique index if not exists archive_contributors_unique_pending_accepted_idx
  on public.archive_contributors (archive_id, email)
  where status in ('pending', 'accepted');

-- Indexes for performance lookups
create index if not exists archive_contributors_archive_id_idx
  on public.archive_contributors (archive_id);

create index if not exists archive_contributors_email_idx
  on public.archive_contributors (email);

create index if not exists archive_contributors_user_id_idx
  on public.archive_contributors (user_id);

create index if not exists archive_contributors_token_hash_idx
  on public.archive_contributors (invite_token_hash);

create index if not exists archive_contributors_status_idx
  on public.archive_contributors (status);

-- Updated_at trigger
drop trigger if exists set_archive_contributors_updated_at on public.archive_contributors;
create trigger set_archive_contributors_updated_at
before update on public.archive_contributors
for each row
execute function public.set_updated_at();

-- Update archive_members role constraint to support contributor and manager roles if not already present
alter table public.archive_members
  drop constraint if exists archive_members_role_check;

alter table public.archive_members
  add constraint archive_members_role_check
    check (role in ('viewer', 'editor', 'contributor', 'manager'));

-- Update can_edit_archive_memories helper function to include contributor and manager roles
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
        and role in ('editor', 'contributor', 'manager')
    );
$$;

-- Enable RLS on archive_contributors
alter table public.archive_contributors enable row level security;

-- RLS Policies for archive_contributors
drop policy if exists "Owners can view archive contributors" on public.archive_contributors;
create policy "Owners can view archive contributors"
on public.archive_contributors
for select
to authenticated
using (public.is_archive_owner(archive_id));

drop policy if exists "Owners can create archive contributors" on public.archive_contributors;
create policy "Owners can create archive contributors"
on public.archive_contributors
for insert
to authenticated
with check (public.is_archive_owner(archive_id));

drop policy if exists "Owners can update archive contributors" on public.archive_contributors;
create policy "Owners can update archive contributors"
on public.archive_contributors
for update
to authenticated
using (public.is_archive_owner(archive_id))
with check (public.is_archive_owner(archive_id));

drop policy if exists "Owners can delete archive contributors" on public.archive_contributors;
create policy "Owners can delete archive contributors"
on public.archive_contributors
for delete
to authenticated
using (public.is_archive_owner(archive_id));

drop policy if exists "Invited users can view own invitations" on public.archive_contributors;
create policy "Invited users can view own invitations"
on public.archive_contributors
for select
to authenticated
using (
  user_id = auth.uid()
  or lower(email) = lower(auth.jwt() ->> 'email')
);
