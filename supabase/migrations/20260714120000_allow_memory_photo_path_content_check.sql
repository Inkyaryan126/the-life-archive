-- Private uploaded media uses photo_path for signed URL playback.
-- Keep the content/media presence check aligned with that storage model.

alter table public.memories
  drop constraint if exists memories_content_or_media_check;

alter table public.memories
  add constraint memories_content_or_media_check
    check (
      nullif(btrim(coalesce(content, '')), '') is not null
      or nullif(btrim(coalesce(media_url, '')), '') is not null
      or nullif(btrim(coalesce(photo_path, '')), '') is not null
    );
