"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildLegacyQuestionClaimEmail } from "@/lib/legacy-question-claim-email";
import { issueLegacyQuestionClaimToken } from "@/lib/legacy-question-claims";
import { getAdminAccess } from "@/lib/admin";
import { processLegacyQuestionSubmission } from "@/lib/legacy-question-onboarding";
import { processSingleOnboardingEmailSend } from "@/lib/legacy-question-email-processor";
import {
  deleteLegacyQuestionTestSubmission,
  isLegacyQuestionStatus,
  updateLegacyQuestionProcessing,
  getLegacyQuestionSubmission,
  updateLegacyQuestionSubmission
} from "@/lib/legacy-question-submissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend-email";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string): never {
  redirect(`/admin/legacy-question?error=${encodeURIComponent(message)}`);
}

function getDisplayName(email: string, firstName: string | null) {
  const trimmed = firstName?.trim();

  if (trimmed) {
    return trimmed;
  }

  return email.split("@")[0] || "Your";
}

async function getArchiveNameAndOwner(submissionId: string) {
  const submission = await getLegacyQuestionSubmission(submissionId);

  if (!submission) {
    throw new Error("Submission was not found.");
  }

  const supabase = createAdminClient();
  const directLookup: any = submission.starterArchiveId
    ? await supabase
        .from("archives")
        .select("id, archive_name, owner_id")
        .eq("id", submission.starterArchiveId)
        .maybeSingle()
    : { data: null, error: null };

  const fallbackLookup: any = await supabase
    .from("archives")
    .select("id, archive_name, owner_id")
    .eq("legacy_question_submission_id", submission.id)
    .maybeSingle();

  const archiveRow = directLookup.data ?? fallbackLookup.data;
  const archiveLookupError = directLookup.error ?? fallbackLookup.error;

  if (archiveLookupError) {
    throw new Error(archiveLookupError.message || "Unable to find the starter archive.");
  }

  if (!archiveRow || !archiveRow.owner_id) {
    throw new Error("The starter archive is missing its owner.");
  }

  return {
    submission,
    archive: {
      id: archiveRow.id as string,
      archiveName: archiveRow.archive_name as string,
      ownerId: archiveRow.owner_id as string
    }
  };
}

async function sendFreshClaimEmailForSubmission(submissionId: string) {
  const { submission } = await getArchiveNameAndOwner(submissionId);
  const supabase: any = createAdminClient();

  // Reset status to pending for immediate manual retry without inflating max attempts
  await supabase
    .from("legacy_question_submissions")
    .update({
      email_status: "pending",
      email_next_attempt_at: new Date().toISOString(),
      email_error_category: null,
      email_error_code: null,
      email_error_message: null
    })
    .eq("id", submission.id);

  console.info({
    event: "legacy_question_email_manual_retry_requested",
    submissionId: submission.id
  });

  await processSingleOnboardingEmailSend(submission.id);
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

export async function retryLegacyQuestionSubmissionAction(formData: FormData) {
  const { isAdmin } = await getAdminAccess();

  if (!isAdmin) {
    redirectWithError("You do not have access to retry submissions.");
  }

  const submissionId = readString(formData, "submissionId");

  if (!submissionId) {
    redirectWithError("Submission ID is missing.");
  }

  try {
    await processLegacyQuestionSubmission(submissionId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to retry submission.";
    redirectWithError(message);
  }

  revalidatePath("/admin/legacy-question");
  redirect("/admin/legacy-question?success=retried");
}

export async function sendFreshLegacyQuestionClaimEmailAction(
  formData: FormData
) {
  const { isAdmin } = await getAdminAccess();

  if (!isAdmin) {
    redirectWithError("You do not have access to reissue claim emails.");
  }

  const submissionId = readString(formData, "submissionId");

  if (!submissionId) {
    redirectWithError("Submission ID is missing.");
  }

  try {
    await sendFreshClaimEmailForSubmission(submissionId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to send a fresh claim email.";
    redirectWithError(message);
  }

  revalidatePath("/admin/legacy-question");
  redirect("/admin/legacy-question?success=claim_reissued");
}

export async function deleteLegacyQuestionTestSubmissionAction(
  formData: FormData
) {
  const { isAdmin } = await getAdminAccess();

  if (!isAdmin) {
    redirectWithError("You do not have access to delete submissions.");
  }

  const submissionId = readString(formData, "submissionId");
  const confirmation = readString(formData, "deleteConfirmation");

  if (!submissionId) {
    redirectWithError("Submission ID is missing.");
  }

  if (confirmation !== "DELETE TEST") {
    redirectWithError("Type DELETE TEST to confirm test submission deletion.");
  }

  let result: Awaited<ReturnType<typeof deleteLegacyQuestionTestSubmission>>;

  try {
    result = await deleteLegacyQuestionTestSubmission(submissionId);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete test submission.";
    redirectWithError(message);
  }

  revalidatePath("/admin/legacy-question");
  redirect(
    `/admin/legacy-question?success=${encodeURIComponent(
      `deleted:${result.deleted_submissions}:${result.deleted_archives}:${result.deleted_memories}`
    )}`
  );
}
