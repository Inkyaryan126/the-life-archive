import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

async function runTla2HomepageRepositioningTests() {
  console.log("Starting TLA 2.0 Phase 4 Homepage Repositioning Test Suite...");

  const pagePath = path.join(process.cwd(), "app", "page.tsx");
  const pageContent = fs.readFileSync(pagePath, "utf8");

  // 1. Primary CTA points to /create/gift
  assert.ok(
    pageContent.includes('href="/create/gift"'),
    "Primary CTA MUST point to /create/gift"
  );

  // 2. Hero includes the new relationship positioning
  assert.ok(
    pageContent.includes("Be there,"),
    "Hero MUST include primary positioning headline 'Be there, even when you can't be.'"
  );
  assert.ok(
    pageContent.includes("One special gift. A lifetime of surprises waiting inside."),
    "Hero MUST include supporting line"
  );

  // 3. Main homepage no longer defaults visitors into Legacy Question
  assert.equal(
    pageContent.includes("/legacy-question"),
    false,
    "Main homepage MUST NOT default visitors into Legacy Question"
  );

  // 4. Eternism is absent from primary homepage navigation
  assert.equal(
    pageContent.includes("Eternism") || pageContent.includes("eternism"),
    false,
    "Eternism MUST be absent from primary homepage navigation"
  );

  // 5. Growing-gift concept is present
  assert.ok(
    pageContent.includes("Give it once. Keep adding to it forever."),
    "Growing-gift section MUST be present"
  );

  // 6. Time Capsule / future-surprise concept is present
  assert.ok(
    pageContent.includes("Messages waiting inside for later."),
    "Time Capsule / future-surprise section MUST be present"
  );

  // 7. Memorial remains discoverable but secondary
  assert.ok(
    pageContent.includes("/after-a-loss"),
    "Memorial / After a Loss support MUST remain discoverable"
  );
  assert.ok(
    pageContent.includes("what they already left becomes priceless"),
    "Restrained memorial concept MUST be present"
  );

  // 8. No dead primary navigation links
  assert.ok(pageContent.includes('href="/keepsakes"'), "Keepsakes link MUST exist");
  assert.ok(pageContent.includes('href="#how-it-works"'), "How It Works link MUST exist");
  assert.ok(pageContent.includes('href="#use-cases"'), "Use Cases link MUST exist");

  // 9. Secondary CTA points to /create intentionally
  assert.ok(pageContent.includes('href="/create"'), "Secondary CTA MUST point to /create bridge");

  // 10. Verify /go advertising route infrastructure exists
  const goRoutePath = path.join(process.cwd(), "app", "go", "[slug]", "route.ts");
  assert.ok(fs.existsSync(goRoutePath), "/go/[slug] advertising route MUST remain intact");

  // 11. No internal technical jargon in primary messaging
  assert.equal(pageContent.includes("connection_memories"), false);
  assert.equal(pageContent.includes("bearer token"), false);
  assert.equal(pageContent.includes("archive resolver"), false);

  console.log("TLA 2.0 Phase 4 Homepage Repositioning Test Suite passed cleanly!");
}

runTla2HomepageRepositioningTests().catch((err) => {
  console.error("TLA 2.0 Homepage Repositioning test suite failed:", err);
  process.exit(1);
});
