"use server";

import { headers } from "next/headers";
import {
  createLegacyQuestionSubmission,
  isLegacyQuestionEntryType,
  markLegacyQuestionPart2Complete,
  type LegacyQuestionEntryType
} from "@/lib/legacy-question-submissions";
import { processLegacyQuestionSubmission } from "@/lib/legacy-question-onboarding";
import { validateAudioUpload } from "@/lib/storage-media";
import { VISITOR_ID_COOKIE_NAME } from "@/lib/site-visit-utils";
import {
  evaluateLegacyQuestionRateLimits,
  extractClientIp,
  recordSuccessfulEmailQuota
} from "@/lib/rate-limit";

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
      showPart2?: boolean;
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

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

function readOptionalAudioFile(formData: FormData) {
  const value = formData.get("audioFile");
  return value instanceof File && value.size > 0 ? value : null;
}

function parseDuration(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function submitLegacyQuestionEntryForm(
  formData: FormData
): Promise<LegacyQuestionSubmitResult> {
  return submitLegacyQuestionEntry({
    email: readString(formData, "email"),
    firstName: readString(formData, "firstName"),
    wantsReminders: readBoolean(formData, "wantsReminders"),
    entryType: readString(formData, "entryType"),
    textContent: readString(formData, "textContent"),
    durationSeconds: parseDuration(readString(formData, "durationSeconds")),
    source: readString(formData, "source"),
    cardBatch: readString(formData, "cardBatch"),
    mediaMimeType: readString(formData, "mediaMimeType"),
    audioFile: readOptionalAudioFile(formData)
  });
}

export async function submitLegacyQuestionEntry(
  input: LegacyQuestionSubmitInput & { audioFile?: File | null }
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

  const durationSeconds = normalizeDuration(input.durationSeconds);
  const audioFile = input.audioFile ?? null;

  if (entryType === "voice") {
    if (!audioFile) {
      return {
        success: false,
        message: "Record a voice memory before sending."
      };
    }

    try {
      validateAudioUpload(audioFile, "Voice memory");
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "That voice file is not supported."
      };
    }

    if (!durationSeconds || durationSeconds > 60) {
      return {
        success: false,
        message: "Keep voice memories to 60 seconds or less."
      };
    }
  }

  if (entryType === "video") {
    return {
      success: false,
      message: "Video is not ready for starter archives yet. Please write a memory or record a voice answer."
    };
  }

  const requestHeaders = await headers();
  const referrer = trimToNull(requestHeaders.get("referer"))?.slice(0, 500) ?? null;
  const userAgent = trimToNull(requestHeaders.get("user-agent"))?.slice(0, 500) ?? null;

  const clientIp = extractClientIp(requestHeaders);
  const cookieHeader = requestHeaders.get("cookie") ?? "";
  const visitorIdMatch = cookieHeader.match(new RegExp(`${VISITOR_ID_COOKIE_NAME}=([^;]+)`));
  const visitorId = visitorIdMatch ? visitorIdMatch[1] : null;

  const rateLimitResult = await evaluateLegacyQuestionRateLimits({
    clientIp,
    visitorId,
    email,
    cardBatch,
    entryType,
    textContent: entryType === "text" ? textContent : null,
    audioFile
  });

  if (!rateLimitResult.allowed) {
    return {
      success: false,
      message: "We're receiving a high volume of memories right now. Please wait a few minutes before trying again."
    };
  }

  let createdSubmissionId: string | null = null;

  try {
    const created = await createLegacyQuestionSubmission({
      email,
      firstName,
      wantsReminders: input.wantsReminders,
      entryType,
      textContent: entryType === "text" ? textContent : null,
      mediaStoragePath: null,
      durationSeconds,
      mediaMimeType: entryType === "voice" && audioFile ? audioFile.type : mediaMimeType,
      source,
      cardBatch,
      referrer,
      userAgent
    });

    createdSubmissionId = created.id;

    const processed = await processLegacyQuestionSubmission(created.id, {
      mediaFile: entryType === "voice" ? audioFile : null
    });
    const processingStatus = processed?.processingStatus ?? "failed";
    const isComplete = processingStatus === "email_sent";
    const isMediaPending = processingStatus === "media_pending";

    if (isComplete) {
      await recordSuccessfulEmailQuota(email);
    }

    if (!isComplete && entryType === "voice" && !processed?.firstMemoryId) {
      return {
        success: false,
        message: "We couldn't save that voice recording. Please try again, or write your memory for now."
      };
    }

    return {
      success: true,
      submissionId: created.id,
      showPart2: isComplete,
      message: isComplete
        ? "Your first memory is saved. Check your email for the secure link to your archive."
        : isMediaPending
          ? "That recording was captured, but secure upload is not ready. Please try again or write your memory for now."
          : "Your memory is safely captured, but we could not send the email yet. We'll retry it."
    };
  } catch (error) {
    const readableError =
      error instanceof Error ? error.message : "Unable to save your memory right now.";

    if (createdSubmissionId && entryType !== "voice") {
      return {
        success: true,
        submissionId: createdSubmissionId,
        showPart2: false,
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

export async function markProloguePart2CompleteAction(input: {
  submissionId: string;
  status: "completed" | "skipped";
}) {
  if (!input.submissionId) return;
  await markLegacyQuestionPart2Complete({
    submissionId: input.submissionId,
    status: input.status
  });
}
