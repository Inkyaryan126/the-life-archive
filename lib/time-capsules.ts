import "server-only";

import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { maskEmailAddress } from "@/lib/auth-passwords";
import { getFallbackDisplayName, loadProfileByUserId } from "@/lib/profiles";
import { validateMemoryMediaUrl } from "@/lib/safe-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { resolveStorageImageUrl } from "@/lib/storage-media";
import {
  convertLocalDeliveryDateToUtc,
  TimeCapsuleDomainError,
  type ScheduleDeliveryDateInput
} from "@/lib/time-capsule-scheduling";
import type { MemoryType } from "@/lib/types";

export {
  convertLocalDeliveryDateToUtc,
  parseTimeCapsuleDateParts,
  parseTimeCapsuleTimeParts,
  TimeCapsuleDomainError
} from "@/lib/time-capsule-scheduling";

type PublicClient = SupabaseClient<any, "public", any>;

export const timeCapsuleStatuses = [
  "scheduled",
  "processing",
  "delivered",
  "failed",
  "canceled"
] as const;

export type TimeCapsuleStatus = (typeof timeCapsuleStatuses)[number];

export type CreateScheduledMemoryDeliveryInput = ScheduleDeliveryDateInput & {
  archiveId: string;
  memoryId: string;
  recipientName: string;
  recipientEmail: string;
  personalNote?: string | null;
};

export type UpdateScheduledMemoryDeliveryInput = ScheduleDeliveryDateInput & {
  deliveryId: string;
  recipientName: string;
  recipientEmail: string;
  personalNote?: string | null;
};

export type OwnerTimeCapsuleListItem = {
  id: string;
  archive: {
    id: string;
    name: string;
    slug: string;
    personName: string;
  };
  memory: {
    id: string;
    title: string;
    type: MemoryType;
  } | null;
  recipientName: string;
  recipientEmail: string;
  recipientEmailDisplay: string;
  personalNote: string | null;
  timezone: string;
  scheduledFor: string;
  status: TimeCapsuleStatus;
  attemptCount: number;
  maxAttempts: number;
  deliveredAt: string | null;
  canceledAt: string | null;
  failedAt: string | null;
  nextAttemptAt: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OwnerTimeCapsuleDetail = OwnerTimeCapsuleListItem;

export type ClaimedTimeCapsuleDelivery = {
  id: string;
  archiveId: string;
  memoryId: string | null;
  ownerId: string;
  recipientName: string;
  recipientEmail: string;
  personalNote: string | null;
  timezone: string;
  scheduledFor: string;
  attemptCount: number;
  maxAttempts: number;
};

export type PreparedTimeCapsuleDelivery = ClaimedTimeCapsuleDelivery & {
  resendEmailId: string | null;
  archive: {
    id: string;
    name: string;
    slug: string;
    personName: string;
  };
  memory: {
    id: string;
    title: string;
    type: MemoryType;
  };
  ownerDisplayName: string;
};

export type TimeCapsuleTokenPreparation = {
  deliveryId: string;
  rawToken: string;
  tokenCreatedAt: string;
};

export type TimeCapsuleProviderAcceptance = {
  deliveryId: string;
  resendEmailId: string;
  acceptedAt: string;
};

export type PublicDeliveredTimeCapsule =
  | {
      status: "available";
      delivery: {
        id: string;
        archive: {
          id: string;
          name: string;
          slug: string;
          personName: string;
        };
        ownerDisplayName: string;
        recipientName: string;
        memory: {
          id: string;
          title: string;
          type: MemoryType;
          content: string;
          mediaUrl: string;
          date: string | null;
          tags: string[];
        };
        personalNote: string | null;
        timezone: string;
        scheduledFor: string;
        deliveredAt: string;
      };
    }
  | {
      status: "unavailable";
    };

type DeliveryRow = {
  id: string;
  archive_id: string;
  memory_id: string | null;
  owner_id: string;
  recipient_name: string;
  recipient_email: string;
  personal_note: string | null;
  timezone: string;
  scheduled_for: string;
  status: TimeCapsuleStatus;
  token_hash: string | null;
  token_created_at: string | null;
  processing_started_at: string | null;
  delivered_at: string | null;
  canceled_at: string | null;
  failed_at: string | null;
  attempt_count: number;
  max_attempts: number;
  last_attempt_at: string | null;
  next_attempt_at: string | null;
  resend_email_id: string | null;
  last_error_code: string | null;
  last_error_message: string | null;
  created_at: string;
  updated_at: string;
};

type ArchiveIdentityRow = {
  id: string;
  slug: string;
  archive_name: string;
  person_name: string;
  owner_id: string;
};

type MemoryIdentityRow = {
  id: string;
  archive_id: string;
  title: string;
  type: MemoryType;
};

type MemoryDeliveryRow = MemoryIdentityRow & {
  content: string | null;
  media_url: string | null;
  photo_path: string | null;
  memory_date: string | null;
  tags: string[] | null;
};

type ClaimDueScheduledMemoryDeliveryRow = {
  id: string;
  archive_id: string;
  memory_id: string | null;
  owner_id: string;
  recipient_name: string;
  recipient_email: string;
  personal_note: string | null;
  timezone: string;
  scheduled_for: string;
  attempt_count: number;
  max_attempts: number;
};

type TimeCapsuleDiagnosticStage =
  | "auth"
  | "validation"
  | "ownership"
  | "delivery_create"
  | "delivery_read"
  | "delivery_update"
  | "delivery_cancel"
  | "delivery_retry"
  | "claim_due"
  | "prepare_send"
  | "token_prepare"
  | "provider_acceptance"
  | "mark_delivered"
  | "mark_failed"
  | "public_resolve";

const deliveryColumns = `
  id,
  archive_id,
  memory_id,
  owner_id,
  recipient_name,
  recipient_email,
  personal_note,
  timezone,
  scheduled_for,
  status,
  token_hash,
  token_created_at,
  processing_started_at,
  delivered_at,
  canceled_at,
  failed_at,
  attempt_count,
  max_attempts,
  last_attempt_at,
  next_attempt_at,
  resend_email_id,
  last_error_code,
  last_error_message,
  created_at,
  updated_at
`;

const archiveColumns = "id, slug, archive_name, person_name, owner_id";
const memoryIdentityColumns = "id, archive_id, title, type";
const memoryDeliveryColumns =
  "id, archive_id, title, type, content, media_url, photo_path, memory_date, tags";
const maxRecipientNameLength = 120;
const maxRecipientEmailLength = 320;
const maxPersonalNoteLength = 500;
const maxResendEmailIdLength = 160;
const maxErrorCodeLength = 80;
const maxErrorMessageLength = 300;
const tokenBytes = 32;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const tokenPattern = /^[A-Za-z0-9_-]{32,128}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getAdminClient() {
  return createAdminClient() as PublicClient;
}

async function getAuthenticatedContext() {
  const supabase = (await createClient()) as PublicClient;
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new TimeCapsuleDomainError(
      "authentication_required",
      "Sign in to manage time capsules."
    );
  }

  return { supabase, user };
}

function sanitizeDiagnosticMessage(value: unknown) {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const rawMessage =
    value instanceof Error
      ? value.message
      : typeof record.message === "string"
        ? record.message
        : typeof value === "string"
          ? value
          : "Unknown error";

  return rawMessage
    .replace(/https?:\/\/\S+/g, "[url]")
    .replace(/[A-Za-z0-9+/=_-]{48,}/g, "[redacted]")
    .slice(0, maxErrorMessageLength);
}

function getErrorDiagnosticFields(error: unknown) {
  const record =
    typeof error === "object" && error !== null
      ? (error as Record<string, unknown>)
      : {};
  const code =
    typeof record.code === "string" || typeof record.code === "number"
      ? String(record.code).slice(0, maxErrorCodeLength)
      : undefined;
  const status =
    typeof record.status === "string" || typeof record.status === "number"
      ? record.status
      : undefined;
  const statusCode =
    typeof record.statusCode === "string" ||
    typeof record.statusCode === "number"
      ? record.statusCode
      : undefined;

  return {
    errorName: error instanceof Error ? error.name : typeof error,
    errorMessage: sanitizeDiagnosticMessage(error),
    ...(code ? { code } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(statusCode !== undefined ? { statusCode } : {})
  };
}

function logTimeCapsuleFailure(input: {
  archiveId?: string | null;
  attemptCount?: number | null;
  deliveryId?: string | null;
  error: unknown;
  memoryId?: string | null;
  stage: TimeCapsuleDiagnosticStage;
  status?: TimeCapsuleStatus | null;
}) {
  console.error({
    event: "time_capsule_domain_failed",
    stage: input.stage,
    ...(input.deliveryId ? { deliveryId: input.deliveryId } : {}),
    ...(input.archiveId ? { archiveId: input.archiveId } : {}),
    ...(input.memoryId ? { memoryId: input.memoryId } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.attemptCount !== undefined && input.attemptCount !== null
      ? { attemptCount: input.attemptCount }
      : {}),
    ...getErrorDiagnosticFields(input.error)
  });
}

function assertUuid(value: string, fieldName: string) {
  if (!uuidPattern.test(value)) {
    throw new TimeCapsuleDomainError(
      "invalid_identifier",
      `${fieldName} is invalid.`
    );
  }
}

function normalizeRecipientName(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    throw new TimeCapsuleDomainError(
      "invalid_recipient_name",
      "Enter the recipient's name."
    );
  }

  if (normalized.length > maxRecipientNameLength) {
    throw new TimeCapsuleDomainError(
      "invalid_recipient_name",
      `Recipient name must be ${maxRecipientNameLength} characters or fewer.`
    );
  }

  return normalized;
}

function normalizeRecipientEmail(value: string) {
  const normalized = value.trim().toLowerCase();

  if (
    !normalized ||
    normalized.length > maxRecipientEmailLength ||
    !emailPattern.test(normalized)
  ) {
    throw new TimeCapsuleDomainError(
      "invalid_recipient_email",
      "Enter a valid recipient email address."
    );
  }

  return normalized;
}

function normalizePersonalNote(value?: string | null) {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? "";

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxPersonalNoteLength) {
    throw new TimeCapsuleDomainError(
      "invalid_personal_note",
      `Personal note must be ${maxPersonalNoteLength} characters or fewer.`
    );
  }

  return normalized;
}

function hashTimeCapsuleToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function generateTimeCapsuleToken() {
  const rawToken = crypto.randomBytes(tokenBytes).toString("base64url");

  return {
    rawToken,
    tokenHash: hashTimeCapsuleToken(rawToken)
  };
}

function safeTokenHashCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getSafeMemoryMediaUrl(value?: string | null) {
  const validation = validateMemoryMediaUrl(value || "");
  return validation.ok && validation.value ? validation.value : undefined;
}

function assertTimeCapsuleStatus(value: string): TimeCapsuleStatus {
  if (timeCapsuleStatuses.includes(value as TimeCapsuleStatus)) {
    return value as TimeCapsuleStatus;
  }

  throw new TimeCapsuleDomainError(
    "invalid_delivery_status",
    "Delivery status is invalid."
  );
}

function mapDeliveryRow(row: DeliveryRow): DeliveryRow {
  return {
    ...row,
    status: assertTimeCapsuleStatus(row.status)
  };
}

function sanitizeErrorCode(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, maxErrorCodeLength);

  return normalized || "delivery_failed";
}

function sanitizeErrorMessage(value: string) {
  return sanitizeDiagnosticMessage(value).slice(0, maxErrorMessageLength);
}

function getRetryDelayMinutes(row: Pick<DeliveryRow, "attempt_count" | "max_attempts">) {
  if (row.attempt_count >= row.max_attempts) {
    return null;
  }

  return row.attempt_count <= 1 ? 15 : 60;
}

async function loadOwnedArchive(
  supabase: PublicClient,
  userId: string,
  archiveId: string
) {
  assertUuid(archiveId, "Archive");

  const { data, error } = await supabase
    .from("archives")
    .select(archiveColumns)
    .eq("id", archiveId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new TimeCapsuleDomainError(
      "archive_not_found",
      "Archive not found."
    );
  }

  return data as ArchiveIdentityRow;
}

async function loadMemoryForArchive(
  supabase: PublicClient,
  archiveId: string,
  memoryId: string
) {
  assertUuid(memoryId, "Memory");

  const { data, error } = await supabase
    .from("memories")
    .select(memoryIdentityColumns)
    .eq("id", memoryId)
    .eq("archive_id", archiveId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new TimeCapsuleDomainError(
      "memory_not_found",
      "Memory not found."
    );
  }

  return data as MemoryIdentityRow;
}

async function loadDeliveryForOwner(
  supabase: PublicClient,
  userId: string,
  deliveryId: string
) {
  assertUuid(deliveryId, "Delivery");

  const { data, error } = await supabase
    .from("scheduled_memory_deliveries")
    .select(deliveryColumns)
    .eq("id", deliveryId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new TimeCapsuleDomainError(
      "delivery_not_found",
      "Time capsule not found."
    );
  }

  return mapDeliveryRow(data as DeliveryRow);
}

function assertDeliveryNotAcceptedYet(row: DeliveryRow) {
  if (row.resend_email_id) {
    throw new TimeCapsuleDomainError(
      "delivery_already_accepted",
      "This time capsule has already been accepted by the email provider."
    );
  }
}

async function hydrateOwnerDeliveryRows(
  supabase: PublicClient,
  rows: DeliveryRow[]
): Promise<OwnerTimeCapsuleListItem[]> {
  const archiveIds = [...new Set(rows.map((row) => row.archive_id))];
  const memoryIds = [
    ...new Set(rows.map((row) => row.memory_id).filter(Boolean) as string[])
  ];
  const archiveMap = new Map<string, ArchiveIdentityRow>();
  const memoryMap = new Map<string, MemoryIdentityRow>();

  if (archiveIds.length > 0) {
    const { data, error } = await supabase
      .from("archives")
      .select(archiveColumns)
      .in("id", archiveIds);

    if (error) {
      throw error;
    }

    for (const archive of (data ?? []) as ArchiveIdentityRow[]) {
      archiveMap.set(archive.id, archive);
    }
  }

  if (memoryIds.length > 0) {
    const { data, error } = await supabase
      .from("memories")
      .select(memoryIdentityColumns)
      .in("id", memoryIds);

    if (error) {
      throw error;
    }

    for (const memory of (data ?? []) as MemoryIdentityRow[]) {
      memoryMap.set(memory.id, memory);
    }
  }

  return rows.map((row) => {
    const archive = archiveMap.get(row.archive_id);
    const memory = row.memory_id ? memoryMap.get(row.memory_id) ?? null : null;

    return {
      id: row.id,
      archive: {
        id: row.archive_id,
        name: archive?.archive_name ?? "Archive unavailable",
        slug: archive?.slug ?? "",
        personName: archive?.person_name ?? ""
      },
      memory: memory
        ? {
            id: memory.id,
            title: memory.title,
            type: memory.type
          }
        : null,
      recipientName: row.recipient_name,
      recipientEmail: row.recipient_email,
      recipientEmailDisplay: maskEmailAddress(row.recipient_email),
      personalNote: row.personal_note,
      timezone: row.timezone,
      scheduledFor: row.scheduled_for,
      status: row.status,
      attemptCount: row.attempt_count,
      maxAttempts: row.max_attempts,
      deliveredAt: row.delivered_at,
      canceledAt: row.canceled_at,
      failedAt: row.failed_at,
      nextAttemptAt: row.next_attempt_at,
      lastErrorCode: row.last_error_code,
      lastErrorMessage: row.last_error_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  });
}

async function getOwnerDisplayName(ownerId: string, fallbackName: string) {
  const supabase = getAdminClient();
  const profile = await loadProfileByUserId(ownerId);
  const { data } = await supabase.auth.admin.getUserById(ownerId);

  return getFallbackDisplayName({
    profileDisplayName: profile?.displayName,
    metadata: data.user?.user_metadata as Record<string, unknown> | null,
    email: data.user?.email ?? null
  }) || fallbackName;
}

async function getOwnerDeliveryView(
  supabase: PublicClient,
  row: DeliveryRow
) {
  const [view] = await hydrateOwnerDeliveryRows(supabase, [row]);
  return view;
}

export async function createScheduledMemoryDelivery(
  input: CreateScheduledMemoryDeliveryInput
) {
  const { supabase, user } = await getAuthenticatedContext();

  try {
    const archive = await loadOwnedArchive(supabase, user.id, input.archiveId);
    await loadMemoryForArchive(supabase, archive.id, input.memoryId);
    const recipientName = normalizeRecipientName(input.recipientName);
    const recipientEmail = normalizeRecipientEmail(input.recipientEmail);
    const personalNote = normalizePersonalNote(input.personalNote);
    const { scheduledFor, timezone } = convertLocalDeliveryDateToUtc(input);

    const { data, error } = await supabase
      .from("scheduled_memory_deliveries")
      .insert({
        archive_id: archive.id,
        memory_id: input.memoryId,
        owner_id: user.id,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        personal_note: personalNote,
        timezone,
        scheduled_for: scheduledFor
      })
      .select(deliveryColumns)
      .single();

    if (error || !data) {
      throw error || new Error("Scheduled delivery could not be created.");
    }

    return getOwnerDeliveryView(supabase, mapDeliveryRow(data as DeliveryRow));
  } catch (error) {
    logTimeCapsuleFailure({
      archiveId: input.archiveId,
      error,
      memoryId: input.memoryId,
      stage:
        error instanceof TimeCapsuleDomainError &&
        error.code.startsWith("invalid")
          ? "validation"
          : "delivery_create"
    });
    throw error;
  }
}

export async function listOwnerScheduledMemoryDeliveries() {
  const { supabase } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("scheduled_memory_deliveries")
    .select(deliveryColumns)
    .order("created_at", { ascending: false });

  if (error) {
    logTimeCapsuleFailure({ error, stage: "delivery_read" });
    throw error;
  }

  return hydrateOwnerDeliveryRows(
    supabase,
    ((data ?? []) as DeliveryRow[]).map(mapDeliveryRow)
  );
}

export async function getOwnerScheduledMemoryDelivery(deliveryId: string) {
  const { supabase, user } = await getAuthenticatedContext();

  try {
    const row = await loadDeliveryForOwner(supabase, user.id, deliveryId);
    return getOwnerDeliveryView(supabase, row);
  } catch (error) {
    logTimeCapsuleFailure({
      deliveryId,
      error,
      stage: "delivery_read"
    });
    throw error;
  }
}

export async function updatePendingScheduledMemoryDelivery(
  input: UpdateScheduledMemoryDeliveryInput
) {
  const { supabase, user } = await getAuthenticatedContext();
  const admin = getAdminClient();

  try {
    const row = await loadDeliveryForOwner(supabase, user.id, input.deliveryId);

    if (row.status !== "scheduled") {
      throw new TimeCapsuleDomainError(
        "delivery_not_editable",
        "Only scheduled time capsules can be edited."
      );
    }

    assertDeliveryNotAcceptedYet(row);

    const recipientName = normalizeRecipientName(input.recipientName);
    const recipientEmail = normalizeRecipientEmail(input.recipientEmail);
    const personalNote = normalizePersonalNote(input.personalNote);
    const { scheduledFor, timezone } = convertLocalDeliveryDateToUtc(input);

    const { data, error } = await admin
      .from("scheduled_memory_deliveries")
      .update({
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        personal_note: personalNote,
        timezone,
        scheduled_for: scheduledFor
      })
      .eq("id", row.id)
      .eq("owner_id", user.id)
      .eq("status", "scheduled")
      .select(deliveryColumns)
      .single();

    if (error || !data) {
      throw error || new Error("Scheduled delivery could not be updated.");
    }

    return getOwnerDeliveryView(supabase, mapDeliveryRow(data as DeliveryRow));
  } catch (error) {
    logTimeCapsuleFailure({
      deliveryId: input.deliveryId,
      error,
      stage:
        error instanceof TimeCapsuleDomainError &&
        error.code.startsWith("invalid")
          ? "validation"
          : "delivery_update"
    });
    throw error;
  }
}

export async function cancelScheduledMemoryDelivery(deliveryId: string) {
  const { supabase, user } = await getAuthenticatedContext();
  const admin = getAdminClient();

  try {
    const row = await loadDeliveryForOwner(supabase, user.id, deliveryId);

    if (row.status === "canceled") {
      return getOwnerDeliveryView(supabase, row);
    }

    if (row.status !== "scheduled" && row.status !== "failed") {
      throw new TimeCapsuleDomainError(
        "delivery_not_cancelable",
        "This time capsule cannot be canceled."
      );
    }

    assertDeliveryNotAcceptedYet(row);

    const { data, error } = await admin
      .from("scheduled_memory_deliveries")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        processing_started_at: null,
        next_attempt_at: null
      })
      .eq("id", row.id)
      .eq("owner_id", user.id)
      .in("status", ["scheduled", "failed"])
      .select(deliveryColumns)
      .single();

    if (error || !data) {
      throw error || new Error("Scheduled delivery could not be canceled.");
    }

    return getOwnerDeliveryView(supabase, mapDeliveryRow(data as DeliveryRow));
  } catch (error) {
    logTimeCapsuleFailure({
      deliveryId,
      error,
      stage: "delivery_cancel"
    });
    throw error;
  }
}

export async function requestManualScheduledMemoryDeliveryRetry(
  deliveryId: string
) {
  const { supabase, user } = await getAuthenticatedContext();
  const admin = getAdminClient();

  try {
    const row = await loadDeliveryForOwner(supabase, user.id, deliveryId);

    if (row.status !== "failed") {
      throw new TimeCapsuleDomainError(
        "delivery_not_retryable",
        "Only failed time capsules can be retried."
      );
    }

    assertDeliveryNotAcceptedYet(row);

    const { data, error } = await admin
      .from("scheduled_memory_deliveries")
      .update({
        status: "scheduled",
        attempt_count: 0,
        processing_started_at: null,
        failed_at: null,
        last_attempt_at: null,
        next_attempt_at: new Date().toISOString(),
        token_hash: null,
        token_created_at: null,
        resend_email_id: null,
        last_error_code: null,
        last_error_message: null
      })
      .eq("id", row.id)
      .eq("owner_id", user.id)
      .eq("status", "failed")
      .select(deliveryColumns)
      .single();

    if (error || !data) {
      throw error || new Error("Scheduled delivery could not be retried.");
    }

    return getOwnerDeliveryView(supabase, mapDeliveryRow(data as DeliveryRow));
  } catch (error) {
    logTimeCapsuleFailure({
      deliveryId,
      error,
      stage: "delivery_retry"
    });
    throw error;
  }
}

export async function claimDueScheduledMemoryDeliveries(limit = 10) {
  const targetLimit = Math.max(1, Math.min(Math.floor(limit), 50));
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc(
    "claim_due_scheduled_memory_deliveries",
    {
      target_limit: targetLimit
    }
  );

  if (error) {
    logTimeCapsuleFailure({ error, stage: "claim_due" });
    throw error;
  }

  return ((data ?? []) as ClaimDueScheduledMemoryDeliveryRow[]).map((row) => ({
    id: row.id,
    archiveId: row.archive_id,
    memoryId: row.memory_id,
    ownerId: row.owner_id,
    recipientName: row.recipient_name,
    recipientEmail: row.recipient_email,
    personalNote: row.personal_note,
    timezone: row.timezone,
    scheduledFor: row.scheduled_for,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts
  }));
}

async function loadArchiveIdentityById(
  supabase: PublicClient,
  archiveId: string
) {
  const { data, error } = await supabase
    .from("archives")
    .select(archiveColumns)
    .eq("id", archiveId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? (data as ArchiveIdentityRow) : null;
}

async function loadMemoryDeliveryById(
  supabase: PublicClient,
  memoryId: string
) {
  const { data, error } = await supabase
    .from("memories")
    .select(memoryDeliveryColumns)
    .eq("id", memoryId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? (data as MemoryDeliveryRow) : null;
}

export async function loadClaimedScheduledMemoryDeliveryForSend(
  deliveryId: string
): Promise<PreparedTimeCapsuleDelivery> {
  assertUuid(deliveryId, "Delivery");
  const supabase = getAdminClient();

  try {
    const { data, error } = await supabase
      .from("scheduled_memory_deliveries")
      .select(deliveryColumns)
      .eq("id", deliveryId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new TimeCapsuleDomainError(
        "delivery_not_found",
        "Time capsule not found."
      );
    }

    const row = mapDeliveryRow(data as DeliveryRow);

    if (row.status !== "processing") {
      throw new TimeCapsuleDomainError(
        "delivery_not_processing",
        "Time capsule is not ready to send."
      );
    }

    assertDeliveryNotAcceptedYet(row);

    if (!row.memory_id) {
      throw new TimeCapsuleDomainError(
        "memory_unavailable",
        "The selected memory is no longer available."
      );
    }

    const [archive, memory] = await Promise.all([
      loadArchiveIdentityById(supabase, row.archive_id),
      loadMemoryDeliveryById(supabase, row.memory_id)
    ]);

    if (!archive) {
      throw new TimeCapsuleDomainError(
        "archive_unavailable",
        "The archive is no longer available."
      );
    }

    if (!memory || memory.archive_id !== row.archive_id) {
      throw new TimeCapsuleDomainError(
        "memory_unavailable",
        "The selected memory is no longer available."
      );
    }

    return {
      id: row.id,
      archiveId: row.archive_id,
      memoryId: row.memory_id,
      ownerId: row.owner_id,
      recipientName: row.recipient_name,
      recipientEmail: row.recipient_email,
      personalNote: row.personal_note,
      timezone: row.timezone,
      scheduledFor: row.scheduled_for,
      attemptCount: row.attempt_count,
      maxAttempts: row.max_attempts,
      resendEmailId: row.resend_email_id,
      archive: {
        id: archive.id,
        name: archive.archive_name,
        slug: archive.slug,
        personName: archive.person_name
      },
      memory: {
        id: memory.id,
        title: memory.title,
        type: memory.type
      },
      ownerDisplayName: await getOwnerDisplayName(
        row.owner_id,
        archive.person_name
      )
    };
  } catch (error) {
    logTimeCapsuleFailure({
      deliveryId,
      error,
      stage: "prepare_send"
    });
    throw error;
  }
}

export async function prepareSecureScheduledMemoryDeliveryToken(
  deliveryId: string
): Promise<TimeCapsuleTokenPreparation> {
  assertUuid(deliveryId, "Delivery");
  const supabase = getAdminClient();

  try {
    const { data: existing, error: readError } = await supabase
      .from("scheduled_memory_deliveries")
      .select("id, status, resend_email_id")
      .eq("id", deliveryId)
      .maybeSingle();

    if (readError) {
      throw readError;
    }

    if (!existing) {
      throw new TimeCapsuleDomainError(
        "delivery_not_found",
        "Time capsule not found."
      );
    }

    if (existing.status !== "processing") {
      throw new TimeCapsuleDomainError(
        "delivery_not_processing",
        "Time capsule is not ready to send."
      );
    }

    if (existing.resend_email_id) {
      throw new TimeCapsuleDomainError(
        "delivery_already_accepted",
        "This time capsule has already been accepted by the email provider."
      );
    }

    const { rawToken, tokenHash } = generateTimeCapsuleToken();
    const tokenCreatedAt = new Date().toISOString();
    const { error } = await supabase
      .from("scheduled_memory_deliveries")
      .update({
        token_hash: tokenHash,
        token_created_at: tokenCreatedAt
      })
      .eq("id", deliveryId)
      .eq("status", "processing");

    if (error) {
      throw error;
    }

    return {
      deliveryId,
      rawToken,
      tokenCreatedAt
    };
  } catch (error) {
    logTimeCapsuleFailure({
      deliveryId,
      error,
      stage: "token_prepare"
    });
    throw error;
  }
}

export async function recordScheduledMemoryDeliveryProviderAcceptance(input: {
  deliveryId: string;
  resendEmailId: string;
}): Promise<TimeCapsuleProviderAcceptance> {
  assertUuid(input.deliveryId, "Delivery");
  const resendEmailId = input.resendEmailId.trim();

  if (!resendEmailId || resendEmailId.length > maxResendEmailIdLength) {
    throw new TimeCapsuleDomainError(
      "invalid_resend_email_id",
      "Email provider confirmation is invalid."
    );
  }

  const supabase = getAdminClient();

  try {
    const { data, error } = await supabase
      .from("scheduled_memory_deliveries")
      .select("id, status, resend_email_id, updated_at")
      .eq("id", input.deliveryId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new TimeCapsuleDomainError(
        "delivery_not_found",
        "Time capsule not found."
      );
    }

    const row = data as {
      id: string;
      status: TimeCapsuleStatus;
      resend_email_id: string | null;
      updated_at: string;
    };

    if (row.status !== "processing") {
      throw new TimeCapsuleDomainError(
        "delivery_not_processing",
        "Time capsule is not ready for provider acceptance."
      );
    }

    if (row.resend_email_id && row.resend_email_id !== resendEmailId) {
      throw new TimeCapsuleDomainError(
        "delivery_already_accepted",
        "This time capsule has already been accepted by the email provider."
      );
    }

    if (row.resend_email_id === resendEmailId) {
      return {
        deliveryId: row.id,
        resendEmailId,
        acceptedAt: row.updated_at
      };
    }

    const { data: updated, error: updateError } = await supabase
      .from("scheduled_memory_deliveries")
      .update({
        resend_email_id: resendEmailId
      })
      .eq("id", row.id)
      .eq("status", "processing")
      .is("resend_email_id", null)
      .select("id, resend_email_id, updated_at")
      .single();

    if (updateError || !updated) {
      throw updateError || new Error("Provider acceptance could not be saved.");
    }

    return {
      deliveryId: (updated as { id: string }).id,
      resendEmailId: (updated as { resend_email_id: string }).resend_email_id,
      acceptedAt: (updated as { updated_at: string }).updated_at
    };
  } catch (error) {
    logTimeCapsuleFailure({
      deliveryId: input.deliveryId,
      error,
      stage: "provider_acceptance"
    });
    throw error;
  }
}

export async function markScheduledMemoryDeliveryDelivered(input: {
  deliveryId: string;
  resendEmailId: string;
}) {
  assertUuid(input.deliveryId, "Delivery");
  const resendEmailId = input.resendEmailId.trim();

  if (!resendEmailId || resendEmailId.length > maxResendEmailIdLength) {
    throw new TimeCapsuleDomainError(
      "invalid_resend_email_id",
      "Email provider confirmation is invalid."
    );
  }

  const supabase = getAdminClient();

  try {
    const { data, error } = await supabase
      .from("scheduled_memory_deliveries")
      .select(deliveryColumns)
      .eq("id", input.deliveryId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new TimeCapsuleDomainError(
        "delivery_not_found",
        "Time capsule not found."
      );
    }

    const row = mapDeliveryRow(data as DeliveryRow);

    if (row.status === "delivered") {
      if (row.resend_email_id === resendEmailId) {
        return row;
      }

      throw new TimeCapsuleDomainError(
        "delivery_already_delivered",
        "Time capsule was already delivered."
      );
    }

    if (
      row.status !== "processing" ||
      !row.token_hash ||
      !row.token_created_at
    ) {
      throw new TimeCapsuleDomainError(
        "delivery_not_deliverable",
        "Time capsule is not ready to mark delivered."
      );
    }

    if (!row.resend_email_id) {
      throw new TimeCapsuleDomainError(
        "delivery_not_accepted",
        "This time capsule has not been accepted by the email provider yet."
      );
    }

    if (row.resend_email_id !== resendEmailId) {
      throw new TimeCapsuleDomainError(
        "delivery_send_ambiguity",
        "This time capsule was accepted by a different email provider message."
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("scheduled_memory_deliveries")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
        resend_email_id: resendEmailId,
        processing_started_at: null,
        failed_at: null,
        next_attempt_at: null,
        last_error_code: null,
        last_error_message: null
      })
      .eq("id", row.id)
      .eq("status", "processing")
      .eq("resend_email_id", resendEmailId)
      .select(deliveryColumns)
      .single();

    if (updateError || !updated) {
      throw updateError || new Error("Delivery could not be marked delivered.");
    }

    return mapDeliveryRow(updated as DeliveryRow);
  } catch (error) {
    logTimeCapsuleFailure({
      deliveryId: input.deliveryId,
      error,
      stage: "mark_delivered"
    });
    throw error;
  }
}

export async function recoverAcceptedScheduledMemoryDelivery(deliveryId: string) {
  assertUuid(deliveryId, "Delivery");
  const supabase = getAdminClient();

  try {
    const { data, error } = await supabase
      .from("scheduled_memory_deliveries")
      .select("id, resend_email_id")
      .eq("id", deliveryId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new TimeCapsuleDomainError(
        "delivery_not_found",
        "Time capsule not found."
      );
    }

    const resendEmailId = (data as { resend_email_id: string | null })
      .resend_email_id;

    if (!resendEmailId) {
      throw new TimeCapsuleDomainError(
        "delivery_not_accepted",
        "This time capsule has not been accepted by the email provider yet."
      );
    }

    return markScheduledMemoryDeliveryDelivered({
      deliveryId,
      resendEmailId
    });
  } catch (error) {
    logTimeCapsuleFailure({
      deliveryId,
      error,
      stage: "mark_delivered"
    });
    throw error;
  }
}

export async function markScheduledMemoryDeliveryFailed(input: {
  deliveryId: string;
  errorCode: string;
  errorMessage: string;
}) {
  assertUuid(input.deliveryId, "Delivery");
  const supabase = getAdminClient();

  try {
    const { data, error } = await supabase
      .from("scheduled_memory_deliveries")
      .select(deliveryColumns)
      .eq("id", input.deliveryId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new TimeCapsuleDomainError(
        "delivery_not_found",
        "Time capsule not found."
      );
    }

    const row = mapDeliveryRow(data as DeliveryRow);

    if (row.status === "delivered" || row.status === "canceled") {
      return row;
    }

    if (row.status !== "processing") {
      throw new TimeCapsuleDomainError(
        "delivery_not_processing",
        "Only processing time capsules can be marked failed."
      );
    }

    if (row.resend_email_id) {
      throw new TimeCapsuleDomainError(
        "delivery_already_accepted",
        "This time capsule has already been accepted by the email provider."
      );
    }

    const retryDelayMinutes = getRetryDelayMinutes(row);
    const nextAttemptAt =
      retryDelayMinutes === null
        ? null
        : new Date(Date.now() + retryDelayMinutes * 60 * 1000).toISOString();

    const { data: updated, error: updateError } = await supabase
      .from("scheduled_memory_deliveries")
      .update({
        status: "failed",
        failed_at: new Date().toISOString(),
        processing_started_at: null,
        next_attempt_at: nextAttemptAt,
        last_error_code: sanitizeErrorCode(input.errorCode),
        last_error_message: sanitizeErrorMessage(input.errorMessage)
      })
      .eq("id", row.id)
      .eq("status", "processing")
      .select(deliveryColumns)
      .single();

    if (updateError || !updated) {
      throw updateError || new Error("Delivery could not be marked failed.");
    }

    return mapDeliveryRow(updated as DeliveryRow);
  } catch (error) {
    logTimeCapsuleFailure({
      deliveryId: input.deliveryId,
      error,
      stage: "mark_failed"
    });
    throw error;
  }
}

export async function resolveDeliveredScheduledMemoryDeliveryByToken(
  rawToken: string
): Promise<PublicDeliveredTimeCapsule> {
  const normalizedToken = rawToken.trim();

  if (!tokenPattern.test(normalizedToken)) {
    return { status: "unavailable" };
  }

  const tokenHash = hashTimeCapsuleToken(normalizedToken);
  const supabase = getAdminClient();

  try {
    const { data, error } = await supabase
      .from("scheduled_memory_deliveries")
      .select(deliveryColumns)
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !data) {
      if (error) {
        logTimeCapsuleFailure({ error, stage: "public_resolve" });
      }

      return { status: "unavailable" };
    }

    const row = mapDeliveryRow(data as DeliveryRow);

    if (
      !row.token_hash ||
      !safeTokenHashCompare(row.token_hash, tokenHash) ||
      row.status !== "delivered" ||
      !row.delivered_at ||
      row.canceled_at ||
      !row.memory_id
    ) {
      return { status: "unavailable" };
    }

    const [archive, memory] = await Promise.all([
      loadArchiveIdentityById(supabase, row.archive_id),
      loadMemoryDeliveryById(supabase, row.memory_id)
    ]);

    if (!archive || !memory || memory.archive_id !== row.archive_id) {
      return { status: "unavailable" };
    }

    const mediaUrl = await resolveStorageImageUrl(
      memory.photo_path,
      getSafeMemoryMediaUrl(memory.media_url)
    );

    return {
      status: "available",
      delivery: {
        id: row.id,
        archive: {
          id: archive.id,
          name: archive.archive_name,
          slug: archive.slug,
          personName: archive.person_name
        },
        ownerDisplayName: await getOwnerDisplayName(
          row.owner_id,
          archive.person_name
        ),
        recipientName: row.recipient_name,
        memory: {
          id: memory.id,
          title: memory.title,
          type: memory.type,
          content: memory.content ?? "",
          mediaUrl,
          date: memory.memory_date,
          tags: memory.tags ?? []
        },
        personalNote: row.personal_note,
        timezone: row.timezone,
        scheduledFor: row.scheduled_for,
        deliveredAt: row.delivered_at
      }
    };
  } catch (error) {
    logTimeCapsuleFailure({ error, stage: "public_resolve" });
    return { status: "unavailable" };
  }
}
