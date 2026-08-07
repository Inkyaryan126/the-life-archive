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

type UpdateArchiveDetailsResult =
  | { success: true; error?: never }
  | { success?: never; error: string };

function parseCropNumber(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const parsed = typeof value === "number" ? value : parseFloat(String(value));

  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return fallback;
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

export async function updateArchiveDetailsAction(
  slug: string,
  formData: FormData
): Promise<UpdateArchiveDetailsResult> {
  try {
    const account = await getAccountContext();
    if (!account.user) {
      return { error: "You must be signed in to edit this archive." };
    }

    const archive = await getArchiveBySlug(slug);
    if (!archive) {
      return { error: "Archive not found." };
    }

    const isOwner = account.archives.some((item) => item.slug === archive.slug);
    if (!isOwner) {
      return { error: "You do not have permission to edit this archive." };
    }

    const personName = formData.get("personName");
    const archiveName = formData.get("archiveName");
    const bio = formData.get("bio");
    const visibility = formData.get("visibility");

    if (
      typeof personName !== "string" ||
      typeof archiveName !== "string" ||
      typeof bio !== "string" ||
      !personName.trim() ||
      !archiveName.trim() ||
      !bio.trim()
    ) {
      return { error: "All fields are required." };
    }

    if (visibility !== "public" && visibility !== "private") {
      return { error: "Invalid visibility value." };
    }
    const normalizedVisibility = visibility as "public" | "private";

    const rawX = formData.get("heroImagePositionX");
    const rawY = formData.get("heroImagePositionY");
    const rawZoom = formData.get("heroImageZoom");

    const normalizedCrop = normalizeHeroCropValues({
      positionX: parseCropNumber(rawX, archive.heroImagePositionX ?? 50),
      positionY: parseCropNumber(rawY, archive.heroImagePositionY ?? 50),
      zoom: parseCropNumber(rawZoom, archive.heroImageZoom ?? 1.0)
    });

    const updates: ArchiveUpdateInput = {
      personName: personName.trim(),
      archiveName: archiveName.trim(),
      bio: bio.trim(),
      visibility: normalizedVisibility,
      heroImagePositionX: normalizedCrop.x,
      heroImagePositionY: normalizedCrop.y,
      heroImageZoom: normalizedCrop.zoom
    };

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

    await updateArchive(slug, updates);
    revalidatePath(`/archive/${slug}`);
    revalidatePath(`/archive/${slug}/edit`);
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Archive update failed:", {
      slug,
      message: error instanceof Error ? error.message : String(error)
    });

    return { error: "We couldn't save those changes right now. Please try again." };
  }
}
