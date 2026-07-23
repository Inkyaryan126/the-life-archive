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
  legacyQuestionEligible: boolean;
  prologuePart3SeenAt: string | null;
  prologuePart3Status: "completed" | "skipped" | null;
};

type PublicProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  legacy_question_eligible?: boolean | null;
  prologue_part3_seen_at?: string | null;
  prologue_part3_status?: "completed" | "skipped" | null;
};

function mapProfile(row: PublicProfileRow): PublicProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    legacyQuestionEligible: Boolean(row.legacy_question_eligible),
    prologuePart3SeenAt: row.prologue_part3_seen_at ?? null,
    prologuePart3Status: row.prologue_part3_status ?? null
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
    .select("id, display_name, avatar_url, bio, created_at, updated_at, legacy_question_eligible, prologue_part3_seen_at, prologue_part3_status")
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
    .select("id, display_name, avatar_url, bio, created_at, updated_at, legacy_question_eligible, prologue_part3_seen_at, prologue_part3_status")
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
    legacyQuestionEligible?: boolean;
  }
) {
  const payload: Record<string, any> = {
    id: input.userId,
    display_name: input.displayName,
    bio: input.bio ?? null,
    avatar_url: input.avatarUrl ?? null
  };

  if (typeof input.legacyQuestionEligible === "boolean") {
    payload.legacy_question_eligible = input.legacyQuestionEligible;
  }

  const { error } = await (supabase.from("profiles") as any).upsert(
    payload,
    {
      onConflict: "id"
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}
