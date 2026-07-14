import "server-only";

import { createClient } from "@/lib/supabase/server";
import { formatMemoryDate } from "@/lib/format";
import type { AccountArchive } from "@/lib/account";
import type { TimeCapsuleArchiveOption, TimeCapsuleMemoryOption } from "./utils";

type MemoryOptionRow = {
  archive_id: string;
  id: string;
  memory_date: string | null;
  title: string;
  type: TimeCapsuleMemoryOption["type"];
};

export async function loadOwnerTimeCapsuleArchiveOptions(
  archives: AccountArchive[]
): Promise<TimeCapsuleArchiveOption[]> {
  if (archives.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const archiveSlugMap = new Map(archives.map((archive) => [archive.slug, archive]));
  const options = new Map<string, TimeCapsuleMemoryOption[]>();

  const { data: archiveRows, error: archiveError } = await supabase
    .from("archives")
    .select("id, slug, archive_name, person_name")
    .in("slug", [...archiveSlugMap.keys()]);

  if (archiveError) {
    throw archiveError;
  }

  const archiveIdBySlug = new Map(
    ((archiveRows ?? []) as Array<{
      archive_name: string;
      id: string;
      person_name: string;
      slug: string;
    }>).map((archive) => [archive.slug, archive])
  );
  const archiveIds = [...archiveSlugMap.keys()]
    .map((slug) => archiveIdBySlug.get(slug)?.id)
    .filter((id): id is string => Boolean(id));

  const { data, error } = await supabase
    .from("memories")
    .select("archive_id, id, memory_date, title, type")
    .in("archive_id", archiveIds)
    .order("memory_date", { ascending: false });

  if (error) {
    throw error;
  }

  for (const slug of archiveSlugMap.keys()) {
    const archiveId = archiveIdBySlug.get(slug)?.id;

    if (archiveId) {
      options.set(archiveId, []);
    }
  }

  for (const row of (data ?? []) as MemoryOptionRow[]) {
    const bucket = options.get(row.archive_id);

    if (!bucket) {
      continue;
    }

    bucket.push({
      id: row.id,
      title: row.title,
      type: row.type,
      date: row.memory_date
    });
  }

  return archives.map((archive) => {
    const archiveIdentity = archiveIdBySlug.get(archive.slug);

    return {
      id: archiveIdentity?.id ?? archive.slug,
      slug: archive.slug,
      archiveName: archive.archiveName,
      personName: archive.personName,
      memories: (options.get(archiveIdentity?.id ?? "") ?? []).map((memory) => ({
        ...memory,
        date: memory.date ?? null
      }))
    };
  });
}

export function getArchiveMemoryOptionSummary(memory: TimeCapsuleMemoryOption) {
  const date = memory.date ? formatMemoryDate(memory.date) : null;
  return {
    ...memory,
    date
  };
}
