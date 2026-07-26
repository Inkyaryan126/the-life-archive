import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { issueLegacyQuestionClaimToken } from "@/lib/legacy-question-claims";
import { processSingleOnboardingEmailSend } from "@/lib/legacy-question-email-processor";
import {
  deleteStorageObject,
  uploadMemoryVoice,
  validateAudioUpload
} from "@/lib/storage-media";
import {
  getLegacyQuestionSubmission,
  updateLegacyQuestionProcessing,
  type LegacyQuestionSubmission
} from "@/lib/legacy-question-submissions";

type AdminClient = SupabaseClient<any, "public", any>;

type ArchiveResult = {
  id: string;
  slug: string;
  archiveName: string;
};

const defaultProfilePhotoUrl =
  "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80";

function getAdminClient() {
  return createAdminClient() as AdminClient;
}

function getDisplayName(submission: LegacyQuestionSubmission) {
  const firstName = submission.firstName?.trim();

  if (firstName) {
    return firstName;
  }

  return submission.email.split("@")[0] || "Your";
}

function getStarterSlug(submission: LegacyQuestionSubmission) {
  if (submission.starterArchiveSlug) {
    return submission.starterArchiveSlug;
  }

  return `starter-${submission.id.replace(/-/g, "").slice(0, 16)}`;
}

function getReadableError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown onboarding error.";

  return message
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sb_secret_[A-Za-z0-9._-]+/gi, "[redacted]")
    .replace(/re_[A-Za-z0-9._-]+/gi, "[redacted]")
    .slice(0, 700);
}

async function resolveLegacyQuestionAuthUser(input: {
  email: string;
  firstName: string | null;
}) {
  const supabase = getAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: input.email,
    options: {
      data: {
        first_name: input.firstName ?? undefined,
        onboarding_source: "legacy_question"
      }
    }
  });

  if (error || !data.user) {
    throw new Error(error?.message || "Unable to resolve the archive owner.");
  }

  return {
    userId: data.user.id
  };
}

async function ensureStarterArchive(input: {
  submission: LegacyQuestionSubmission;
  ownerId: string;
}) {
  const supabase = getAdminClient();

  if (input.submission.starterArchiveId) {
    const { data: existing, error } = await supabase
      .from("archives")
      .select("id, slug, archive_name")
      .eq("id", input.submission.starterArchiveId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (existing) {
      return {
        id: existing.id as string,
        slug: existing.slug as string,
        archiveName: existing.archive_name as string
      };
    }
  }

  const { data: bySubmission, error: lookupError } = await supabase
    .from("archives")
    .select("id, slug, archive_name")
    .eq("legacy_question_submission_id", input.submission.id)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  if (bySubmission) {
    return {
      id: bySubmission.id as string,
      slug: bySubmission.slug as string,
      archiveName: bySubmission.archive_name as string
    };
  }

  const displayName = getDisplayName(input.submission);
  const archiveName =
    displayName === "Your"
      ? "Your Starter Life Archive"
      : `${displayName}'s Starter Life Archive`;
  const slug = getStarterSlug(input.submission);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("archives")
    .insert({
      owner_id: input.ownerId,
      slug,
      archive_name: archiveName,
      person_name: displayName,
      bio: "A starter archive created from the first memory shared through The Life Archive.",
      profile_photo_url: defaultProfilePhotoUrl,
      profile_photo_path: null,
      visibility: "private",
      memorial_mode: false,
      is_demo: false,
      relationship_to_owner: "self",
      legacy_question_submission_id: input.submission.id,
      created_at: now,
      updated_at: now
    })
    .select("id, slug, archive_name")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to create starter archive.");
  }

  return {
    id: data.id as string,
    slug: data.slug as string,
    archiveName: data.archive_name as string
  };
}

async function ensureFirstMemory(input: {
  submission: LegacyQuestionSubmission;
  archive: ArchiveResult;
  ownerId: string;
  mediaFile?: File | null;
}) {
  const supabase = getAdminClient();

  if (input.submission.firstMemoryId) {
    const { data: existing, error } = await supabase
      .from("memories")
      .select("id")
      .eq("id", input.submission.firstMemoryId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (existing) {
      return { id: existing.id as string };
    }
  }

  const { data: bySubmission, error: lookupError } = await supabase
    .from("memories")
    .select("id")
    .eq("legacy_question_submission_id", input.submission.id)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  if (bySubmission) {
    return { id: bySubmission.id as string };
  }

  if (input.submission.entryType === "voice" && !input.mediaFile) {
    throw new Error("Voice content is required to create the first memory.");
  }

  if (input.submission.entryType === "video") {
    throw new Error("Video starter memories are not ready yet.");
  }

  if (input.submission.entryType === "text" && !input.submission.textContent) {
    throw new Error("Text content is required to create the first memory.");
  }

  const now = new Date().toISOString();
  const isVoice = input.submission.entryType === "voice";
  const memoryContent = isVoice
    ? "Voice answer recorded from the Legacy Question."
    : input.submission.textContent;

  const { data, error } = await supabase
    .from("memories")
    .insert({
      archive_id: input.archive.id,
      title: isVoice ? "My first voice memory" : "My first preserved memory",
      type: isVoice ? "voice" : "journal",
      content: memoryContent,
      media_url: null,
      photo_path: null,
      memory_date: now.slice(0, 10),
      tags: ["legacy-question", "starter"],
      created_by: input.ownerId,
      legacy_question_submission_id: input.submission.id,
      created_at: now,
      updated_at: now
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to create first memory.");
  }

  const memoryId = data.id as string;

  if (!isVoice) {
    return { id: memoryId };
  }

  const mediaFile = input.mediaFile;

  if (!mediaFile) {
    await supabase.from("memories").delete().eq("id", memoryId);
    throw new Error("Voice content is required to create the first memory.");
  }

  let filePath: string | null = null;

  try {
    validateAudioUpload(mediaFile, "Voice memory");
    filePath = await uploadMemoryVoice(input.archive.id, memoryId, mediaFile);

    const { data: updatedMemory, error: updateError } = await supabase
      .from("memories")
      .update({
        photo_path: filePath,
        media_url: null
      })
      .eq("id", memoryId)
      .select("id")
      .single();

    if (updateError || !updatedMemory) {
      throw updateError || new Error("Memory could not be created.");
    }
  } catch (error) {
    if (filePath) {
      await deleteStorageObject(filePath);
    }

    await supabase.from("memories").delete().eq("id", memoryId);

    throw error instanceof Error
      ? error
      : new Error("We couldn't save that voice file. Please try again.");
  }

  return { id: memoryId, mediaStoragePath: filePath, mediaMimeType: mediaFile.type };
}

async function ensureClaimToken(input: {
  submissionId: string;
  archiveId: string;
  userId: string;
  email: string;
}) {
  const supabase = getAdminClient();
  const { data: existingClaim } = await supabase
    .from("legacy_question_claim_tokens")
    .select("*")
    .eq("submission_id", input.submissionId)
    .is("claimed_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (existingClaim) {
    return existingClaim;
  }

  return issueLegacyQuestionClaimToken(input);
}

export async function processLegacyQuestionSubmission(
  submissionId: string,
  options: { mediaFile?: File | null } = {}
) {
  const submission = await getLegacyQuestionSubmission(submissionId);

  if (!submission) {
    throw new Error("Submission was not found.");
  }

  if (
    submission.processingStatus === "email_sent" &&
    submission.welcomeEmailSentAt
  ) {
    return submission;
  }

  const attemptNumber = submission.processingAttempts + 1;
  const attemptStartedAt = new Date().toISOString();
  let currentStage = "captured";

  await updateLegacyQuestionProcessing(submission.id, {
    processingAttempts: attemptNumber,
    lastProcessingAttemptAt: attemptStartedAt,
    processingStage: "captured",
    processingError: null
  });

  if (submission.entryType === "video") {
    await updateLegacyQuestionProcessing(submission.id, {
      processingStatus: "media_pending",
      processingStage: "media_pending",
      processingError:
        "Video submissions are captured, but starter archive media upload support is not wired yet."
    });
    return getLegacyQuestionSubmission(submission.id);
  }

  try {
    currentStage = "claim_link_create";
    await updateLegacyQuestionProcessing(submission.id, {
      processingStage: currentStage
    });

    const owner = await resolveLegacyQuestionAuthUser({
      email: submission.email,
      firstName: submission.firstName
    });

    currentStage = "claim_link_created";
    await updateLegacyQuestionProcessing(submission.id, {
      invitationSentAt: submission.invitationSentAt || new Date().toISOString(),
      processingStatus: "claim_link_created",
      processingStage: currentStage
    });

    currentStage = "archive_create";
    await updateLegacyQuestionProcessing(submission.id, {
      processingStage: currentStage
    });

    const archive = await ensureStarterArchive({
      submission,
      ownerId: owner.userId
    });
    const archiveCreatedAt = submission.archiveCreatedAt || new Date().toISOString();

    currentStage = "archive_created";
    await updateLegacyQuestionProcessing(submission.id, {
      starterArchiveId: archive.id,
      starterArchiveSlug: archive.slug,
      archiveCreatedAt,
      processingStatus: "archive_created",
      processingStage: currentStage
    });

    const refreshedAfterArchive =
      (await getLegacyQuestionSubmission(submission.id)) ?? submission;
    currentStage = "memory_create";
    await updateLegacyQuestionProcessing(submission.id, {
      processingStage: currentStage
    });

    const memory = await ensureFirstMemory({
      submission: refreshedAfterArchive,
      archive,
      ownerId: owner.userId,
      mediaFile: options.mediaFile ?? null
    });
    const firstMemoryCreatedAt =
      refreshedAfterArchive.firstMemoryCreatedAt || new Date().toISOString();

    currentStage = "memory_created";
    await updateLegacyQuestionProcessing(submission.id, {
      firstMemoryId: memory.id,
      mediaStoragePath: memory.mediaStoragePath ?? refreshedAfterArchive.mediaStoragePath,
      mediaMimeType: memory.mediaMimeType ?? refreshedAfterArchive.mediaMimeType,
      firstMemoryCreatedAt,
      processingStatus: "memory_created",
      processingStage: currentStage
    });

    // Ensure canonical claim token
    currentStage = "claim_link_create";
    await ensureClaimToken({
      submissionId: submission.id,
      archiveId: archive.id,
      userId: owner.userId,
      email: submission.email
    });

    // Send onboarding email via processor
    currentStage = "email_send";
    await updateLegacyQuestionProcessing(submission.id, {
      processingStage: currentStage
    });

    await processSingleOnboardingEmailSend(submission.id);

    return getLegacyQuestionSubmission(submission.id);
  } catch (error) {
    const readableError = getReadableError(error);

    console.error("legacy_question_onboarding_failed", {
      submissionId: submission.id,
      processingAttempt: attemptNumber,
      error: readableError
    });

    await updateLegacyQuestionProcessing(submission.id, {
      processingStatus: "failed",
      processingStage: currentStage,
      submissionStatus: "failed",
      processingError: readableError
    });

    return getLegacyQuestionSubmission(submission.id);
  }
}
