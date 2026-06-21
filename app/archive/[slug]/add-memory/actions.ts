"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMemory, isMemoryType } from "@/lib/archive-data";
import { validateMemoryMediaUrl } from "@/lib/safe-url";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(slug: string, message: string): never {
  redirect(
    `/archive/${slug}/add-memory?error=${encodeURIComponent(message)}`
  );
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
  const date = readString(formData, "date");
  const tags = parseTags(readString(formData, "tags"));

  if (!title) {
    redirectWithError(slug, "Memory title is required.");
  }

  if (!type || !isMemoryType(type)) {
    redirectWithError(slug, "Memory type is required.");
  }

  if (!content && !mediaUrl) {
    redirectWithError(
      slug,
      "Add a written memory, an Unsplash photo link, or a Spotify song link."
    );
  }

  const mediaUrlValidation = validateMemoryMediaUrl(mediaUrl);

  if (!mediaUrlValidation.ok) {
    redirectWithError(slug, mediaUrlValidation.message);
  }

  const memory = await createMemory({
    archiveSlug: slug,
    title,
    type,
    content,
    mediaUrl: mediaUrlValidation.value,
    date,
    tags
  });

  if (!memory) {
    redirectWithError(slug, "Archive was not found.");
  }

  revalidatePath(`/archive/${slug}`);
  revalidatePath(`/archive/${slug}/memories`);
  revalidatePath(`/archive/${slug}/random`);
  redirect(`/archive/${slug}/memories?created=1`);
}
