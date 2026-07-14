import "server-only";

import { getSiteUrl } from "@/lib/qr";
import { sendTimeCapsuleDeliveryEmail } from "@/lib/time-capsule-email";
import {
  claimDueScheduledMemoryDeliveries,
  loadClaimedScheduledMemoryDeliveryForSend,
  markScheduledMemoryDeliveryDelivered,
  markScheduledMemoryDeliveryFailed,
  prepareSecureScheduledMemoryDeliveryToken,
  recordScheduledMemoryDeliveryProviderAcceptance,
  recoverAcceptedScheduledMemoryDelivery,
  TimeCapsuleDomainError,
  type ClaimedTimeCapsuleDelivery
} from "@/lib/time-capsules";

export type TimeCapsuleProcessorSummary = {
  claimed: number;
  delivered: number;
  recovered: number;
  failed: number;
  skipped: number;
};

const defaultBatchSize = 10;

type TimeCapsuleProcessorLog = {
  archiveId?: string | null;
  attemptCount?: number | null;
  deliveryId?: string | null;
  errorCode?: string;
  errorMessage?: string;
  errorName?: string;
  event: string;
  memoryId?: string | null;
  stage: string;
  status?: string;
  totals?: TimeCapsuleProcessorSummary;
};

function sanitizeLogMessage(value: unknown) {
  const message =
    value instanceof Error
      ? value.message
      : typeof value === "string"
        ? value
        : "Unknown error";

  return message
    .replace(/https?:\/\/\S+/g, "[url]")
    .replace(/[A-Za-z0-9+/=_-]{48,}/g, "[redacted]")
    .slice(0, 300);
}

function getErrorCode(error: unknown, fallback = "delivery_processing_failed") {
  if (error instanceof TimeCapsuleDomainError) {
    return error.code;
  }

  const record =
    typeof error === "object" && error !== null
      ? (error as Record<string, unknown>)
      : {};

  return typeof record.code === "string"
    ? record.code.slice(0, 80)
    : fallback;
}

function logInfo(input: TimeCapsuleProcessorLog) {
  console.info(input);
}

function logError(input: TimeCapsuleProcessorLog) {
  console.error(input);
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function assertProcessorConfiguration() {
  getRequiredEnv("NEXT_PUBLIC_SITE_URL");
  getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  getRequiredEnv("RESEND_API_KEY");
  getRequiredEnv("TLA_FROM_EMAIL");
}

function buildDeliveryUrl(rawToken: string) {
  return `${getSiteUrl()}/delivery/${encodeURIComponent(rawToken)}`;
}

async function markClaimedDeliveryFailed(input: {
  delivery: ClaimedTimeCapsuleDelivery;
  error: unknown;
  errorCode?: string;
  errorMessage?: string;
}) {
  await markScheduledMemoryDeliveryFailed({
    deliveryId: input.delivery.id,
    errorCode: input.errorCode || getErrorCode(input.error),
    errorMessage: input.errorMessage || sanitizeLogMessage(input.error)
  });
}

async function recoverAcceptedDelivery(delivery: ClaimedTimeCapsuleDelivery) {
  const recovered = await recoverAcceptedScheduledMemoryDelivery(delivery.id);

  logInfo({
    event: "time_capsule_cron_delivery_recovered",
    stage: "provider_acceptance_recovery",
    deliveryId: delivery.id,
    archiveId: delivery.archiveId,
    memoryId: delivery.memoryId,
    status: recovered.status,
    attemptCount: delivery.attemptCount
  });
}

async function processClaimedDelivery(
  delivery: ClaimedTimeCapsuleDelivery
): Promise<keyof Omit<TimeCapsuleProcessorSummary, "claimed">> {
  try {
    const prepared = await loadClaimedScheduledMemoryDeliveryForSend(
      delivery.id
    );

    if (prepared.resendEmailId) {
      await recoverAcceptedDelivery(delivery);
      return "recovered";
    }

    const token = await prepareSecureScheduledMemoryDeliveryToken(delivery.id);
    const deliveryUrl = buildDeliveryUrl(token.rawToken);
    const emailResult = await sendTimeCapsuleDeliveryEmail({
      delivery: prepared,
      deliveryUrl
    });

    if (!emailResult.accepted) {
      await markClaimedDeliveryFailed({
        delivery,
        error: emailResult.errorMessage,
        errorCode: emailResult.errorCode,
        errorMessage: emailResult.errorMessage
      });

      logError({
        event: "time_capsule_cron_delivery_failed",
        stage: "email_send",
        deliveryId: delivery.id,
        archiveId: delivery.archiveId,
        memoryId: delivery.memoryId,
        attemptCount: delivery.attemptCount,
        errorCode: emailResult.errorCode,
        errorMessage: emailResult.errorMessage
      });

      return "failed";
    }

    let accepted;

    try {
      accepted = await recordScheduledMemoryDeliveryProviderAcceptance({
        deliveryId: delivery.id,
        resendEmailId: emailResult.resendEmailId
      });
    } catch (error) {
      logError({
        event: "time_capsule_provider_acceptance_persistence_failed",
        stage: "provider_acceptance",
        deliveryId: delivery.id,
        archiveId: delivery.archiveId,
        memoryId: delivery.memoryId,
        attemptCount: delivery.attemptCount,
        errorCode: getErrorCode(error, "provider_acceptance_persist_failed"),
        errorName: error instanceof Error ? error.name : typeof error,
        errorMessage: sanitizeLogMessage(error)
      });

      return "failed";
    }

    await markScheduledMemoryDeliveryDelivered({
      deliveryId: delivery.id,
      resendEmailId: accepted.resendEmailId
    });

    logInfo({
      event: "time_capsule_cron_delivery_delivered",
      stage: "mark_delivered",
      deliveryId: delivery.id,
      archiveId: delivery.archiveId,
      memoryId: delivery.memoryId,
      status: "delivered",
      attemptCount: delivery.attemptCount
    });

    return "delivered";
  } catch (error) {
    const errorCode = getErrorCode(error);

    if (errorCode === "delivery_already_accepted") {
      try {
        await recoverAcceptedDelivery(delivery);
        return "recovered";
      } catch (recoveryError) {
        logError({
          event: "time_capsule_provider_acceptance_recovery_failed",
          stage: "provider_acceptance_recovery",
          deliveryId: delivery.id,
          archiveId: delivery.archiveId,
          memoryId: delivery.memoryId,
          attemptCount: delivery.attemptCount,
          errorCode: getErrorCode(recoveryError, "accepted_recovery_failed"),
          errorName:
            recoveryError instanceof Error ? recoveryError.name : typeof recoveryError,
          errorMessage: sanitizeLogMessage(recoveryError)
        });

        return "skipped";
      }
    }

    try {
      await markClaimedDeliveryFailed({
        delivery,
        error,
        errorCode,
        errorMessage: sanitizeLogMessage(error)
      });
    } catch (markFailedError) {
      logError({
        event: "time_capsule_cron_mark_failed_failed",
        stage: "mark_failed",
        deliveryId: delivery.id,
        archiveId: delivery.archiveId,
        memoryId: delivery.memoryId,
        attemptCount: delivery.attemptCount,
        errorCode: getErrorCode(markFailedError, "mark_failed_failed"),
        errorName:
          markFailedError instanceof Error
            ? markFailedError.name
            : typeof markFailedError,
        errorMessage: sanitizeLogMessage(markFailedError)
      });
    }

    logError({
      event: "time_capsule_cron_delivery_failed",
      stage: "process_delivery",
      deliveryId: delivery.id,
      archiveId: delivery.archiveId,
      memoryId: delivery.memoryId,
      attemptCount: delivery.attemptCount,
      errorCode,
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: sanitizeLogMessage(error)
    });

    return "failed";
  }
}

export async function processDueTimeCapsuleDeliveries(input?: {
  batchSize?: number;
}): Promise<TimeCapsuleProcessorSummary> {
  assertProcessorConfiguration();

  const claimed = await claimDueScheduledMemoryDeliveries(
    input?.batchSize ?? defaultBatchSize
  );
  const summary: TimeCapsuleProcessorSummary = {
    claimed: claimed.length,
    delivered: 0,
    recovered: 0,
    failed: 0,
    skipped: 0
  };

  for (const delivery of claimed) {
    const result = await processClaimedDelivery(delivery);
    summary[result] += 1;
  }

  logInfo({
    event: "time_capsule_cron_processor_complete",
    stage: "complete",
    totals: summary
  });

  return summary;
}
