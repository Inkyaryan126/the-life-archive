"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteMemoryForOwner } from "@/lib/archive-data";

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithDeleteError(slug: string, memoryId: string): never {
  redirect(
    `/archive/${encodeURIComponent(slug)}/memories/${encodeURIComponent(
      memoryId
    )}?deleteError=1`
  );
}

export async function deleteMemoryAction(formData: FormData) {
  const slug = readRequiredString(formData, "archiveSlug");
  const memoryId = readRequiredString(formData, "memoryId");

  if (!slug || !memoryId) {
    redirect("/");
  }

  try {
    await deleteMemoryForOwner({
      archiveSlug: slug,
      memoryId
    });
  } catch {
    redirectWithDeleteError(slug, memoryId);
  }

  revalidatePath(`/archive/${slug}`);
  revalidatePath(`/archive/${slug}/memories`);
  revalidatePath(`/archive/${slug}/memories/${memoryId}`);

  redirect(`/archive/${slug}/memories?deleted=1`);
}
