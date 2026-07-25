import {
  acceptedAudioFormatLabel,
  acceptedAudioMimeTypes,
  acceptedImageFormatLabel,
  acceptedImageMimeTypes,
  acceptedVideoFormatLabel,
  acceptedVideoMimeTypes,
  maxAudioUploadBytes,
  maxAudioUploadMegabytes,
  maxImageUploadBytes,
  maxImageUploadMegabytes,
  maxVideoUploadBytes,
  maxVideoUploadMegabytes
} from "./media-upload-constants";

function getAdminStorage() {
  const { createAdminClient } = require("./supabase/admin");
  return createAdminClient().storage;
}

export const archiveMediaBucket = "archive-media";

export const imageExtensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif"
};

export const audioExtensionByMimeType: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/m4a": "m4a",
  "audio/aac": "aac"
};

export const videoExtensionByMimeType: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv"
};

const allowedImageMimeTypes = new Set<string>(acceptedImageMimeTypes);
const allowedAudioMimeTypes = new Set<string>(acceptedAudioMimeTypes);
const allowedVideoMimeTypes = new Set<string>(acceptedVideoMimeTypes);

export function normalizeMimeType(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const cleaned = value.toLowerCase().trim().split(";")[0]?.trim() ?? "";

  if (cleaned === "application/octet-stream") {
    return "";
  }

  return cleaned;
}

export function validatePathSegment(segment: string, segmentName: string): string {
  if (!segment || typeof segment !== "string") {
    throw new Error(`${segmentName} cannot be empty.`);
  }

  const trimmed = segment.trim();

  if (!trimmed) {
    throw new Error(`${segmentName} cannot be empty.`);
  }

  if (
    trimmed.includes("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("..") ||
    /[\u0000-\u001f\u007f]/.test(trimmed)
  ) {
    throw new Error(`${segmentName} contains invalid characters.`);
  }

  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(trimmed)) {
    throw new Error(`${segmentName} format is invalid.`);
  }

  return trimmed;
}

export function validateImageUpload(file: File, fieldName: string): { normalizedMime: string; extension: string } {
  if (!file || file.size === 0) {
    throw new Error(`${fieldName} cannot be empty.`);
  }

  if (file.size > maxImageUploadBytes) {
    throw new Error(`${fieldName} must be smaller than ${maxImageUploadMegabytes} MB.`);
  }

  const normalizedMime = normalizeMimeType(file.type);

  if (!normalizedMime || !allowedImageMimeTypes.has(normalizedMime)) {
    throw new Error(`${fieldName} must be a supported image format: ${acceptedImageFormatLabel}.`);
  }

  const extension = imageExtensionByMimeType[normalizedMime];

  if (!extension) {
    throw new Error(`${fieldName} file format is not supported.`);
  }

  return { normalizedMime, extension };
}

export function validateAudioUpload(file: File, fieldName: string): { normalizedMime: string; extension: string } {
  if (!file || file.size === 0) {
    throw new Error(`${fieldName} cannot be empty.`);
  }

  if (file.size > maxAudioUploadBytes) {
    throw new Error(`${fieldName} must be smaller than ${maxAudioUploadMegabytes} MB.`);
  }

  const normalizedMime = normalizeMimeType(file.type);

  if (!normalizedMime || !allowedAudioMimeTypes.has(normalizedMime)) {
    throw new Error(`${fieldName} must be a supported audio format: ${acceptedAudioFormatLabel}.`);
  }

  const extension = audioExtensionByMimeType[normalizedMime];

  if (!extension) {
    throw new Error(`${fieldName} audio format is not supported.`);
  }

  return { normalizedMime, extension };
}

export function validateVideoUpload(file: File, fieldName: string): { normalizedMime: string; extension: string } {
  if (!file || file.size === 0) {
    throw new Error(`${fieldName} cannot be empty.`);
  }

  if (file.size > maxVideoUploadBytes) {
    throw new Error(`${fieldName} must be smaller than ${maxVideoUploadMegabytes} MB.`);
  }

  const normalizedMime = normalizeMimeType(file.type);

  if (!normalizedMime || !allowedVideoMimeTypes.has(normalizedMime)) {
    throw new Error(`${fieldName} must be a supported video format: ${acceptedVideoFormatLabel}.`);
  }

  const extension = videoExtensionByMimeType[normalizedMime];

  if (!extension) {
    throw new Error(`${fieldName} video format is not supported.`);
  }

  return { normalizedMime, extension };
}

export function buildArchiveCoverPath(archiveId: string, file: File): { path: string; normalizedMime: string } {
  const safeArchiveId = validatePathSegment(archiveId, "Archive ID");
  const { normalizedMime, extension } = validateImageUpload(file, "Cover photo");

  return {
    path: `archives/${safeArchiveId}/cover/original.${extension}`,
    normalizedMime
  };
}

export function buildMemoryPhotoPath(archiveId: string, memoryId: string, file: File): { path: string; normalizedMime: string } {
  const safeArchiveId = validatePathSegment(archiveId, "Archive ID");
  const safeMemoryId = validatePathSegment(memoryId, "Memory ID");
  const { normalizedMime, extension } = validateImageUpload(file, "Memory photo");

  return {
    path: `archives/${safeArchiveId}/memories/${safeMemoryId}/original.${extension}`,
    normalizedMime
  };
}

export function buildMemoryVoicePath(archiveId: string, memoryId: string, file: File): { path: string; normalizedMime: string } {
  const safeArchiveId = validatePathSegment(archiveId, "Archive ID");
  const safeMemoryId = validatePathSegment(memoryId, "Memory ID");
  const { normalizedMime, extension } = validateAudioUpload(file, "Voice memory");

  return {
    path: `archives/${safeArchiveId}/memories/${safeMemoryId}/original.${extension}`,
    normalizedMime
  };
}

export function buildMemoryVideoPath(archiveId: string, memoryId: string, file: File): { path: string; normalizedMime: string } {
  const safeArchiveId = validatePathSegment(archiveId, "Archive ID");
  const safeMemoryId = validatePathSegment(memoryId, "Memory ID");
  const { normalizedMime, extension } = validateVideoUpload(file, "Video memory");

  return {
    path: `archives/${safeArchiveId}/memories/${safeMemoryId}/original.${extension}`,
    normalizedMime
  };
}

async function getArrayBuffer(file: File): Promise<Buffer> {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer);
}

export async function uploadArchiveCoverImage(archiveId: string, file: File): Promise<string> {
  const { path, normalizedMime } = buildArchiveCoverPath(archiveId, file);
  const bytes = await getArrayBuffer(file);
  const storage = getAdminStorage();

  const { error } = await storage.from(archiveMediaBucket).upload(path, bytes, {
    contentType: normalizedMime,
    upsert: true
  });

  if (error) {
    throw error;
  }

  return path;
}

export async function uploadMemoryPhoto(archiveId: string, memoryId: string, file: File): Promise<string> {
  const { path, normalizedMime } = buildMemoryPhotoPath(archiveId, memoryId, file);
  const bytes = await getArrayBuffer(file);
  const storage = getAdminStorage();

  const { error } = await storage.from(archiveMediaBucket).upload(path, bytes, {
    contentType: normalizedMime,
    upsert: true
  });

  if (error) {
    throw error;
  }

  return path;
}

export async function uploadMemoryVoice(archiveId: string, memoryId: string, file: File): Promise<string> {
  const { path, normalizedMime } = buildMemoryVoicePath(archiveId, memoryId, file);
  const bytes = await getArrayBuffer(file);
  const storage = getAdminStorage();

  const { error } = await storage.from(archiveMediaBucket).upload(path, bytes, {
    contentType: normalizedMime,
    upsert: true
  });

  if (error) {
    throw error;
  }

  return path;
}

export async function uploadMemoryVideo(archiveId: string, memoryId: string, file: File): Promise<string> {
  const { path, normalizedMime } = buildMemoryVideoPath(archiveId, memoryId, file);
  const bytes = await getArrayBuffer(file);
  const storage = getAdminStorage();

  const { error } = await storage.from(archiveMediaBucket).upload(path, bytes, {
    contentType: normalizedMime,
    upsert: true
  });

  if (error) {
    throw error;
  }

  return path;
}

export async function resolveStorageImageUrl(storagePath?: string | null, fallbackUrl?: string | null): Promise<string> {
  if (!storagePath) {
    return fallbackUrl || "";
  }

  try {
    const { data, error } = await getAdminStorage()
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

export async function deleteStorageObject(storagePath: string): Promise<boolean> {
  try {
    const { error } = await getAdminStorage()
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
