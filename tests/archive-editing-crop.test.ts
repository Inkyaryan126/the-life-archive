import assert from "node:assert/strict";
import {
  normalizeHeroCropValues,
  getArchiveHeroImageStyle,
  DEFAULT_HERO_IMAGE_POSITION_X,
  DEFAULT_HERO_IMAGE_POSITION_Y,
  DEFAULT_HERO_IMAGE_ZOOM
} from "../lib/archive-hero-image";
import { updateArchive, getArchiveBySlug } from "../lib/archive-data";

async function runArchiveEditingCropTests() {
  console.log("Starting Archive Editing & Hero Photo Crop Test Suite...");

  // 1. Test Default Crop Values & Normalization
  console.log("Testing Crop Normalization Defaults & Fallbacks...");
  const defaultCrop = normalizeHeroCropValues();
  assert.equal(defaultCrop.x, DEFAULT_HERO_IMAGE_POSITION_X);
  assert.equal(defaultCrop.y, DEFAULT_HERO_IMAGE_POSITION_Y);
  assert.equal(defaultCrop.zoom, DEFAULT_HERO_IMAGE_ZOOM);

  const nullCrop = normalizeHeroCropValues({ positionX: null, positionY: null, zoom: null });
  assert.equal(nullCrop.x, 50);
  assert.equal(nullCrop.y, 50);
  assert.equal(nullCrop.zoom, 1.0);

  // 2. Test Clamping Out-of-Bounds Numbers
  console.log("Testing Clamping of Out-of-Bounds & NaN Values...");
  const clampedLow = normalizeHeroCropValues({ positionX: -20, positionY: -50, zoom: 0.2 });
  assert.equal(clampedLow.x, 0, "X should clamp to 0 minimum");
  assert.equal(clampedLow.y, 0, "Y should clamp to 0 minimum");
  assert.equal(clampedLow.zoom, 1.0, "Zoom should clamp to 1.0 minimum");

  const clampedHigh = normalizeHeroCropValues({ positionX: 150, positionY: 200, zoom: 5.5 });
  assert.equal(clampedHigh.x, 100, "X should clamp to 100 maximum");
  assert.equal(clampedHigh.y, 100, "Y should clamp to 100 maximum");
  assert.equal(clampedHigh.zoom, 3.0, "Zoom should clamp to 3.0 maximum");

  const nanCrop = normalizeHeroCropValues({ positionX: NaN, positionY: Infinity, zoom: -Infinity });
  assert.equal(nanCrop.x, 50, "NaN X should fallback to default 50");
  assert.equal(nanCrop.y, 50, "Infinity Y should fallback to default 50");
  assert.equal(nanCrop.zoom, 1.0, "-Infinity Zoom should fallback to default 1.0");

  // 3. Test Shared Style Helper Output (overflow-hidden container, cover fit, position, origin, scale transform)
  console.log("Testing getArchiveHeroImageStyle CSS Properties...");
  const styleDefault = getArchiveHeroImageStyle(50, 50, 1.0);
  assert.equal(styleDefault.objectFit, "cover");
  assert.equal(styleDefault.objectPosition, "50% 50%");
  assert.equal(styleDefault.transformOrigin, "50% 50%");
  assert.equal(styleDefault.transform, undefined, "Zoom 1.0 should omit scale transform");

  const styleCustom = getArchiveHeroImageStyle(35, 75, 1.8);
  assert.equal(styleCustom.objectFit, "cover");
  assert.equal(styleCustom.objectPosition, "35% 75%");
  assert.equal(styleCustom.transformOrigin, "35% 75%");
  assert.equal(styleCustom.transform, "scale(1.8)");

  // 4. Test Persistence of Crop Parameters in Data Layer
  console.log("Testing Data Layer Persistence of Hero Crop Metadata...");
  const testSlug = "dustin-sigley";
  const existingArchive = await getArchiveBySlug(testSlug);

  if (existingArchive) {
    const updated = await updateArchive(testSlug, {
      personName: existingArchive.personName,
      archiveName: existingArchive.archiveName,
      bio: existingArchive.bio,
      visibility: existingArchive.visibility,
      heroImagePositionX: 42,
      heroImagePositionY: 68,
      heroImageZoom: 1.5
    });

    assert.equal(updated.heroImagePositionX, 42, "Position X must persist in data layer");
    assert.equal(updated.heroImagePositionY, 68, "Position Y must persist in data layer");
    assert.equal(updated.heroImageZoom, 1.5, "Zoom must persist in data layer");

    const reloaded = await getArchiveBySlug(testSlug);
    assert.equal(reloaded?.heroImagePositionX, 42, "Reloaded archive must preserve Position X");
    assert.equal(reloaded?.heroImagePositionY, 68, "Reloaded archive must preserve Position Y");
    assert.equal(reloaded?.heroImageZoom, 1.5, "Reloaded archive must preserve Zoom");
  }

  // 5. Verify Unchanged Image Integrity When Photo Input Empty
  console.log("Testing Empty Photo Input Integrity...");
  if (existingArchive) {
    const updatedWithoutPhoto = await updateArchive(testSlug, {
      personName: "Dustin Sigley",
      heroImagePositionX: 50,
      heroImagePositionY: 50,
      heroImageZoom: 1.0
    });

    assert.ok(updatedWithoutPhoto.profilePhotoUrl, "Profile photo URL must not be cleared when no photo provided");
  }

  console.log("Archive Editing & Hero Photo Crop Test Suite passed cleanly!");
}

runArchiveEditingCropTests().catch((err) => {
  console.error("Archive Editing & Hero Photo Crop test suite failed:", err);
  process.exit(1);
});
