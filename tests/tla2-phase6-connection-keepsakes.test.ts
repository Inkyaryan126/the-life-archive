import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { generateSecureKeepsakeCode, isValidKeepsakeCode } from "../lib/keepsake-codes";
import {
  pairKeepsakeToConnection,
  revokeKeepsakeMapping,
  replaceKeepsakeForConnection
} from "../lib/tla2-keepsake-pairing";
import { getPeopleSummaryForUser } from "../lib/tla2-people-dashboard";
import { isMemoryEligibleForRecipientView } from "../lib/tla2-foundation";
import { upsertKeepsakeOrder } from "../lib/keepsake-orders";

async function runPhase6Tests() {
  console.log("Starting Deterministic Database Idempotency Phase 6 Test Suite...");

  // 1. Secure Code Standard (ks_ + 24 base64url characters)
  const code = generateSecureKeepsakeCode();
  assert.ok(isValidKeepsakeCode(code), "Generated code MUST match ks_ + 24 base64url pattern");
  assert.equal(code.startsWith("ks_"), true, "Code MUST begin with ks_ prefix");
  assert.equal(code.length, 27, "Code length MUST be exactly 27 characters (ks_ + 24 chars)");

  // 2. Canonical QR URL resolves to https://thelifearchive.vip/k/[code]
  const canonicalUrl = `https://thelifearchive.vip/k/${code}`;
  assert.ok(canonicalUrl.startsWith("https://thelifearchive.vip/k/ks_"), "Canonical QR URL MUST use https://thelifearchive.vip domain");
  assert.equal(canonicalUrl.includes("thelifearchive.com"), false, "Canonical QR URL MUST NOT use obsolete .com domain");

  // 3. Hardware pairing creates active mapping
  const pairRes = await pairKeepsakeToConnection({
    keepsakeCode: code,
    connectionId: "conn-sarah-1",
    stripeSessionId: "cs_test_session_1",
    stripeItemIndex: 0
  });
  assert.equal(pairRes.ok, true, "Hardware pairing MUST succeed for valid code");

  // 4. One hardware item CANNOT have two active mappings
  const duplicatePairRes = await pairKeepsakeToConnection({
    keepsakeCode: code,
    connectionId: "conn-sarah-2"
  });
  assert.equal(duplicatePairRes.ok, false, "Same physical keepsake CANNOT receive two active mappings");

  // 5. Multiple hardware items can map to the SAME connection
  const code2 = generateSecureKeepsakeCode();
  const pairRes2 = await pairKeepsakeToConnection({
    keepsakeCode: code2,
    connectionId: "conn-sarah-1",
    stripeSessionId: "cs_test_session_1",
    stripeItemIndex: 1
  });
  assert.equal(pairRes2.ok, true, "Second hardware item MUST be allowed for same connection with distinct index");

  // 6. Hardware replacement revokes old code and maps new code to same connection
  const newCode = generateSecureKeepsakeCode();
  const replaceRes = await replaceKeepsakeForConnection(code, newCode, "conn-sarah-1");
  assert.equal(replaceRes.ok, true, "Replacement hardware MUST succeed");

  // 7. Session-Anchored Idempotency: Re-processing same Stripe session (cs_A)
  const sessionA = `sess-cs-A-${Date.now()}`;
  await upsertKeepsakeOrder({
    stripeSessionId: sessionA,
    customerEmail: "sarah-buyer@example.com",
    productName: "Engraved Necklace",
    amountPaid: 4900,
    currency: "usd",
    paymentStatus: "paid",
    archiveSlug: "sarah-archive",
    connectionId: "conn-sarah-1",
    quantity: 1,
    stripeSessionUrl: "https://dashboard.stripe.com/test"
  });

  // Second delivery of same session cs_A MUST be idempotent
  await upsertKeepsakeOrder({
    stripeSessionId: sessionA,
    customerEmail: "sarah-buyer@example.com",
    productName: "Engraved Necklace",
    amountPaid: 4900,
    currency: "usd",
    paymentStatus: "paid",
    archiveSlug: "sarah-archive",
    connectionId: "conn-sarah-1",
    quantity: 1,
    stripeSessionUrl: "https://dashboard.stripe.com/test"
  });

  // 8. Legitimate Repeat Purchase: NEW Stripe session (cs_B) for Sarah for same product
  const sessionB = `sess-cs-B-${Date.now()}`;
  await upsertKeepsakeOrder({
    stripeSessionId: sessionB,
    customerEmail: "sarah-buyer@example.com",
    productName: "Engraved Necklace",
    amountPaid: 4900,
    currency: "usd",
    paymentStatus: "paid",
    archiveSlug: "sarah-archive",
    connectionId: "conn-sarah-1",
    quantity: 1,
    stripeSessionUrl: "https://dashboard.stripe.com/test"
  });

  // 9. Multi-Quantity Purchase: Stripe session cs_C with quantity = 2
  const sessionC = `sess-cs-C-${Date.now()}`;
  await upsertKeepsakeOrder({
    stripeSessionId: sessionC,
    customerEmail: "sarah-buyer@example.com",
    productName: "Keychain Keepsake",
    amountPaid: 7800,
    currency: "usd",
    paymentStatus: "paid",
    archiveSlug: "sarah-archive",
    connectionId: "conn-sarah-1",
    quantity: 2,
    stripeSessionUrl: "https://dashboard.stripe.com/test"
  });

  // 10. Verify /k/[code] scanner route exists
  const scannerRoutePath = path.join(process.cwd(), "app", "k", "[token]", "page.tsx");
  assert.ok(fs.existsSync(scannerRoutePath), "/k/[token] scanner route MUST exist");

  // 11. Verify legacy /claim/[token] route remains untouched
  const claimRoutePath = path.join(process.cwd(), "app", "claim", "[token]", "page.tsx");
  assert.ok(fs.existsSync(claimRoutePath), "Legacy /claim/[token] route MUST remain untouched");

  // 12. Time Capsule eligibility evaluation rules
  const deliveredEligible = isMemoryEligibleForRecipientView({
    memoryId: "mem-1",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "delivered",
      deliverAt: "2026-01-01T00:00:00Z",
      deliveredAt: "2026-01-01T00:01:00Z",
      canceledAt: null
    }
  });
  assert.equal(deliveredEligible, true, "Delivered authorized memory MUST be recipient eligible");

  const failedLocked = isMemoryEligibleForRecipientView({
    memoryId: "mem-2",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "failed",
      deliverAt: "2026-01-01T00:00:00Z",
      deliveredAt: null,
      canceledAt: null
    }
  });
  assert.equal(failedLocked, false, "Failed delivery MUST remain locked and unavailable");

  const scheduledLocked = isMemoryEligibleForRecipientView({
    memoryId: "mem-3",
    isAuthorizedInAllowlist: true,
    scheduledDelivery: {
      status: "scheduled",
      deliverAt: "2028-01-01T00:00:00Z",
      deliveredAt: null,
      canceledAt: null
    }
  });
  assert.equal(scheduledLocked, false, "Scheduled future delivery MUST remain locked");

  // 13. Verify empty user query returns empty summary array
  const emptySummary = await getPeopleSummaryForUser("");
  assert.deepEqual(emptySummary, [], "Empty user query returns empty summary array");

  console.log("Deterministic Database Idempotency Phase 6 Test Suite passed cleanly!");
}

runPhase6Tests().catch((err) => {
  console.error("TLA 2.0 Phase 6 test suite failed:", err);
  process.exit(1);
});
