import crypto from "node:crypto";

export type EmailErrorCategory =
  | "timeout"
  | "rate_limit"
  | "server_error"
  | "network_error"
  | "invalid_recipient"
  | "permanent_client_error";

export type EmailClassification = {
  isTransient: boolean;
  category: EmailErrorCategory;
  code: string;
  message: string;
};

const BACKOFF_MINUTES = [0, 5, 20, 60, 240];

export function getClaimTokenSecret(): string {
  const secret = process.env.CLAIM_TOKEN_SECRET?.trim();
  if (!secret) {
    throw new Error("CLAIM_TOKEN_SECRET is missing from server environment configuration.");
  }
  return secret;
}

export function deriveDeterministicClaimToken(claimId: string, tokenVersion = 1): string {
  const secret = getClaimTokenSecret();
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(`tla-legacy-question-claim:${claimId}:${tokenVersion}`)
    .digest("base64url");

  return `lqc_${hmac}`;
}

export function calculateEmailRetryBackoff(
  attemptCount: number,
  jitterRatio = 0,
  nowDate = new Date()
): { nextAttemptAt: Date; backoffMinutes: number } {
  const attemptIndex = Math.max(0, Math.min(attemptCount - 1, BACKOFF_MINUTES.length - 1));
  let backoffMinutes = BACKOFF_MINUTES[attemptIndex] ?? 240;

  if (jitterRatio !== 0 && backoffMinutes > 0) {
    const jitter = backoffMinutes * 0.1 * Math.max(-1, Math.min(1, jitterRatio));
    backoffMinutes = Math.max(1, Math.round(backoffMinutes + jitter));
  }

  const nextAttemptAt = new Date(nowDate.getTime() + backoffMinutes * 60 * 1000);
  return { nextAttemptAt, backoffMinutes };
}

export function classifyEmailError(error: unknown): EmailClassification {
  const message = error instanceof Error ? error.message : String(error);
  const status = typeof error === "object" && error !== null && "status" in error
    ? (error as any).status
    : undefined;

  const sanitizedMessage = message
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/re_\S+/gi, "[redacted]")
    .replace(/https?:\/\/\S+/g, "[url]")
    .slice(0, 300);

  if (message.toLowerCase().includes("timed out") || message.toLowerCase().includes("aborted")) {
    return {
      isTransient: true,
      category: "timeout",
      code: "HTTP_TIMEOUT",
      message: sanitizedMessage
    };
  }

  if (status === 429) {
    return {
      isTransient: true,
      category: "rate_limit",
      code: "HTTP_429_RATE_LIMIT",
      message: sanitizedMessage
    };
  }

  if (typeof status === "number" && (status === 408 || status === 409 || status === 425 || (status >= 500 && status <= 599))) {
    return {
      isTransient: true,
      category: "server_error",
      code: `HTTP_${status}`,
      message: sanitizedMessage
    };
  }

  if (typeof status === "number" && [400, 401, 403, 404, 422].includes(status)) {
    const isRecipientErr = message.toLowerCase().includes("recipient") || message.toLowerCase().includes("email");
    return {
      isTransient: false,
      category: isRecipientErr ? "invalid_recipient" : "permanent_client_error",
      code: `HTTP_${status}`,
      message: sanitizedMessage
    };
  }

  if (message.toLowerCase().includes("network") || message.toLowerCase().includes("fetch failed") || message.toLowerCase().includes("econnrefused")) {
    return {
      isTransient: true,
      category: "network_error",
      code: "NETWORK_ERROR",
      message: sanitizedMessage
    };
  }

  return {
    isTransient: false,
    category: "permanent_client_error",
    code: "PERMANENT_ERROR",
    message: sanitizedMessage
  };
}

export async function processSingleOnboardingEmailSend(submissionId: string) {
  const { createAdminClient } = require("./supabase/admin");
  const { getSiteUrl } = require("./qr");
  const { buildLegacyQuestionClaimEmail } = require("./legacy-question-claim-email");
  const { sendEmail } = require("./resend-email");

  const supabase = createAdminClient();

  const { data: submission, error: subError } = await supabase
    .from("legacy_question_submissions")
    .select("*, archives(id, archive_name)")
    .eq("id", submissionId)
    .single();

  if (subError || !submission) {
    throw new Error(`Submission ${submissionId} not found.`);
  }

  const { data: claimRow, error: claimError } = await supabase
    .from("legacy_question_claim_tokens")
    .select("*")
    .eq("submission_id", submissionId)
    .is("claimed_at", null)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (claimError || !claimRow) {
    throw new Error(`Active claim token not found for submission ${submissionId}.`);
  }

  const tokenVersion = (claimRow as any).token_version || 1;
  let rawToken: string;

  try {
    rawToken = deriveDeterministicClaimToken(claimRow.id, tokenVersion);
  } catch {
    rawToken = claimRow.token_hash;
  }

  const claimUrl = `${getSiteUrl().replace(/\/$/, "")}/claim/${rawToken}`;
  const archiveName = submission.archives?.archive_name || `${submission.first_name || "Your"}'s Starter Life Archive`;
  const displayName = submission.first_name || submission.email.split("@")[0] || "Your";

  const emailContent = buildLegacyQuestionClaimEmail({
    archiveName,
    displayName,
    claimUrl,
    expiresAt: claimRow.expires_at
  });

  const idempotencyKey = `tla-onboarding-email:${submission.id}:${tokenVersion}:${submission.email_template_version || 1}`;

  try {
    const result = await sendEmail({
      to: submission.email,
      ...emailContent,
      idempotencyKey
    });

    const { data: updated, error: rpcError } = await supabase.rpc("record_onboarding_email_result", {
      target_submission_id: submission.id,
      target_status: "sent",
      target_resend_message_id: result.id,
      target_next_attempt_at: null,
      target_error_category: null,
      target_error_code: null,
      target_error_message: null
    });

    if (rpcError) {
      throw new Error(`RPC record_onboarding_email_result failed: ${rpcError.message}`);
    }

    console.info({
      event: "legacy_question_email_sent",
      submissionId: submission.id,
      attemptCount: submission.email_attempt_count,
      resendMessageId: result.id
    });

    return updated;
  } catch (err) {
    const classification = classifyEmailError(err);
    const attemptCount = submission.email_attempt_count;
    const maxAttempts = submission.email_max_attempts || 5;

    let targetStatus: "transient_failure" | "permanent_failure";
    let nextAttemptAt: string | null = null;

    if (classification.isTransient && attemptCount < maxAttempts) {
      targetStatus = "transient_failure";
      const backoff = calculateEmailRetryBackoff(attemptCount);
      nextAttemptAt = backoff.nextAttemptAt.toISOString();

      console.warn({
        event: "legacy_question_email_transient_failure",
        submissionId: submission.id,
        attemptCount,
        category: classification.category,
        nextAttemptAt
      });
    } else {
      targetStatus = "permanent_failure";
      nextAttemptAt = null;

      console.error({
        event: "legacy_question_email_permanent_failure",
        submissionId: submission.id,
        attemptCount,
        category: classification.category,
        code: classification.code
      });
    }

    const { data: updated } = await supabase.rpc("record_onboarding_email_result", {
      target_submission_id: submission.id,
      target_status: targetStatus,
      target_resend_message_id: null,
      target_next_attempt_at: nextAttemptAt,
      target_error_category: classification.category,
      target_error_code: classification.code,
      target_error_message: classification.message
    });

    return updated;
  }
}

export async function processDueOnboardingEmailRetries(batchSize = 10) {
  const { createAdminClient } = require("./supabase/admin");
  const supabase = createAdminClient();

  await supabase.rpc("recover_stale_onboarding_email_locks", { lock_timeout_minutes: 10 });

  const { data: claimedRows, error: claimError } = await supabase.rpc(
    "claim_due_onboarding_email_retries",
    { batch_size: batchSize }
  );

  if (claimError || !claimedRows) {
    console.error({
      event: "legacy_question_email_cron_failed",
      error: claimError?.message || "Failed to claim due onboarding email retries."
    });
    return { claimed: 0, processed: 0, errors: 1 };
  }

  const rows = claimedRows as Array<{ id: string }>;
  let processedCount = 0;
  let errorCount = 0;

  for (const row of rows) {
    try {
      await processSingleOnboardingEmailSend(row.id);
      processedCount += 1;
    } catch (err) {
      errorCount += 1;
      console.error({
        event: "legacy_question_email_processor_error",
        submissionId: row.id,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  const eventName = errorCount === 0 ? "legacy_question_email_cron_success" : "legacy_question_email_cron_partial_failure";

  console.info({
    event: eventName,
    claimed: rows.length,
    processed: processedCount,
    errors: errorCount
  });

  return {
    claimed: rows.length,
    processed: processedCount,
    errors: errorCount
  };
}
