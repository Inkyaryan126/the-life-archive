import "server-only";

import { createAdminClient } from "./supabase/admin";

export const archiveMediaBucket = "archive-media";

const maxImageUploadBytes = 10 * 1024 * 1024;

const imageExtensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif"
};

const allowedImageMimeTypes = new Set(Object.keys(imageExtensionByMimeType));

function getExtensionFromFile(file: File) {
  const mimeExtension = imageExtensionByMimeType[file.type.toLowerCase()];

  if (mimeExtension) {
    return mimeExtension;
  }

  return "jpg";
}

function getArrayBuffer(file: File) {
  return file.arrayBuffer().then((buffer) => Buffer.from(buffer));
}

export function validateImageUpload(file: File, fieldName: string) {
  if (!allowedImageMimeTypes.has(file.type.toLowerCase())) {
    throw new Error(
      `${fieldName} must be a JPG, PNG, WebP, GIF, or AVIF image.`
    );
  }

  if (file.size > maxImageUploadBytes) {
    throw new Error(`${fieldName} must be smaller than 10 MB.`);
  }
}

export function buildArchiveCoverPath(archiveId: string, file: File) {
  return `archives/${archiveId}/cover/original.${getExtensionFromFile(file)}`;
}

export function buildMemoryPhotoPath(archiveId: string, memoryId: string, file: File) {
  return `archives/${archiveId}/memories/${memoryId}/original.${getExtensionFromFile(file)}`;
}

export async function uploadArchiveCoverImage(
  archiveId: string,
  file: File
) {
  const storage = createAdminClient().storage;
  const path = buildArchiveCoverPath(archiveId, file);
  const bytes = await getArrayBuffer(file);

  const { error } = await storage.from(archiveMediaBucket).upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: true
  });

  if (error) {
    throw error;
  }

  return path;
}

export async function uploadMemoryPhoto(
  archiveId: string,
  memoryId: string,
  file: File
) {
  const storage = createAdminClient().storage;
  const path = buildMemoryPhotoPath(archiveId, memoryId, file);
  const bytes = await getArrayBuffer(file);

  const { error } = await storage.from(archiveMediaBucket).upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: true
  });

  if (error) {
    throw error;
  }

  return path;
}

export async function resolveStorageImageUrl(
  storagePath?: string | null,
  fallbackUrl?: string | null
) {
  if (!storagePath) {
    return fallbackUrl || "";
  }

  try {
    const { data, error } = await createAdminClient().storage
      .from(archiveMediaBucket)
      .createSignedUrl(storagePath, 60 * 60);

    if (error || !data?.signedUrl) {
      return fallbackUrl || "";
    }

    return data.signedUrl;
  } catch {
    return fallbackUrl || "";
  }
}

export async function deleteStorageObject(storagePath: string) {
  try {
    const { error } = await createAdminClient().storage
      .from(archiveMediaBucket)
      .remove([storagePath]);

    if (error) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}
