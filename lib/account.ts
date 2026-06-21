import "server-only";

import type { ArchiveVisibility } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export type AccountArchive = {
  slug: string;
  archiveName: string;
  personName: string;
  visibility: ArchiveVisibility;
};

export type AccountContext = {
  isConfigured: boolean;
  user: {
    id: string;
    email: string;
    createdAt: string;
    emailConfirmed: boolean;
  } | null;
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
      archive: null,
      archiveLookupFailed: false
    };
  }

  const { data: archive, error: archiveError } = await supabase
    .from("archives")
    .select("slug, archive_name, person_name, visibility")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    isConfigured: true,
    user: {
      id: user.id,
      email: user.email ?? "Email unavailable",
      createdAt: user.created_at,
      emailConfirmed: Boolean(user.email_confirmed_at)
    },
    archive: archive
      ? {
          slug: archive.slug,
          archiveName: archive.archive_name,
          personName: archive.person_name,
          visibility: archive.visibility as ArchiveVisibility
        }
      : null,
    archiveLookupFailed: Boolean(archiveError)
  };
}
