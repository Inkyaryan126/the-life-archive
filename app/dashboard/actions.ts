"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { regenerateLegacyActivationCode } from "@/lib/archive-data";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function regenerateLegacyActivationCodeAction(formData: FormData) {
  const slug = readString(formData, "archiveSlug");

  if (!slug) {
    redirect("/dashboard?legacyCodeError=missing");
  }

  try {
    await regenerateLegacyActivationCode(slug);
  } catch {
    redirect("/dashboard?legacyCodeError=failed");
  }

  revalidatePath("/dashboard");
  revalidatePath("/member-card");
  redirect("/dashboard?legacyCode=regenerated");
}
