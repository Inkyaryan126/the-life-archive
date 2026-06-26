"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import { createArchive } from "@/lib/archive-data";
import { isArchiveRelationshipToOwner } from "@/lib/archive-relationships";
import { validateProfilePhotoUrl } from "@/lib/safe-url";
import type { ArchiveVisibility } from "@/lib/types";

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function redirectWithError(message: string): never {
  redirect(`/create?error=${encodeURIComponent(message)}`);
}

export async function createArchiveAction(formData: FormData) {
  const archiveName = readRequiredString(formData, "archiveName");
  const personName = readRequiredString(formData, "personName");
  const bio = readRequiredString(formData, "bio");
  const profilePhotoUrl = readRequiredString(formData, "profilePhotoUrl");
  const profilePhotoFile = readOptionalFile(formData, "profilePhotoFile");
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

  if (relationshipToOwnerValue === "self") {
    const account = await getAccountContext();
    const hasPersonalArchive = account.archives.some(
      (archive) => archive.relationshipToOwner === "self"
    );

    if (hasPersonalArchive) {
      redirectWithError(
        "Your personal archive already exists. Create another archive for a loved one instead."
      );
    }
  }

  const profilePhotoValidation = validateProfilePhotoUrl(profilePhotoUrl);

  if (!profilePhotoValidation.ok) {
    redirectWithError(profilePhotoValidation.message);
  }

  let archive: Awaited<ReturnType<typeof createArchive>> | null = null;

  try {
    archive = await createArchive({
      archiveName,
      personName,
      bio,
      profilePhotoUrl: profilePhotoValidation.value,
      profilePhotoFile,
      visibility,
      memorialMode: formData.get("memorialMode") === "on",
      relationshipToOwner: relationshipToOwnerValue
    });
  } catch (error) {
    redirectWithError(
      error instanceof Error
        ? error.message
        : "We couldn't create that archive. Please try again."
    );
  }

  if (!archive) {
    redirectWithError("We couldn't create that archive. Please try again.");
  }

  revalidatePath("/");
  revalidatePath(`/archive/${archive.slug}`);
  redirect(`/archive/${archive.slug}?created=1`);
}
