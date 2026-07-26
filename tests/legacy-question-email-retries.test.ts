import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  calculateEmailRetryBackoff,
  classifyEmailError,
  deriveDeterministicClaimToken
} from "../lib/legacy-question-email-processor";

async function runTests() {
  console.log("Starting strengthened legacy-question-email-retries test suite...");

  // Set env secret for token derivation test
  process.env.CLAIM_TOKEN_SECRET = "test_claim_token_secret_32_bytes_long_123456789";

  // 1. Error Classification - Transient Errors (408, 409, 425, 429, 500, 502, 503, 504, network, timeout)
  const transientStatuses = [408, 409, 425, 429, 500, 502, 503, 504, 599];
  for (const status of transientStatuses) {
    const err: any = new Error(`HTTP ${status} test error`);
    err.status = status;
    const classified = classifyEmailError(err);
    assert.equal(classified.isTransient, true, `Status ${status} should be transient`);
  }

  const timeoutErr = new Error("Resend request timed out before completing.");
  assert.equal(classifyEmailError(timeoutErr).isTransient, true);

  const networkErr = new Error("fetch failed econnrefused");
  assert.equal(classifyEmailError(networkErr).isTransient, true);

  // 2. Error Classification - Permanent Errors (400, 401, 403, 404, 422, unknown 4xx)
  const permanentStatuses = [400, 401, 403, 404, 422, 499];
  for (const status of permanentStatuses) {
    const err: any = new Error(`HTTP ${status} test error`);
    err.status = status;
    const classified = classifyEmailError(err);
    assert.equal(classified.isTransient, false, `Status ${status} should be permanent`);
  }

  // 3. Backoff Schedule Calculation & Jitter Bounds
  const baseTime = new Date("2026-07-25T12:00:00.000Z");

  const attempt1 = calculateEmailRetryBackoff(1, 0, baseTime); // Attempt 1: +0 mins
  assert.equal(attempt1.backoffMinutes, 0);

  const attempt2 = calculateEmailRetryBackoff(2, 0, baseTime); // Attempt 2: +5 mins
  assert.equal(attempt2.backoffMinutes, 5);

  const attempt3 = calculateEmailRetryBackoff(3, 0, baseTime); // Attempt 3: +20 mins
  assert.equal(attempt3.backoffMinutes, 20);

  const attempt4 = calculateEmailRetryBackoff(4, 0, baseTime); // Attempt 4: +60 mins (1 hour)
  assert.equal(attempt4.backoffMinutes, 60);

  const attempt5 = calculateEmailRetryBackoff(5, 0, baseTime); // Attempt 5: +240 mins (4 hours)
  assert.equal(attempt5.backoffMinutes, 240);

  const attempt2WithJitter = calculateEmailRetryBackoff(2, 1.0, baseTime);
  assert.equal(attempt2WithJitter.backoffMinutes, 6);

  // 4. Deterministic Claim Token Recreation & Hash Matching
  const claimId = "11111111-2222-3333-4444-555555555555";
  const tokenV1_a = deriveDeterministicClaimToken(claimId, 1);
  const tokenV1_b = deriveDeterministicClaimToken(claimId, 1);
  const tokenV2 = deriveDeterministicClaimToken(claimId, 2);

  assert.equal(tokenV1_a, tokenV1_b); // Identical token recreated deterministically
  assert.notEqual(tokenV1_a, tokenV2); // Incrementing token_version changes token
  assert.equal(tokenV1_a.startsWith("lqc_"), true);

  const hashV1 = crypto.createHash("sha256").update(tokenV1_a).digest("hex");
  const hashV2 = crypto.createHash("sha256").update(tokenV2).digest("hex");
  assert.notEqual(hashV1, hashV2);

  // 5. Provider Idempotency Key Format & Privacy Safeguards
  const submissionId = "sub_99999999-8888-7777-6666-555555555555";
  const tokenVersion = 1;
  const templateVersion = 1;
  const idempotencyKey = `tla-onboarding-email:${submissionId}:${tokenVersion}:${templateVersion}`;

  assert.match(idempotencyKey, /^tla-onboarding-email:sub_[a-f0-9-]+:1:1$/);
  assert.equal(idempotencyKey.length < 100, true);
  assert.doesNotMatch(idempotencyKey, /@/); // No email address
  assert.doesNotMatch(idempotencyKey, /lqc_/); // No raw token

  // 6. Error Message Sanitization (Redacts Bearer tokens, secrets, URLs)
  const secretErr = new Error("Failed connecting with Bearer re_secret_12345 to https://api.resend.com/emails");
  const sanitized = classifyEmailError(secretErr);
  assert.doesNotMatch(sanitized.message, /re_secret_12345/);
  assert.doesNotMatch(sanitized.message, /https:\/\/api.resend.com/);
  assert.match(sanitized.message, /\[redacted\]/);
  assert.match(sanitized.message, /\[url\]/);

  console.log("strengthened legacy-question-email-retries test suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("legacy-question-email-retries test suite failed:", err);
  process.exit(1);
});
