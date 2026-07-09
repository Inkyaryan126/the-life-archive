"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/admin";
import {
  isLegacyQuestionStatus,
  updateLegacyQuestionSubmission
} from "@/lib/legacy-question-submissions";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string): never {
  redirect(`/admin/legacy-question?error=${encodeURIComponent(message)}`);
}

export async function updateLegacyQuestionSubmissionAction(
  formData: FormData
) {
  const { isAdmin } = await getAdminAccess();

  if (!isAdmin) {
    redirectWithError("You do not have access to update submissions.");
  }

  const submissionId = readString(formData, "submissionId");
  const submissionStatus = readString(formData, "submissionStatus");
  const notes = readString(formData, "notes");

  if (!submissionId) {
    redirectWithError("Submission ID is missing.");
  }

  if (!isLegacyQuestionStatus(submissionStatus)) {
    redirectWithError("Choose a valid submission status.");
  }

  try {
    await updateLegacyQuestionSubmission({
      submissionId,
      submissionStatus,
      notes
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update submission.";
    redirectWithError(message);
  }

  revalidatePath("/admin/legacy-question");
  redirect("/admin/legacy-question?success=updated");
}
