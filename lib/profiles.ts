import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type PublicProfile = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

type PublicProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: PublicProfileRow): PublicProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function readMetadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string
) {
  const value = metadata?.[key];

  return typeof value === "string" ? value.trim() : "";
}

export function normalizeProfileDisplayName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function validateProfileDisplayName(value: string) {
  const normalized = normalizeProfileDisplayName(value);

  if (!normalized) {
    return { ok: true as const, value: null };
  }

  if (normalized.length > 60) {
    return {
      ok: false as const,
      message: "Display name must be 60 characters or fewer."
    };
  }

  return { ok: true as const, value: normalized };
}

export function validateProfileBio(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return { ok: true as const, value: null };
  }

  if (normalized.length > 300) {
    return {
      ok: false as const,
      message: "Bio must be 300 characters or fewer."
    };
  }

  return { ok: true as const, value: normalized };
}

export function getFallbackDisplayName(input: {
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

  const emailPrefix = input.email?.split("@")[0] ?? "";
  const normalizedEmailPrefix = emailPrefix.replace(/[._-]+/g, " ").trim();

  if (normalizedEmailPrefix) {
    return normalizedEmailPrefix;
  }

  return "Archive Member";
}

export async function loadProfilesByUserIds(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)].filter(Boolean);

  if (uniqueIds.length === 0) {
    return new Map<string, PublicProfile>();
  }

  const supabase = createAdminClient() as SupabaseClient<any, "public", any>;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, created_at, updated_at")
    .in("id", uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  const profiles = new Map<string, PublicProfile>();

  for (const row of (data ?? []) as PublicProfileRow[]) {
    profiles.set(row.id, mapProfile(row));
  }

  return profiles;
}

export async function loadProfileByUserId(userId: string) {
  const supabase = createAdminClient() as SupabaseClient<any, "public", any>;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProfile(data as PublicProfileRow) : null;
}

export async function upsertProfileForUser(
  supabase: SupabaseClient<any, "public", any>,
  input: {
    userId: string;
    displayName: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  }
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: input.userId,
      display_name: input.displayName,
      bio: input.bio ?? null,
      avatar_url: input.avatarUrl ?? null
    },
    {
      onConflict: "id"
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}
