-- Backfill the public Dustin example archive to the repository-owned portrait.
-- This keeps the founder/example archive off third-party image hosting.

update public.archives
set
  profile_photo_url = '/images/dustin-sigley.png',
  profile_photo_path = null,
  updated_at = now()
where slug = 'dustin-sigley';
