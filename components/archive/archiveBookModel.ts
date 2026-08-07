import type { Memory, MemoryType } from "@/lib/types";

export const archiveTocEntriesPerPage = 5;

export function getMemoryTypeLabel(type: MemoryType) {
  const labels: Record<MemoryType, string> = {
    journal: "Journal",
    photo: "Photo",
    video: "Video",
    voice: "Voice Note",
    song: "Song",
    lesson: "Life Lesson"
  };

  return labels[type] ?? "Chapter";
}

export function trimArchiveText(value: string | null | undefined, maxLength = 360) {
  const normalized = (value || "").replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).replace(/\s+\S*$/, "")}...`;
}

export function getArchiveTocPageCount(
  chapters: unknown[],
  entriesPerPage = archiveTocEntriesPerPage
) {
  return Math.max(1, Math.ceil(chapters.length / entriesPerPage));
}

export function getArchiveTocPageItems<T>(
  chapters: T[],
  pageIndex: number,
  entriesPerPage = archiveTocEntriesPerPage
) {
  const safePageIndex = Math.max(0, Math.min(pageIndex, getArchiveTocPageCount(chapters, entriesPerPage) - 1));
  const start = safePageIndex * entriesPerPage;
  return chapters.slice(start, start + entriesPerPage);
}
