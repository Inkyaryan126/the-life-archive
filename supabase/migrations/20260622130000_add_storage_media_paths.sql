-- Phase 1 storage-backed image assets for The Life Archive.
-- Keep legacy URL columns as fallback during the rollout.

insert into storage.buckets (id, name, public)
values ('archive-media', 'archive-media', false)
on conflict (id) do update
set public = excluded.public;

alter table public.archives
  add column if not exists profile_photo_path text;

alter table public.memories
  add column if not exists photo_path text;

comment on column public.archives.profile_photo_path is
  'Private Storage path for archive cover photos.';

comment on column public.memories.photo_path is
  'Private Storage path for photo memories.';
