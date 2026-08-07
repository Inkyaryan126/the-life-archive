"use server";

import { revalidatePath } from "next/cache";
import {
  createVisitorMessage,
  deleteVisitorMessage,
  getArchiveBySlug,
  updateArchive,
  type ArchiveUpdateInput
} from "@/lib/archive-data";
import { getAccountContext } from "@/lib/account";
import { uploadArchiveCoverImage, validateImageUpload, resolveStorageImageUrl } from "@/lib/storage-media";
import { normalizeHeroCropValues } from "@/lib/archive-hero-image";

function parseCropNumber(
  value: unknown,
  fieldName: string,
  min: number,
  max: number,
  fallback: number
): number {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const parsed = typeof value === "number" ? value : parseFloat(String(value));

  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric value for ${fieldName}.`);
  }

  if (parsed < min || parsed > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}.`);
  }

  return parsed;
}

export async function postVisitorMessageAction(slug: string, formData: FormData) {
  const name = formData.get("name") as string;
  const message = formData.get("message") as string;

  if (!name?.trim() || !message?.trim()) {
    return { error: "Name and message are required." };
  }

  try {
    await createVisitorMessage(slug, name, message);
    revalidatePath(`/archive/${slug}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to post message." };
  }
}

export async function deleteVisitorMessageAction(slug: string, messageId: string) {
  const account = await getAccountContext();
  if (!account.user) {
    return { error: "Unauthorized" };
  }

  try {
    await deleteVisitorMessage(messageId);
    revalidatePath(`/archive/${slug}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete message." };
  }
}

export async function updateArchiveDetailsAction(slug: string, formData: FormData) {
  // 1. Strict Owner Authorization FIRST before reading files or processing updates
  const account = await getAccountContext();
  if (!account.user) {
    throw new Error("Unauthorized");
  }

  const archive = await getArchiveBySlug(slug);
  if (!archive) {
    throw new Error("Archive not found.");
  }

  const isOwner = account.archives.some((item) => item.slug === archive.slug);
  if (!isOwner) {
    throw new Error("Unauthorized");
  }

  // 2. Validate Text Fields
  const personName = formData.get("personName") as string;
  const archiveName = formData.get("archiveName") as string;
  const bio = formData.get("bio") as string;
  const visibility = formData.get("visibility") as any;

  if (!personName?.trim() || !archiveName?.trim() || !bio?.trim()) {
    throw new Error("All fields are required.");
  }

  if (visibility !== "public" && visibility !== "private") {
    throw new Error("Invalid visibility value.");
  }

  // 3. Strict Server-Side Validation of Crop Numbers
  const rawX = formData.get("heroImagePositionX");
  const rawY = formData.get("heroImagePositionY");
  const rawZoom = formData.get("heroImageZoom");

  const positionX = parseCropNumber(
    rawX,
    "Focal X Position",
    0,
    100,
    archive.heroImagePositionX ?? 50
  );
  const positionY = parseCropNumber(
    rawY,
    "Focal Y Position",
    0,
    100,
    archive.heroImagePositionY ?? 50
  );
  const zoom = parseCropNumber(
    rawZoom,
    "Hero Image Zoom",
    1.0,
    3.0,
    archive.heroImageZoom ?? 1.0
  );

  const { x: normalizedX, y: normalizedY, zoom: normalizedZoom } = normalizeHeroCropValues({
    positionX,
    positionY,
    zoom
  });

  const updates: ArchiveUpdateInput = {
    personName: personName.trim(),
    archiveName: archiveName.trim(),
    bio: bio.trim(),
    visibility,
    heroImagePositionX: normalizedX,
    heroImagePositionY: normalizedY,
    heroImageZoom: normalizedZoom
  };

  // 4. Handle Optional Photo Upload (Only if valid new file provided)
  const fileCandidate = formData.get("heroPhoto") || formData.get("profilePhoto");

  if (fileCandidate && typeof fileCandidate === "object" && "size" in fileCandidate) {
    const file = fileCandidate as File;
    if (file.size > 0) {
      validateImageUpload(file, "Hero photo");
      const storagePath = await uploadArchiveCoverImage(archive.id, file);
      const publicUrl = await resolveStorageImageUrl(storagePath);
      updates.profilePhotoUrl = publicUrl;
      updates.profilePhotoPath = storagePath;
    }
  }

  // 5. Persist Updates & Revalidate Affected Pages
  try {
    await updateArchive(slug, updates);
    revalidatePath(`/archive/${slug}`);
    revalidatePath(`/archive/${slug}/edit`);
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to update archive.");
  }
}
