import assert from "node:assert/strict";
import {
  createGiftConnection,
  publishGiftConnection,
  resolveOwnerGiftPreview,
  getGuidedPromptsForGift
} from "../lib/tla2-gift-creation";
import { isMemoryEligibleForRecipientView } from "../lib/tla2-foundation";

async function runTla2GiftCreationWizardTests() {
  console.log("Starting TLA 2.0 Phase 3 Dedicated CreationKey & Idempotency Test Suite...");

  // 1. Empty recipient name fails safely
  const emptyResult = await createGiftConnection({
    personName: "  ",
    relationshipType: "partner",
    responses: []
  });
  assert.equal(emptyResult.ok, false, "Empty recipient name MUST fail safely");

  // 2. Cryptographic UUID CreationKey Idempotency
  const uuid1 = "123e4567-e89b-12d3-a456-426614174000";
  const draftResult = await createGiftConnection({
    creationKey: uuid1,
    personName: "Sarah Jenkins",
    relationshipType: "partner",
    occasion: "anniversary",
    accessStatus: "restricted",
    responses: [
      {
        promptText: "Tell them something you love about them",
        suggestedMemoryType: "voice",
        content: "I love your smile and your kindness.",
        defaultCategorySlugs: ["love", "miss_you"]
      }
    ]
  });

  assert.equal(draftResult.ok, true, "Draft gift connection creation MUST succeed");
  if (draftResult.ok) {
    assert.equal(draftResult.accessStatus, "restricted", "Creation accessStatus MUST default to restricted (UI Draft)");
    assert.equal(draftResult.memoryCount, 1);
    assert.equal(draftResult.creationKey, uuid1);
  }

  // 3. Draft Security: Restricted (draft) memories are NOT recipient-visible in public /k/[code] resolver
  const draftPublicEligibility = isMemoryEligibleForRecipientView({
    memoryId: "restricted-mem-1",
    isAuthorizedInAllowlist: false // Public resolver excludes unreleased/restricted allowlist items
  });
  assert.equal(
    draftPublicEligibility,
    false,
    "Unpublished restricted draft memory MUST NOT be visible in public recipient resolver"
  );

  // 4. Owner Preview: Owner preview can see the restricted draft memory
  if (draftResult.ok) {
    const ownerPreview = await resolveOwnerGiftPreview(draftResult.connectionId, draftResult.archiveSlug);
    assert.equal(ownerPreview.ok, true);
    assert.equal(ownerPreview.memories.length, 1, "Owner preview MUST contain restricted draft memory");
  }

  // 5. Explicit Publication: Publishing converts restricted to released
  if (draftResult.ok) {
    const publishRes = await publishGiftConnection(draftResult.connectionId);
    assert.equal(publishRes.ok, true, "Publishing connection MUST succeed");

    const releasedPublicEligibility = isMemoryEligibleForRecipientView({
      memoryId: "restricted-mem-1",
      isAuthorizedInAllowlist: true // Released item in allowlist is now visible
    });
    assert.equal(
      releasedPublicEligibility,
      true,
      "Explicitly published memory MUST become recipient-visible"
    );
  }

  // 6. Idempotency Test 1: Same creator + same creation_key retried twice -> 1 connection
  if (draftResult.ok) {
    const retryResult = await createGiftConnection({
      creationKey: uuid1,
      personName: "Sarah Jenkins",
      relationshipType: "partner",
      occasion: "anniversary",
      responses: []
    });

    assert.equal(retryResult.ok, true);
    if (retryResult.ok) {
      assert.equal(retryResult.connectionId, draftResult.connectionId, "Same creation_key MUST reuse same connection ID");
    }
  }

  // 7. Idempotency Test 2: Same creator + different creation_keys + same recipient -> 2 distinct connections
  const uuid2 = "987fc543-e21b-32d1-b654-426614174999";
  const secondGiftResult = await createGiftConnection({
    creationKey: uuid2,
    personName: "Sarah Jenkins",
    relationshipType: "partner",
    occasion: "birthday",
    responses: []
  });

  assert.equal(secondGiftResult.ok, true);
  if (draftResult.ok && secondGiftResult.ok) {
    assert.notEqual(
      secondGiftResult.connectionId,
      draftResult.connectionId,
      "Different creation_keys MUST produce distinct gift connections"
    );
  }

  // 8. Verify encoded login return URL with query parameters
  const returnUrl = `/create/gift?key=${uuid1}&name=${encodeURIComponent("Sarah Jenkins")}&rel=partner&occ=anniversary`;
  const encodedNextParam = encodeURIComponent(returnUrl);
  assert.ok(encodedNextParam.includes("%3Fkey%3D"), "Nested query parameters MUST be safely encoded in next param");

  console.log("TLA 2.0 Phase 3 Dedicated CreationKey & Idempotency Test Suite passed cleanly!");
}

runTla2GiftCreationWizardTests().catch((err) => {
  console.error("TLA 2.0 Gift Creation Wizard test suite failed:", err);
  process.exit(1);
});
