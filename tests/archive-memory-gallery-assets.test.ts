import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  photoFrameConfigs,
  getDeterministicPhotoFrame,
  getDeterministicTilt,
  hashString
} from "../lib/archive-memory-helpers";

async function runArchiveMemoryGalleryAssetsTests() {
  console.log("Starting Archive Memory Gallery Assets Test Suite...");

  // 1. Verify Asset Files Exist in Canonical Subfolder Structure
  const requiredAssets = [
    "public/images/archive-assets/frames/ornate-gold-frame.png",
    "public/images/archive-assets/frames/dark-wood-frame.png",
    "public/images/archive-assets/frames/polaroid-frame.png",
    "public/images/archive-assets/frames/vintage-photo-corners.png",
    "public/images/archive-assets/audio/cassette-memory.png",
    "public/images/archive-assets/books/open-antique-journal.png",
    "public/images/archive-assets/music/vinyl-record.png",
    "public/images/archive-assets/video/filmstrip-frame.png",
    "public/images/archive-assets/cards/parchment-life-lesson.png",
    "public/images/archive-assets/labels/brass-memory-plaque.png"
  ];

  requiredAssets.forEach((assetPath) => {
    const fullPath = path.join(process.cwd(), assetPath);
    assert.ok(fs.existsSync(fullPath), `Asset file MUST exist at canonical location: ${assetPath}`);
  });

  // 2. Verify No Generic ChatGPT Filenames Remain in Root archive-assets/
  const rootAssetFiles = fs.readdirSync(path.join(process.cwd(), "public/images/archive-assets"));
  const chatGptFiles = rootAssetFiles.filter((f) => f.includes("ChatGPT"));
  assert.equal(
    chatGptFiles.length,
    0,
    `No generic ChatGPT filenames should remain in archive-assets root, found: ${chatGptFiles.join(", ")}`
  );

  // 3. Verify Memory Type to Asset Mappings
  assert.equal(
    photoFrameConfigs.gold.asset,
    "/images/archive-assets/frames/ornate-gold-frame.png",
    "Photo gold frame asset path must match"
  );
  assert.equal(
    photoFrameConfigs.wood.asset,
    "/images/archive-assets/frames/dark-wood-frame.png",
    "Photo wood frame asset path must match"
  );

  // 4. Verify Deterministic Frame & Tilt Assignment
  const memoryId1 = "mem-12345";
  const memoryId2 = "mem-67890";

  const frame1a = getDeterministicPhotoFrame(memoryId1);
  const frame1b = getDeterministicPhotoFrame(memoryId1);
  assert.equal(frame1a, frame1b, "Frame assignment MUST be deterministic for the same memory ID");

  const tilt1a = getDeterministicTilt(memoryId2);
  const tilt1b = getDeterministicTilt(memoryId2);
  assert.equal(tilt1a, tilt1b, "Tilt assignment MUST be deterministic for the same memory ID");

  // 5. Verify Memory Page Source Code Structure
  const pageFile = fs.readFileSync(path.join(process.cwd(), "app/archive/[slug]/memories/page.tsx"), "utf-8");
  assert.ok(pageFile.includes("MemoryGallery"), "Memories page MUST render MemoryGallery");
  assert.ok(!pageFile.includes("MemoryCard"), "Old generic MemoryCard grid MUST be removed from memories page");

  console.log("Archive Memory Gallery Assets Test Suite passed cleanly!");
}

runArchiveMemoryGalleryAssetsTests().catch((err) => {
  console.error("Archive Memory Gallery Assets test suite failed:", err);
  process.exit(1);
});
