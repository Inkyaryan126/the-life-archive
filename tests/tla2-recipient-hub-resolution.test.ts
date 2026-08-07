import assert from "node:assert/strict";
import { generateSecureKeepsakeCode } from "../lib/keepsake-codes";
import { resolveKeepsakeExperience } from "../lib/tla2-keepsake-resolver";
import {
  isMemoryEligibleForRecipientView,
  evaluateTimeCapsuleTeaser
} from "../lib/tla2-foundation";

async function runTla2RecipientHubResolutionTests() {
  console.log("Starting TLA 2.0 Phase 2 Recipient Hub Resolution Test Suite...");

  // 1. New ks_ bearer code generation & format validation
  const ksToken = generateSecureKeepsakeCode();
  assert.equal(ksToken.startsWith("ks_"), true, "Bearer code must start with ks_");
  assert.equal(ksToken.length, 27, "Bearer code must be 27 characters long");

  // 2. Invalid code resolution returns clean error without leaking database exceptions
  const invalidResult = await resolveKeepsakeExperience("invalid_code_xyz");
  assert.equal(invalidResult.ok, false, "Invalid keepsake code must fail safely");

  // 3. Disabled / Revoked keepsake resolution returns clean error
  const fakeRevokedToken = "ks_000000000000000000000000";
  const revokedResult = await resolveKeepsakeExperience(fakeRevokedToken);
  assert.equal(revokedResult.ok, false, "Revoked keepsake token must fail safely");

  // 4. Memory Allowlist Authorization Filtering
  const unAuthorizedMemory = isMemoryEligibleForRecipientView({
    memoryId: "mem-secret",
    isAuthorizedInAllowlist: false
  });
  assert.equal(
    unAuthorizedMemory,
    false,
    "Memory outside connection_memories allowlist MUST NOT be accessible"
  );

  // 5. Time Capsule Safety Rules Verification
  // Scheduled Time Capsule
  const scheduledLock = isMemoryEligibleForRecipientView({
    memoryId: "mem-scheduled-1",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "scheduled",
      deliverAt: "2035-01-01T00:00:00Z",
      deliveredAt: null,
      canceledAt: null
    }
  });
  assert.equal(scheduledLock, false, "Scheduled Time Capsule MUST be locked");

  // Processing Time Capsule
  const processingLock = isMemoryEligibleForRecipientView({
    memoryId: "mem-processing-1",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "processing",
      deliverAt: "2035-01-01T00:00:00Z",
      deliveredAt: null,
      canceledAt: null
    }
  });
  assert.equal(processingLock, false, "Processing Time Capsule MUST be locked");

  // Failed Time Capsule
  const failedLock = isMemoryEligibleForRecipientView({
    memoryId: "mem-failed-1",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "failed",
      deliverAt: "2020-01-01T00:00:00Z",
      deliveredAt: null,
      canceledAt: null
    }
  });
  assert.equal(failedLock, false, "Failed undelivered Time Capsule MUST be locked");

  // Canceled Time Capsule
  const canceledLock = isMemoryEligibleForRecipientView({
    memoryId: "mem-canceled-1",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "delivered",
      deliverAt: "2020-01-01T00:00:00Z",
      deliveredAt: "2020-01-01T00:05:00Z",
      canceledAt: "2020-01-02T00:00:00Z"
    }
  });
  assert.equal(canceledLock, false, "Canceled Time Capsule MUST be locked");

  // Delivered Time Capsule
  const deliveredEligible = isMemoryEligibleForRecipientView({
    memoryId: "mem-delivered-1",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "delivered",
      deliverAt: "2020-01-01T00:00:00Z",
      deliveredAt: "2020-01-01T00:05:00Z",
      canceledAt: null
    }
  });
  assert.equal(deliveredEligible, true, "Delivered Time Capsule MUST be eligible when authorized");

  // 6. Time Capsule Teaser / Countdown Metadata Safety
  const hiddenTeaser = evaluateTimeCapsuleTeaser({
    deliveryId: "del-1",
    deliverAt: "2030-01-01T00:00:00Z",
    preUnlockVisibility: "hidden",
    title: "Secret Birthday Letter",
    status: "scheduled",
    canceledAt: null
  });
  assert.equal(hiddenTeaser, null, "Hidden Time Capsule MUST return null teaser");

  const countdownTeaser = evaluateTimeCapsuleTeaser({
    deliveryId: "del-2",
    deliverAt: "2030-01-01T00:00:00Z",
    preUnlockVisibility: "countdown",
    title: "Happy Birthday Letter",
    status: "scheduled",
    canceledAt: null
  });
  assert.ok(countdownTeaser !== null, "Countdown Time Capsule MUST return teaser metadata");
  assert.equal(countdownTeaser?.title, "Happy Birthday Letter");
  assert.equal(countdownTeaser?.visibility, "countdown");

  console.log("TLA 2.0 Phase 2 Recipient Hub Resolution Test Suite passed cleanly!");
}

runTla2RecipientHubResolutionTests().catch((err) => {
  console.error("TLA 2.0 Recipient Hub Resolution test suite failed:", err);
  process.exit(1);
});
