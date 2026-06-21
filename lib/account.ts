import "server-only";

import type { ArchiveVisibility } from "@/lib/types";
import type { ArchiveRelationshipToOwner } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { normalizeArchiveRelationshipToOwner } from "@/lib/archive-relationships";

export type AccountArchive = {
  slug: string;
  archiveName: string;
  personName: string;
  visibility: ArchiveVisibility;
  memorialMode: boolean;
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
  } | null;
  archives: AccountArchive[];
  defaultArchive: AccountArchive | null;
  // Temporary compatibility alias for consumers that still expect one archive.
  archive: AccountArchive | null;
  archiveLookupFailed: boolean;
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
      archives: [],
      defaultArchive: null,
      archive: null,
      archiveLookupFailed: false
    };
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isConfigured: true,
      user: null,
      archives: [],
      defaultArchive: null,
      archive: null,
      archiveLookupFailed: false
    };
  }

  const { data: archiveRows, error: archiveError } = await supabase
    .from("archives")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  const archives: AccountArchive[] = (archiveRows ?? []).map((archive) => ({
    slug: archive.slug,
    archiveName: archive.archive_name,
    personName: archive.person_name,
    visibility: archive.visibility as ArchiveVisibility,
    memorialMode: archive.memorial_mode,
    relationshipToOwner: normalizeArchiveRelationshipToOwner(
      archive.relationship_to_owner
    ),
    createdAt: archive.created_at
  }));
  const defaultArchive =
    archives.find((archive) => archive.relationshipToOwner === "self") ??
    archives[0] ??
    null;

  return {
    isConfigured: true,
    user: {
      id: user.id,
      email: user.email ?? "Email unavailable",
      createdAt: user.created_at,
      emailConfirmed: Boolean(user.email_confirmed_at)
    },
    archives,
    defaultArchive,
    archive: defaultArchive,
    archiveLookupFailed: Boolean(archiveError)
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

  const supabase = createClient();
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
