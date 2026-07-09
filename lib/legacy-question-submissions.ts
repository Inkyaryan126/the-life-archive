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

export type LegacyQuestionEntryType =
  (typeof legacyQuestionEntryTypes)[number];
export type LegacyQuestionStatus = (typeof legacyQuestionStatuses)[number];

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
  mockArchiveSlug: string | null;
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
  mock_archive_slug: string | null;
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
  mockArchiveSlug?: string | null;
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
    mockArchiveSlug: row.mock_archive_slug,
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
      mock_archive_slug: input.mockArchiveSlug || null,
      submission_status: "captured",
      visibility: "private",
      consent_private_default: true,
      consent_contact: true
    })
    .select("id, mock_archive_slug")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: String(data.id),
    mockArchiveSlug: data.mock_archive_slug as string | null
  };
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
