"use server";

import { headers } from "next/headers";
import {
  createLegacyQuestionSubmission,
  isLegacyQuestionEntryType,
  type LegacyQuestionEntryType
} from "@/lib/legacy-question-submissions";
import { processLegacyQuestionSubmission } from "@/lib/legacy-question-onboarding";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const textMinLength = 20;
const textMaxLength = 2000;

export type LegacyQuestionSubmitInput = {
  email: string;
  firstName?: string;
  wantsReminders: boolean;
  entryType: string;
  textContent?: string;
  durationSeconds?: number | null;
  source?: string;
  cardBatch?: string | null;
  mediaMimeType?: string | null;
};

export type LegacyQuestionSubmitResult =
  | {
      success: true;
      submissionId: string;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

function trimToNull(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed || null;
}

function sanitizeSource(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-") ?? "";

  return trimmed.slice(0, 80) || "legacy_question_page";
}

function sanitizeCardBatch(value: string | null | undefined) {
  const trimmed = value?.trim().replace(/[^a-zA-Z0-9_-]/g, "-") ?? "";

  return trimmed.slice(0, 80) || null;
}

function normalizeDuration(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(60, Math.round(value)));
}

export async function submitLegacyQuestionEntry(
  input: LegacyQuestionSubmitInput
): Promise<LegacyQuestionSubmitResult> {
  const email = input.email.trim().toLowerCase();
  const firstName = trimToNull(input.firstName);
  const textContent = trimToNull(input.textContent);
  const source = sanitizeSource(input.source);
  const cardBatch = sanitizeCardBatch(input.cardBatch);
  const mediaMimeType = trimToNull(input.mediaMimeType)?.slice(0, 120) ?? null;

  if (!emailPattern.test(email)) {
    return {
      success: false,
      message: "Enter a valid email address."
    };
  }

  if (!isLegacyQuestionEntryType(input.entryType)) {
    return {
      success: false,
      message: "Choose voice, writing, or video before sending."
    };
  }

  const entryType: LegacyQuestionEntryType = input.entryType;

  if (entryType === "text") {
    if (!textContent || textContent.length < textMinLength) {
      return {
        success: false,
        message: "Write at least 20 characters before sending your memory."
      };
    }

    if (textContent.length > textMaxLength) {
      return {
        success: false,
        message: "Keep written memories under 2,000 characters for this first version."
      };
    }
  }

  const requestHeaders = await headers();
  const referrer = trimToNull(requestHeaders.get("referer"))?.slice(0, 500) ?? null;
  const userAgent = trimToNull(requestHeaders.get("user-agent"))?.slice(0, 500) ?? null;

  let createdSubmissionId: string | null = null;

  try {
    const created = await createLegacyQuestionSubmission({
      email,
      firstName,
      wantsReminders: input.wantsReminders,
      entryType,
      textContent: entryType === "text" ? textContent : null,
      mediaStoragePath: null,
      mediaMimeType,
      durationSeconds: normalizeDuration(input.durationSeconds),
      source,
      cardBatch,
      referrer,
      userAgent
    });

    createdSubmissionId = created.id;

    const processed = await processLegacyQuestionSubmission(created.id);
    const processingStatus = processed?.processingStatus ?? "failed";
    const isComplete = processingStatus === "email_sent";
    const isMediaPending = processingStatus === "media_pending";

    return {
      success: true,
      submissionId: created.id,
      message: isComplete
        ? "Your first memory is saved. Check your email for the secure link to your archive."
        : isMediaPending
          ? "Your memory is captured. Voice and video starter archives are pending secure media upload support."
          : "Your memory is safely captured, but we could not send the email yet. We'll retry it."
    };
  } catch (error) {
    const readableError =
      error instanceof Error ? error.message : "Unable to save your memory right now.";

    if (createdSubmissionId) {
      return {
        success: true,
        submissionId: createdSubmissionId,
        message:
          "Your memory is safely captured, but we could not send the email yet. We'll retry it."
      };
    }

    return {
      success: false,
      message: readableError
    };
  }
}
