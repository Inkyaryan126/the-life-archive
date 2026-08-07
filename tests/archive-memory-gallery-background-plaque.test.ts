import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

async function runArchiveMemoryGalleryBackgroundPlaqueTests() {
  console.log("Starting Archive Memory Gallery Background & Plaque Test Suite...");

  // 1. Verify Memories Page Background Asset Reference
  const pagePath = path.join(process.cwd(), "app/archive/[slug]/memories/page.tsx");
  assert.ok(fs.existsSync(pagePath), "Memories page MUST exist");
  const pageContent = fs.readFileSync(pagePath, "utf-8");

  assert.ok(
    pageContent.includes("/images/archive-assets/background.png"),
    "Memories page MUST specify /images/archive-assets/background.png as background image"
  );
  assert.ok(
    pageContent.includes("#0d0a08"),
    "Memories page MUST specify matching dark background color #0d0a08"
  );

  // 2. Verify MemoryPlaque Safe Bounds & Title Clamping
  const plaquePath = path.join(process.cwd(), "components/archive/memories/MemoryPlaque.tsx");
  assert.ok(fs.existsSync(plaquePath), "MemoryPlaque component file MUST exist");
  const plaqueContent = fs.readFileSync(plaquePath, "utf-8");

  assert.ok(
    plaqueContent.includes("/images/archive-assets/labels/brass-memory-plaque.png"),
    "MemoryPlaque MUST use brass-memory-plaque.png asset"
  );
  assert.ok(
    plaqueContent.includes("16%"),
    "MemoryPlaque MUST use safe inner bounds inset excluding ornate side borders"
  );
  assert.ok(
    plaqueContent.includes("line-clamp-2"),
    "MemoryPlaque MUST support 2-line title clamping for long titles"
  );
  assert.ok(
    plaqueContent.includes("title={title}"),
    "MemoryPlaque MUST preserve full title via title attribute for accessibility"
  );

  console.log("Archive Memory Gallery Background & Plaque Test Suite passed cleanly!");
}

runArchiveMemoryGalleryBackgroundPlaqueTests().catch((err) => {
  console.error("Archive Memory Gallery Background & Plaque test suite failed:", err);
  process.exit(1);
});
