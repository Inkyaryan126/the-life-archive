import "server-only";

import type { ArchiveVisibility } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export type AccountArchive = {
  slug: string;
  archiveName: string;
  personName: string;
  visibility: ArchiveVisibility;
  memorialMode: boolean;
  relationshipToOwner?: string;
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
    relationshipToOwner:
      typeof archive.relationship_to_owner === "string"
        ? archive.relationship_to_owner
        : undefined,
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
