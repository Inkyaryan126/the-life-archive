"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { regenerateLegacyActivationCode } from "@/lib/archive-data";

import { createClient } from "@/lib/supabase/server";
import { markLegacyQuestionPart3Complete } from "@/lib/legacy-question-submissions";

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

export async function markProloguePart3CompleteAction(input: {
  status: "completed" | "skipped";
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await markLegacyQuestionPart3Complete({
    userId: user.id,
    status: input.status
  });

  revalidatePath("/dashboard");
}
