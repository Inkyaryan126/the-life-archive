-- Add one legacy instruction document per archive.
-- MVP access levels are owner_only and released. Trusted contacts remain future work.

create table if not exists public.legacy_instructions (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null unique references public.archives(id) on delete cascade,
  body text not null,
  access_level text not null default 'owner_only',
  released_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint legacy_instructions_body_check
    check (nullif(btrim(body), '') is not null),
  constraint legacy_instructions_access_level_check
    check (access_level in ('owner_only', 'released'))
);

drop trigger if exists set_legacy_instructions_updated_at on public.legacy_instructions;
create trigger set_legacy_instructions_updated_at
before update on public.legacy_instructions
for each row
execute function public.set_updated_at();

create index if not exists legacy_instructions_access_level_idx
  on public.legacy_instructions (access_level);

alter table public.legacy_instructions enable row level security;

create or replace function public.is_legacy_instruction_owner(target_archive_id uuid)
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

create or replace function public.get_legacy_instruction_by_archive_slug(target_slug text)
returns table (
  archive_slug text,
  archive_name text,
  person_name text,
  body text,
  access_level text,
  released_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    archives.slug as archive_slug,
    archives.archive_name,
    archives.person_name,
    legacy_instructions.body,
    legacy_instructions.access_level,
    legacy_instructions.released_at,
    legacy_instructions.created_at,
    legacy_instructions.updated_at
  from public.legacy_instructions
  join public.archives
    on archives.id = legacy_instructions.archive_id
  where archives.slug = target_slug
    and (
      legacy_instructions.access_level = 'released'
      or public.is_legacy_instruction_owner(legacy_instructions.archive_id)
    )
  limit 1;
$$;

drop policy if exists "Owners and released instructions can be read" on public.legacy_instructions;
create policy "Owners and released instructions can be read"
on public.legacy_instructions
for select
to anon, authenticated
using (
  access_level = 'released'
  or public.is_legacy_instruction_owner(archive_id)
);

drop policy if exists "Owners can create legacy instructions" on public.legacy_instructions;
create policy "Owners can create legacy instructions"
on public.legacy_instructions
for insert
to authenticated
with check (
  public.is_legacy_instruction_owner(archive_id)
  and created_by = auth.uid()
  and access_level in ('owner_only', 'released')
);

drop policy if exists "Owners can update legacy instructions" on public.legacy_instructions;
create policy "Owners can update legacy instructions"
on public.legacy_instructions
for update
to authenticated
using (public.is_legacy_instruction_owner(archive_id))
with check (
  public.is_legacy_instruction_owner(archive_id)
  and access_level in ('owner_only', 'released')
);

drop policy if exists "Owners can delete legacy instructions" on public.legacy_instructions;
create policy "Owners can delete legacy instructions"
on public.legacy_instructions
for delete
to authenticated
using (public.is_legacy_instruction_owner(archive_id));
