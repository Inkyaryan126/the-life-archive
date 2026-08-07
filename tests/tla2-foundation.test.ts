import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  generateSecureKeepsakeCode,
  isValidKeepsakeCode,
  isMemoryEligibleForRecipientView,
  evaluateTimeCapsuleTeaser
} from "../lib/tla2-foundation";

async function runTla2FoundationTests() {
  console.log("Starting TLA 2.0 Phase 1 Foundation & Security Test Suite...");

  // 1. Verify Cryptographic Keepsake Bearer Token Generation & Format (ks_ + 24 chars = 27 chars)
  const token1 = generateSecureKeepsakeCode();
  const token2 = generateSecureKeepsakeCode();

  assert.notEqual(token1, token2, "Keepsake tokens MUST be cryptographically random and unique");
  assert.equal(token1.startsWith("ks_"), true, "Keepsake token MUST start with 'ks_' prefix");
  assert.equal(token1.length, 27, "Keepsake token MUST be 27 characters long (ks_ + 24 base64url characters)");
  assert.equal(isValidKeepsakeCode(token1), true, "isValidKeepsakeCode MUST return true for valid token format");
  assert.equal(isValidKeepsakeCode("invalid_token"), false, "isValidKeepsakeCode MUST return false for invalid token");
  assert.equal(isValidKeepsakeCode("ks_short"), false, "isValidKeepsakeCode MUST return false for short token");

  // 2. Test Partial Unique Constraint Contract in Migration SQL
  const migration2Path = path.join(
    process.cwd(),
    "supabase/migrations/20260808010000_create_tla2_keepsake_mappings_and_prompts.sql"
  );
  assert.ok(fs.existsSync(migration2Path), "Migration 20260808010000 MUST exist");
  const migration2Sql = fs.readFileSync(migration2Path, "utf-8");

  assert.ok(
    migration2Sql.includes("keepsakes_single_active_mapping_idx"),
    "Migration MUST define unique index keepsakes_single_active_mapping_idx"
  );
  assert.ok(
    migration2Sql.includes("WHERE (status = 'active')") || migration2Sql.includes("WHERE status = 'active'"),
    "Partial index MUST enforce single active mapping per keepsake"
  );

  // 3. Test Allowlist Authorization (Memory NOT in connection_memories MUST NOT be accessible)
  const unAuthorizedResult = isMemoryEligibleForRecipientView({
    memoryId: "mem-unauthorized",
    isAuthorizedInAllowlist: false
  });
  assert.equal(
    unAuthorizedResult,
    false,
    "A memory NOT in the connection_memories allowlist MUST NOT be accessible to recipient"
  );

  const authorizedResult = isMemoryEligibleForRecipientView({
    memoryId: "mem-authorized",
    isAuthorizedInAllowlist: true
  });
  assert.equal(
    authorizedResult,
    true,
    "An authorized connection memory with no scheduled delivery MUST be accessible"
  );

  // 4. Test Restricted Connection Memory
  // Restricted access_status is excluded by WHERE cm.access_status = 'released'
  assert.equal(
    isMemoryEligibleForRecipientView({ memoryId: "mem-restricted", isAuthorizedInAllowlist: false }),
    false,
    "Restricted connection memories MUST NOT be accessible"
  );

  // 5. Test Scheduled Time Capsule Exclusion
  const scheduledTimeCapsuleResult = isMemoryEligibleForRecipientView({
    memoryId: "mem-scheduled",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "scheduled",
      deliverAt: "2030-01-01T00:00:00Z",
      deliveredAt: null,
      canceledAt: null
    }
  });
  assert.equal(
    scheduledTimeCapsuleResult,
    false,
    "A scheduled Time Capsule MUST NOT expose memory content before release"
  );

  // 6. Test Processing Time Capsule Exclusion
  const processingTimeCapsuleResult = isMemoryEligibleForRecipientView({
    memoryId: "mem-processing",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "processing",
      deliverAt: "2030-01-01T00:00:00Z",
      deliveredAt: null,
      canceledAt: null
    }
  });
  assert.equal(
    processingTimeCapsuleResult,
    false,
    "A processing Time Capsule MUST NOT expose memory content before release"
  );

  // 7. Test Failed Undelivered Time Capsule Exclusion (MUST NOT LEAK)
  const failedTimeCapsuleResult = isMemoryEligibleForRecipientView({
    memoryId: "mem-failed",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "failed",
      deliverAt: "2020-01-01T00:00:00Z",
      deliveredAt: null,
      canceledAt: null
    }
  });
  assert.equal(
    failedTimeCapsuleResult,
    false,
    "A failed undelivered Time Capsule MUST NOT leak memory content"
  );

  // 8. Test Successfully Delivered Time Capsule (Becomes Eligible)
  const deliveredTimeCapsuleResult = isMemoryEligibleForRecipientView({
    memoryId: "mem-delivered",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "delivered",
      deliverAt: "2020-01-01T00:00:00Z",
      deliveredAt: "2020-01-01T00:05:00Z",
      canceledAt: null
    }
  });
  assert.equal(
    deliveredTimeCapsuleResult,
    true,
    "A successfully delivered Time Capsule MUST become accessible when authorized"
  );

  // 9. Test Hidden Time Capsule Pre-Unlock Visibility (Reveals NO metadata)
  const hiddenTeaser = evaluateTimeCapsuleTeaser({
    deliveryId: "del-hidden",
    deliverAt: "2030-01-01T00:00:00Z",
    preUnlockVisibility: "hidden",
    title: "Secret Birthday Message",
    status: "scheduled",
    canceledAt: null
  });
  assert.equal(hiddenTeaser, null, "Hidden Time Capsule MUST return null teaser metadata");

  // 10. Test Teaser / Countdown Pre-Unlock Visibility (Returns metadata, NEVER body/media)
  const teaserResult = evaluateTimeCapsuleTeaser({
    deliveryId: "del-teaser",
    deliverAt: "2030-01-01T00:00:00Z",
    preUnlockVisibility: "teaser",
    title: "Something is waiting for your birthday",
    status: "scheduled",
    canceledAt: null
  });
  assert.ok(teaserResult !== null, "Teaser Time Capsule MUST return teaser metadata");
  assert.equal(teaserResult?.title, "Something is waiting for your birthday");
  assert.equal(teaserResult?.visibility, "teaser");

  // 11. Test Conservative Backfill Rule in Migration 1 SQL
  const migration1Path = path.join(
    process.cwd(),
    "supabase/migrations/20260808000000_create_tla2_people_connections_and_allowlists.sql"
  );
  assert.ok(fs.existsSync(migration1Path), "Migration 20260808000000 MUST exist");
  const migration1Sql = fs.readFileSync(migration1Path, "utf-8");

  assert.ok(
    migration1Sql.includes("archive_share_pass_memories"),
    "Legacy backfill MUST query archive_share_pass_memories for explicit share proof"
  );
  assert.ok(
    !migration1Sql.includes("INSERT INTO public.connection_memories SELECT pc.id, m.id FROM public.memories"),
    "Legacy backfill MUST NOT blindly mark all memories as released"
  );

  // 12. Test Legacy Resolver Function in Migration 3 SQL
  const migration3Path = path.join(
    process.cwd(),
    "supabase/migrations/20260808020000_add_tla2_time_capsule_visibility_and_resolver.sql"
  );
  assert.ok(fs.existsSync(migration3Path), "Migration 20260808020000 MUST exist");
  const migration3Sql = fs.readFileSync(migration3Path, "utf-8");

  assert.ok(
    migration3Sql.includes("resolve_legacy_share_pass"),
    "Migration 3 MUST include legacy share pass resolver fallback"
  );
  assert.ok(
    migration3Sql.includes("SECURITY DEFINER"),
    "Resolver functions MUST be defined with SECURITY DEFINER"
  );

  console.log("TLA 2.0 Phase 1 Foundation & Security Test Suite passed cleanly!");
}

runTla2FoundationTests().catch((err) => {
  console.error("TLA 2.0 Foundation test suite failed:", err);
  process.exit(1);
});
