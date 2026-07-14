export const maxImageUploadBytes = 10 * 1024 * 1024;
export const maxAudioUploadBytes = 50 * 1024 * 1024;
export const maxAudioUploadMegabytes = maxAudioUploadBytes / (1024 * 1024);

export const acceptedAudioMimeTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac"
] as const;

export const acceptedAudioFormatLabel = "MP3, WAV, M4A, AAC, OGG, or WebM";
