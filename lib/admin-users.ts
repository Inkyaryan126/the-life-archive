import "server-only";

import type { User } from "@supabase/supabase-js";
import { normalizeArchiveRelationshipToOwner } from "@/lib/archive-relationships";
import { resolveStorageImageUrl } from "@/lib/storage-media";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ArchiveRelationshipToOwner,
  ArchiveVisibility,
  LifeArchive,
  Memory,
  MemoryType
} from "@/lib/types";

type ProfileRow = {
  id: string;
  display_name: string | null;
  created_at: string | null;
};

type AdminArchiveRow = {
  id: string;
  owner_id: string | null;
  slug: string | null;
  archive_name: string | null;
  person_name: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  profile_photo_path: string | null;
  visibility: string | null;
  memorial_mode: boolean | null;
  relationship_to_owner: string | null;
  created_at: string;
};

type AdminMemoryRow = {
  id: string;
  archive_id: string;
  title: string;
  type: string;
  content: string | null;
  media_url: string | null;
  photo_path: string | null;
  memory_date: string | null;
  tags: string[] | null;
  created_at: string;
};

export type AdminUserArchiveSummary = {
  id: string;
  archiveName: string;
  personName: string;
  slug: string;
  visibility: ArchiveVisibility;
  discoverable: boolean;
  memorialMode: boolean;
  relationshipToOwner: ArchiveRelationshipToOwner;
  createdAt: string;
  memoryCount: number;
};

export type AdminUserDirectoryEntry = {
  id: string;
  email: string | null;
  displayName: string;
  profileDisplayName: string | null;
  createdAt: string | null;
  profileCreatedAt: string | null;
  archiveCount: number;
  archives: AdminUserArchiveSummary[];
};

export type AdminUserDirectory = {
  users: AdminUserDirectoryEntry[];
  totalUsers: number;
  totalArchives: number;
};

export type AdminArchivePreview = {
  owner: AdminUserDirectoryEntry;
  archive: LifeArchive & {
    id: string;
    ownerId: string | null;
    discoverable: boolean;
  };
  memories: Memory[];
};

function readMetadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string
) {
  const value = metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function getEmailPrefix(email: string | null | undefined) {
  return email?.split("@")[0]?.replace(/[._-]+/g, " ").trim() ?? "";
}

function getDirectoryDisplayName(input: {
  profileDisplayName?: string | null;
  metadata?: Record<string, unknown> | null;
  email?: string | null;
}) {
  const profileDisplayName = input.profileDisplayName?.trim();

  if (profileDisplayName) {
    return profileDisplayName;
  }

  const metadataDisplayName =
    readMetadataString(input.metadata, "display_name") ||
    readMetadataString(input.metadata, "full_name") ||
    readMetadataString(input.metadata, "name");

  if (metadataDisplayName) {
    return metadataDisplayName;
  }

  return getEmailPrefix(input.email) || "Unnamed User";
}

function normalizeVisibility(value: string | null): ArchiveVisibility {
  return value === "public" ? "public" : "private";
}

function normalizeMemoryType(value: string | null): MemoryType {
  if (
    value === "song" ||
    value === "journal" ||
    value === "photo" ||
    value === "video" ||
    value === "voice" ||
    value === "lesson"
  ) {
    return value;
  }

  return "journal";
}

function formatArchiveName(row: AdminArchiveRow) {
  return row.archive_name?.trim() || "Untitled Archive";
}

function formatPersonName(row: AdminArchiveRow) {
  return row.person_name?.trim() || formatArchiveName(row);
}

async function listAllAuthUsers() {
  const supabase = createAdminClient();
  const users: User[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000
    });

    if (error) {
      throw new Error(error.message);
    }

    users.push(...(data.users ?? []));

    if (!data.users || data.users.length < 1000) {
      break;
    }

    page += 1;
  }

  return users;
}

export async function countAdminAccounts() {
  return (await listAllAuthUsers()).length;
}

async function loadDirectoryRows() {
  const supabase = createAdminClient();
  const [users, profilesResult, archivesResult, memoriesResult] = await Promise.all([
    listAllAuthUsers(),
    supabase
      .from("profiles")
      .select("id, display_name, created_at"),
    supabase
      .from("archives")
      .select(
        "id, owner_id, slug, archive_name, person_name, bio, profile_photo_url, profile_photo_path, visibility, memorial_mode, relationship_to_owner, created_at"
      )
      .order("created_at", { ascending: false }),
    supabase.from("memories").select("archive_id")
  ]);

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  if (archivesResult.error) {
    throw new Error(archivesResult.error.message);
  }

  if (memoriesResult.error) {
    throw new Error(memoriesResult.error.message);
  }

  return {
    users,
    profiles: (profilesResult.data ?? []) as ProfileRow[],
    archives: (archivesResult.data ?? []) as AdminArchiveRow[],
    memoryArchiveIds: ((memoriesResult.data ?? []) as Array<{ archive_id: string }>).map(
      (row) => row.archive_id
    )
  };
}

function buildMemoryCountMap(memoryArchiveIds: string[]) {
  const counts = new Map<string, number>();

  for (const archiveId of memoryArchiveIds) {
    counts.set(archiveId, (counts.get(archiveId) ?? 0) + 1);
  }

  return counts;
}

function buildArchiveSummary(
  row: AdminArchiveRow,
  memoryCounts: Map<string, number>
): AdminUserArchiveSummary {
  const visibility = normalizeVisibility(row.visibility);

  return {
    id: row.id,
    archiveName: formatArchiveName(row),
    personName: formatPersonName(row),
    slug: row.slug?.trim() || "",
    visibility,
    discoverable: visibility === "public",
    memorialMode: Boolean(row.memorial_mode),
    relationshipToOwner: normalizeArchiveRelationshipToOwner(
      row.relationship_to_owner
    ),
    createdAt: row.created_at,
    memoryCount: memoryCounts.get(row.id) ?? 0
  };
}

function matchesDirectorySearch(entry: AdminUserDirectoryEntry, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    entry.displayName,
    entry.email,
    ...entry.archives.flatMap((archive) => [
      archive.archiveName,
      archive.personName,
      archive.slug
    ])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export async function listAdminUsersAndArchives(
  query?: string
): Promise<AdminUserDirectory> {
  const { users, profiles, archives, memoryArchiveIds } = await loadDirectoryRows();
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const memoryCounts = buildMemoryCountMap(memoryArchiveIds);
  const archivesByOwnerId = new Map<string, AdminUserArchiveSummary[]>();

  for (const archive of archives) {
    if (!archive.owner_id) {
      continue;
    }

    const ownerArchives = archivesByOwnerId.get(archive.owner_id) ?? [];
    ownerArchives.push(buildArchiveSummary(archive, memoryCounts));
    archivesByOwnerId.set(archive.owner_id, ownerArchives);
  }

  const entries = users.map((user) => {
    const profile = profilesById.get(user.id) ?? null;
    const userArchives = archivesByOwnerId.get(user.id) ?? [];

    return {
      id: user.id,
      email: user.email ?? null,
      displayName: getDirectoryDisplayName({
        profileDisplayName: profile?.display_name,
        metadata: user.user_metadata as Record<string, unknown> | null,
        email: user.email
      }),
      profileDisplayName: profile?.display_name ?? null,
      createdAt: user.created_at ?? null,
      profileCreatedAt: profile?.created_at ?? null,
      archiveCount: userArchives.length,
      archives: userArchives.sort((left, right) =>
        left.archiveName.localeCompare(right.archiveName)
      )
    };
  });

  const normalizedQuery = query?.trim() ?? "";
  const filteredUsers = entries
    .filter((entry) => matchesDirectorySearch(entry, normalizedQuery))
    .sort((left, right) => left.displayName.localeCompare(right.displayName));

  return {
    users: filteredUsers,
    totalUsers: entries.length,
    totalArchives: archives.length
  };
}

export async function getAdminArchivePreview(
  archiveId: string
): Promise<AdminArchivePreview | null> {
  const supabase = createAdminClient();
  const { data: archiveRow, error: archiveError } = await supabase
    .from("archives")
    .select(
      "id, owner_id, slug, archive_name, person_name, bio, profile_photo_url, profile_photo_path, visibility, memorial_mode, relationship_to_owner, created_at"
    )
    .eq("id", archiveId)
    .maybeSingle();

  if (archiveError) {
    throw new Error(archiveError.message);
  }

  if (!archiveRow) {
    return null;
  }

  const archive = archiveRow as AdminArchiveRow;

  if (!archive.owner_id) {
    return null;
  }

  const [ownerResult, profileResult, memoriesResult] = await Promise.all([
    supabase.auth.admin.getUserById(archive.owner_id),
    supabase
      .from("profiles")
      .select("id, display_name, created_at")
      .eq("id", archive.owner_id)
      .maybeSingle(),
    supabase
      .from("memories")
      .select("id, archive_id, title, type, content, media_url, photo_path, memory_date, tags, created_at")
      .eq("archive_id", archive.id)
      .order("memory_date", { ascending: false })
  ]);

  if (ownerResult.error) {
    throw new Error(ownerResult.error.message);
  }

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (memoriesResult.error) {
    throw new Error(memoriesResult.error.message);
  }

  const ownerUser = ownerResult.data.user;
  const profile = (profileResult.data ?? null) as ProfileRow | null;
  const visibility = normalizeVisibility(archive.visibility);
  const profilePhotoUrl = await resolveStorageImageUrl(
    archive.profile_photo_path,
    archive.profile_photo_url || undefined
  );
  const archiveSlug = archive.slug?.trim() || archive.id;
  const owner: AdminUserDirectoryEntry = {
    id: archive.owner_id,
    email: ownerUser?.email ?? null,
    displayName: getDirectoryDisplayName({
      profileDisplayName: profile?.display_name,
      metadata: ownerUser?.user_metadata as Record<string, unknown> | null,
      email: ownerUser?.email
    }),
    profileDisplayName: profile?.display_name ?? null,
    createdAt: ownerUser?.created_at ?? null,
    profileCreatedAt: profile?.created_at ?? null,
    archiveCount: 1,
    archives: [buildArchiveSummary(archive, buildMemoryCountMap([]))]
  };

  const memories: Memory[] = await Promise.all(
    ((memoriesResult.data ?? []) as AdminMemoryRow[]).map(async (memory) => ({
      id: memory.id,
      archiveSlug,
      title: memory.title,
      type: normalizeMemoryType(memory.type),
      content: memory.content ?? "",
      mediaUrl: await resolveStorageImageUrl(
        memory.photo_path,
        memory.media_url || undefined
      ),
      photoPath: memory.photo_path,
      date: memory.memory_date ?? memory.created_at.slice(0, 10),
      tags: memory.tags ?? []
    }))
  );

  return {
    owner,
    archive: {
      id: archive.id,
      ownerId: archive.owner_id,
      slug: archiveSlug,
      archiveName: formatArchiveName(archive),
      personName: formatPersonName(archive),
      bio: archive.bio ?? "",
      profilePhotoUrl,
      profilePhotoPath: archive.profile_photo_path,
      visibility,
      discoverable: visibility === "public",
      memorialMode: Boolean(archive.memorial_mode),
      relationshipToOwner: normalizeArchiveRelationshipToOwner(
        archive.relationship_to_owner
      ),
      createdAt: archive.created_at.slice(0, 10)
    },
    memories
  };
}
