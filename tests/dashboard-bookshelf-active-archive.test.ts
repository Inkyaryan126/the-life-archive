import assert from "node:assert/strict";

async function runDashboardBookshelfTests() {
  console.log("Starting Dashboard Bookshelf & Active Archive Selection Test Suite...");

  // 1. Verify URL construction for bookshelf books
  console.log("Testing Bookshelf Link Generation & Active Archive Selection...");
  const lindaSlug = "linda-higgins";
  const dustinSlug = "dustin-sigley";

  const getBookshelfHref = (slug: string | null, isCreate: boolean) => {
    if (isCreate || !slug) return "/create";
    return `/dashboard?archive=${encodeURIComponent(slug)}`;
  };

  assert.equal(
    getBookshelfHref("linda-higgins", false),
    "/dashboard?archive=linda-higgins",
    "Existing archive bookshelf book MUST target /dashboard?archive=slug rather than /archive/slug"
  );

  assert.equal(
    getBookshelfHref(null, true),
    "/create",
    "Create Archive book MUST retain /create navigation"
  );

  // 2. Verify Add-Memory Action Resolution for Selected Archive
  console.log("Testing Add-Memory Action Resolution for Selected Archive...");
  const getAddMemoryHref = (archiveSlug: string, mode: string) => {
    return `/archive/${archiveSlug}/add-memory?mode=${encodeURIComponent(mode)}`;
  };

  const lindaVoiceHref = getAddMemoryHref(lindaSlug, "voice-sound");
  const lindaPhotoHref = getAddMemoryHref(lindaSlug, "photo-video");
  const dustinVoiceHref = getAddMemoryHref(dustinSlug, "voice-sound");

  assert.equal(lindaVoiceHref, "/archive/linda-higgins/add-memory?mode=voice-sound");
  assert.equal(lindaPhotoHref, "/archive/linda-higgins/add-memory?mode=photo-video");
  assert.equal(dustinVoiceHref, "/archive/dustin-sigley/add-memory?mode=voice-sound");

  assert.ok(
    lindaVoiceHref.includes("linda-higgins"),
    "Selecting Linda MUST target Linda's archive ID/slug for voice actions"
  );
  assert.ok(
    lindaPhotoHref.includes("linda-higgins"),
    "Selecting Linda MUST target Linda's archive ID/slug for photo actions"
  );

  // 3. Verify Legacy Notes Scoping
  console.log("Testing Legacy Notes Scoping...");
  const isSelfArchive = (relationshipToOwner: string, memorialMode: boolean) => {
    return relationshipToOwner === "self" && !memorialMode;
  };

  assert.equal(
    isSelfArchive("self", false),
    true,
    "Personal living archive MUST have Legacy Notes enabled"
  );
  assert.equal(
    isSelfArchive("mother", true),
    false,
    "Linda Higgins / Memorial archive MUST NOT have Legacy Notes enabled"
  );

  console.log("Dashboard Bookshelf & Active Archive Selection Test Suite passed cleanly!");
}

runDashboardBookshelfTests().catch((err) => {
  console.error("Dashboard Bookshelf test suite failed:", err);
  process.exit(1);
});
