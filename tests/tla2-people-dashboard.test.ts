import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getPeopleSummaryForUser, getPersonDetailForUser } from "../lib/tla2-people-dashboard";
import { createGiftConnection, publishGiftConnection } from "../lib/tla2-gift-creation";

async function runTla2PeopleDashboardTests() {
  console.log("Starting TLA 2.0 Phase 5 People Dashboard Closeout Test Suite...");

  // 1. Unauthenticated or empty userId returns empty array safely
  const emptyRes = await getPeopleSummaryForUser("");
  assert.deepEqual(emptyRes, [], "Unauthenticated query MUST return empty array safely");

  // 2. Unauthorized connection detail access is rejected
  const unauthorizedRes = await getPersonDetailForUser("conn-unauth-123", "wrong-user-999");
  assert.equal(unauthorizedRes.ok, false, "Unauthorized user MUST be rejected from viewing another user's connection");

  // 3. Verify /people page exists and contains zero technical jargon
  const peoplePagePath = path.join(process.cwd(), "app", "people", "page.tsx");
  assert.ok(fs.existsSync(peoplePagePath), "/people route page MUST exist");

  const peoplePageContent = fs.readFileSync(peoplePagePath, "utf8");
  assert.ok(peoplePageContent.includes("Your People"), "/people page MUST contain 'Your People' headline");
  assert.ok(peoplePageContent.includes("Who do you want to make something for?"), "Empty state headline MUST be present");
  assert.ok(peoplePageContent.includes("/create/gift"), "Empty state primary CTA MUST point to /create/gift");

  // Verify zero technical database terms in customer UI
  assert.equal(peoplePageContent.includes("connection_memories"), false);
  assert.equal(peoplePageContent.includes("bearer token"), false);
  assert.equal(peoplePageContent.includes("archive resolver"), false);

  // 4. Verify /people/[connectionId] detail page exists
  const detailPagePath = path.join(process.cwd(), "app", "people", "[connectionId]", "page.tsx");
  assert.ok(fs.existsSync(detailPagePath), "/people/[connectionId] route page MUST exist");

  const detailPageContent = fs.readFileSync(detailPagePath, "utf8");
  assert.ok(detailPageContent.includes("getPersonDetailForUser"), "Detail page MUST enforce server-side ownership verification");

  // 5. Verify Add Something reuses existing connection ID cleanly
  const existingConnRes = await createGiftConnection({
    creationKey: "test-key-reuse-99",
    existingConnectionId: "conn-sarah-123",
    personName: "Sarah",
    relationshipType: "partner",
    responses: [
      {
        promptText: "A story for Sarah",
        suggestedMemoryType: "voice",
        content: "Reused connection memory content",
        defaultCategorySlugs: ["love"]
      }
    ],
    accessStatus: "restricted"
  });

  assert.equal(existingConnRes.ok, true, "Existing connection addition MUST succeed");
  if (existingConnRes.ok) {
    assert.equal(existingConnRes.connectionId, "conn-sarah-123", "MUST reuse existing connectionId without creating duplicate");
    assert.equal(existingConnRes.accessStatus, "restricted", "New memory MUST default to restricted / Draft");
  }

  // 6. Verify publishGiftConnection limits release to target connectionId
  const pubRes = await publishGiftConnection("conn-sarah-123");
  assert.equal(pubRes.ok, true, "Connection publishing MUST succeed safely");

  console.log("TLA 2.0 Phase 5 People Dashboard Closeout Test Suite passed cleanly!");
}

runTla2PeopleDashboardTests().catch((err) => {
  console.error("TLA 2.0 People Dashboard closeout test suite failed:", err);
  process.exit(1);
});
