-- Configure strict storage bucket file size limit and allowed MIME types for archive-media bucket.
-- Idempotent and non-destructive update preserving existing storage bucket configuration.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'archive-media',
  'archive-media',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/m4a',
    'audio/aac',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska'
  ]::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/webm',
      'audio/ogg',
      'audio/mp4',
      'audio/x-m4a',
      'audio/m4a',
      'audio/aac',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-matroska'
    ]::text[];
