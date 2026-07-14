import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export const legacyQuestionEntryTypes = ["voice", "text", "video"] as const;
export const legacyQuestionStatuses = [
  "captured",
  "emailed",
  "archived",
  "failed"
] as const;
export const legacyQuestionProcessingStatuses = [
  "captured",
  "archive_created",
  "memory_created",
  "claim_link_created",
  "email_sent",
  "media_pending",
  "failed"
] as const;

export type LegacyQuestionEntryType =
  (typeof legacyQuestionEntryTypes)[number];
export type LegacyQuestionStatus = (typeof legacyQuestionStatuses)[number];
export type LegacyQuestionProcessingStatus =
  (typeof legacyQuestionProcessingStatuses)[number];

export type LegacyQuestionSubmission = {
  id: string;
  createdAt: string;
  email: string;
  firstName: string | null;
  wantsReminders: boolean;
  entryType: LegacyQuestionEntryType;
  textContent: string | null;
  mediaStoragePath: string | null;
  mediaMimeType: string | null;
  durationSeconds: number | null;
  source: string;
  cardBatch: string | null;
  referrer: string | null;
  userAgent: string | null;
  starterArchiveId: string | null;
  starterArchiveSlug: string | null;
  firstMemoryId: string | null;
  archiveCreatedAt: string | null;
  firstMemoryCreatedAt: string | null;
  invitationSentAt: string | null;
  welcomeEmailSentAt: string | null;
  processingStatus: LegacyQuestionProcessingStatus;
  processingStage: string | null;
  processingError: string | null;
  processingAttempts: number;
  lastProcessingAttemptAt: string | null;
  submissionStatus: LegacyQuestionStatus;
  visibility: "private" | "family" | "public";
  consentPrivateDefault: boolean;
  consentContact: boolean;
  notes: string;
};

type LegacyQuestionSubmissionRow = {
  id: string;
  created_at: string;
  email: string;
  first_name: string | null;
  wants_reminders: boolean;
  entry_type: LegacyQuestionEntryType;
  text_content: string | null;
  media_storage_path: string | null;
  media_mime_type: string | null;
  duration_seconds: number | null;
  source: string;
  card_batch: string | null;
  referrer: string | null;
  user_agent: string | null;
  starter_archive_id: string | null;
  starter_archive_slug: string | null;
  first_memory_id: string | null;
  archive_created_at: string | null;
  first_memory_created_at: string | null;
  invitation_sent_at: string | null;
  welcome_email_sent_at: string | null;
  processing_status: LegacyQuestionProcessingStatus;
  processing_stage: string | null;
  processing_error: string | null;
  processing_attempts: number;
  last_processing_attempt_at: string | null;
  submission_status: LegacyQuestionStatus;
  visibility: "private" | "family" | "public";
  consent_private_default: boolean;
  consent_contact: boolean;
  notes: string | null;
};

export type CreateLegacyQuestionSubmissionInput = {
  email: string;
  firstName?: string | null;
  wantsReminders: boolean;
  entryType: LegacyQuestionEntryType;
  textContent?: string | null;
  mediaStoragePath?: string | null;
  mediaMimeType?: string | null;
  durationSeconds?: number | null;
  source: string;
  cardBatch?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
};

function getAdminClient() {
  return createAdminClient() as SupabaseClient<any, "public", any>;
}

export function isLegacyQuestionEntryType(
  value: string
): value is LegacyQuestionEntryType {
  return legacyQuestionEntryTypes.includes(
    value as LegacyQuestionEntryType
  );
}

export function isLegacyQuestionStatus(
  value: string
): value is LegacyQuestionStatus {
  return legacyQuestionStatuses.includes(value as LegacyQuestionStatus);
}

export function isLegacyQuestionProcessingStatus(
  value: string
): value is LegacyQuestionProcessingStatus {
  return legacyQuestionProcessingStatuses.includes(
    value as LegacyQuestionProcessingStatus
  );
}

function mapSubmission(
  row: LegacyQuestionSubmissionRow
): LegacyQuestionSubmission {
  return {
    id: row.id,
    createdAt: row.created_at,
    email: row.email,
    firstName: row.first_name,
    wantsReminders: row.wants_reminders,
    entryType: row.entry_type,
    textContent: row.text_content,
    mediaStoragePath: row.media_storage_path,
    mediaMimeType: row.media_mime_type,
    durationSeconds: row.duration_seconds,
    source: row.source,
    cardBatch: row.card_batch,
    referrer: row.referrer,
    userAgent: row.user_agent,
    starterArchiveId: row.starter_archive_id,
    starterArchiveSlug: row.starter_archive_slug,
    firstMemoryId: row.first_memory_id,
    archiveCreatedAt: row.archive_created_at,
    firstMemoryCreatedAt: row.first_memory_created_at,
    invitationSentAt: row.invitation_sent_at,
    welcomeEmailSentAt: row.welcome_email_sent_at,
    processingStatus: row.processing_status ?? "captured",
    processingStage: row.processing_stage,
    processingError: row.processing_error,
    processingAttempts: row.processing_attempts ?? 0,
    lastProcessingAttemptAt: row.last_processing_attempt_at,
    submissionStatus: row.submission_status,
    visibility: row.visibility,
    consentPrivateDefault: row.consent_private_default,
    consentContact: row.consent_contact,
    notes: row.notes ?? ""
  };
}

export async function createLegacyQuestionSubmission(
  input: CreateLegacyQuestionSubmissionInput
) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("legacy_question_submissions")
    .insert({
      email: input.email,
      first_name: input.firstName || null,
      wants_reminders: input.wantsReminders,
      entry_type: input.entryType,
      text_content: input.textContent || null,
      media_storage_path: input.mediaStoragePath || null,
      media_mime_type: input.mediaMimeType || null,
      duration_seconds: input.durationSeconds ?? null,
      source: input.source,
      card_batch: input.cardBatch || null,
      referrer: input.referrer || null,
      user_agent: input.userAgent || null,
      submission_status: "captured",
      processing_status: "captured",
      processing_stage: "captured",
      visibility: "private",
      consent_private_default: true,
      consent_contact: true
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: String(data.id)
  };
}

export async function getLegacyQuestionSubmission(submissionId: string) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("legacy_question_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapSubmission(data as LegacyQuestionSubmissionRow) : null;
}

export async function listLegacyQuestionSubmissions(limit = 100) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("legacy_question_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 250)));

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as LegacyQuestionSubmissionRow[]).map(mapSubmission);
}

export async function updateLegacyQuestionSubmission(input: {
  submissionId: string;
  submissionStatus: LegacyQuestionStatus;
  notes: string;
}) {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("legacy_question_submissions")
    .update({
      submission_status: input.submissionStatus,
      notes: input.notes
    })
    .eq("id", input.submissionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateLegacyQuestionProcessing(
  submissionId: string,
  values: Partial<{
    mediaStoragePath: string | null;
    mediaMimeType: string | null;
    starterArchiveId: string | null;
    starterArchiveSlug: string | null;
    firstMemoryId: string | null;
    archiveCreatedAt: string | null;
    firstMemoryCreatedAt: string | null;
    invitationSentAt: string | null;
    welcomeEmailSentAt: string | null;
    processingStatus: LegacyQuestionProcessingStatus;
    processingStage: string | null;
    processingError: string | null;
    processingAttempts: number;
    lastProcessingAttemptAt: string | null;
    submissionStatus: LegacyQuestionStatus;
  }>
) {
  const supabase = getAdminClient();
  const update: Record<string, string | number | null> = {};

  if ("mediaStoragePath" in values) {
    update.media_storage_path = values.mediaStoragePath ?? null;
  }

  if ("mediaMimeType" in values) {
    update.media_mime_type = values.mediaMimeType ?? null;
  }

  if ("starterArchiveId" in values) {
    update.starter_archive_id = values.starterArchiveId ?? null;
  }

  if ("starterArchiveSlug" in values) {
    update.starter_archive_slug = values.starterArchiveSlug ?? null;
  }

  if ("firstMemoryId" in values) {
    update.first_memory_id = values.firstMemoryId ?? null;
  }

  if ("archiveCreatedAt" in values) {
    update.archive_created_at = values.archiveCreatedAt ?? null;
  }

  if ("firstMemoryCreatedAt" in values) {
    update.first_memory_created_at = values.firstMemoryCreatedAt ?? null;
  }

  if ("invitationSentAt" in values) {
    update.invitation_sent_at = values.invitationSentAt ?? null;
  }

  if ("welcomeEmailSentAt" in values) {
    update.welcome_email_sent_at = values.welcomeEmailSentAt ?? null;
  }

  if ("processingStatus" in values && values.processingStatus) {
    update.processing_status = values.processingStatus;
  }

  if ("processingStage" in values) {
    update.processing_stage = values.processingStage ?? null;
  }

  if ("processingError" in values) {
    update.processing_error = values.processingError ?? null;
  }

  if ("processingAttempts" in values && typeof values.processingAttempts === "number") {
    update.processing_attempts = values.processingAttempts;
  }

  if ("lastProcessingAttemptAt" in values) {
    update.last_processing_attempt_at = values.lastProcessingAttemptAt ?? null;
  }

  if ("submissionStatus" in values && values.submissionStatus) {
    update.submission_status = values.submissionStatus;
  }

  const { error } = await supabase
    .from("legacy_question_submissions")
    .update(update)
    .eq("id", submissionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteLegacyQuestionTestSubmission(submissionId: string) {
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc(
    "delete_legacy_question_test_submission",
    {
      target_submission_id: submissionId
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data as {
    submission_id: string;
    deleted_memories: number;
    deleted_archives: number;
    deleted_submissions: number;
  };
}
