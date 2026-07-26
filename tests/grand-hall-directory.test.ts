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

  // 5. Verify NO standalone Eternism divider text is rendered
  assert.doesNotMatch(
    pageContent,
    /id: "eternism-divider"/,
    "No standalone Eternism divider heading should be in directoryRowGeometries"
  );
  assert.doesNotMatch(
    pageContent,
    /isHeader: true/,
    "isHeader flag must not be present for any divider heading"
  );

  // Verify the decorative divider region remains visually unused by HTML text overlays
  // Top 5 rows end around 46.04% (top 41.07 + height 4.97)
  // First lower section row starts after the decorative divider (top >= 46.85%)
  assert.match(pageContent, /top:\ 41\.07,\s*height:\ 4\.97/, "Top 5 Archive rows geometry must not be altered");
  assert.match(pageContent, /top:\ 46\.85/, "Eternism destination row overlay must be moved upward to top: 46.85%");

  // 6. Verify clickable ETERNISM destination remains present and destination routes exist
  assert.ok(pageContent.includes('title: "Eternism"'), 'Clickable ETERNISM destination must remain present');
  assert.match(pageContent, /href: "\/create"/);
  assert.match(pageContent, /href: "\/keepsakes"/);
  assert.match(pageContent, /href: "\/eternism"/);
  assert.match(pageContent, /href: "\/eternism\/observatory"/);
  assert.match(pageContent, /href: "\/eternism\/manifesto"/);
  assert.match(pageContent, /href: "\/eternism\/faq"/);

  // 7. Verify no row geometry regresses (strictly increasing top coordinates for all 9 rows)
  const topMatches = [...pageContent.matchAll(/top:\s*([0-9.]+)/g)].map((m) => parseFloat(m[1]));
  const directoryTops = topMatches.slice(0, 9);
  assert.equal(directoryTops.length, 9, "Must extract top coordinates for exactly 9 directory rows");
  for (let i = 1; i < directoryTops.length; i++) {
    assert.ok(
      directoryTops[i] > directoryTops[i - 1],
      `Row ${i} top (${directoryTops[i]}%) must be strictly greater than row ${i - 1} top (${directoryTops[i - 1]}%)`
    );
  }

  console.log("Grand Hall directory verification tests passed cleanly!");
}

runTests().catch((err) => {
  console.error("Grand Hall directory test suite failed:", err);
  process.exit(1);
});
