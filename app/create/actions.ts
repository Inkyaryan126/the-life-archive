"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createArchive } from "@/lib/archive-data";
import { isArchiveRelationshipToOwner } from "@/lib/archive-relationships";
import { validateProfilePhotoUrl } from "@/lib/safe-url";
import type { ArchiveVisibility } from "@/lib/types";

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string): never {
  redirect(`/create?error=${encodeURIComponent(message)}`);
}

export async function createArchiveAction(formData: FormData) {
  const archiveName = readRequiredString(formData, "archiveName");
  const personName = readRequiredString(formData, "personName");
  const bio = readRequiredString(formData, "bio");
  const profilePhotoUrl = readRequiredString(formData, "profilePhotoUrl");
  const visibilityValue = readRequiredString(formData, "visibility");
  const relationshipToOwnerValue = readRequiredString(
    formData,
    "relationshipToOwner"
  );
  const visibility: ArchiveVisibility =
    visibilityValue === "public" ? "public" : "private";

  if (!archiveName) {
    redirectWithError("Archive name is required.");
  }

  if (!personName) {
    redirectWithError("Person name is required.");
  }

  if (!isArchiveRelationshipToOwner(relationshipToOwnerValue)) {
    redirectWithError("Please select who this archive is for.");
  }

  const profilePhotoValidation = validateProfilePhotoUrl(profilePhotoUrl);

  if (!profilePhotoValidation.ok) {
    redirectWithError(profilePhotoValidation.message);
  }

  const archive = await createArchive({
    archiveName,
    personName,
    bio,
    profilePhotoUrl: profilePhotoValidation.value,
    visibility,
    memorialMode: formData.get("memorialMode") === "on",
    relationshipToOwner: relationshipToOwnerValue
  });

  revalidatePath("/");
  revalidatePath(`/archive/${archive.slug}`);
  redirect(`/archive/${archive.slug}?created=1`);
}
