import { createHash, randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MigrationMode = "dry-run" | "verify" | "apply";

export type MigrationOptions = {
  mode: MigrationMode;
  sourcePath?: string;
  ownerId?: string;
  ownerEmail?: string;
  productionConfirm?: boolean;
  confirmPlan?: string;
  json?: boolean;
};

export type ResolvedOwner = {
  id: string;
  email: string | null;
  maskedEmail: string;
};

export type LocalArchiveSeed = {
  id?: string;
  slug: string;
  archiveName: string;
  personName: string;
  bio?: string;
  profilePhotoUrl?: string;
  visibility?: string;
  memorialMode?: boolean;
  relationshipToOwner?: string;
  createdAt?: string;
};

export type LocalMemorySeed = {
  id?: string;
  archiveSlug: string;
  title: string;
  type: string;
  content: string;
  mediaUrl?: string;
  date?: string;
  tags?: string[];
};

export type LocalSeedFile = {
  archives?: LocalArchiveSeed[];
  memories?: LocalMemorySeed[];
};

export type LedgerRecord = {
  id: string;
  source_system: string;
  source_type: string;
  source_key: string;
  destination_table: string;
  destination_id: string;
  owner_id: string;
  source_hash: string;
  migrated_at: string;
  verified_at: string | null;
  last_seen_at: string;
  migration_run_id: string | null;
  metadata: Record<string, unknown>;
};

export type VerificationStatus =
  | "MATCHED"
  | "MISSING_DESTINATION"
  | "MODIFIED_SOURCE"
  | "DESTINATION_DRIFT"
  | "OWNER_MISMATCH"
  | "SLUG_CONFLICT"
  | "LEDGER_MISSING";

export type MigrationPlanItem = {
  sourceType: "archive" | "memory";
  sourceKey: string;
  sourceHash: string;
  status: VerificationStatus;
  destinationId?: string;
  action: "create" | "update" | "skip" | "conflict" | "adopt";
};

export type MigrationSummary = {
  mode: MigrationMode;
  sourceFile: string;
  sourceHash: string;
  planHash: string;
  ownerId: string;
  ownerEmailMasked: string;
  archivesCreate: number;
  archivesUpdate: number;
  archivesUnchanged: number;
  archiveConflicts: number;
  memoriesCreate: number;
  memoriesUpdate: number;
  memoriesUnchanged: number;
  memoriesMissing: number;
  ledgerCreates: number;
  ledgerUpdates: number;
  errors: string[];
  status: "READY" | "PLAN_MISMATCH" | "VERIFY_PASSED" | "VERIFY_FAILED" | "APPLIED" | "ERROR";
  planItems?: MigrationPlanItem[];
};

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export function maskEmail(email: string | null | undefined): string {
  if (!email) return "[NO_EMAIL]";
  const trimmed = email.trim().toLowerCase();
  const [local, domain] = trimmed.split("@");
  if (!local || !domain) return "[INVALID_EMAIL]";
  const maskedLocal = local.length <= 2 ? `${local[0]}*` : `${local[0]}***${local[local.length - 1]}`;
  const [domName, domExt] = domain.split(".");
  const maskedDom = domName ? `${domName[0]}***` : "***";
  return `${maskedLocal}@${maskedDom}.${domExt || "com"}`;
}

export function isValidUuid(value: string | null | undefined): boolean {
  return typeof value === "string" && UUID_REGEX.test(value.trim());
}

export function computeSha256(data: string | Buffer | object): string {
  const content = typeof data === "string"
    ? data
    : Buffer.isBuffer(data)
      ? data
      : JSON.stringify(data);

  return createHash("sha256").update(content).digest("hex");
}

export function parseMigrationOptions(args: string[]): MigrationOptions {
  let mode: MigrationMode | undefined;
  let sourcePath: string | undefined;
  let ownerId: string | undefined;
  let ownerEmail: string | undefined;
  let productionConfirm = false;
  let confirmPlan: string | undefined;
  let json = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--dry-run") {
      if (mode) throw new Error("Multiple modes provided. Specify exactly one of --dry-run, --verify, or --apply.");
      mode = "dry-run";
    } else if (arg === "--verify") {
      if (mode) throw new Error("Multiple modes provided. Specify exactly one of --dry-run, --verify, or --apply.");
      mode = "verify";
    } else if (arg === "--apply") {
      if (mode) throw new Error("Multiple modes provided. Specify exactly one of --dry-run, --verify, or --apply.");
      mode = "apply";
    } else if (arg === "--source") {
      i += 1;
      if (!args[i] || args[i].startsWith("-")) throw new Error("--source requires a valid file path argument.");
      sourcePath = args[i];
    } else if (arg === "--owner-id") {
      i += 1;
      if (!args[i] || args[i].startsWith("-")) throw new Error("--owner-id requires a UUID argument.");
      ownerId = args[i];
    } else if (arg === "--owner-email") {
      i += 1;
      if (!args[i] || args[i].startsWith("-")) throw new Error("--owner-email requires an email argument.");
      ownerEmail = args[i];
    } else if (arg === "--production-confirm") {
      productionConfirm = true;
    } else if (arg === "--confirm-plan") {
      i += 1;
      if (!args[i] || args[i].startsWith("-")) throw new Error("--confirm-plan requires a plan hash argument.");
      confirmPlan = args[i];
    } else if (arg === "--json") {
      json = true;
    } else {
      throw new Error(`Unknown or unhandled flag: ${arg}`);
    }
  }

  if (!mode) {
    throw new Error("Exactly one mode must be specified: --dry-run, --verify, or --apply.");
  }

  if (!ownerId && !ownerEmail) {
    throw new Error("Either --owner-id or --owner-email must be specified.");
  }

  if (ownerId && ownerEmail) {
    throw new Error("Specify either --owner-id or --owner-email, but not both.");
  }

  return {
    mode,
    sourcePath: sourcePath || join(process.cwd(), "data", "life-archive.json"),
    ownerId,
    ownerEmail,
    productionConfirm,
    confirmPlan,
    json
  };
}

export async function validateSourceFile(filePath: string): Promise<{ fullPath: string; parsed: LocalSeedFile }> {
  const fullPath = resolve(filePath);
  let fileStats;

  try {
    fileStats = await stat(fullPath);
  } catch {
    throw new Error(`Source file missing or inaccessible at path: ${filePath}`);
  }

  if (fileStats.isDirectory()) {
    throw new Error(`Source path points to a directory, not a JSON file: ${filePath}`);
  }

  let raw;
  try {
    raw = await readFile(fullPath, "utf8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read source file at ${filePath}: ${msg}`);
  }

  let parsed: LocalSeedFile;
  try {
    parsed = JSON.parse(raw);
  } catch (jsonErr) {
    throw new Error(`Malformed JSON syntax in source file at ${filePath}: ${(jsonErr as Error).message}`);
  }

  if (!parsed || (typeof parsed !== "object") || (!Array.isArray(parsed.archives) && !Array.isArray(parsed.memories))) {
    throw new Error(`Malformed source schema at ${filePath}: expected object containing archives and/or memories arrays.`);
  }

  return { fullPath, parsed };
}

export async function resolveOwnerUser(
  supabase: SupabaseClient,
  options: { ownerId?: string; ownerEmail?: string }
): Promise<ResolvedOwner> {
  const { ownerId, ownerEmail } = options;

  if (ownerId) {
    if (!isValidUuid(ownerId)) {
      throw new Error(`Invalid --owner-id UUID format: ${ownerId}`);
    }

    const { data, error } = await supabase.auth.admin.getUserById(ownerId.trim());

    if (error || !data?.user) {
      throw new Error(`Owner user ID not found in Supabase Auth: ${ownerId}`);
    }

    return {
      id: data.user.id,
      email: data.user.email ?? null,
      maskedEmail: maskEmail(data.user.email)
    };
  }

  if (ownerEmail) {
    const normalizedEmail = ownerEmail.trim().toLowerCase();
    let page = 1;
    const perPage = 100;
    let matchedUser: any = null;
    let matchCount = 0;

    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

      if (error) {
        throw new Error(`Failed to query Supabase Auth users: ${error.message}`);
      }

      const users = data?.users ?? [];

      for (const u of users) {
        if (u.email?.trim().toLowerCase() === normalizedEmail) {
          matchCount += 1;
          matchedUser = u;
        }
      }

      if (users.length < perPage) {
        break;
      }

      page += 1;
    }

    if (matchCount === 0 || !matchedUser) {
      throw new Error(`Owner user email not found in Supabase Auth: ${maskEmail(normalizedEmail)}`);
    }

    if (matchCount > 1) {
      throw new Error(`Ambiguous owner resolution: Multiple Auth users match email ${maskEmail(normalizedEmail)}`);
    }

    return {
      id: matchedUser.id,
      email: matchedUser.email ?? null,
      maskedEmail: maskEmail(matchedUser.email)
    };
  }

  throw new Error("No owner identification provided.");
}

export function buildArchiveSourceKey(archive: LocalArchiveSeed): string {
  return `archive:${archive.slug.trim().toLowerCase()}`;
}

export function buildArchiveSourceHash(archive: LocalArchiveSeed): string {
  const canonical = {
    slug: archive.slug.trim().toLowerCase(),
    archiveName: archive.archiveName.trim(),
    personName: archive.personName.trim(),
    bio: archive.bio?.trim() || "",
    profilePhotoUrl: archive.profilePhotoUrl?.trim() || "",
    visibility: archive.visibility || "public",
    memorialMode: archive.memorialMode === true
  };
  return computeSha256(canonical);
}

export function buildMemorySourceKey(memory: LocalMemorySeed, archiveSlug: string, index: number): string {
  if (memory.id?.trim()) {
    return `memory:${archiveSlug.trim().toLowerCase()}:${memory.id.trim()}`;
  }

  const fingerprint = computeSha256({
    title: memory.title.trim(),
    type: memory.type.trim(),
    date: memory.date || "",
    content: memory.content.trim()
  });

  return `memory:${archiveSlug.trim().toLowerCase()}:${index}:${fingerprint.slice(0, 16)}`;
}

export function buildMemorySourceHash(memory: LocalMemorySeed): string {
  const canonical = {
    title: memory.title.trim(),
    type: memory.type.trim(),
    content: memory.content.trim(),
    mediaUrl: memory.mediaUrl?.trim() || "",
    date: memory.date || "",
    tags: Array.isArray(memory.tags) ? memory.tags.map((t) => t.trim()).sort() : []
  };

  return computeSha256(canonical);
}

export async function runLocalMigration(
  supabase: SupabaseClient,
  options: MigrationOptions
): Promise<MigrationSummary> {
  const { fullPath, parsed: parsedData } = await validateSourceFile(options.sourcePath!);

  const owner = await resolveOwnerUser(supabase, {
    ownerId: options.ownerId,
    ownerEmail: options.ownerEmail
  });

  const rawJson = await readFile(fullPath, "utf8");
  const rawArchives = parsedData.archives || [];
  const rawMemories = parsedData.memories || [];

  const seedSlugs = new Set(["dustin-sigley-2"]);
  const archivesToMigrate = rawArchives.filter((a) => a.slug && !seedSlugs.has(a.slug));
  const archiveSlugsToMigrate = new Set(archivesToMigrate.map((a) => a.slug.trim().toLowerCase()));
  const memoriesToMigrate = rawMemories.filter((m) => archiveSlugsToMigrate.has(m.archiveSlug.trim().toLowerCase()));

  // Fetch initial ledger mapping state
  const { data: initialLedgerRows } = await supabase
    .from("local_migration_records")
    .select("*")
    .eq("source_system", "local_json")
    .eq("owner_id", owner.id);

  const ledgerState = ((initialLedgerRows ?? []) as LedgerRecord[]).map((r) => ({
    key: `${r.source_type}:${r.source_key}`,
    destId: r.destination_id,
    hash: r.source_hash
  }));

  const canonicalSourceState = {
    sourceFile: fullPath,
    ownerId: owner.id,
    archives: archivesToMigrate.map((a) => ({
      slug: a.slug,
      archiveName: a.archiveName,
      hash: buildArchiveSourceHash(a)
    })),
    memories: memoriesToMigrate.map((m, idx) => ({
      archiveSlug: m.archiveSlug,
      title: m.title,
      hash: buildMemorySourceHash(m),
      key: buildMemorySourceKey(m, m.archiveSlug, idx)
    })),
    ledgerState
  };

  const sourceHash = computeSha256(rawJson);
  const planHash = computeSha256(canonicalSourceState);

  const errors: string[] = [];

  // Check production apply safeguards
  if (options.mode === "apply") {
    if (!options.productionConfirm) {
      errors.push("Flag --production-confirm is required whenever --apply is executed.");
    }

    if (!options.confirmPlan) {
      errors.push("Flag --confirm-plan <planHash> is required whenever --apply is executed.");
    } else if (options.confirmPlan.trim() !== planHash) {
      errors.push(
        `Plan hash mismatch: Supplied --confirm-plan hash [${options.confirmPlan}] does not match current calculated plan hash [${planHash}].`
      );
    }

    if (errors.length > 0) {
      return {
        mode: options.mode,
        sourceFile: fullPath,
        sourceHash,
        planHash,
        ownerId: owner.id,
        ownerEmailMasked: owner.maskedEmail,
        archivesCreate: 0,
        archivesUpdate: 0,
        archivesUnchanged: 0,
        archiveConflicts: 0,
        memoriesCreate: 0,
        memoriesUpdate: 0,
        memoriesUnchanged: 0,
        memoriesMissing: 0,
        ledgerCreates: 0,
        ledgerUpdates: 0,
        errors,
        status: "PLAN_MISMATCH"
      };
    }
  }

  const ledgerMap = new Map<string, LedgerRecord>(
    ((initialLedgerRows ?? []) as LedgerRecord[]).map((row) => [`${row.source_type}:${row.source_key}`, row])
  );

  let archivesCreate = 0;
  let archivesUpdate = 0;
  let archivesUnchanged = 0;
  let archiveConflicts = 0;

  let memoriesCreate = 0;
  let memoriesUpdate = 0;
  let memoriesUnchanged = 0;
  let memoriesMissing = 0;

  let ledgerCreates = 0;
  let ledgerUpdates = 0;

  const planItems: MigrationPlanItem[] = [];
  const runId = randomUUID();

  // Reconcile Archives
  for (const archive of archivesToMigrate) {
    const sourceKey = buildArchiveSourceKey(archive);
    const archiveHash = buildArchiveSourceHash(archive);
    const ledgerEntry = ledgerMap.get(`archive:${sourceKey}`);

    let targetArchiveId: string | null = null;
    let itemStatus: VerificationStatus = "MATCHED";
    let action: "create" | "update" | "skip" | "conflict" | "adopt" = "skip";

    if (ledgerEntry) {
      targetArchiveId = ledgerEntry.destination_id;
      const { data: destArchive, error: destError } = await supabase
        .from("archives")
        .select("id, owner_id, slug, archive_name, person_name")
        .eq("id", targetArchiveId)
        .maybeSingle();

      if (destError || !destArchive) {
        itemStatus = "MISSING_DESTINATION";
        action = "create";
        archivesCreate += 1;
      } else if (destArchive.owner_id !== owner.id) {
        itemStatus = "OWNER_MISMATCH";
        action = "conflict";
        archiveConflicts += 1;
        errors.push(`Archive ${archive.slug} owner mismatch in destination.`);
      } else if (ledgerEntry.source_hash !== archiveHash) {
        itemStatus = "MODIFIED_SOURCE";
        action = "update";
        archivesUpdate += 1;
      } else if (destArchive.archive_name !== archive.archiveName.trim() || destArchive.person_name !== archive.personName.trim()) {
        // Destination fields changed independently in Supabase
        itemStatus = "DESTINATION_DRIFT";
        action = "update";
        archivesUpdate += 1;
      } else {
        itemStatus = "MATCHED";
        action = "skip";
        archivesUnchanged += 1;
      }
    } else {
      // Ledger missing: check destination archives table
      const { data: existingSlug, error: slugError } = await supabase
        .from("archives")
        .select("id, owner_id, archive_name")
        .eq("slug", archive.slug.trim().toLowerCase())
        .maybeSingle();

      if (slugError) {
        errors.push(`Error querying archive slug ${archive.slug}: ${slugError.message}`);
        continue;
      }

      if (existingSlug) {
        if (existingSlug.owner_id !== owner.id) {
          itemStatus = "SLUG_CONFLICT";
          action = "conflict";
          archiveConflicts += 1;
          errors.push(`Archive slug ${archive.slug} is owned by another user.`);
        } else {
          // LEDGER_MISSING: Same owner archive exists in Supabase
          itemStatus = "LEDGER_MISSING";
          action = "adopt";
          targetArchiveId = existingSlug.id;
          archivesUpdate += 1;
        }
      } else {
        itemStatus = "MISSING_DESTINATION";
        action = "create";
        archivesCreate += 1;
      }
    }

    planItems.push({
      sourceType: "archive",
      sourceKey,
      sourceHash: archiveHash,
      status: itemStatus,
      destinationId: targetArchiveId || undefined,
      action
    });

    if (options.mode === "apply" && action !== "conflict") {
      const payload = {
        slug: archive.slug.trim().toLowerCase(),
        archive_name: archive.archiveName.trim(),
        person_name: archive.personName.trim(),
        bio: archive.bio?.trim() || null,
        profile_photo_url: archive.profilePhotoUrl?.trim() || null,
        visibility: archive.visibility || "public",
        memorial_mode: archive.memorialMode === true,
        relationship_to_owner: archive.relationshipToOwner || "self",
        owner_id: owner.id,
        is_demo: false,
        created_at: archive.createdAt || new Date().toISOString()
      };

      if (action === "create") {
        const { data: newArch, error: createError } = await supabase
          .from("archives")
          .insert(payload)
          .select("id")
          .single();

        if (createError || !newArch) {
          errors.push(`Failed to insert archive ${archive.slug}: ${createError?.message}`);
          continue;
        }
        targetArchiveId = newArch.id;
      } else if ((action === "update" || action === "adopt") && targetArchiveId) {
        const { error: updateError } = await supabase
          .from("archives")
          .update(payload)
          .eq("id", targetArchiveId);

        if (updateError) {
          errors.push(`Failed to update archive ${archive.slug}: ${updateError.message}`);
          continue;
        }
      }

      if (targetArchiveId) {
        const { error: ledgerUpsertError } = await supabase
          .from("local_migration_records")
          .upsert(
            {
              source_system: "local_json",
              source_type: "archive",
              source_key: sourceKey,
              destination_table: "archives",
              destination_id: targetArchiveId,
              owner_id: owner.id,
              source_hash: archiveHash,
              verified_at: new Date().toISOString(),
              last_seen_at: new Date().toISOString(),
              migration_run_id: runId
            },
            { onConflict: "source_system,source_type,source_key,owner_id" }
          );

        if (ledgerUpsertError) {
          errors.push(`Failed to write ledger for archive ${archive.slug}: ${ledgerUpsertError.message}`);
        } else {
          ledgerCreates += 1;
        }
      }
    }
  }

  // Reconcile Memories
  for (let idx = 0; idx < memoriesToMigrate.length; idx += 1) {
    const memory = memoriesToMigrate[idx];
    const sourceKey = buildMemorySourceKey(memory, memory.archiveSlug, idx);
    const memoryHash = buildMemorySourceHash(memory);
    const ledgerEntry = ledgerMap.get(`memory:${sourceKey}`);

    let targetMemoryId: string | null = null;
    let itemStatus: VerificationStatus = "MATCHED";
    let action: "create" | "update" | "skip" | "conflict" | "adopt" = "skip";

    if (ledgerEntry) {
      targetMemoryId = ledgerEntry.destination_id;
      const { data: destMemory, error: destError } = await supabase
        .from("memories")
        .select("id, archive_id, title, content")
        .eq("id", targetMemoryId)
        .maybeSingle();

      if (destError || !destMemory) {
        itemStatus = "MISSING_DESTINATION";
        action = "create";
        memoriesMissing += 1;
      } else if (ledgerEntry.source_hash !== memoryHash) {
        itemStatus = "MODIFIED_SOURCE";
        action = "update";
        memoriesUpdate += 1;
      } else if (destMemory.title !== memory.title.trim() || destMemory.content !== memory.content.trim()) {
        itemStatus = "DESTINATION_DRIFT";
        action = "update";
        memoriesUpdate += 1;
      } else {
        itemStatus = "MATCHED";
        action = "skip";
        memoriesUnchanged += 1;
      }
    } else {
      itemStatus = "MISSING_DESTINATION";
      action = "create";
      memoriesCreate += 1;
    }

    planItems.push({
      sourceType: "memory",
      sourceKey,
      sourceHash: memoryHash,
      status: itemStatus,
      destinationId: targetMemoryId || undefined,
      action
    });

    if (options.mode === "apply" && (action === "create" || action === "update")) {
      const parentArchiveKey = buildArchiveSourceKey({ slug: memory.archiveSlug } as any);
      const archivePlanItem = planItems.find(
        (p) => p.sourceType === "archive" && p.sourceKey === parentArchiveKey
      );

      let archiveId = archivePlanItem?.destinationId;

      if (!archiveId) {
        const { data: parentArch } = await supabase
          .from("archives")
          .select("id")
          .eq("slug", memory.archiveSlug.trim().toLowerCase())
          .eq("owner_id", owner.id)
          .maybeSingle();

        archiveId = parentArch?.id;
      }

      if (!archiveId) {
        errors.push(`Cannot migrate memory because parent archive [${memory.archiveSlug}] was not found.`);
        continue;
      }

      const payload = {
        archive_id: archiveId,
        title: memory.title.trim(),
        type: memory.type.trim(),
        content: memory.content.trim(),
        media_url: memory.mediaUrl?.trim() || null,
        memory_date: memory.date || null,
        tags: memory.tags || [],
        created_at: memory.date || new Date().toISOString()
      };

      if (action === "create") {
        const { data: newMem, error: createError } = await supabase
          .from("memories")
          .insert(payload)
          .select("id")
          .single();

        if (createError || !newMem) {
          errors.push(`Failed to insert memory: ${createError?.message}`);
          continue;
        }
        targetMemoryId = newMem.id;
      } else if ((action === "update" || action === "adopt") && targetMemoryId) {
        const { error: updateError } = await supabase
          .from("memories")
          .update(payload)
          .eq("id", targetMemoryId);

        if (updateError) {
          errors.push(`Failed to update memory: ${updateError.message}`);
          continue;
        }
      }

      if (targetMemoryId) {
        const { error: ledgerUpsertError } = await supabase
          .from("local_migration_records")
          .upsert(
            {
              source_system: "local_json",
              source_type: "memory",
              source_key: sourceKey,
              destination_table: "memories",
              destination_id: targetMemoryId,
              owner_id: owner.id,
              source_hash: memoryHash,
              verified_at: new Date().toISOString(),
              last_seen_at: new Date().toISOString(),
              migration_run_id: runId
            },
            { onConflict: "source_system,source_type,source_key,owner_id" }
          );

        if (ledgerUpsertError) {
          errors.push(`Failed to write ledger for memory: ${ledgerUpsertError.message}`);
        } else {
          ledgerCreates += 1;
        }
      }
    }
  }

  let finalStatus: MigrationSummary["status"] = "READY";

  if (options.mode === "verify") {
    const hasIssues = errors.length > 0 || archiveConflicts > 0 || memoriesMissing > 0 ||
      planItems.some((item) => item.status !== "MATCHED");
    finalStatus = hasIssues ? "VERIFY_FAILED" : "VERIFY_PASSED";
  } else if (options.mode === "apply") {
    finalStatus = errors.length === 0 ? "APPLIED" : "ERROR";
  }

  return {
    mode: options.mode,
    sourceFile: fullPath,
    sourceHash,
    planHash,
    ownerId: owner.id,
    ownerEmailMasked: owner.maskedEmail,
    archivesCreate,
    archivesUpdate,
    archivesUnchanged,
    archiveConflicts,
    memoriesCreate,
    memoriesUpdate,
    memoriesUnchanged,
    memoriesMissing,
    ledgerCreates,
    ledgerUpdates,
    errors,
    status: finalStatus,
    planItems
  };
}
