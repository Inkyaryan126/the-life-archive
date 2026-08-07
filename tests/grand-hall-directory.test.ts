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

  // 2. Verify design guide image exists as a reference
  const guideRelativePath = "site-design/archive-building-design/archive-map-guide.png";
  const guideAbsolutePath = join(process.cwd(), guideRelativePath);
  assert.ok(existsSync(guideAbsolutePath), `Guide image must exist at ${guideRelativePath}`);

  // 3. Verify /after-a-loss route remains intact in app/
  const afterLossRoute = join(process.cwd(), "app", "after-a-loss", "page.tsx");
  assert.ok(existsSync(afterLossRoute), "/after-a-loss route must remain intact");

  // 4. Verify Grand Hall component and room arrival components remain preserved for archive rooms
  const grandHallRoute = join(process.cwd(), "app", "archive", "[slug]", "grand-hall", "page.tsx");
  assert.ok(existsSync(grandHallRoute), "Grand Hall route /archive/[slug]/grand-hall must remain intact");

  const arrivalComponent = join(process.cwd(), "components", "archive-building", "ArchiveArrival.tsx");
  assert.ok(existsSync(arrivalComponent), "ArchiveArrival component must remain intact");

  console.log("Grand Hall directory verification tests passed cleanly!");
}

runTests().catch((err) => {
  console.error("Grand Hall directory test suite failed:", err);
  process.exit(1);
});
