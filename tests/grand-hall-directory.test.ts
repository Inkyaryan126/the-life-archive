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

  // Verify explicit row geometry definitions (not equal-height single flex grid)
  assert.match(pageContent, /directoryRowGeometries: DirectoryRowGeometry\[\] = \[/);

  // 3. Verify Legacy Question & Support After a Loss are ABSENT from physical directory board
  assert.doesNotMatch(
    pageContent,
    /title: "The Legacy Question"/,
    "Legacy Question must not appear on the physical directory board"
  );
  assert.doesNotMatch(
    pageContent,
    /id: "support-after-loss"/,
    "Support After a Loss must not be rendered on the physical directory board"
  );

  // Verify Support After a Loss route still exists in app/
  const afterLossRoute = join(process.cwd(), "app", "after-a-loss", "page.tsx");
  assert.ok(existsSync(afterLossRoute), "/after-a-loss route must remain intact");

  // 4. Verify exactly 9 clickable directory destinations
  const topRows = ["My Archives", "Create an Archive", "Continuity Capsule", "Time Capsules", "Keepsakes"];
  const bottomRows = ["Eternism", "The Observatory", "The Manifesto", "Eternism FAQ"];

  for (const title of topRows) {
    assert.ok(pageContent.includes(`title: "${title}"`), `Top section must contain: ${title}`);
  }

  for (const title of bottomRows) {
    assert.ok(pageContent.includes(`title: "${title}"`), `Bottom section must contain: ${title}`);
  }

  // Count clickable items in directoryRowGeometries
  const clickableMatches = pageContent.match(/id: "(?!eternism-divider")[^"]+"/g) || [];
  assert.equal(clickableMatches.length, 9, "Must have exactly 9 clickable directory rows");

  // 5. Verify non-clickable ETERNISM divider heading
  assert.match(pageContent, /id: "eternism-divider"/);
  assert.match(pageContent, /isHeader: true/);

  // 6. Verify destination routes
  assert.match(pageContent, /href: "\/create"/);
  assert.match(pageContent, /href: "\/keepsakes"/);
  assert.match(pageContent, /href: "\/eternism"/);
  assert.match(pageContent, /href: "\/eternism\/observatory"/);
  assert.match(pageContent, /href: "\/eternism\/manifesto"/);
  assert.match(pageContent, /href: "\/eternism\/faq"/);

  console.log("Grand Hall directory verification tests passed cleanly!");
}

runTests().catch((err) => {
  console.error("Grand Hall directory test suite failed:", err);
  process.exit(1);
});
