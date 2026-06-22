import "server-only";

import { createAdminClient } from "./supabase/admin";

export const archiveMediaBucket = "archive-media";

const maxImageUploadBytes = 10 * 1024 * 1024;
const maxAudioUploadBytes = 50 * 1024 * 1024;

const imageExtensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif"
};

const allowedImageMimeTypes = new Set(Object.keys(imageExtensionByMimeType));
const audioExtensionByMimeType: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac"
};
const allowedAudioMimeTypes = new Set(Object.keys(audioExtensionByMimeType));

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

export function validateAudioUpload(file: File, fieldName: string) {
  if (!allowedAudioMimeTypes.has(file.type.toLowerCase())) {
    throw new Error(
      `${fieldName} must be an MP3, WAV, M4A, AAC, OGG, or WebM audio file.`
    );
  }

  if (file.size > maxAudioUploadBytes) {
    throw new Error(`${fieldName} must be smaller than 50 MB.`);
  }
}

export function buildArchiveCoverPath(archiveId: string, file: File) {
  return `archives/${archiveId}/cover/original.${getExtensionFromFile(file)}`;
}

export function buildMemoryPhotoPath(archiveId: string, memoryId: string, file: File) {
  return `archives/${archiveId}/memories/${memoryId}/original.${getExtensionFromFile(file)}`;
}

function getAudioExtension(file: File) {
  const mimeExtension = audioExtensionByMimeType[file.type.toLowerCase()];

  if (mimeExtension) {
    return mimeExtension;
  }

  return "mp3";
}

export function buildMemoryVoicePath(archiveId: string, memoryId: string, file: File) {
  return `archives/${archiveId}/memories/${memoryId}/original.${getAudioExtension(file)}`;
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

export async function uploadMemoryVoice(
  archiveId: string,
  memoryId: string,
  file: File
) {
  const storage = createAdminClient().storage;
  const path = buildMemoryVoicePath(archiveId, memoryId, file);
  const bytes = await getArrayBuffer(file);

  const { error } = await storage.from(archiveMediaBucket).upload(path, bytes, {
    contentType: file.type || "audio/mpeg",
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
