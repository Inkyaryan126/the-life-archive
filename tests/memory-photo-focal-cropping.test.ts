import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function isPortraitImage(width: number, height: number): boolean {
  return height > width;
}

function getFocalObjectPosition(isPortrait: boolean): string {
  return isPortrait ? "center 15%" : "center 18%";
}

async function runMemoryPhotoFocalCroppingTests() {
  console.log("Starting Memory Photo Focal Cropping Test Suite...");

  // 1. Verify Orientation Detection
  assert.equal(isPortraitImage(1000, 1500), true, "Tall images (1000x1500) MUST be detected as portrait");
  assert.equal(isPortraitImage(1500, 1000), false, "Wide images (1500x1000) MUST be detected as landscape");
  assert.equal(isPortraitImage(1000, 1000), false, "Square images (1000x1000) MUST NOT be forced portrait");

  // 2. Verify Top-Focused Focal Object Position
  const portraitPosition = getFocalObjectPosition(true);
  assert.equal(portraitPosition, "center 15%", "Portrait photos MUST use top-anchored object position center 15%");

  const landscapePosition = getFocalObjectPosition(false);
  assert.equal(landscapePosition, "center 18%", "Landscape photos MUST use top-anchored object position center 18%");

  // 3. Verify MemoryPhotoImage File Contract
  const componentPath = path.join(process.cwd(), "components/media/MemoryPhotoImage.tsx");
  assert.ok(fs.existsSync(componentPath), "MemoryPhotoImage component file MUST exist");
  const componentContent = fs.readFileSync(componentPath, "utf-8");
  assert.ok(componentContent.includes("objectPosition"), "MemoryPhotoImage MUST specify custom objectPosition");
  assert.ok(componentContent.includes("center 15%"), "MemoryPhotoImage MUST include center 15% top focal position");

  // 4. Verify PhotoMemoryObject File Contract
  const photoObjPath = path.join(process.cwd(), "components/archive/memories/PhotoMemoryObject.tsx");
  const photoObjContent = fs.readFileSync(photoObjPath, "utf-8");
  assert.ok(photoObjContent.includes("objectPosition"), "PhotoMemoryObject MUST specify custom objectPosition");

  console.log("Memory Photo Focal Cropping Test Suite passed cleanly!");
}

runMemoryPhotoFocalCroppingTests().catch((err) => {
  console.error("Memory Photo Focal Cropping test suite failed:", err);
  process.exit(1);
});
