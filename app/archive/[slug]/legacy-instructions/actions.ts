"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveLegacyInstruction } from "@/lib/archive-data";
import {
  isLegacyInstructionAccessLevel
} from "@/lib/legacy-instructions";

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(slug: string, message: string): never {
  redirect(
    `/archive/${slug}/legacy-instructions?error=${encodeURIComponent(message)}`
  );
}

export async function saveLegacyInstructionsAction(
  slug: string,
  formData: FormData
) {
  const body = readRequiredString(formData, "body");
  const accessLevel = readRequiredString(formData, "accessLevel");

  if (!body) {
    redirectWithError(slug, "Legacy instructions are required.");
  }

  if (!isLegacyInstructionAccessLevel(accessLevel)) {
    redirectWithError(slug, "Please choose a valid access level.");
  }

  try {
    await saveLegacyInstruction({
      archiveSlug: slug,
      body,
      accessLevel
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save instructions.";
    redirectWithError(slug, message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/archive/${slug}`);
  revalidatePath(`/archive/${slug}/legacy-instructions`);
  redirect(`/archive/${slug}/legacy-instructions`);
}
