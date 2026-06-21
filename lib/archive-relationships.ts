import type { ArchiveRelationshipToOwner } from "@/lib/types";

export const archiveRelationships = [
  "self",
  "parent",
  "child",
  "partner",
  "sibling",
  "grandparent",
  "grandchild",
  "friend",
  "mentor",
  "other"
] as const satisfies readonly ArchiveRelationshipToOwner[];

export const archiveRelationshipLabels: Record<
  ArchiveRelationshipToOwner,
  string
> = {
  self: "Myself",
  parent: "Parent",
  child: "Child",
  partner: "Partner / Spouse",
  sibling: "Sibling",
  grandparent: "Grandparent",
  grandchild: "Grandchild",
  friend: "Friend",
  mentor: "Mentor",
  other: "Someone else"
};

export function isArchiveRelationshipToOwner(
  value: string
): value is ArchiveRelationshipToOwner {
  return (archiveRelationships as readonly string[]).includes(value);
}

export function normalizeArchiveRelationshipToOwner(
  value?: string | null
): ArchiveRelationshipToOwner {
  return value && isArchiveRelationshipToOwner(value) ? value : "other";
}

export function getArchiveRelationshipLabel(
  value?: string | null
): string {
  return archiveRelationshipLabels[normalizeArchiveRelationshipToOwner(value)];
}
