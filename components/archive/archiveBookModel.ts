import type { Memory, MemoryType } from "@/lib/types";

export const archiveBookStructuralPageCount = 2;

export function getArchiveChapterPageIndex(chapterIndex: number) {
  return archiveBookStructuralPageCount + chapterIndex;
}

export function getArchiveBookPageCount(chapters: Pick<Memory, "id">[]) {
  return archiveBookStructuralPageCount + chapters.length;
}

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
