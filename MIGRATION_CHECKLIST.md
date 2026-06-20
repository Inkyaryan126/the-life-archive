# Supabase Migration Audit & Checklist (Phase 1)

This audit documents the current system state, the mapping to Supabase, and the safety measures for the Phase 1 migration (JSON to Supabase backend swap).

---

## 1. Existing Routes
- `/` (Home)
- `/create` (Create Archive)
- `/archive/[slug]` (Archive Details)
- `/archive/[slug]/memories` (All Memories)
- `/archive/[slug]/random` (Random Memory)
- `/archive/[slug]/qr` (QR Card)
- `/archive/[slug]/add-memory` (Add Memory)

## 2. Audit of `lib/archive-data.ts`
### Exported Functions
- `getFeaturedArchives(): Promise<LifeArchive[]>`
- `getArchiveBySlug(slug: string): Promise<LifeArchive | null>`
- `getMemoriesByArchiveSlug(slug: string): Promise<Memory[]>`
- `getRandomMemory(slug: string): Promise<Memory | null>`
- `createArchive(input: CreateArchiveInput): Promise<LifeArchive>`
- `createMemory(input: CreateMemoryInput): Promise<Memory | null>`
- `isMemoryType(value: string): value is MemoryType`

### Constants/Helpers
- `memoryTypes: MemoryType[]`

### Consumers (Modules importing `@/lib/archive-data`)
- `app/archive/[slug]/add-memory/actions.ts`
- `app/archive/[slug]/add-memory/page.tsx`
- `app/archive/[slug]/memories/page.tsx`
- `app/archive/[slug]/page.tsx`
- `app/archive/[slug]/qr/page.tsx`
- `app/archive/[slug]/random/page.tsx`
- `app/create/actions.ts`
- `app/page.tsx`

## 3. Filesystem Audit
### Files referencing `data/life-archive.json` or FS operations:
- `lib/archive-data.ts` (Primary data access, performs all CRUD on the file).
- `README.md` (Documentation).
- `SUPABASE_SETUP.md` (Documentation).

### Findings:
- `lib/archive-data.ts` is the **exclusive** point of access for filesystem-based data.
- No other routes or actions bypass `lib/archive-data.ts`.
- No migration blockers discovered; all filesystem operations are encapsulated.

## 4. Existing Data Flow
- Frontend calls Server Actions.
- Server Actions call `lib/archive-data.ts`.
- `lib/archive-data.ts` encapsulates all `fs/promises` operations.

## 5. Existing JSON Schema
- `ArchiveStore`: `{ archives: LifeArchive[], memories: Memory[] }`
- `LifeArchive`: `{ slug, archiveName, personName, bio, profilePhotoUrl, visibility, memorialMode, createdAt }`
- `Memory`: `{ id, archiveSlug, title, type, content, mediaUrl, date, tags }`

## 6. Required Supabase Tables (Mapped)
- `public.archives` (columns: `id`, `slug`, `archive_name`, `person_name`, `bio`, `profile_photo_url`, `visibility`, `memorial_mode`, `created_at`)
- `public.memories` (columns: `id`, `archive_id` (foreign key to archives), `title`, `type`, `content`, `media_url`, `memory_date`, `tags`, `created_at`)

## 7. Rollback Plan
- The feature flag `USE_SUPABASE` (`true`/`false`) in `.env` controls runtime behavior within `lib/archive-data.ts`.
- If `USE_SUPABASE === 'false'`, `lib/archive-data.ts` uses `fs/promises` and the JSON file.
- If `USE_SUPABASE === 'true'`, it switches to `@supabase/supabase-js`.
- If issues occur, revert `USE_SUPABASE` to `false` to restore JSON functionality.

## 8. Risk Assessment
- **Data Inconsistency:** High risk if JSON and Supabase are not synced. Mitigation: Sync script to be run once before flipping the flag.
- **Contract Mismatch:** Medium risk (data mapping). Mitigation: Strict TypeScript types in `lib/archive-data.ts`.
- **Rollback Complexity:** Low risk (feature flag approach).
- **Authentication:** None (Phase 1 constraint).

---

## Migration Steps Checklist
- [ ] Audit complete, plan approved.
- [ ] Implement `USE_SUPABASE` toggle in `lib/archive-data.ts` (keeping JSON as default).
- [ ] Implement Supabase client setup in `lib/supabase.ts`.
- [ ] Write Supabase data access functions in `lib/archive-data.ts`.
- [ ] Run migration script to sync JSON to Supabase.
- [ ] Toggle `USE_SUPABASE=true`.
- [ ] Verify functionality (Home, Archive, Add Memory, Random, etc.).
- [ ] Validate Rollback (`USE_SUPABASE=false`).
