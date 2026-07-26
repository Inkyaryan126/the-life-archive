import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

async function runTests() {
  console.log("Starting Grand Hall directory verification test suite...");

  // 1. Verify intended background image file path & existence
  const imageRelativePath = "public/images/archive-building/archive-map.png";
  const imageAbsolutePath = join(process.cwd(), imageRelativePath);
  assert.ok(existsSync(imageAbsolutePath), `Background image file must exist at ${imageRelativePath}`);

  // Check image natural dimensions (1448 x 1086)
  const imageBuffer = readFileSync(imageAbsolutePath);
  const width = imageBuffer.readUInt32BE(16);
  const height = imageBuffer.readUInt32BE(20);
  assert.equal(width, 1448, "Background image width must be 1448px");
  assert.equal(height, 1086, "Background image height must be 1086px");

  // 2. Inspect app/page.tsx file contents
  const homePagePath = join(process.cwd(), "app", "page.tsx");
  const pageContent = readFileSync(homePagePath, "utf8");

  // Verify single-column region geometry uses percentage-based values
  assert.match(pageContent, /desktopDirectoryRegion = \{/);
  assert.match(pageContent, /left: 39/);
  assert.match(pageContent, /top: 20\.4/);
  assert.match(pageContent, /width: 22/);
  assert.match(pageContent, /height: 64/);

  // 3. Verify Legacy Question is NOT rendered on the physical directory board
  assert.doesNotMatch(
    pageContent,
    /ariaLabel: "Start with The Legacy Question/,
    "Legacy Question must not appear on the main directory board"
  );

  // 4. Verify all 10 requested directory destinations are present
  const requiredDestinations = [
    "My Archives",
    "Create an Archive",
    "Continuity Capsule",
    "Time Capsules",
    "Keepsakes",
    "Support After a Loss",
    "Eternism",
    "The Observatory",
    "The Manifesto",
    "Eternism FAQ"
  ];

  for (const title of requiredDestinations) {
    assert.ok(
      pageContent.includes(`title: "${title}"`),
      `Directory must contain destination: ${title}`
    );
  }

  // 5. Verify ETERNISM section header and routes
  assert.match(pageContent, /title: "ETERNISM"/);
  assert.match(pageContent, /href: "\/eternism"/);
  assert.match(pageContent, /href: "\/eternism\/observatory"/);
  assert.match(pageContent, /href: "\/eternism\/manifesto"/);
  assert.match(pageContent, /href: "\/eternism\/faq"/);

  // 6. Verify Help, Privacy, Terms are NOT placed on the physical board
  assert.doesNotMatch(
    pageContent,
    /href: "#information",[\s\S]*?desktopDirectoryRegion/,
    "Privacy and Help links must not be placed on the physical board"
  );

  // 7. Verify Legacy Question onboarding route & lib file still exist
  const legacyQuestionRoute = join(process.cwd(), "app", "legacy-question", "page.tsx");
  const legacyQuestionLib = join(process.cwd(), "lib", "legacy-question-onboarding.ts");
  assert.ok(existsSync(legacyQuestionRoute), "/legacy-question route must remain intact");
  assert.ok(existsSync(legacyQuestionLib), "lib/legacy-question-onboarding.ts must remain intact");

  console.log("Grand Hall directory verification tests passed cleanly!");
}

runTests().catch((err) => {
  console.error("Grand Hall directory test suite failed:", err);
  process.exit(1);
});
