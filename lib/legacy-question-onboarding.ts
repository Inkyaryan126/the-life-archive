import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/qr";
import { sendEmail } from "@/lib/resend-email";
import { createAdminClient } from "@/lib/supabase/admin";
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getWelcomeEmail(input: {
  archiveName: string;
  displayName: string;
  secureLink: string;
}) {
  const subject = "Your Life Archive starter is waiting";
  const greeting = input.displayName === "Your" ? "Hello" : `Hello ${input.displayName}`;
  const escapedGreeting = escapeHtml(greeting);
  const escapedArchiveName = escapeHtml(input.archiveName);
  const escapedSecureLink = escapeHtml(input.secureLink);

  const text = `${greeting},

Your first memory has been preserved in The Life Archive.

Your starter archive, ${input.archiveName}, is waiting for you. Use the secure link below to claim it and continue building it with more stories, photos, songs, lessons, videos, and voice notes.

${input.secureLink}

This is a starter archive, not a finished archive. You can keep adding to it over time.

The Life Archive`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#11100e;color:#211912;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:640px;margin:0 auto;background:#f8f1e7;padding:36px 28px;">
      <p style="margin:0 0 14px;color:#8e6b2f;font:700 12px Arial,sans-serif;letter-spacing:0.16em;text-transform:uppercase;">The Life Archive</p>
      <h1 style="margin:0 0 18px;color:#211912;font-size:34px;line-height:1.1;">Your first memory has been preserved.</h1>
      <p style="margin:0 0 18px;color:#5f554a;font:16px/1.7 Arial,sans-serif;">${escapedGreeting},</p>
      <p style="margin:0 0 18px;color:#5f554a;font:16px/1.7 Arial,sans-serif;">Your starter archive, <strong>${escapedArchiveName}</strong>, is waiting for you. Use the secure link below to claim it and continue building it with more stories, photos, songs, lessons, videos, and voice notes.</p>
      <p style="margin:28px 0;">
        <a href="${escapedSecureLink}" style="display:inline-block;background:#c9a45c;color:#11100e;text-decoration:none;border-radius:999px;padding:14px 22px;font:700 15px Arial,sans-serif;">Claim my starter archive</a>
      </p>
      <p style="margin:0 0 18px;color:#5f554a;font:14px/1.7 Arial,sans-serif;">This is a starter archive, not a finished archive. You can keep adding to it over time.</p>
      <p style="margin:28px 0 0;color:#8e6b2f;font:700 12px Arial,sans-serif;letter-spacing:0.16em;text-transform:uppercase;">Preserve the voice, stories, and memories that should not disappear.</p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

async function generateSecureClaimLink(input: {
  email: string;
  firstName: string | null;
}) {
  const siteUrl = getSiteUrl();
  const redirectTo = `${siteUrl}/auth/callback`;
  const supabase = getAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: input.email,
    options: {
      redirectTo,
      data: {
        first_name: input.firstName ?? undefined,
        onboarding_source: "legacy_question"
      }
    }
  });

  if (error || !data.user || !data.properties?.action_link) {
    throw new Error(error?.message || "Unable to create secure claim link.");
  }

  return {
    actionLink: data.properties.action_link,
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

  if (!input.submission.textContent) {
    throw new Error("Text content is required to create the first memory.");
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("memories")
    .insert({
      archive_id: input.archive.id,
      title: "My first preserved memory",
      type: "journal",
      content: input.submission.textContent,
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

  return { id: data.id as string };
}

export async function processLegacyQuestionSubmission(submissionId: string) {
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

  if (submission.entryType !== "text") {
    await updateLegacyQuestionProcessing(submission.id, {
      processingStatus: "media_pending",
      processingStage: "media_pending",
      processingError:
        "Voice and video submissions are captured, but starter archive media upload support is not wired yet."
    });
    return getLegacyQuestionSubmission(submission.id);
  }

  try {
    currentStage = "claim_link_create";
    await updateLegacyQuestionProcessing(submission.id, {
      processingStage: currentStage
    });

    const claim = await generateSecureClaimLink({
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
      ownerId: claim.userId
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
      ownerId: claim.userId
    });
    const firstMemoryCreatedAt =
      refreshedAfterArchive.firstMemoryCreatedAt || new Date().toISOString();

    currentStage = "memory_created";
    await updateLegacyQuestionProcessing(submission.id, {
      firstMemoryId: memory.id,
      firstMemoryCreatedAt,
      processingStatus: "memory_created",
      processingStage: currentStage
    });

    if (!refreshedAfterArchive.welcomeEmailSentAt) {
      currentStage = "email_send";
      await updateLegacyQuestionProcessing(submission.id, {
        processingStage: currentStage
      });

      const email = getWelcomeEmail({
        archiveName: archive.archiveName,
        displayName: getDisplayName(submission),
        secureLink: claim.actionLink
      });

      await sendEmail({
        to: submission.email,
        ...email
      });
    }

    currentStage = "email_sent";
    await updateLegacyQuestionProcessing(submission.id, {
      welcomeEmailSentAt: new Date().toISOString(),
      processingStatus: "email_sent",
      processingStage: currentStage,
      submissionStatus: "archived",
      processingError: null
    });

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
