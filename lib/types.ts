export type ArchiveVisibility = "private" | "public";

export type MemoryType =
  | "journal"
  | "photo"
  | "video"
  | "voice"
  | "song"
  | "lesson";

export type LifeArchive = {
  slug: string;
  archiveName: string;
  personName: string;
  bio: string;
  profilePhotoUrl: string;
  visibility: ArchiveVisibility;
  memorialMode: boolean;
  createdAt: string;
};

export type Memory = {
  id: string;
  archiveSlug: string;
  title: string;
  type: MemoryType;
  content: string;
  mediaUrl?: string;
  date: string;
  tags: string[];
};

export type ArchiveStore = {
  archives: LifeArchive[];
  memories: Memory[];
};
