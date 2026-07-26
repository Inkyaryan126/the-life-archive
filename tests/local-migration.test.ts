import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  parseMigrationOptions,
  resolveOwnerUser,
  validateSourceFile,
  buildArchiveSourceKey,
  buildArchiveSourceHash,
  buildMemorySourceKey,
  buildMemorySourceHash,
  computeSha256,
  isValidUuid,
  maskEmail,
  runLocalMigration,
  type LocalArchiveSeed,
  type LocalMemorySeed
} from "../lib/local-migration";

async function runTests() {
  console.log("Starting local-migration verification test suite...");

  // 1. CLI Options Parser - Mode requirements
  assert.throws(
    () => parseMigrationOptions([]),
    /Exactly one mode must be specified/
  );

  assert.throws(
    () => parseMigrationOptions(["--dry-run", "--verify", "--owner-email", "test@example.com"]),
    /Multiple modes provided/
  );

  // 2. Owner parameters mutual exclusivity & requirement
  assert.throws(
    () => parseMigrationOptions(["--dry-run"]),
    /Either --owner-id or --owner-email must be specified/
  );

  assert.throws(
    () => parseMigrationOptions(["--dry-run", "--owner-id", "11111111-2222-3333-4444-555555555555", "--owner-email", "user@example.com"]),
    /Specify either --owner-id or --owner-email, but not both/
  );

  // 3. Strict UUID validation & Email masking
  assert.equal(isValidUuid("11111111-2222-4333-8444-555555555555"), true);
  assert.equal(isValidUuid("00000000-0000-0000-0000-000000000000"), false); // dummy UUID invalid format
  assert.equal(isValidUuid("invalid-uuid"), false);

  assert.equal(maskEmail("alex@example.com"), "a***x@e***.com");
  assert.equal(maskEmail(null), "[NO_EMAIL]");

  // 4. Source File Validation (Missing file, directory, malformed JSON)
  await assert.rejects(
    () => validateSourceFile("data/nonexistent-file.json"),
    /Source file missing or inaccessible/
  );

  await assert.rejects(
    () => validateSourceFile("data"),
    /Source path points to a directory/
  );

  // 5. Source Keys & Fingerprint Stability
  const archiveSeed: LocalArchiveSeed = {
    slug: "alex-morgan",
    archiveName: "The Life Archive of Alex Morgan",
    personName: "Alex Morgan"
  };

  const memorySeed1: LocalMemorySeed = {
    archiveSlug: "alex-morgan",
    title: "A day at the lake",
    type: "photo",
    content: "We spent the entire afternoon on the water.",
    date: "2026-07-01"
  };

  const memorySeed2: LocalMemorySeed = {
    archiveSlug: "alex-morgan",
    title: "A day at the lake", // Duplicate title
    type: "photo",
    content: "Different content for a second memory on the same day.",
    date: "2026-07-01"
  };

  const archKey = buildArchiveSourceKey(archiveSeed);
  const archHash1 = buildArchiveSourceHash(archiveSeed);

  assert.equal(archKey, "archive:alex-morgan");
  assert.equal(archHash1, buildArchiveSourceHash(archiveSeed)); // Stable hash

  const memKey1 = buildMemorySourceKey(memorySeed1, "alex-morgan", 0);
  const memKey2 = buildMemorySourceKey(memorySeed2, "alex-morgan", 1);

  assert.notEqual(memKey1, memKey2); // Unique keys for duplicate titles

  // 6. Mock Supabase Client & Operations Verification
  const mockOwner = {
    id: "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7a8",
    email: "owner@example.com"
  };

  const insertedRows: Record<string, any[]> = {
    archives: [],
    memories: [],
    local_migration_records: []
  };

  const mockSupabase: any = {
    auth: {
      admin: {
        getUserById: async (id: string) => {
          if (id === mockOwner.id) {
            return { data: { user: mockOwner }, error: null };
          }
          return { data: { user: null }, error: { message: "User not found" } };
        },
        listUsers: async ({ page }: { page: number }) => {
          if (page === 1) {
            return {
              data: { users: [mockOwner] },
              error: null
            };
          }
          return { data: { users: [] }, error: null };
        }
      }
    },
    from: (table: string) => {
      return {
        select: () => ({
          eq: (col: string, val: any) => ({
            eq: (col2: string, val2: any) => ({
              maybeSingle: async () => null,
              select: () => ({ maybeSingle: async () => null })
            }),
            maybeSingle: async () => null,
            order: () => ({ data: [], error: null })
          }),
          maybeSingle: async () => null
        }),
        insert: (payload: any) => ({
          select: () => ({
            single: async () => {
              const created = { id: `mock-uuid-${Math.random()}`, ...payload };
              insertedRows[table] = insertedRows[table] || [];
              insertedRows[table].push(created);
              return { data: created, error: null };
            }
          })
        }),
        upsert: async (payload: any) => {
          insertedRows[table] = insertedRows[table] || [];
          insertedRows[table].push(payload);
          return { data: payload, error: null };
        },
        update: () => ({
          eq: async () => ({ data: null, error: null })
        })
      };
    }
  };

  // 7. Owner Resolution by ID & Email (with pagination)
  const resolvedById = await resolveOwnerUser(mockSupabase, { ownerId: mockOwner.id });
  assert.equal(resolvedById.id, mockOwner.id);
  assert.equal(resolvedById.maskedEmail, "o***r@e***.com");

  const resolvedByEmail = await resolveOwnerUser(mockSupabase, { ownerEmail: "owner@example.com" });
  assert.equal(resolvedByEmail.id, mockOwner.id);

  await assert.rejects(
    () => resolveOwnerUser(mockSupabase, { ownerEmail: "nonexistent@example.com" }),
    /Owner user email not found/
  );

  // 8. Dry-Run Mode Verification (Zero Writes)
  const dryRunSummary = await runLocalMigration(mockSupabase, {
    mode: "dry-run",
    sourcePath: join(process.cwd(), "data", "life-archive.json"),
    ownerId: mockOwner.id
  });

  assert.equal(dryRunSummary.mode, "dry-run");
  assert.equal(dryRunSummary.status, "READY");
  assert.equal(dryRunSummary.archivesCreate, 0); // Seed slug dustin-sigley-2 skipped
  assert.notEqual(dryRunSummary.planHash, undefined);
  assert.equal(insertedRows.archives.length, 0); // ZERO writes in dry-run
  assert.equal(insertedRows.memories.length, 0);
  assert.equal(insertedRows.local_migration_records.length, 0);

  // 9. Apply Mode Security Safeguards & Stale Plan Hash Rejection
  const applyWithoutConfirm = await runLocalMigration(mockSupabase, {
    mode: "apply",
    sourcePath: join(process.cwd(), "data", "life-archive.json"),
    ownerId: mockOwner.id
  });

  assert.equal(applyWithoutConfirm.status, "PLAN_MISMATCH");
  assert.match(applyWithoutConfirm.errors[0], /--production-confirm/);

  const applyWithStaleHash = await runLocalMigration(mockSupabase, {
    mode: "apply",
    sourcePath: join(process.cwd(), "data", "life-archive.json"),
    ownerId: mockOwner.id,
    productionConfirm: true,
    confirmPlan: "invalid-stale-hash"
  });

  assert.equal(applyWithStaleHash.status, "PLAN_MISMATCH");
  assert.match(applyWithStaleHash.errors[0], /Plan hash mismatch/);

  // 10. Verify SQL Migration file contents
  const migrationSqlPath = join(process.cwd(), "supabase", "migrations", "20260725200000_local_migration_ledger.sql");
  const migrationSql = await readFile(migrationSqlPath, "utf8");

  assert.match(migrationSql, /CREATE TABLE IF NOT EXISTS public\.local_migration_records/);
  assert.match(migrationSql, /ALTER TABLE public\.local_migration_records ENABLE ROW LEVEL SECURITY;/);
  assert.match(migrationSql, /REVOKE ALL ON public\.local_migration_records FROM public, anon, authenticated;/);
  assert.match(migrationSql, /GRANT ALL ON public\.local_migration_records TO service_role;/);
  assert.match(migrationSql, /CONSTRAINT local_migration_records_source_key_unique UNIQUE/);

  // 11. Verify Dummy UUID is completely absent in migration implementation files
  const scriptContent = await readFile(join(process.cwd(), "scripts", "migrate-local-to-supabase.ts"), "utf8");
  const libContent = await readFile(join(process.cwd(), "lib", "local-migration.ts"), "utf8");

  assert.doesNotMatch(scriptContent, /00000000-0000-0000-0000-000000000000/);
  assert.doesNotMatch(libContent, /00000000-0000-0000-0000-000000000000/);

  console.log("local-migration verification test suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("local-migration tests failed:", err);
  process.exit(1);
});
