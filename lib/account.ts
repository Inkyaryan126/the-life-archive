import "server-only";

import type { ArchiveVisibility } from "@/lib/types";
import type { ArchiveRelationshipToOwner } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { normalizeArchiveRelationshipToOwner } from "@/lib/archive-relationships";
import {
  getFallbackDisplayName,
  type PublicProfile
} from "@/lib/profiles";

export type AccountArchive = {
  slug: string;
  archiveName: string;
  personName: string;
  visibility: ArchiveVisibility;
  memorialMode: boolean;
  legacyActivationCode: string | null;
  legacyCodeUsedAt: string | null;
  legacyActivatedBy: string | null;
  memorialActivatedAt: string | null;
  memorialActivatedBy: string | null;
  relationshipToOwner: ArchiveRelationshipToOwner;
  createdAt: string;
};

export type AccountContext = {
  isConfigured: boolean;
  user: {
    id: string;
    email: string;
    createdAt: string;
    emailConfirmed: boolean;
    displayName: string;
  } | null;
  profile: PublicProfile | null;
  archives: AccountArchive[];
  defaultArchive: AccountArchive | null;
  // Temporary compatibility alias for consumers that still expect one archive.
  archive: AccountArchive | null;
  archiveLookupFailed: boolean;
  prologuePart3Eligible: boolean;
};

export async function getAccountContext(): Promise<AccountContext> {
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!isConfigured) {
    return {
      isConfigured: false,
      user: null,
      profile: null,
      archives: [],
      defaultArchive: null,
      archive: null,
      archiveLookupFailed: false,
      prologuePart3Eligible: false
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isConfigured: true,
      user: null,
      profile: null,
      archives: [],
      defaultArchive: null,
      archive: null,
      archiveLookupFailed: false,
      prologuePart3Eligible: false
    };
  }

  const { data: archiveRows, error: archiveError } = await supabase
    .from("archives")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, created_at, updated_at, legacy_question_eligible, prologue_part3_seen_at, prologue_part3_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Unable to fetch profile:", profileError.message);
  }

  const archives: AccountArchive[] = (archiveRows ?? []).map((archive) => ({
    slug: archive.slug,
    archiveName: archive.archive_name,
    personName: archive.person_name,
    visibility: archive.visibility as ArchiveVisibility,
    memorialMode: archive.memorial_mode,
    legacyActivationCode: archive.legacy_activation_code ?? null,
    legacyCodeUsedAt: archive.legacy_code_used_at ?? null,
    legacyActivatedBy: archive.legacy_activated_by ?? null,
    memorialActivatedAt: archive.memorial_activated_at ?? null,
    memorialActivatedBy: archive.memorial_activated_by ?? null,
    relationshipToOwner: normalizeArchiveRelationshipToOwner(
      archive.relationship_to_owner
    ),
    createdAt: archive.created_at
  }));
  const defaultArchive =
    archives.find((archive) => archive.relationshipToOwner === "self") ?? null;
  const profile: PublicProfile | null = profileRow
    ? {
        id: profileRow.id,
        displayName: profileRow.display_name,
        avatarUrl: profileRow.avatar_url,
        bio: profileRow.bio,
        createdAt: profileRow.created_at,
        updatedAt: profileRow.updated_at,
        legacyQuestionEligible: Boolean(profileRow.legacy_question_eligible),
        prologuePart3SeenAt: profileRow.prologue_part3_seen_at ?? null,
        prologuePart3Status: profileRow.prologue_part3_status ?? null
      }
    : null;

  const prologuePart3Eligible = Boolean(
    profile?.legacyQuestionEligible && !profile?.prologuePart3SeenAt
  );

  return {
    isConfigured: true,
    user: {
      id: user.id,
      email: user.email ?? "Email unavailable",
      createdAt: user.created_at,
      emailConfirmed: Boolean(user.email_confirmed_at),
      displayName: getFallbackDisplayName({
        profileDisplayName: profile?.displayName,
        metadata: user.user_metadata as Record<string, unknown> | null,
        email: user.email
      })
    },
    profile,
    archives,
    defaultArchive,
    archive: defaultArchive,
    archiveLookupFailed: Boolean(archiveError),
    prologuePart3Eligible
  };
}

export async function canCurrentUserAddMemory(
  archiveSlug: string,
  account: AccountContext
) {
  if (!account.user) {
    return false;
  }

  if (account.archives.some((archive) => archive.slug === archiveSlug)) {
    return true;
  }

  const supabase = await createClient();
  const { data: archive } = await supabase
    .from("archives")
    .select("id")
    .eq("slug", archiveSlug)
    .maybeSingle();

  if (!archive) {
    return false;
  }

  const { data: membership } = await supabase
    .from("archive_members")
    .select("role")
    .eq("archive_id", archive.id)
    .eq("user_id", account.user.id)
    .maybeSingle();

  return membership?.role === "editor";
}
