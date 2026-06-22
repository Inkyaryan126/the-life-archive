import { mkdir, readFile, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { createClient } from "./supabase/server";
import {
  validateMemoryMediaUrl,
  validateProfilePhotoUrl
} from "./safe-url";
import {
  deleteStorageObject,
  resolveStorageImageUrl,
  uploadMemoryVoice,
  validateImageUpload,
  uploadArchiveCoverImage,
  uploadMemoryPhoto
} from "./storage-media";
import {
  normalizeArchiveRelationshipToOwner,
  isArchiveRelationshipToOwner
} from "./archive-relationships";
import {
  isLegacyInstructionAccessLevel,
  normalizeLegacyInstructionAccessLevel
} from "./legacy-instructions";
import type {
  ArchiveStore,
  ArchiveVisibility,
  ArchiveRelationshipToOwner,
  LifeArchive,
  LegacyInstruction,
  LegacyInstructionAccessLevel,
  Memory,
  MemoryType
} from "./types";

const storePath = path.join(process.cwd(), "data", "life-archive.json");
const useSupabase = process.env.USE_SUPABASE === "true";
const requiresSupabase =
  process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

if (requiresSupabase && !useSupabase) {
  throw new Error(
    "Production configuration error: USE_SUPABASE must be true. Local JSON storage is disabled in production and on Vercel."
  );
}

export const memoryTypes: MemoryType[] = [
  "song",
  "journal",
  "photo",
  "video",
  "voice",
  "lesson"
];

const defaultProfilePhotoUrl =
  "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80";

const archiveSeedIds = {
  sariRae: "9e1b0e95-1d3b-4e91-9c42-5b8bf6c8d501",
  dustinSigley: "f7d2eb3c-2c6c-4c11-b7f2-90c2d6c1c5be"
} as const;

function getSafeProfilePhotoUrl(value?: string | null) {
  const validation = validateProfilePhotoUrl(value || "");
  return validation.ok && validation.value
    ? validation.value
    : defaultProfilePhotoUrl;
}

function getSafeMemoryMediaUrl(value?: string | null) {
  const validation = validateMemoryMediaUrl(value || "");
  return validation.ok && validation.value ? validation.value : undefined;
}

type ArchiveRow = {
  id: string;
  slug: string;
  archive_name: string;
  person_name: string;
  bio: string;
  profile_photo_url: string | null;
  profile_photo_path: string | null;
  visibility: ArchiveVisibility;
  memorial_mode: boolean;
  relationship_to_owner: ArchiveRelationshipToOwner;
  created_at: string;
};

type MemoryRow = {
  id: string;
  archive_id: string;
  title: string;
  type: MemoryType;
  content: string;
  media_url: string | null;
  photo_path: string | null;
  memory_date: string;
  tags: string[];
};

function mapArchiveRow(row: ArchiveRow): LifeArchive {
  return {
    id: row.id,
    slug: row.slug,
    archiveName: row.archive_name,
    personName: row.person_name,
    bio: row.bio,
    profilePhotoUrl: getSafeProfilePhotoUrl(row.profile_photo_url),
    profilePhotoPath: row.profile_photo_path,
    visibility: row.visibility as ArchiveVisibility,
    memorialMode: row.memorial_mode,
    relationshipToOwner: normalizeArchiveRelationshipToOwner(
      row.relationship_to_owner
    ),
    createdAt: row.created_at.slice(0, 10)
  };
}

async function mapArchiveRowWithResolvedPhoto(row: ArchiveRow) {
  const archive = mapArchiveRow(row);
  return {
    ...archive,
    profilePhotoUrl: await resolveStorageImageUrl(
      row.profile_photo_path,
      archive.profilePhotoUrl
    )
  };
}

async function mapMemoryRowWithResolvedMedia(
  row: MemoryRow,
  archiveSlug: string
) {
  return {
    id: row.id,
    archiveSlug,
    title: row.title,
    type: row.type as MemoryType,
    content: row.content,
    mediaUrl: await resolveStorageImageUrl(
      row.photo_path,
      getSafeMemoryMediaUrl(row.media_url)
    ),
    photoPath: row.photo_path,
    date: row.memory_date,
    tags: row.tags
  };
}

const seedArchives: LifeArchive[] = [
  {
    id: archiveSeedIds.sariRae,
    slug: "sari-rae",
    archiveName: "Sari Rae's Life Archive",
    personName: "Sari Rae",
    bio: "Sari Rae is a devoted mother whose life centers on family, care, and the small moments that become lasting memories. With a background in cosmetology and a gift for making people feel their best, her archive holds the stories, lessons, and moments that reflect a warm, grounded life well lived.",
    profilePhotoUrl: "/images/sari-rae.png",
    visibility: "public",
    memorialMode: false,
    relationshipToOwner: "other",
    createdAt: "2026-06-01"
  },
  {
    id: archiveSeedIds.dustinSigley,
    slug: "dustin-sigley",
    archiveName: "Dustin Sigley's Life Archive",
    personName: "Dustin Sigley",
    bio: "Dustin Sigley is the founder of The Life Archive, built from the belief that a person deserves to leave behind more than a name, a date, and a few scattered memories. His archive preserves the ideas, lessons, music, and moments that shaped the beginning of the project.",
    profilePhotoUrl: "/images/dustin-sigley.png",
    visibility: "public",
    memorialMode: false,
    relationshipToOwner: "self",
    createdAt: "2026-06-20"
  }
];

const seedMemories: Memory[] = [
  {
    id: "m-001",
    archiveSlug: "sari-rae",
    title: "The kitchen table rule",
    type: "lesson",
    content:
      "Sari always said the best conversations happen after the dishes are cleared, when nobody is in a hurry and the family can just be together.",
    date: "2021-11-24",
    tags: ["family", "lesson", "home"]
  },
  {
    id: "m-002",
    archiveSlug: "sari-rae",
    title: "A day at the salon",
    type: "photo",
    content:
      "A moment from the salon, where Sari helped someone leave feeling a little lighter and a little more confident.",
    mediaUrl: "/images/sari-rae.png",
    date: "2019-07-12",
    tags: ["cosmetology", "family"]
  },
  {
    id: "m-003",
    archiveSlug: "sari-rae",
    title: "A letter for the first hard year",
    type: "journal",
    content:
      "If you are reading this during a hard season, remember that love is often built in the ordinary things: a meal, a ride home, a calm voice, and showing up again tomorrow.",
    date: "2024-01-02",
    tags: ["future", "journal"]
  },
  {
    id: "m-004",
    archiveSlug: "sari-rae",
    title: "Her Sunday playlist",
    type: "song",
    content:
      "The songs that played while Sari cooked on Sunday mornings and the family drifted in one by one.",
    mediaUrl: "https://open.spotify.com/",
    date: "2020-03-08",
    tags: ["music", "sunday"]
  },
  {
    id: "dustin-001",
    archiveSlug: "dustin-sigley",
    title: "The first version",
    type: "journal",
    content:
      "The Life Archive started with a simple belief: people should not need a perfect biography to preserve what mattered. A few memories, lessons, songs, and notes can become a doorway back into a life.",
    date: "2026-06-20",
    tags: ["founder", "journal", "beginning"]
  },
  {
    id: "dustin-002",
    archiveSlug: "dustin-sigley",
    title: "Preserve stories before they disappear",
    type: "lesson",
    content:
      "Do not wait for the perfect time to ask for the story. Save the voice note, write the sentence down, collect the photo, and keep the detail while it is still close.",
    date: "2026-06-20",
    tags: ["lesson", "stories", "legacy"]
  },
  {
    id: "dustin-003",
    archiveSlug: "dustin-sigley",
    title: "A song for the first scan",
    type: "song",
    content:
      "A song connected to the earliest days of The Life Archive and the belief that music can bring a moment back.",
    mediaUrl: "https://open.spotify.com/",
    date: "2026-06-20",
    tags: ["song", "beginning"]
  }
];

const seedStore: ArchiveStore = {
  archives: seedArchives,
  memories: seedMemories,
  legacyInstructions: []
};

type CreateArchiveInput = {
  archiveName: string;
  personName: string;
  bio: string;
  profilePhotoUrl?: string;
  profilePhotoFile?: File | null;
  visibility: ArchiveVisibility;
  memorialMode: boolean;
  relationshipToOwner: ArchiveRelationshipToOwner;
};

type CreateMemoryInput = {
  archiveSlug: string;
  title: string;
  type: MemoryType;
  content: string;
  mediaUrl?: string;
  mediaFile?: File | null;
  date?: string;
  tags: string[];
};

type SaveLegacyInstructionInput = {
  archiveSlug: string;
  body: string;
  accessLevel: LegacyInstructionAccessLevel;
};

async function ensureStore() {
  await mkdir(path.dirname(storePath), { recursive: true });

  try {
    await readFile(storePath, "utf8");
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      await writeStore(seedStore);
      return;
    }

    throw error;
  }
}

async function readStore(): Promise<ArchiveStore> {
  await ensureStore();
  const raw = await readFile(storePath, "utf8");
  const store = JSON.parse(raw) as ArchiveStore;
  const seededStore = mergeSeedData(store);

  if (seededStore.changed) {
    await writeStore(seededStore.store);
  }

  return seededStore.store;
}

async function writeStore(store: ArchiveStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "archive";
}

function uniqueSlug(baseSlug: string, existingArchives: Array<{ slug: string }>) {
  const existing = new Set(existingArchives.map((archive) => archive.slug));

  if (!existing.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let nextSlug = `${baseSlug}-${counter}`;

  while (existing.has(nextSlug)) {
    counter += 1;
    nextSlug = `${baseSlug}-${counter}`;
  }

  return nextSlug;
}

function mergeSeedData(store: ArchiveStore) {
  let changed = false;
  const archiveSlugs = new Set(store.archives.map((archive) => archive.slug));
  const memoryIds = new Set(store.memories.map((memory) => memory.id));

  if (!Array.isArray(store.legacyInstructions)) {
    store.legacyInstructions = [];
    changed = true;
  }

  const legacyInstructionSlugs = new Set(
    store.legacyInstructions.map((instruction) => instruction.archiveSlug)
  );

  for (const archive of store.archives) {
    if (!archive.id) {
      archive.id = randomUUID();
      changed = true;
    }
  }

  for (const archive of seedArchives) {
    if (!archiveSlugs.has(archive.slug)) {
      store.archives.push(archive);
      changed = true;
    }
  }

  for (const memory of seedMemories) {
    if (!memoryIds.has(memory.id)) {
      store.memories.push(memory);
      changed = true;
    }
  }

  return { store, changed };
}

export function isMemoryType(value: string): value is MemoryType {
  return memoryTypes.includes(value as MemoryType);
}

export async function getFeaturedArchives() {
  if (useSupabase) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("archives")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Promise.all(
      data.map((row: ArchiveRow) => mapArchiveRowWithResolvedPhoto(row))
    );
  }

  const store = await readStore();
  return Promise.all(
    store.archives.map(async (archive) => ({
      ...archive,
      profilePhotoUrl: await resolveStorageImageUrl(
        archive.profilePhotoPath,
        getSafeProfilePhotoUrl(archive.profilePhotoUrl)
      ),
      relationshipToOwner: normalizeArchiveRelationshipToOwner(
        archive.relationshipToOwner
      )
    }))
  );
}

export async function getArchiveBySlug(slug: string) {
  if (useSupabase) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("archives")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapArchiveRowWithResolvedPhoto(data as ArchiveRow);
  }

  const store = await readStore();
  const archive = store.archives.find((item) => item.slug === slug);
  return archive
    ? {
        ...archive,
        profilePhotoUrl: await resolveStorageImageUrl(
          archive.profilePhotoPath,
          getSafeProfilePhotoUrl(archive.profilePhotoUrl)
        ),
        relationshipToOwner: normalizeArchiveRelationshipToOwner(
          archive.relationshipToOwner
        )
      }
    : null;
}

export async function getMemoriesByArchiveSlug(slug: string) {
  if (useSupabase) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("memories")
      .select("*, archives!inner(slug)")
      .eq("archives.slug", slug)
      .order("memory_date", { ascending: false });

    if (error) throw error;

    return Promise.all(
      data.map(async (row: MemoryRow) =>
        mapMemoryRowWithResolvedMedia(row, slug)
      )
    );
  }

  const store = await readStore();

  return Promise.all(
    store.memories
      .filter((memory) => memory.archiveSlug === slug)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(async (memory) => ({
        ...memory,
        mediaUrl: await resolveStorageImageUrl(
          memory.photoPath,
          getSafeMemoryMediaUrl(memory.mediaUrl)
        )
      }))
  );
}

export async function getRandomMemory(slug: string) {
  const archiveMemories = await getMemoriesByArchiveSlug(slug);

  if (archiveMemories.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * archiveMemories.length);
  return archiveMemories[index];
}

function mapLegacyInstruction(
  instruction: LegacyInstruction,
  overrides?: Partial<LegacyInstruction>
) {
  return {
    ...instruction,
    ...overrides,
    accessLevel: normalizeLegacyInstructionAccessLevel(
      overrides?.accessLevel ?? instruction.accessLevel
    )
  };
}

export async function getLegacyInstructionByArchiveSlug(slug: string, isOwner?: boolean) {
  if (useSupabase) {
    const supabase = createClient();
    const { data, error } = await supabase.rpc(
      "get_legacy_instruction_by_archive_slug",
      {
        target_slug: slug
      }
    );

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;

    if (!row) {
      return null;
    }

    return mapLegacyInstruction({
      archiveSlug: row.archive_slug,
      archiveName: row.archive_name,
      personName: row.person_name,
      body: row.body,
      accessLevel: normalizeLegacyInstructionAccessLevel(row.access_level),
      releasedAt: row.released_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  const store = await readStore();
  const instruction = store.legacyInstructions.find(
    (item) => item.archiveSlug === slug
  );

  if (!instruction) {
    return null;
  }

  const archive = store.archives.find((item) => item.slug === slug);

  if (!archive) {
    return null;
  }

  if (instruction.accessLevel !== "released" && !isOwner) {
    return null;
  }

  return mapLegacyInstruction(instruction, {
    archiveName: archive.archiveName,
    personName: archive.personName
  });
}

export async function saveLegacyInstruction(
  input: SaveLegacyInstructionInput
) {
  if (!isLegacyInstructionAccessLevel(input.accessLevel)) {
    throw new Error("Invalid legacy instruction access level.");
  }

  const trimmedBody = input.body.trim();

  if (!trimmedBody) {
    throw new Error("Legacy instructions cannot be empty.");
  }

  if (useSupabase) {
    const supabase = createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Authentication required to save legacy instructions");
    }

    const { data: archive, error: archiveError } = await supabase
      .from("archives")
      .select("id, slug, archive_name, person_name, owner_id")
      .eq("slug", input.archiveSlug)
      .maybeSingle();

    if (archiveError || !archive) {
      throw new Error("Archive not found");
    }

    if (archive.owner_id !== user.id) {
      throw new Error("You do not have permission to edit these instructions.");
    }

    const releasedAt =
      input.accessLevel === "released"
        ? new Date().toISOString()
        : null;

    const { data: existing } = await supabase
      .from("legacy_instructions")
      .select("id")
      .eq("archive_id", archive.id)
      .maybeSingle();

    const payload = {
      archive_id: archive.id,
      body: trimmedBody,
      access_level: input.accessLevel,
      released_at: releasedAt,
      created_by: user.id
    };

    const result = existing
      ? await supabase
          .from("legacy_instructions")
          .update(payload)
          .eq("id", existing.id)
          .select("body, access_level, released_at, created_at, updated_at")
          .single()
      : await supabase
          .from("legacy_instructions")
          .insert(payload)
          .select("body, access_level, released_at, created_at, updated_at")
          .single();

    if (result.error) {
      throw result.error;
    }

    return mapLegacyInstruction({
      archiveSlug: archive.slug,
      archiveName: archive.archive_name,
      personName: archive.person_name,
      body: result.data.body,
      accessLevel: normalizeLegacyInstructionAccessLevel(
        result.data.access_level
      ),
      releasedAt: result.data.released_at,
      createdAt: result.data.created_at,
      updatedAt: result.data.updated_at
    });
  }

  const store = await readStore();
  const archive = store.archives.find(
    (item) => item.slug === input.archiveSlug
  );

  if (!archive) {
    throw new Error("Archive not found");
  }

  const releasedAt =
    input.accessLevel === "released"
      ? new Date().toISOString()
      : null;
  const existingIndex = store.legacyInstructions.findIndex(
    (item) => item.archiveSlug === input.archiveSlug
  );
  const now = new Date().toISOString();
  const nextInstruction: LegacyInstruction = {
    archiveSlug: archive.slug,
    archiveName: archive.archiveName,
    personName: archive.personName,
    body: trimmedBody,
    accessLevel: input.accessLevel,
    releasedAt,
    createdAt:
      existingIndex >= 0
        ? store.legacyInstructions[existingIndex].createdAt
        : now,
    updatedAt: now
  };

  if (existingIndex >= 0) {
    store.legacyInstructions[existingIndex] = nextInstruction;
  } else {
    store.legacyInstructions.unshift(nextInstruction);
  }

  await writeStore(store);
  return nextInstruction;
}

export async function createArchive(input: CreateArchiveInput) {
  const profilePhotoValidation = validateProfilePhotoUrl(
    input.profilePhotoUrl || ""
  );

  if (!profilePhotoValidation.ok) {
    throw new Error(profilePhotoValidation.message);
  }

  if (input.profilePhotoFile && !useSupabase) {
    throw new Error(
      "Photo uploads are not available until Supabase Storage is configured. Paste a photo link instead."
    );
  }

  if (input.profilePhotoFile) {
    validateImageUpload(input.profilePhotoFile, "Profile photo");
  }

  const profilePhotoUrl =
    profilePhotoValidation.value || defaultProfilePhotoUrl;
  const relationshipToOwner = isArchiveRelationshipToOwner(
    input.relationshipToOwner
  )
    ? input.relationshipToOwner
    : "other";

  if (useSupabase) {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Authentication required to create an archive");
    }

    const { data: existingArchives } = await supabase
      .from("archives")
      .select("slug");

    const slug = uniqueSlug(
      slugify(input.personName),
      (existingArchives || []).map((a: any) => ({ slug: a.slug }))
    );

    const { data, error } = await supabase
      .from("archives")
      .insert({
        slug,
        archive_name: input.archiveName,
        person_name: input.personName,
        bio: input.bio,
        profile_photo_url: profilePhotoUrl,
        profile_photo_path: null,
        visibility: input.visibility,
        memorial_mode: input.memorialMode,
        relationship_to_owner: relationshipToOwner,
        is_demo: false,
        owner_id: user.id
      })
      .select()
      .single();

    if (error || !data) throw error || new Error("Archive could not be created.");

    let archiveRow = data as ArchiveRow;
    let profilePhotoPath: string | null = null;

    if (input.profilePhotoFile) {
      try {
        profilePhotoPath = await uploadArchiveCoverImage(
          archiveRow.id,
          input.profilePhotoFile
        );

        const { data: updatedArchive, error: updateError } = await supabase
          .from("archives")
          .update({ profile_photo_path: profilePhotoPath })
          .eq("id", archiveRow.id)
          .select()
          .single();

        if (updateError || !updatedArchive) {
          await supabase.from("archives").delete().eq("id", archiveRow.id);
          throw updateError || new Error("Archive could not be created.");
        }

        archiveRow = updatedArchive as ArchiveRow;
      } catch {
        if (profilePhotoPath) {
          await deleteStorageObject(profilePhotoPath);
        }
        await supabase.from("archives").delete().eq("id", archiveRow.id);
        throw new Error("We couldn't save the profile photo. Please try again.");
      }
    }

    return {
      ...mapArchiveRow(archiveRow),
      profilePhotoUrl: await resolveStorageImageUrl(
        archiveRow.profile_photo_path,
        getSafeProfilePhotoUrl(archiveRow.profile_photo_url)
      )
    };
  }

  const store = await readStore();
  const slug = uniqueSlug(
    slugify(input.personName),
    store.archives.map((a) => ({ slug: a.slug }))
  );
  const now = new Date().toISOString().slice(0, 10);

  const archive: LifeArchive = {
    id: randomUUID(),
    slug,
    archiveName: input.archiveName,
    personName: input.personName,
    bio: input.bio,
    profilePhotoUrl,
    profilePhotoPath: null,
    visibility: input.visibility,
    memorialMode: input.memorialMode,
    relationshipToOwner,
    createdAt: now
  };

  store.archives.unshift(archive);
  await writeStore(store);

  return archive;
}

export async function createMemory(input: CreateMemoryInput) {
  const mediaUrlValidation = validateMemoryMediaUrl(input.mediaUrl || "");

  if (!mediaUrlValidation.ok) {
    throw new Error(mediaUrlValidation.message);
  }

  if (input.mediaFile && !useSupabase) {
    throw new Error(
      "Photo uploads are not available until Supabase Storage is configured. Paste a photo link instead."
    );
  }

  if (input.mediaFile && input.type === "photo") {
    validateImageUpload(input.mediaFile, "Photo memory");
  }

  if (input.mediaFile && input.type === "voice") {
    // audio validation happens with the upload helper
  }

  if (input.mediaFile && input.type !== "photo" && input.type !== "voice") {
    throw new Error("Only photo or voice memories can use file uploads.");
  }

  const mediaUrl = mediaUrlValidation.value;

  if (useSupabase) {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Authentication required to create a memory");
    }

    const { data: archive, error: archiveError } = await supabase
      .from("archives")
      .select("id")
      .eq("slug", input.archiveSlug)
      .single();

    if (archiveError || !archive) {
      return null;
    }

    const { data, error } = await supabase
      .from("memories")
      .insert({
        archive_id: archive.id,
        title: input.title,
        type: input.type,
        content: input.content,
        media_url: mediaUrl || null,
        photo_path: null,
        memory_date: input.date || new Date().toISOString().slice(0, 10),
        tags: input.tags,
        created_at: new Date().toISOString(),
        created_by: user.id
      })
      .select()
      .single();

    if (error || !data) throw error || new Error("Memory could not be created.");

    let memoryRow = data as MemoryRow;
    let filePath: string | null = null;

    if (input.mediaFile) {
      try {
        if (input.type === "photo") {
          filePath = await uploadMemoryPhoto(
            archive.id,
            memoryRow.id,
            input.mediaFile
          );
        } else if (input.type === "voice") {
          filePath = await uploadMemoryVoice(
            archive.id,
            memoryRow.id,
            input.mediaFile
          );
        }

        const { data: updatedMemory, error: updateError } = await supabase
          .from("memories")
          .update({
            ...(input.type === "photo" ? { photo_path: filePath } : {}),
            ...(input.type === "voice" ? { media_url: null } : {})
          })
          .eq("id", memoryRow.id)
          .select()
          .single();

        if (updateError || !updatedMemory) {
          await supabase.from("memories").delete().eq("id", memoryRow.id);
          throw updateError || new Error("Memory could not be created.");
        }

        memoryRow = updatedMemory as MemoryRow;
      } catch {
        if (filePath) {
          await deleteStorageObject(filePath);
        }
        await supabase.from("memories").delete().eq("id", memoryRow.id);
        throw new Error(
          input.type === "voice"
            ? "We couldn't save that voice file. Please try again."
            : "We couldn't save that photo. Please try again."
        );
      }
    }

    return {
      id: memoryRow.id,
      archiveSlug: input.archiveSlug,
      title: memoryRow.title,
      type: memoryRow.type as MemoryType,
      content: memoryRow.content,
      mediaUrl: await resolveStorageImageUrl(
        memoryRow.photo_path,
        getSafeMemoryMediaUrl(memoryRow.media_url)
      ),
      photoPath: memoryRow.photo_path,
      date: memoryRow.memory_date,
      tags: memoryRow.tags
    };
  }

  const store = await readStore();
  const archiveExists = store.archives.some(
    (archive) => archive.slug === input.archiveSlug
  );

  if (!archiveExists) {
    return null;
  }

  const memory: Memory = {
    id: randomUUID(),
    archiveSlug: input.archiveSlug,
    title: input.title,
    type: input.type,
    content: input.content,
    mediaUrl: mediaUrl || undefined,
    photoPath: null,
    date: input.date || new Date().toISOString().slice(0, 10),
    tags: input.tags
  };

  store.memories.unshift(memory);
  await writeStore(store);

  return memory;
}
