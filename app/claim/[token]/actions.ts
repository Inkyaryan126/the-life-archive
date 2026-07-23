"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildLegacyQuestionClaimEmail } from "@/lib/legacy-question-claim-email";
import {
  getLegacyQuestionClaimOverviewByRawToken,
  issueLegacyQuestionClaimToken,
  markLegacyQuestionClaimTokenClaimed
} from "@/lib/legacy-question-claims";
import {
  validatePasswordConfirmation,
  validatePassword
} from "@/lib/auth-passwords";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLegacyQuestionSubmission, updateLegacyQuestionProcessing } from "@/lib/legacy-question-submissions";
import { sendEmail } from "@/lib/resend-email";
import {
  upsertProfileForUser,
  loadProfileByUserId,
  validateProfileDisplayName
} from "@/lib/profiles";

function readTrimmedString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readPasswordString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function redirectWithError(token: string, message: string): never {
  redirect(`/claim/${encodeURIComponent(token)}?error=${encodeURIComponent(message)}`);
}

function getClaimUrl(token: string) {
  return `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"}/claim/${token}`;
}

function getDisplayName(email: string, firstName: string | null) {
  const trimmed = firstName?.trim();

  if (trimmed) {
    return trimmed;
  }

  return email.split("@")[0] || "Your";
}

function getClaimMode(formData: FormData) {
  const value = formData.get("claimIntent");

  return typeof value === "string" && value === "continue"
    ? "continue"
    : "create";
}

async function getArchiveName(archiveId: string) {
  const supabase = createAdminClient();
  const result: any = await supabase
    .from("archives")
    .select("archive_name")
    .eq("id", archiveId)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data?.archive_name as string | undefined) ?? "Your Starter Life Archive";
}

async function sendClaimEmailForToken(
  claim: NonNullable<
    Awaited<ReturnType<typeof getLegacyQuestionClaimOverviewByRawToken>>
  >
) {
  const submission = await getLegacyQuestionSubmission(claim.row.submission_id);

  if (!submission) {
    throw new Error("Submission was not found.");
  }

  const archiveName = await getArchiveName(claim.row.archive_id);
  const claimToken = await issueLegacyQuestionClaimToken({
    submissionId: submission.id,
    archiveId: claim.row.archive_id,
    userId: claim.row.user_id,
    email: claim.row.email
  });
  const claimUrl = getClaimUrl(claimToken.rawToken);
  const email = buildLegacyQuestionClaimEmail({
    archiveName,
    displayName: getDisplayName(claim.row.email, submission.firstName),
    claimUrl,
    expiresAt: claimToken.expiresAt
  });

  try {
    await sendEmail({
      to: claim.row.email,
      ...email
    });

    await updateLegacyQuestionProcessing(submission.id, {
      invitationSentAt: new Date().toISOString(),
      welcomeEmailSentAt: new Date().toISOString(),
      processingStatus: "email_sent",
      processingStage: "email_sent",
      processingError: null
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to send a claim email.";

    await updateLegacyQuestionProcessing(submission.id, {
      processingStatus: "failed",
      processingStage: "email_send",
      processingError: message
    });

    throw error;
  }

  return claimToken;
}

export async function claimLegacyQuestionArchiveAction(formData: FormData) {
  const token = readTrimmedString(formData, "claimToken");
  const displayNameInput = readTrimmedString(formData, "displayName");
  const password = readPasswordString(formData, "password");
  const confirmPassword = readPasswordString(formData, "confirmPassword");
  const claimMode = getClaimMode(formData);

  if (!token) {
    redirect(`/login?error=${encodeURIComponent("That claim link expired or was already used.")}`);
  }

  const claim = await getLegacyQuestionClaimOverviewByRawToken(token);

  if (!claim || claim.claimStatus !== "active") {
    redirectWithError(token, "That claim link expired or was already used.");
  }

  const displayNameValidation = validateProfileDisplayName(displayNameInput);

  if (!displayNameValidation.ok) {
    redirectWithError(token, displayNameValidation.message);
  }

  if (claimMode === "create") {
    const confirmation = validatePasswordConfirmation(password, confirmPassword);

    if (!confirmation.ok) {
      redirectWithError(token, confirmation.message);
    }

    const passwordValidation = validatePassword(password);

    if (!passwordValidation.ok) {
      redirectWithError(token, passwordValidation.message);
    }
  }

  const supabase = await createClient();
  const {
    data: { user: sessionUser }
  } = await supabase.auth.getUser();
  const hasVerifiedExistingSession = sessionUser?.id === claim.row.user_id;
  let authenticatedUserId = sessionUser?.id ?? null;

  if (claimMode === "continue" && !hasVerifiedExistingSession) {
    redirectWithError(
      token,
      "Sign in with your password first, or create a new password to claim this archive."
    );
  }

  const admin = createAdminClient();
  if (!hasVerifiedExistingSession) {
    const { data: generated, error: generateError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: claim.row.email,
        options: {
          data: {
            onboarding_source: "legacy_question_claim"
          }
        }
      });

    if (generateError || !generated.user || !generated.properties?.hashed_token) {
      redirectWithError(token, generateError?.message || "Unable to authenticate the claim.");
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: generated.properties.hashed_token,
      type: generated.properties.verification_type as "magiclink"
    });

    if (verifyError) {
      redirectWithError(token, verifyError.message || "Unable to authenticate the claim.");
    }

    const { data: refreshedUser } = await supabase.auth.getUser();
    authenticatedUserId = refreshedUser.user?.id ?? null;
  }

  if (authenticatedUserId !== claim.row.user_id) {
    await supabase.auth.signOut();
    redirectWithError(token, "We could not match this claim to the correct account.");
  }

  const userId = authenticatedUserId;

  const existingProfile = await loadProfileByUserId(userId);
  const resolvedDisplayName =
    displayNameValidation.value ?? existingProfile?.displayName ?? null;

  if (claimMode === "create") {
    const passwordResult = validatePassword(password);

    if (!passwordResult.ok) {
      await supabase.auth.signOut();
      redirectWithError(token, passwordResult.message);
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password: passwordResult.value
    });

    if (passwordError) {
      await supabase.auth.signOut();
      const lowerMessage = passwordError.message.toLowerCase();
      redirectWithError(
        token,
        lowerMessage.includes("recent") || lowerMessage.includes("reauth")
          ? "Please sign in again and try claiming with a fresh secure link."
          : passwordError.message || "Unable to update the password."
      );
    }
  }

  try {
    await upsertProfileForUser(supabase, {
      userId,
      displayName: resolvedDisplayName,
      legacyQuestionEligible: true
    });

    const adminClient = createAdminClient();
    await (adminClient
      .from("legacy_question_submissions") as any)
      .update({ claimed_user_id: userId })
      .eq("id", claim.row.submission_id);
  } catch (error) {
    await supabase.auth.signOut();
    redirectWithError(
      token,
      error instanceof Error
        ? error.message
        : "Unable to save your profile right now."
    );
  }

  try {
    await markLegacyQuestionClaimTokenClaimed(claim.row.id);
  } catch (error) {
    await supabase.auth.signOut();
    const message =
      error instanceof Error ? error.message : "That claim link has already been used.";
    redirectWithError(token, message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/admin");
  revalidatePath("/admin/legacy-question");
  redirect("/dashboard?welcome=starter");
}

export async function requestFreshLegacyQuestionClaimEmailAction(
  formData: FormData
) {
  const token = readTrimmedString(formData, "claimToken");

  if (!token) {
    redirect(`/login?error=${encodeURIComponent("That claim link expired or was already used.")}`);
  }

  const claim = await getLegacyQuestionClaimOverviewByRawToken(token);

  if (!claim) {
    redirectWithError(token, "That claim link expired or was already used.");
  }

  try {
    await sendClaimEmailForToken(claim);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to send a fresh claim email.";
    redirectWithError(token, message);
  }

  revalidatePath(`/claim/${encodeURIComponent(token)}`);
  redirect(`/claim/${encodeURIComponent(token)}?success=reissued`);
}
