-- Create final_wishes and final_wish_songs tables for archive owner posthumous instructions & playlist

create table if not exists public.final_wishes (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null unique references public.archives(id) on delete cascade,
  user_id uuid not null,
  service_preference text,
  service_custom_description text,
  service_location text,
  traditions text,
  service_tone text,
  service_instructions text,
  disposition_preference text,
  disposition_location text,
  ashes_instructions text,
  donation_notes text,
  disposition_instructions text,
  first_contact text,
  preferred_officiant text,
  pallbearer_suggestions text,
  people_to_involve text,
  people_not_responsible text,
  responsibility_notes text,
  obituary_name text,
  obituary_relationships text,
  obituary_accomplishments text,
  obituary_causes text,
  obituary_notes text,
  obituary_exclusions text,
  clothing_preference text,
  display_preferences text,
  gathering_preferences text,
  final_message text,
  additional_wishes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.final_wish_songs (
  id uuid primary key default gen_random_uuid(),
  final_wishes_id uuid not null references public.final_wishes(id) on delete cascade,
  archive_id uuid not null references public.archives(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  artist text,
  url text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Useful indexes
create index if not exists final_wishes_archive_id_idx on public.final_wishes(archive_id);
create index if not exists final_wish_songs_final_wishes_id_sort_idx on public.final_wish_songs(final_wishes_id, sort_order asc);
create index if not exists final_wish_songs_archive_id_idx on public.final_wish_songs(archive_id);

-- RLS & Security: Private, Archive Owner-only access for Living archives
alter table public.final_wishes enable row level security;
alter table public.final_wish_songs enable row level security;

create policy "Owners can view final wishes"
  on public.final_wishes for select
  using (exists (
    select 1 from public.archives a
    where a.id = final_wishes.archive_id
      and a.owner_id = auth.uid()
      and a.memorial_mode = false
  ));

create policy "Owners can insert final wishes"
  on public.final_wishes for insert
  with check (auth.uid() = user_id and exists (
    select 1 from public.archives a
    where a.id = final_wishes.archive_id
      and a.owner_id = auth.uid()
      and a.memorial_mode = false
  ));

create policy "Owners can update final wishes"
  on public.final_wishes for update
  using (exists (
    select 1 from public.archives a
    where a.id = final_wishes.archive_id
      and a.owner_id = auth.uid()
      and a.memorial_mode = false
  ));

create policy "Owners can delete final wishes"
  on public.final_wishes for delete
  using (exists (
    select 1 from public.archives a
    where a.id = final_wishes.archive_id
      and a.owner_id = auth.uid()
      and a.memorial_mode = false
  ));

create policy "Owners can view final wish songs"
  on public.final_wish_songs for select
  using (exists (
    select 1 from public.archives a
    where a.id = final_wish_songs.archive_id
      and a.owner_id = auth.uid()
      and a.memorial_mode = false
  ));

create policy "Owners can insert final wish songs"
  on public.final_wish_songs for insert
  with check (exists (
    select 1 from public.archives a
    where a.id = final_wish_songs.archive_id
      and a.owner_id = auth.uid()
      and a.memorial_mode = false
  ));

create policy "Owners can update final wish songs"
  on public.final_wish_songs for update
  using (exists (
    select 1 from public.archives a
    where a.id = final_wish_songs.archive_id
      and a.owner_id = auth.uid()
      and a.memorial_mode = false
  ));

create policy "Owners can delete final wish songs"
  on public.final_wish_songs for delete
  using (exists (
    select 1 from public.archives a
    where a.id = final_wish_songs.archive_id
      and a.owner_id = auth.uid()
      and a.memorial_mode = false
  ));
