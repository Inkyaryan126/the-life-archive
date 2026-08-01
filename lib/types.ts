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
  legacyActivationCode?: string | null;
  legacyCodeUsedAt?: string | null;
  legacyActivatedBy?: string | null;
  memorialActivatedAt?: string | null;
  memorialActivatedBy?: string | null;
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

export type ServicePreference =
  | "funeral"
  | "memorial"
  | "celebration_of_life"
  | "private_gathering"
  | "no_formal_service"
  | "undecided"
  | "custom";

export type DispositionPreference =
  | "burial"
  | "cremation"
  | "donation"
  | "green_burial"
  | "undecided"
  | "custom";

export type FinalWishSong = {
  id: string;
  finalWishesId?: string;
  archiveId: string;
  title: string;
  artist?: string | null;
  url?: string | null;
  notes?: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type FinalWishes = {
  id: string;
  archiveId: string;
  archiveSlug?: string;
  userId: string;
  servicePreference?: ServicePreference | null;
  serviceCustomDescription?: string | null;
  serviceLocation?: string | null;
  traditions?: string | null;
  serviceTone?: string | null;
  serviceInstructions?: string | null;
  dispositionPreference?: DispositionPreference | null;
  dispositionLocation?: string | null;
  ashesInstructions?: string | null;
  donationNotes?: string | null;
  dispositionInstructions?: string | null;
  firstContact?: string | null;
  preferredOfficiant?: string | null;
  pallbearerSuggestions?: string | null;
  peopleToInvolve?: string | null;
  peopleNotResponsible?: string | null;
  responsibilityNotes?: string | null;
  obituaryName?: string | null;
  obituaryRelationships?: string | null;
  obituaryAccomplishments?: string | null;
  obituaryCauses?: string | null;
  obituaryNotes?: string | null;
  obituaryExclusions?: string | null;
  clothingPreference?: string | null;
  displayPreferences?: string | null;
  gatheringPreferences?: string | null;
  finalMessage?: string | null;
  additionalWishes?: string | null;
  songs: FinalWishSong[];
  createdAt?: string;
  updatedAt?: string;
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
  createdBy?: string | null;
  createdByDisplayName?: string | null;
};

export type VisitorMessage = {
  id: string;
  archiveSlug: string;
  name: string;
  message: string;
  createdAt: string;
};

export type ArchiveStore = {
  archives: LifeArchive[];
  memories: Memory[];
  legacyInstructions: LegacyInstruction[];
  visitorMessages?: VisitorMessage[];
  finalWishes?: FinalWishes[];
};

export type SharePassStatus = "active" | "disabled" | "revoked";

export type Keepsake = {
  id: string;
  archiveId: string;
  keepsakeCode: string;
  productType: string;
  activeSharePassId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ArchiveSharePass = {
  id: string;
  keepsakeId: string;
  archiveId: string;
  createdBy: string | null;
  passName: string;
  status: SharePassStatus;
  useCount: number;
  lastScannedAt: string | null;
  createdAt: string;
  updatedAt: string;
  selectedMemoryIds?: string[];
};

export type GuestPassMemory = {
  id: string;
  title: string;
  type: MemoryType;
  content: string | null;
  mediaUrl: string | null;
  signedMediaUrl?: string | null;
  memoryDate: string | null;
  tags: string[];
};
