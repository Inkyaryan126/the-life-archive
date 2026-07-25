export const maxImageUploadBytes = 10 * 1024 * 1024;
export const maxImageUploadMegabytes = maxImageUploadBytes / (1024 * 1024);

export const maxAudioUploadBytes = 50 * 1024 * 1024;
export const maxAudioUploadMegabytes = maxAudioUploadBytes / (1024 * 1024);

export const maxVideoUploadBytes = 50 * 1024 * 1024;
export const maxVideoUploadMegabytes = maxVideoUploadBytes / (1024 * 1024);

export const bucketMaxUploadBytes = 50 * 1024 * 1024;

export const acceptedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif"
] as const;

export const acceptedImageFormatLabel = "JPG, PNG, WebP, GIF, or AVIF";

export const acceptedAudioMimeTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac"
] as const;

export const acceptedAudioFormatLabel = "MP3, WAV, M4A, AAC, OGG, or WebM";

export const acceptedVideoMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska"
] as const;

export const acceptedVideoFormatLabel = "MP4, WebM, MOV, or MKV";
