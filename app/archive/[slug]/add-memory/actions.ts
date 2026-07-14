"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMemory, isMemoryType } from "@/lib/archive-data";
import {
  acceptedAudioFormatLabel,
  maxAudioUploadMegabytes
} from "@/lib/media-upload-constants";
import { validateMemoryMediaUrl } from "@/lib/safe-url";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function getUploadErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("must be smaller than") && message.includes("MB")) {
    return `This file is larger than the maximum allowed size of ${maxAudioUploadMegabytes} MB. Trim or compress the recording, then upload it again.`;
  }

  if (message.includes("supported audio file")) {
    return `This audio format is not supported. Please upload ${acceptedAudioFormatLabel} audio.`;
  }

  if (message.includes("couldn't save that voice file")) {
    return "The upload was interrupted before it finished. Your memory was not saved. Please try again.";
  }

  if (message.includes("couldn't save that photo")) {
    return "The upload was interrupted before it finished. Your memory was not saved. Please try again.";
  }

  return message || "We could not save this memory. Nothing was lost, but the upload did not complete.";
}

function redirectWithError(slug: string, message: string, values?: Record<string, string>): never {
  const params = new URLSearchParams({ error: message });

  for (const [key, value] of Object.entries(values ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  redirect(`/archive/${slug}/add-memory?${params.toString()}`);
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function addMemoryAction(slug: string, formData: FormData) {
  const title = readString(formData, "title");
  const type = readString(formData, "type");
  const content = readString(formData, "content");
  const mediaUrl = readString(formData, "mediaUrl");
  const mediaFile = readOptionalFile(formData, "mediaFile");
  const date = readString(formData, "date");
  const tags = parseTags(readString(formData, "tags"));
  const submittedValues = {
    title,
    type,
    content,
    mediaUrl,
    date,
    tags: tags.join(", ")
  };

  if (!title) {
    redirectWithError(slug, "Memory title is required.", submittedValues);
  }

  if (!type || !isMemoryType(type)) {
    redirectWithError(slug, "Memory type is required.", submittedValues);
  }

  if (!content && !mediaUrl && !mediaFile) {
    redirectWithError(
      slug,
      "Add a written memory, a photo upload, a voice upload, an Unsplash photo link, a hosted voice link, or a Spotify song link.",
      submittedValues
    );
  }

  const mediaUrlValidation = validateMemoryMediaUrl(mediaUrl);

  if (!mediaUrlValidation.ok) {
    redirectWithError(slug, mediaUrlValidation.message, submittedValues);
  }

  let memory: Awaited<ReturnType<typeof createMemory>> | null = null;

  try {
    memory = await createMemory({
      archiveSlug: slug,
      title,
      type,
      content,
      mediaUrl: mediaUrlValidation.value,
      mediaFile,
      date,
      tags
    });
  } catch (error) {
    redirectWithError(
      slug,
      getUploadErrorMessage(error),
      submittedValues
    );
  }

  if (!memory) {
    redirectWithError(slug, "Archive was not found.", submittedValues);
  }

  revalidatePath(`/archive/${slug}`);
  revalidatePath(`/archive/${slug}/memories`);
  revalidatePath(`/archive/${slug}/random`);
  redirect(`/archive/${slug}/memories?created=1`);
}
