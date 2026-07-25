import { createHmac, createHash } from "crypto";

export type RateLimitCheckItem = {
  rate_key: string;
  action_type: string;
  max_requests: number;
  window_seconds: number;
};

export type EvaluateRateLimitInput = {
  clientIp: string;
  visitorId: string | null;
  email: string;
  cardBatch: string | null;
  entryType: string;
  textContent: string | null;
  audioFile: File | null;
};

export type RateLimitEvaluationResult =
  | { allowed: true }
  | { allowed: false; reason: string; signalType: string };

function getHashSecret(): string | null {
  const secret = process.env.RATE_LIMIT_HASH_SECRET?.trim();
  return secret || null;
}

export function computeHmac(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data.trim().toLowerCase()).digest("hex");
}

export function normalizeTextContent(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function computeAudioDigest(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return createHash("sha256").update(buffer).digest("hex");
}

export async function computeDuplicateFingerprint(input: {
  email: string;
  entryType: string;
  textContent?: string | null;
  audioFile?: File | null;
  secret: string;
}): Promise<string> {
  let contentSignal = "";

  if (input.entryType === "text" && input.textContent) {
    const normalized = normalizeTextContent(input.textContent);
    contentSignal = createHash("sha256").update(normalized).digest("hex");
  } else if (input.entryType === "voice" && input.audioFile) {
    contentSignal = await computeAudioDigest(input.audioFile);
  }

  const rawSignal = `dup:${input.email.trim().toLowerCase()}:${input.entryType}:${contentSignal}`;
  return computeHmac(rawSignal, input.secret);
}

export function extractClientIp(headersInstance: Headers): string {
  const forwardedFor = headersInstance.get("x-forwarded-for");

  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    const clientIp = ips[0];

    if (clientIp) {
      return clientIp;
    }
  }

  const realIp = headersInstance.get("x-real-ip");

  if (realIp?.trim()) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

export async function buildRateLimitCheckItems(
  input: EvaluateRateLimitInput,
  secret: string
): Promise<{ checks: RateLimitCheckItem[]; duplicateKey: string; ipKey: string }> {
  const ipHmac = computeHmac(`ip:${input.clientIp}`, secret);
  const visitorHmac = computeHmac(`vis:${input.visitorId || "none"}`, secret);
  const emailHmac = computeHmac(`email:${input.email}`, secret);
  const cardHmac = input.cardBatch ? computeHmac(`card:${input.cardBatch}`, secret) : null;
  const duplicateHmac = await computeDuplicateFingerprint({
    email: input.email,
    entryType: input.entryType,
    textContent: input.textContent,
    audioFile: input.audioFile,
    secret
  });

  const checks: RateLimitCheckItem[] = [
    // 1. Visitor burst: 3 per 60s
    { rate_key: `vis:${visitorHmac}`, action_type: "burst", max_requests: 3, window_seconds: 60 },
    // 2. IP burst: 12 per 60s
    { rate_key: `ip:${ipHmac}`, action_type: "burst", max_requests: 12, window_seconds: 60 },
    // 3. Visitor daily: 10 per 24h (86400s)
    { rate_key: `vis:${visitorHmac}`, action_type: "daily", max_requests: 10, window_seconds: 86400 },
    // 4. IP daily: 75 per 24h (86400s)
    { rate_key: `ip:${ipHmac}`, action_type: "daily", max_requests: 75, window_seconds: 86400 },
    // 5. Successful onboarding email limit (read-only precheck against email_sent): 3 per 24h (86400s)
    { rate_key: `email:${emailHmac}`, action_type: "email_sent", max_requests: 3, window_seconds: 86400 },
    // 6. Rejected attempts per IP: 30 per 10m (600s)
    { rate_key: `ip:${ipHmac}`, action_type: "rejected", max_requests: 30, window_seconds: 600 },
    // 7. Atomic duplicate submission check: 1 per 5m (300s)
    { rate_key: `dup:${duplicateHmac}`, action_type: "duplicate", max_requests: 1, window_seconds: 300 }
  ];

  if (cardHmac) {
    // 8. Card/keepsake code: 50 per 1h (3600s)
    checks.push({ rate_key: `card:${cardHmac}`, action_type: "card_1h", max_requests: 50, window_seconds: 3600 });
    // 9. Card/keepsake code: 150 per 24h (86400s)
    checks.push({ rate_key: `card:${cardHmac}`, action_type: "card_24h", max_requests: 150, window_seconds: 86400 });
  }

  return { checks, duplicateKey: duplicateHmac, ipKey: ipHmac };
}

export function determineSignalType(violatingKey: string | null): string {
  if (!violatingKey) return "unknown";
  if (violatingKey.startsWith("vis:")) return "visitor_id";
  if (violatingKey.startsWith("ip:")) return "ip_hash";
  if (violatingKey.startsWith("email:")) return "email_hash";
  if (violatingKey.startsWith("card:")) return "card_batch";
  if (violatingKey.startsWith("dup:")) return "duplicate_submission";
  return "rate_limit";
}

export async function evaluateLegacyQuestionRateLimits(
  input: EvaluateRateLimitInput
): Promise<RateLimitEvaluationResult> {
  const secret = getHashSecret();

  if (!secret) {
    console.error("rate_limit_failed_closed", {
      reason: "missing_secret",
      timestamp: new Date().toISOString()
    });

    return { allowed: false, reason: "Server misconfigured", signalType: "system" };
  }

  const { checks } = await buildRateLimitCheckItems(input, secret);

  try {
    // Lazily require createAdminClient for ts-node compatibility
    const { createAdminClient } = require("./supabase/admin");
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("check_and_record_visitor_rate_limits", {
      p_checks: checks
    });

    if (error) {
      console.error("rate_limit_rpc_error", {
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      });

      return { allowed: false, reason: "RPC error", signalType: "system" };
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row || typeof row.allowed !== "boolean") {
      console.error("rate_limit_rpc_malformed_response", {
        timestamp: new Date().toISOString()
      });

      return { allowed: false, reason: "RPC malformed response", signalType: "system" };
    }

    if (!row.allowed) {
      const signalType = determineSignalType(row.violating_key);

      console.warn({
        event: "legacy_question_rate_limit_exceeded",
        signalType,
        timestamp: new Date().toISOString()
      });

      return {
        allowed: false,
        reason: "Rate limit exceeded",
        signalType
      };
    }

    return { allowed: true };
  } catch (err) {
    console.error("rate_limit_exception", {
      errorMessage: err instanceof Error ? err.message : "Unknown error",
      timestamp: new Date().toISOString()
    });

    return { allowed: false, reason: "RPC exception", signalType: "system" };
  }
}

export async function recordSuccessfulEmailQuota(email: string): Promise<void> {
  const secret = getHashSecret();

  if (!secret) return;

  const emailHmac = computeHmac(`email:${email}`, secret);

  try {
    const { createAdminClient } = require("./supabase/admin");
    const supabase = createAdminClient();
    await supabase.from("visitor_rate_limit_events").insert({
      rate_key: `email:${emailHmac}`,
      action_type: "email_sent",
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("record_email_quota_failed", {
      errorMessage: err instanceof Error ? err.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
}
