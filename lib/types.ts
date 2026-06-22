export type ArchiveVisibility = "private" | "public";

export type ArchiveRelationshipToOwner =
  | "self"
  | "parent"
  | "child"
  | "partner"
  | "sibling"
  | "grandparent"
  | "grandchild"
  | "friend"
  | "mentor"
  | "other";

export type LegacyInstructionAccessLevel = "owner_only" | "released";

export type MemoryType =
  | "journal"
  | "photo"
  | "video"
  | "voice"
  | "song"
  | "lesson";

export type LifeArchive = {
  id: string;
  slug: string;
  archiveName: string;
  personName: string;
  bio: string;
  profilePhotoUrl: string;
  profilePhotoPath?: string | null;
  visibility: ArchiveVisibility;
  memorialMode: boolean;
  relationshipToOwner: ArchiveRelationshipToOwner;
  createdAt: string;
};

export type LegacyInstruction = {
  archiveSlug: string;
  archiveName: string;
  personName: string;
  body: string;
  accessLevel: LegacyInstructionAccessLevel;
  releasedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Memory = {
  id: string;
  archiveSlug: string;
  title: string;
  type: MemoryType;
  content: string;
  mediaUrl?: string;
  photoPath?: string | null;
  date: string;
  tags: string[];
};

export type ArchiveStore = {
  archives: LifeArchive[];
  memories: Memory[];
  legacyInstructions: LegacyInstruction[];
};
