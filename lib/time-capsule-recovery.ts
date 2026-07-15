export type TimeCapsuleRecoveryStatus =
  | "scheduled"
  | "processing"
  | "delivered"
  | "failed"
  | "canceled";

export type TimeCapsuleRecoveryRow = {
  attemptCount: number;
  canceledAt: string | null;
  deliveredAt: string | null;
  maxAttempts: number;
  processingStartedAt: string | null;
  resendEmailId: string | null;
  status: TimeCapsuleRecoveryStatus;
};

export type StaleProcessingRecoveryDecision =
  | "ignore"
  | "wait"
  | "recover_accepted"
  | "fail_retryable"
  | "fail_exhausted";

export const staleProcessingTimeoutMinutes = 20;

export function getRetryDelayMinutes(input: {
  attemptCount: number;
  maxAttempts: number;
}) {
  if (input.attemptCount >= input.maxAttempts) {
    return null;
  }

  return input.attemptCount <= 1 ? 15 : 60;
}

export function getStaleProcessingRecoveryDecision(
  row: TimeCapsuleRecoveryRow,
  input: {
    now: Date;
    timeoutMinutes?: number;
  }
): StaleProcessingRecoveryDecision {
  if (
    row.status === "delivered" ||
    row.status === "canceled" ||
    row.deliveredAt ||
    row.canceledAt
  ) {
    return "ignore";
  }

  if (row.status !== "processing") {
    return "ignore";
  }

  if (!row.processingStartedAt) {
    return "wait";
  }

  const startedAt = new Date(row.processingStartedAt).getTime();

  if (!Number.isFinite(startedAt)) {
    return "wait";
  }

  const timeoutMs =
    (input.timeoutMinutes ?? staleProcessingTimeoutMinutes) * 60 * 1000;

  if (startedAt > input.now.getTime() - timeoutMs) {
    return "wait";
  }

  // A stored Resend id means the provider accepted the email. Recovery must
  // finalize delivery from that evidence instead of sending a second email.
  if (row.resendEmailId) {
    return "recover_accepted";
  }

  return row.attemptCount >= row.maxAttempts
    ? "fail_exhausted"
    : "fail_retryable";
}
