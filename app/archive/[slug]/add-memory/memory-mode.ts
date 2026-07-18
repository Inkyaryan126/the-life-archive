import type { MemoryType } from "@/lib/types";

export const addMemoryModes = [
  "voice-sound",
  "photo-video",
  "letter-journal"
] as const;

export type AddMemoryMode = (typeof addMemoryModes)[number];

export const memoryTypesByMode: Record<AddMemoryMode, MemoryType[]> = {
  "voice-sound": ["voice", "song"],
  "photo-video": ["photo", "video"],
  "letter-journal": ["journal"]
};

export const modeLabels: Record<AddMemoryMode, string> = {
  "voice-sound": "Add Voice & Sound",
  "photo-video": "Add Photos & Video",
  "letter-journal": "Write a Letter or Journal Entry"
};

export function isAddMemoryMode(value?: string): value is AddMemoryMode {
  return Boolean(value && addMemoryModes.includes(value as AddMemoryMode));
}

export function getModeForType(type?: string): AddMemoryMode | null {
  if (type === "voice" || type === "song") {
    return "voice-sound";
  }

  if (type === "photo" || type === "video") {
    return "photo-video";
  }

  if (type === "lesson" || type === "journal") {
    return "letter-journal";
  }

  return null;
}

export function resolveAddMemoryMode(input: {
  mode?: string;
  type?: string;
}): AddMemoryMode {
  if (isAddMemoryMode(input.mode)) {
    return input.mode;
  }

  return getModeForType(input.type) ?? "letter-journal";
}
