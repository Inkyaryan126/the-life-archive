"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createArchive } from "@/lib/archive-data";
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
  const visibility: ArchiveVisibility =
    visibilityValue === "public" ? "public" : "private";

  if (!archiveName) {
    redirectWithError("Archive name is required.");
  }

  if (!personName) {
    redirectWithError("Person name is required.");
  }

  const archive = await createArchive({
    archiveName,
    personName,
    bio,
    profilePhotoUrl,
    visibility,
    memorialMode: formData.get("memorialMode") === "on"
  });

  revalidatePath("/");
  revalidatePath(`/archive/${archive.slug}`);
  redirect(`/archive/${archive.slug}`);
}
