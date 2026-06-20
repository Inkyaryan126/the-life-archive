# Supabase Setup

This document describes the database foundation for Life Archive. The app is not wired to Supabase yet and still uses local JSON persistence.

## Environment Variables

When Supabase is wired into the app later, add these variables:

```bash
NEXT_PUBLIC_SITE_URL=https://thelifearchive.vip
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It should only be used in trusted server-side scripts or admin-only maintenance tasks.

## Migration File

Run this SQL first:

```text
supabase/migrations/20260620130000_create_life_archive_foundation.sql
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

## Seed File

Run this SQL after the migration:

```text
supabase/seed.sql
```

It creates public read-only demo archives for:

- Maya Rivera
- Dustin Sigley

Demo archives use:

```sql
owner_id = null
is_demo = true
visibility = 'public'
```

Normal authenticated users cannot update or delete demo archives through the provided RLS policies.

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
supabase/seed.sql
```

8. Run it.
9. In **Table Editor**, confirm that `archives` contains `maya-rivera` and `dustin-sigley`.

## How To Run With Supabase CLI Later

After linking a local Supabase project:

```bash
supabase db push
supabase db seed
```

The CLI is not required for this MVP database foundation.

## Private QR Behavior

Public archives expose all memories. Public QR pages can read a public archive and randomly reveal one of its memories.

Private archive QR scans should require login in the application layer. Once the app is wired to Supabase, RLS will only allow private archive reads for:

- the archive owner
- users listed in `archive_members`

No share-token table is included yet. If private QR links should work without login later, add a separate `archive_share_links` table with revocable tokens and expiration dates.

## What Is Intentionally Not Wired Yet

- App reads still use `data/life-archive.json`.
- Create archive still writes local JSON.
- Add memory still writes local JSON.
- Auth is not added.
- Supabase client/server helpers are not added.
- Storage buckets are not added.
- Upload flows for photos, voice recordings, and videos are not added.
- UI does not use `archive_members` yet.

## Implementation Notes For Later

- Use `archives.slug` for public routes.
- Use `archives.owner_id = auth.uid()` for owner-only access.
- Use `archive_members.role = 'editor'` for collaborator memory writes.
- Keep memory-level visibility out of MVP; public archives expose all memories.
- Treat `memorial_mode` as presentation-only.
