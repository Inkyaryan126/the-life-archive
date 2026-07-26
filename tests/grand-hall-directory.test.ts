import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

async function runTests() {
  console.log("Starting Grand Hall directory verification test suite...");

  // 1. Verify intended background image file path & existence
  const imageRelativePath = "public/images/archive-building/archive-map.png";
  const imageAbsolutePath = join(process.cwd(), imageRelativePath);
  assert.ok(existsSync(imageAbsolutePath), `Production background image must exist at ${imageRelativePath}`);

  // Check image natural dimensions (1448 x 1086)
  const imageBuffer = readFileSync(imageAbsolutePath);
  const width = imageBuffer.readUInt32BE(16);
  const height = imageBuffer.readUInt32BE(20);
  assert.equal(width, 1448, "Background image width must be 1448px");
  assert.equal(height, 1086, "Background image height must be 1086px");

  // 2. Verify design guide image exists as a reference and is NOT used as production background
  const guideRelativePath = "site-design/archive-building-design/archive-map-guide.png";
  const guideAbsolutePath = join(process.cwd(), guideRelativePath);
  assert.ok(existsSync(guideAbsolutePath), `Guide image must exist at ${guideRelativePath}`);

  const homePagePath = join(process.cwd(), "app", "page.tsx");
  const pageContent = readFileSync(homePagePath, "utf8");

  assert.match(pageContent, /archive-map\.png/, "Production must use archive-map.png");
  assert.doesNotMatch(
    pageContent,
    /import.*archive-map-guide|src=.*archive-map-guide/,
    "Production code must not use archive-map-guide.png as live background"
  );

  // Source assertion confirming geometry was derived from 1448 x 1086 guide dimensions
  assert.match(
    pageContent,
    /1448 x 1086 guide dimensions/,
    "Source assertion: geometry must state derivation from 1448 x 1086 guide dimensions"
  );

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

  // 4. Verify exactly 9 clickable destination overlays exist with explicit independent geometries
  const topRows = ["My Archives", "Create an Archive", "Continuity Capsule", "Time Capsules", "Keepsakes"];
  const bottomRows = ["Eternism", "The Observatory", "The Manifesto", "Eternism FAQ"];

  for (const title of topRows) {
    assert.ok(pageContent.includes(`title: "${title}"`), `Top section must contain: ${title}`);
  }

  for (const title of bottomRows) {
    assert.ok(pageContent.includes(`title: "${title}"`), `Bottom section must contain: ${title}`);
  }

  // Verify explicit row geometry definitions (no equal-height auto-distribution grid)
  assert.match(pageContent, /directoryRowGeometries: DirectoryRowGeometry\[\] = \[/);

  // Extract geometry objects from page.tsx
  const geomMatches = [...pageContent.matchAll(/id:\s*"([^"]+)",[\s\S]*?top:\s*([0-9.]+),[\s\S]*?height:\s*([0-9.]+),[\s\S]*?left:\s*([0-9.]+),[\s\S]*?width:\s*([0-9.]+)/g)];
  assert.equal(geomMatches.length, 9, "Must have exactly 9 explicit independent row geometry definitions");

  const seenGeometries = new Set<string>();

  geomMatches.forEach((m, idx) => {
    const id = m[1];
    const top = parseFloat(m[2]);
    const rowHeight = parseFloat(m[3]);
    const left = parseFloat(m[4]);
    const rowWidth = parseFloat(m[5]);

    // Percentage checks
    assert.ok(top > 0 && top < 100, `Row ${id} top (${top}%) must be between 0 and 100%`);
    assert.ok(rowHeight > 0 && rowHeight < 100, `Row ${id} height (${rowHeight}%) must be between 0 and 100%`);
    assert.ok(left > 0 && left < 100, `Row ${id} left (${left}%) must be between 0 and 100%`);
    assert.ok(rowWidth > 0 && rowWidth < 100, `Row ${id} width (${rowWidth}%) must be between 0 and 100%`);

    // Bounds check
    assert.ok(left + rowWidth <= 100, `Row ${id} must remain within horizontal bounds (left+width <= 100%)`);
    assert.ok(top + rowHeight <= 100, `Row ${id} must remain within vertical bounds (top+height <= 100%)`);

    // Duplicate check
    const key = `${top.toFixed(4)},${left.toFixed(4)},${rowWidth.toFixed(4)},${rowHeight.toFixed(4)}`;
    assert.ok(!seenGeometries.has(key), `Row ${id} must not have duplicate geometry coordinates`);
    seenGeometries.add(key);

    // Strictly increasing order check
    if (idx > 0) {
      const prevTop = parseFloat(geomMatches[idx - 1][2]);
      assert.ok(top > prevTop, `Row ${id} top (${top}%) must be strictly greater than previous row top (${prevTop}%)`);
    }
  });

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
