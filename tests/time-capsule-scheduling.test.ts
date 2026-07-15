import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Temporal } from "@js-temporal/polyfill";
import {
  getRetryDelayMinutes,
  getStaleProcessingRecoveryDecision
} from "../lib/time-capsule-recovery";
import {
  isPlausibleTimeCapsuleDeliveryToken,
  shouldExposeDeliveredMemory
} from "../lib/time-capsule-public-access";
import {
  convertLocalDeliveryDateToUtc,
  parseTimeCapsuleTimeParts,
  TimeCapsuleDomainError
} from "../lib/time-capsule-scheduling";

function assertDomainError(error: unknown, code: string) {
  assert.ok(error instanceof TimeCapsuleDomainError);
  assert.equal(error.code, code);
}

function getFutureDateParts(timezone: string) {
  const future = Temporal.Now.zonedDateTimeISO(timezone).add({ days: 2 });

  return {
    localDate: future.toPlainDate().toString(),
    localTime: "09:30",
    timezone
  };
}

{
  const result = convertLocalDeliveryDateToUtc(
    getFutureDateParts("America/New_York")
  );

  assert.equal(result.timezone, "America/New_York");
  assert.ok(result.scheduledFor.endsWith("Z"));
  assert.equal(
    Temporal.Instant.compare(
      Temporal.Instant.from(result.scheduledFor),
      Temporal.Now.instant()
    ),
    1
  );
}

{
  const timezone = "UTC";
  const past = Temporal.Now.zonedDateTimeISO(timezone).subtract({ minutes: 5 });

  assert.throws(
    () =>
      convertLocalDeliveryDateToUtc({
        localDate: past.toPlainDate().toString(),
        localTime: past.toPlainTime().toString({ smallestUnit: "minute" }),
        timezone
      }),
    (error) => {
      assertDomainError(error, "delivery_date_not_future");
      return true;
    }
  );
}

{
  assert.deepEqual(parseTimeCapsuleTimeParts("23:59"), {
    hour: 23,
    minute: 59
  });

  assert.throws(
    () => parseTimeCapsuleTimeParts("24:00"),
    (error) => {
      assertDomainError(error, "invalid_delivery_time");
      return true;
    }
  );
}

console.log("time-capsule-scheduling tests passed");

const now = new Date("2026-07-15T16:00:00.000Z");
const staleProcessingStartedAt = "2026-07-15T15:30:00.000Z";
const freshProcessingStartedAt = "2026-07-15T15:50:00.000Z";

{
  assert.equal(
    getStaleProcessingRecoveryDecision(
      {
        attemptCount: 1,
        canceledAt: null,
        deliveredAt: null,
        maxAttempts: 3,
        processingStartedAt: staleProcessingStartedAt,
        resendEmailId: "resend_123",
        status: "processing"
      },
      { now }
    ),
    "recover_accepted"
  );
}

{
  assert.equal(
    getStaleProcessingRecoveryDecision(
      {
        attemptCount: 1,
        canceledAt: null,
        deliveredAt: null,
        maxAttempts: 3,
        processingStartedAt: staleProcessingStartedAt,
        resendEmailId: null,
        status: "processing"
      },
      { now }
    ),
    "fail_retryable"
  );

  assert.equal(
    getStaleProcessingRecoveryDecision(
      {
        attemptCount: 3,
        canceledAt: null,
        deliveredAt: null,
        maxAttempts: 3,
        processingStartedAt: staleProcessingStartedAt,
        resendEmailId: null,
        status: "processing"
      },
      { now }
    ),
    "fail_exhausted"
  );
}

{
  assert.equal(
    getStaleProcessingRecoveryDecision(
      {
        attemptCount: 1,
        canceledAt: null,
        deliveredAt: null,
        maxAttempts: 3,
        processingStartedAt: freshProcessingStartedAt,
        resendEmailId: null,
        status: "processing"
      },
      { now }
    ),
    "wait"
  );

  assert.equal(
    getStaleProcessingRecoveryDecision(
      {
        attemptCount: 1,
        canceledAt: "2026-07-15T15:40:00.000Z",
        deliveredAt: null,
        maxAttempts: 3,
        processingStartedAt: staleProcessingStartedAt,
        resendEmailId: null,
        status: "canceled"
      },
      { now }
    ),
    "ignore"
  );

  assert.equal(
    getStaleProcessingRecoveryDecision(
      {
        attemptCount: 1,
        canceledAt: null,
        deliveredAt: "2026-07-15T15:40:00.000Z",
        maxAttempts: 3,
        processingStartedAt: staleProcessingStartedAt,
        resendEmailId: "resend_123",
        status: "delivered"
      },
      { now }
    ),
    "ignore"
  );
}

{
  assert.equal(getRetryDelayMinutes({ attemptCount: 1, maxAttempts: 3 }), 15);
  assert.equal(getRetryDelayMinutes({ attemptCount: 2, maxAttempts: 3 }), 60);
  assert.equal(getRetryDelayMinutes({ attemptCount: 3, maxAttempts: 3 }), null);
}

{
  assert.equal(isPlausibleTimeCapsuleDeliveryToken("short"), false);
  assert.equal(isPlausibleTimeCapsuleDeliveryToken("x".repeat(32)), true);

  assert.equal(
    shouldExposeDeliveredMemory({
      archiveId: "archive-1",
      canceledAt: null,
      deliveredAt: "2026-07-15T15:40:00.000Z",
      memoryArchiveId: "archive-1",
      memoryId: "memory-1",
      status: "delivered",
      tokenHashMatches: true,
      tokenHashPresent: true
    }),
    true
  );

  assert.equal(
    shouldExposeDeliveredMemory({
      archiveId: "archive-1",
      canceledAt: null,
      deliveredAt: "2026-07-15T15:40:00.000Z",
      memoryArchiveId: "archive-2",
      memoryId: "memory-1",
      status: "delivered",
      tokenHashMatches: true,
      tokenHashPresent: true
    }),
    false
  );

  assert.equal(
    shouldExposeDeliveredMemory({
      archiveId: "archive-1",
      canceledAt: "2026-07-15T15:41:00.000Z",
      deliveredAt: "2026-07-15T15:40:00.000Z",
      memoryArchiveId: "archive-1",
      memoryId: "memory-1",
      status: "delivered",
      tokenHashMatches: true,
      tokenHashPresent: true
    }),
    false
  );
}

{
  const migration = readFileSync(
    "supabase/migrations/20260715160000_recover_stale_time_capsule_processing.sql",
    "utf8"
  );

  assert.match(migration, /resend_email_id is not null/);
  assert.match(migration, /provider_accepted_recovery/);
  assert.match(migration, /stale_unaccepted_retry/);
  assert.match(migration, /stale_unaccepted_exhausted_candidates/);
  assert.match(migration, /for update skip locked/);
  assert.doesNotMatch(migration, /stale_unaccepted_processing/);
  assert.match(
    migration,
    /with stale_unaccepted_exhausted_candidates as \([\s\S]*?for update skip locked[\s\S]*?\)\s+update public\.scheduled_memory_deliveries/
  );
  assert.match(
    migration,
    /return query\s+with claim_candidates as \([\s\S]*?claimed_deliveries as \(\s*update public\.scheduled_memory_deliveries/
  );
  assert.match(
    migration,
    /when claim_candidates\.provider_accepted_recovery\s+then scheduled_memory_deliveries\.attempt_count\s+else scheduled_memory_deliveries\.attempt_count \+ 1/
  );
  assert.match(
    migration,
    /when claim_candidates\.stale_unaccepted_retry\s+then null\s+else scheduled_memory_deliveries\.token_hash/
  );
  assert.match(migration, /attempt_count < scheduled_memory_deliveries\.max_attempts/);
  assert.match(migration, /attempt_count >= scheduled_memory_deliveries\.max_attempts/);
  assert.match(migration, /canceled_at is null/);
  assert.match(migration, /delivered_at is null/);
}

console.log("time-capsule-recovery tests passed");
