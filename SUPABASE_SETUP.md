# Supabase Setup

This document describes the Supabase foundation for Life Archive. The app still keeps local JSON fallback data for development, but production reads and writes are wired to Supabase.

## Environment Variables

The app uses these variables:

```bash
NEXT_PUBLIC_SITE_URL=https://thelifearchive.vip
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It should only be used in trusted server-side scripts or admin-only maintenance tasks.

Phase 1 storage-backed image uploads also require the service role key so the server can upload private archive images and generate signed image URLs.

## Migration Files

Run these SQL files in order:

```text
supabase/migrations/20260620130000_create_life_archive_foundation.sql
supabase/migrations/20260621113000_add_relationship_to_owner_to_archives.sql
supabase/migrations/20260621124500_add_legacy_instructions.sql
supabase/migrations/20260622130000_add_storage_media_paths.sql
supabase/migrations/20260622133000_fix_dustin_example_archive_photo.sql
```

It creates:

- `archives`
- `memories`
- `archive_members`
- `updated_at` trigger function
- indexes
- check constraints
- row-level security
- RLS helper functions
- RLS policies
- private `archive-media` Storage bucket
- `archives.profile_photo_path`
- `memories.photo_path`

## Seed File

Run this SQL after the schema migrations:

```text
supabase/seed.sql
```

It creates protected public example archives for:

- Sari Rae
- Dustin Sigley

Protected example archives use:

```sql
owner_id = null
is_demo = true
visibility = 'public'
```

Normal authenticated users cannot update or delete protected example archives through the provided RLS policies.

## How To Run In Supabase Dashboard

1. Open the Supabase project.
2. Go to **SQL Editor**.
3. Create a new query.
4. Paste the full contents of:

```text
supabase/migrations/20260620130000_create_life_archive_foundation.sql
```

5. Run it.
6. Create another new query.
7. Paste the full contents of:

```text
supabase/migrations/20260621113000_add_relationship_to_owner_to_archives.sql
```

8. Run it.
9. Create another new query.
10. Paste the full contents of:

```text
supabase/migrations/20260621124500_add_legacy_instructions.sql
```

11. Run it.
12. Create another new query.
13. Paste the full contents of:

```text
supabase/migrations/20260622130000_add_storage_media_paths.sql
```

14. Run it.
15. Create another new query.
16. Paste the full contents of:

```text
supabase/migrations/20260622133000_fix_dustin_example_archive_photo.sql
```

17. Run it.
18. Create another new query.
19. Paste the full contents of:

```text
supabase/seed.sql
```

20. Run it.
21. In **Table Editor**, confirm that `archives` contains `sari-rae` and `dustin-sigley`.

## How To Run With Supabase CLI Later

After linking a local Supabase project:

```bash
supabase db push
supabase db seed
```

The CLI is not required for this MVP database foundation.

## Private QR Behavior

Public archives expose all memories. Public QR pages can read a public archive and randomly reveal one of its memories.

Phase 1 archive images are stored in a private `archive-media` bucket. The app reads them through signed URLs on the server.

`profile_photo_url` and `media_url` remain as fallback fields until the storage flow has proven stable in production.

Private archive QR scans should require login in the application layer. Supabase RLS will only allow private archive reads for:

- the archive owner
- users listed in `archive_members`

No share-token table is included yet. If private QR links should work without login later, add a separate `archive_share_links` table with revocable tokens and expiration dates.

## What Is Intentionally Not Wired Yet

- Local JSON remains available as a development fallback when Supabase is not enabled.
- Voice recording uploads are not added yet.
- Video uploads are not added yet.
- Document uploads are not added yet.
- UI does not use `archive_members` yet.

## Implementation Notes For Later

- Use `archives.slug` for public routes.
- Use `archives.owner_id = auth.uid()` for owner-only access.
- Use `archive_members.role = 'editor'` for collaborator memory writes.
- Keep memory-level visibility out of MVP; public archives expose all memories.
- Treat `memorial_mode` as presentation-only.
