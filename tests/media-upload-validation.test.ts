import assert from "node:assert/strict";
import {
  audioExtensionByMimeType,
  buildArchiveCoverPath,
  buildMemoryPhotoPath,
  buildMemoryVideoPath,
  buildMemoryVoicePath,
  imageExtensionByMimeType,
  normalizeMimeType,
  validateAudioUpload,
  validateImageUpload,
  validatePathSegment,
  validateVideoUpload,
  videoExtensionByMimeType
} from "../lib/storage-media";
import {
  acceptedAudioMimeTypes,
  acceptedImageMimeTypes,
  acceptedVideoMimeTypes,
  maxAudioUploadBytes,
  maxImageUploadBytes,
  maxVideoUploadBytes
} from "../lib/media-upload-constants";

function createMockFile(options: { size: number; type: string; name?: string }): File {
  return {
    name: options.name ?? "test-file",
    size: options.size,
    type: options.type,
    arrayBuffer: async () => new ArrayBuffer(options.size)
  } as unknown as File;
}

const archiveId = "550e8400-e29b-41d4-a716-446655440000";
const memoryId = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

{
  // 1. Zero-byte file rejection
  const zeroByteFile = createMockFile({ size: 0, type: "image/jpeg" });
  assert.throws(
    () => validateImageUpload(zeroByteFile, "Test image"),
    /cannot be empty/
  );
  assert.throws(
    () => validateAudioUpload(zeroByteFile, "Test audio"),
    /cannot be empty/
  );
  assert.throws(
    () => validateVideoUpload(zeroByteFile, "Test video"),
    /cannot be empty/
  );
}

{
  // 2. Oversized image rejection (> 10 MB)
  const oversizedImage = createMockFile({
    size: maxImageUploadBytes + 1,
    type: "image/png"
  });
  assert.throws(
    () => validateImageUpload(oversizedImage, "Cover photo"),
    /smaller than 10 MB/
  );
}

{
  // 3. Oversized audio rejection (> 50 MB)
  const oversizedAudio = createMockFile({
    size: maxAudioUploadBytes + 1,
    type: "audio/mpeg"
  });
  assert.throws(
    () => validateAudioUpload(oversizedAudio, "Voice memory"),
    /smaller than 50 MB/
  );
}

{
  // 4. Oversized video rejection (> 50 MB)
  const oversizedVideo = createMockFile({
    size: maxVideoUploadBytes + 1,
    type: "video/mp4"
  });
  assert.throws(
    () => validateVideoUpload(oversizedVideo, "Video memory"),
    /smaller than 50 MB/
  );
}

{
  // 5. application/octet-stream rejection
  const octetStreamFile = createMockFile({
    size: 1024,
    type: "application/octet-stream"
  });
  assert.throws(
    () => validateImageUpload(octetStreamFile, "Photo"),
    /supported image format/
  );
  assert.throws(
    () => validateAudioUpload(octetStreamFile, "Voice"),
    /supported audio format/
  );
  assert.throws(
    () => validateVideoUpload(octetStreamFile, "Video"),
    /supported video format/
  );
}

{
  // 6. Unknown MIME rejection
  const unknownMimeFile = createMockFile({
    size: 1024,
    type: "application/x-msdownload"
  });
  assert.throws(
    () => validateImageUpload(unknownMimeFile, "Photo"),
    /supported image format/
  );
}

{
  // 7. MIME parameter normalization
  assert.equal(normalizeMimeType("audio/webm;codecs=opus"), "audio/webm");
  assert.equal(normalizeMimeType("image/png; quality=0.8"), "image/png");
}

{
  // 8. Uppercase MIME normalization
  assert.equal(normalizeMimeType("Audio/MP4"), "audio/mp4");
  assert.equal(normalizeMimeType("IMAGE/JPEG"), "image/jpeg");
}

{
  // 9. All approved image MIME types
  for (const mime of acceptedImageMimeTypes) {
    const file = createMockFile({ size: 1024, type: mime });
    const result = validateImageUpload(file, "Photo");
    assert.equal(result.normalizedMime, mime);
    assert.equal(result.extension, imageExtensionByMimeType[mime]);
  }
}

{
  // 10. All approved audio MIME types
  for (const mime of acceptedAudioMimeTypes) {
    const file = createMockFile({ size: 1024, type: mime });
    const result = validateAudioUpload(file, "Voice");
    assert.equal(result.normalizedMime, mime);
    assert.equal(result.extension, audioExtensionByMimeType[mime]);
  }
}

{
  // 11. All approved video MIME types
  for (const mime of acceptedVideoMimeTypes) {
    const file = createMockFile({ size: 1024, type: mime });
    const result = validateVideoUpload(file, "Video");
    assert.equal(result.normalizedMime, mime);
    assert.equal(result.extension, videoExtensionByMimeType[mime]);
  }
}

{
  // 12. Correct MIME-to-extension mappings
  assert.equal(imageExtensionByMimeType["image/jpeg"], "jpg");
  assert.equal(imageExtensionByMimeType["image/png"], "png");
  assert.equal(imageExtensionByMimeType["image/webp"], "webp");
  assert.equal(imageExtensionByMimeType["image/gif"], "gif");
  assert.equal(imageExtensionByMimeType["image/avif"], "avif");

  assert.equal(audioExtensionByMimeType["audio/mpeg"], "mp3");
  assert.equal(audioExtensionByMimeType["audio/wav"], "wav");
  assert.equal(audioExtensionByMimeType["audio/webm"], "webm");
  assert.equal(audioExtensionByMimeType["audio/mp4"], "m4a");

  assert.equal(videoExtensionByMimeType["video/mp4"], "mp4");
  assert.equal(videoExtensionByMimeType["video/webm"], "webm");
  assert.equal(videoExtensionByMimeType["video/quicktime"], "mov");
  assert.equal(videoExtensionByMimeType["video/x-matroska"], "mkv");
}

{
  // 13. No fallback extension behavior (throws on unmapped MIME)
  const unmappedFile = createMockFile({ size: 1024, type: "image/bmp" });
  assert.throws(
    () => validateImageUpload(unmappedFile, "Photo"),
    /supported image format/
  );
}

{
  // 14. Path traversal rejection
  assert.throws(
    () => validatePathSegment("../etc/passwd", "Archive ID"),
    /invalid/
  );
  assert.throws(
    () => validatePathSegment("archive/../secret", "Archive ID"),
    /invalid/
  );
  assert.throws(
    () => validatePathSegment("archive\u0000bad", "Archive ID"),
    /invalid/
  );
}

{
  // 15. Slash and backslash rejection
  assert.throws(
    () => validatePathSegment("archive/123", "Archive ID"),
    /invalid/
  );
  assert.throws(
    () => validatePathSegment("archive\\123", "Archive ID"),
    /invalid/
  );
}

{
  // 16. Invalid UUID / identifier format rejection
  assert.throws(
    () => validatePathSegment("not a valid id!@#$", "Archive ID"),
    /format is invalid/
  );
  assert.throws(
    () => validatePathSegment("", "Archive ID"),
    /cannot be empty/
  );
}

{
  // 17. Valid path generation
  const imageFile = createMockFile({ size: 1024, type: "image/png" });
  const coverResult = buildArchiveCoverPath(archiveId, imageFile);
  assert.equal(coverResult.path, `archives/${archiveId}/cover/original.png`);
  assert.equal(coverResult.normalizedMime, "image/png");

  const photoResult = buildMemoryPhotoPath(archiveId, memoryId, imageFile);
  assert.equal(
    photoResult.path,
    `archives/${archiveId}/memories/${memoryId}/original.png`
  );
  assert.equal(photoResult.normalizedMime, "image/png");

  const voiceFile = createMockFile({
    size: 1024,
    type: "audio/webm;codecs=opus"
  });
  const voiceResult = buildMemoryVoicePath(archiveId, memoryId, voiceFile);
  assert.equal(
    voiceResult.path,
    `archives/${archiveId}/memories/${memoryId}/original.webm`
  );
  assert.equal(voiceResult.normalizedMime, "audio/webm");

  const videoFile = createMockFile({ size: 1024, type: "video/mp4" });
  const videoResult = buildMemoryVideoPath(archiveId, memoryId, videoFile);
  assert.equal(
    videoResult.path,
    `archives/${archiveId}/memories/${memoryId}/original.mp4`
  );
  assert.equal(videoResult.normalizedMime, "video/mp4");
}

console.log("media-upload-validation tests passed cleanly!");
