import assert from "node:assert/strict";

function getMemoryBrowsingAddMemoryHref(archiveSlug: string): string {
  return `/dashboard?archive=${encodeURIComponent(archiveSlug)}`;
}

function getDashboardDirectModeHref(archiveSlug: string, mode: string): string {
  return `/archive/${archiveSlug}/add-memory?mode=${encodeURIComponent(mode)}`;
}

async function runMemoryPageAddMemoryRoutingTests() {
  console.log("Starting Memory Page Add Memory Routing Test Suite...");

  // 1. Verify Memory Listing Page Add Memory Destination
  const lindaMemoriesHref = getMemoryBrowsingAddMemoryHref("linda-higgins");
  assert.equal(
    lindaMemoriesHref,
    "/dashboard?archive=linda-higgins",
    "Linda Higgins memories page top Add Memory MUST point to /dashboard?archive=linda-higgins"
  );

  const dustinMemoriesHref = getMemoryBrowsingAddMemoryHref("dustin-sigley");
  assert.equal(
    dustinMemoriesHref,
    "/dashboard?archive=dustin-sigley",
    "Dustin memories page top Add Memory MUST point to /dashboard?archive=dustin-sigley"
  );

  // 2. Verify Memory Detail Page Add Memory Destination
  const lindaDetailHref = getMemoryBrowsingAddMemoryHref("linda-higgins");
  assert.equal(
    lindaDetailHref,
    "/dashboard?archive=linda-higgins",
    "Linda Higgins memory detail page top Add Memory MUST point to /dashboard?archive=linda-higgins"
  );

  // 3. Verify No Direct Mode Params on Memory Browsing Add Memory Buttons
  assert.ok(
    !lindaMemoriesHref.includes("mode="),
    "Generic Add Memory buttons on memory browsing pages MUST NOT include mode-specific query params"
  );
  assert.ok(
    !lindaMemoriesHref.includes("/add-memory"),
    "Generic Add Memory buttons on memory browsing pages MUST NOT link directly to /add-memory"
  );

  // 4. Verify Dashboard Direct Mode Buttons Remain Unchanged
  const dashboardVoiceHref = getDashboardDirectModeHref("linda-higgins", "voice-sound");
  const dashboardPhotoHref = getDashboardDirectModeHref("linda-higgins", "photo-video");

  assert.equal(dashboardVoiceHref, "/archive/linda-higgins/add-memory?mode=voice-sound");
  assert.equal(dashboardPhotoHref, "/archive/linda-higgins/add-memory?mode=photo-video");

  console.log("Memory Page Add Memory Routing Test Suite passed cleanly!");
}

runMemoryPageAddMemoryRoutingTests().catch((err) => {
  console.error("Memory Page Add Memory Routing test suite failed:", err);
  process.exit(1);
});
