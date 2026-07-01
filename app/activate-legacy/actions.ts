"use server";

import { redirect } from "next/navigation";
import { submitLegacyActivation } from "@/lib/legacy-activation";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string): never {
  redirect(`/activate-legacy?error=${encodeURIComponent(message)}`);
}

export async function submitLegacyActivationAction(formData: FormData) {
  const code = readString(formData, "code");
  const requesterName = readString(formData, "requesterName");
  const relationshipToOwner = readString(formData, "relationshipToOwner");
  const message = readString(formData, "message");

  try {
    await submitLegacyActivation({
      code,
      requesterName,
      relationshipToOwner,
      message
    });
  } catch (error) {
    const fallback = "We could not submit that activation request.";
    redirectWithError(error instanceof Error ? error.message : fallback);
  }

  redirect("/activate-legacy?submitted=1");
}
