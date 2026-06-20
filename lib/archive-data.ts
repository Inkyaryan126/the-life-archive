import { mkdir, readFile, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import type {
  ArchiveStore,
  ArchiveVisibility,
  LifeArchive,
  Memory,
  MemoryType
} from "./types";

const storePath = path.join(process.cwd(), "data", "life-archive.json");

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

const seedArchives: LifeArchive[] = [
  {
    slug: "maya-rivera",
    archiveName: "Maya Rivera's Life Archive",
    personName: "Maya Rivera",
    bio: "Teacher, gardener, Sunday dinner host, and the steady voice everyone called when life felt too loud.",
    profilePhotoUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    visibility: "public",
    memorialMode: false,
    createdAt: "2026-06-01"
  },
  {
    slug: "dustin-sigley",
    archiveName: "Founders Archive",
    personName: "Dustin Sigley",
    bio: "Founder seed archive for Life Archive, built to show how a person's ideas, lessons, and memories can live together in one simple place.",
    profilePhotoUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    visibility: "public",
    memorialMode: false,
    createdAt: "2026-06-20"
  }
];

const seedMemories: Memory[] = [
  {
    id: "m-001",
    archiveSlug: "maya-rivera",
    title: "The kitchen table rule",
    type: "lesson",
    content:
      "Maya always said the best conversations happen after the plates are cleared, when no one is rushing to be anywhere else.",
    date: "2021-11-24",
    tags: ["family", "lesson", "home"]
  },
  {
    id: "m-002",
    archiveSlug: "maya-rivera",
    title: "Summer roses",
    type: "photo",
    content:
      "A favorite photo from the first summer the rose bushes finally climbed over the back fence.",
    mediaUrl:
      "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=1200&q=80",
    date: "2019-07-12",
    tags: ["garden", "summer"]
  },
  {
    id: "m-003",
    archiveSlug: "maya-rivera",
    title: "A letter for the first hard year",
    type: "journal",
    content:
      "If you are reading this during a hard season, make the next right choice and let tomorrow get its own turn.",
    date: "2024-01-02",
    tags: ["future", "journal"]
  },
  {
    id: "m-004",
    archiveSlug: "maya-rivera",
    title: "Her Sunday playlist",
    type: "song",
    content:
      "The songs that played while Maya cooked on Sunday mornings, before anyone else arrived.",
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
      "A placeholder song memory for the founder demo. This shows how a QR scan can surface music alongside written memories.",
    mediaUrl: "https://open.spotify.com/",
    date: "2026-06-20",
    tags: ["song", "demo"]
  }
];

const seedStore: ArchiveStore = {
  archives: seedArchives,
  memories: seedMemories
};

type CreateArchiveInput = {
  archiveName: string;
  personName: string;
  bio: string;
  profilePhotoUrl?: string;
  visibility: ArchiveVisibility;
  memorialMode: boolean;
};

type CreateMemoryInput = {
  archiveSlug: string;
  title: string;
  type: MemoryType;
  content: string;
  mediaUrl?: string;
  date?: string;
  tags: string[];
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

function uniqueSlug(baseSlug: string, archives: LifeArchive[]) {
  const existing = new Set(archives.map((archive) => archive.slug));

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
  const store = await readStore();
  return store.archives;
}

export async function getArchiveBySlug(slug: string) {
  const store = await readStore();
  return store.archives.find((archive) => archive.slug === slug) ?? null;
}

export async function getMemoriesByArchiveSlug(slug: string) {
  const store = await readStore();

  return store.memories
    .filter((memory) => memory.archiveSlug === slug)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getRandomMemory(slug: string) {
  const archiveMemories = await getMemoriesByArchiveSlug(slug);

  if (archiveMemories.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * archiveMemories.length);
  return archiveMemories[index];
}

export async function createArchive(input: CreateArchiveInput) {
  const store = await readStore();
  const slug = uniqueSlug(slugify(input.personName), store.archives);
  const now = new Date().toISOString().slice(0, 10);

  const archive: LifeArchive = {
    slug,
    archiveName: input.archiveName,
    personName: input.personName,
    bio: input.bio,
    profilePhotoUrl: input.profilePhotoUrl || defaultProfilePhotoUrl,
    visibility: input.visibility,
    memorialMode: input.memorialMode,
    createdAt: now
  };

  store.archives.unshift(archive);
  await writeStore(store);

  return archive;
}

export async function createMemory(input: CreateMemoryInput) {
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
    mediaUrl: input.mediaUrl || undefined,
    date: input.date || new Date().toISOString().slice(0, 10),
    tags: input.tags
  };

  store.memories.unshift(memory);
  await writeStore(store);

  return memory;
}
