import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getFinalWishesByArchiveSlug,
  saveFinalWishes,
  requireEligibleFinalWishesArchive
} from "../lib/final-wishes-data";

async function runFinalWishesTests() {
  console.log("Starting Final Wishes verification test suite...");

  // 1. Image Assets Verification
  const prodMyArchivesPath = join(process.cwd(), "public/images/archive-building/my-archives.png");
  const siteDesignMyArchivesPath = join(process.cwd(), "site-design/archive-building-design/my-archives.png");
  const updatedMyArchivesGuide = join(process.cwd(), "site-design/archive-building-design/my-archives-guide.png");
  const newBgPath = join(process.cwd(), "public/images/archive-building/final-wishes.png");
  const siteDesignBgPath = join(process.cwd(), "site-design/archive-building-design/final-wishes.png");

  assert.ok(existsSync(prodMyArchivesPath), "Production image public/images/archive-building/my-archives.png must exist");
  assert.ok(existsSync(siteDesignMyArchivesPath), "Site design image site-design/archive-building-design/my-archives.png must exist");
  assert.ok(existsSync(updatedMyArchivesGuide), "Updated guide image site-design/archive-building-design/my-archives-guide.png must exist");
  assert.ok(existsSync(newBgPath), "Production image public/images/archive-building/final-wishes.png must exist");
  assert.ok(existsSync(siteDesignBgPath), "Site design image site-design/archive-building-design/final-wishes.png must exist");

  // Verify production image matches current source image byte-for-byte or by file hash
  const prodBuf = readFileSync(prodMyArchivesPath);
  const srcBuf = readFileSync(siteDesignMyArchivesPath);
  const guideBuf = readFileSync(updatedMyArchivesGuide);

  assert.ok(prodBuf.equals(srcBuf), "Production image must match current source image byte-for-byte");

  // Verify dimensions of source and guide images (1535 x 1024)
  const srcWidth = srcBuf.readUInt32BE(16);
  const srcHeight = srcBuf.readUInt32BE(20);
  const guideWidth = guideBuf.readUInt32BE(16);
  const guideHeight = guideBuf.readUInt32BE(20);

  assert.equal(srcWidth, 1535, "Source image width must be 1535px");
  assert.equal(srcHeight, 1024, "Source image height must be 1024px");
  assert.equal(guideWidth, 1535, "Guide image width must be 1535px");
  assert.equal(guideHeight, 1024, "Guide image height must be 1024px");
  assert.equal(srcWidth / srcHeight, guideWidth / guideHeight, "Source and guide images must share exact aspect ratio");

  // 2. Hotspot on My Archive (app/dashboard/page.tsx)
  const dashboardPagePath = join(process.cwd(), "app/dashboard/page.tsx");
  const dashboardContent = readFileSync(dashboardPagePath, "utf8");

  assert.match(dashboardContent, /finalWishesRegion/, "Dashboard page must define finalWishesRegion");
  assert.match(dashboardContent, /left:\s*85\.0163/, "finalWishesRegion must use re-measured left coordinate (85.0163%)");
  assert.match(dashboardContent, /top:\s*73\.5352/, "finalWishesRegion must use re-measured top coordinate (73.5352%)");
  assert.match(dashboardContent, /width:\s*14\.5277/, "finalWishesRegion must use re-measured width coordinate (14.5277%)");
  assert.match(dashboardContent, /height:\s*21\.6797/, "finalWishesRegion must use re-measured height coordinate (21.6797%)");

  assert.match(dashboardContent, /ariaLabel="Open Final Wishes"/, "Dashboard page must render accessible label 'Open Final Wishes'");
  assert.match(dashboardContent, /href="\/dashboard\/final-wishes"/, "Hotspot must link to /dashboard/final-wishes");
  assert.match(dashboardContent, /focus:ring-2/, "Hotspot link must support keyboard accessibility with focus indicator");

  // 3. Route & Component Security & Eligibility Verification
  const routePath = join(process.cwd(), "app/dashboard/final-wishes/page.tsx");
  const actionPath = join(process.cwd(), "app/dashboard/final-wishes/actions.ts");
  const formComponentPath = join(process.cwd(), "components/final-wishes/FinalWishesForm.tsx");
  const clientComponentPath = join(process.cwd(), "components/final-wishes/FinalWishesClient.tsx");
  const migrationPath = join(process.cwd(), "supabase/migrations/20260801140000_create_final_wishes.sql");

  assert.ok(existsSync(routePath), "Route /dashboard/final-wishes/page.tsx must exist");
  assert.ok(existsSync(actionPath), "Server action file actions.ts must exist");
  assert.ok(existsSync(formComponentPath), "FinalWishesForm component must exist");
  assert.ok(existsSync(clientComponentPath), "FinalWishesClient component must exist");
  assert.ok(existsSync(migrationPath), "Supabase migration 20260801140000_create_final_wishes.sql must exist");

  const pageContent = readFileSync(routePath, "utf8");
  assert.match(pageContent, /eligibleArchives/, "Page must filter eligible living archives");
  assert.match(pageContent, /requestedIsEligible/, "Page must validate requested archive query parameter against eligible archives");
  assert.match(pageContent, /redirect\(/, "Page must redirect when query parameter attempts to access ineligible archive");

  const clientContent = readFileSync(clientComponentPath, "utf8");
  assert.match(clientContent, /bg-transparent/, "Client component overlay must use transparent background");
  assert.match(clientContent, /otherEligibleArchives\.length > 0/, "Archive selector must only show when multiple eligible archives exist");
  assert.match(clientContent, /Final Wishes Unavailable/, "Polished empty state must exist when no eligible archives exist");

  const formContent = readFileSync(formComponentPath, "utf8");
  assert.match(formContent, /scrollbar-none/, "Form must hide ugly scrollbars while preserving scrolling");
  assert.match(formContent, /bg-transparent/, "Form background must be transparent to fit parchment");

  // Check RLS in migration prevents memorial archives & non-owner access
  const migrationContent = readFileSync(migrationPath, "utf8");
  assert.match(migrationContent, /enable row level security/, "RLS must be enabled on tables");
  assert.match(migrationContent, /memorial_mode = false/, "RLS must enforce Living-only archive status");
  assert.match(migrationContent, /owner_id = auth\.uid\(\)/, "RLS must restrict access to authenticated owners");

  // 4. Server-side Central Validation Unit Tests
  const testSlug = "dustin-sigley-2";

  // Test requireEligibleFinalWishesArchive on valid living archive
  const validatedArchive = await requireEligibleFinalWishesArchive("local-user-id", testSlug);
  assert.ok(validatedArchive, "Valid living archive must pass eligibility check");

  // Test server-side validation error handling on invalid user or nonexistent archive
  await assert.rejects(
    async () => {
      await requireEligibleFinalWishesArchive("other-user-id", "nonexistent-archive-slug");
    },
    /Archive not found/i,
    "Validation must reject nonexistent archives"
  );

  // 5. Data Save, Reload & Validation Unit Tests
  await assert.rejects(
    async () => {
      await saveFinalWishes(
        testSlug,
        { servicePreference: "celebration_of_life" },
        [{ title: "   ", artist: "Unknown" }],
        "local-user-id"
      );
    },
    /Song #1 requires a valid title|Song title is required/i,
    "Validation must prevent saving a song without a title"
  );

  // Test successful save of Final Wishes and Playlist
  const savedData = await saveFinalWishes(
    testSlug,
    {
      servicePreference: "memorial",
      serviceLocation: "St. Jude Chapel",
      dispositionPreference: "cremation",
      ashesInstructions: "Scattered in the Pacific",
      firstContact: "Jane Sigley (Wife)",
      obituaryName: "Dustin Sigley",
      clothingPreference: "Classic Navy Suit",
      finalMessage: "Peace and love to all my family."
    },
    [
      { title: "Amazing Grace", artist: "Judy Collins", sortOrder: 0 },
      { title: "In My Life", artist: "The Beatles", sortOrder: 1 }
    ],
    "local-user-id"
  );

  assert.equal(savedData.servicePreference, "memorial");
  assert.equal(savedData.serviceLocation, "St. Jude Chapel");
  assert.equal(savedData.dispositionPreference, "cremation");
  assert.equal(savedData.songs.length, 2);
  assert.equal(savedData.songs[0].title, "Amazing Grace");
  assert.equal(savedData.songs[1].title, "In My Life");

  // Test data reloads correctly
  const reloaded = await getFinalWishesByArchiveSlug(testSlug, "local-user-id");
  assert.ok(reloaded, "Saved Final Wishes must reload correctly");
  assert.equal(reloaded?.serviceLocation, "St. Jude Chapel");
  assert.equal(reloaded?.songs.length, 2);

  // Test Playlist Reordering & Removal
  const reorderedData = await saveFinalWishes(
    testSlug,
    { servicePreference: "memorial" },
    [
      { title: "In My Life", artist: "The Beatles", sortOrder: 0 },
      { title: "Amazing Grace", artist: "Judy Collins", sortOrder: 1 },
      { title: "What a Wonderful World", artist: "Louis Armstrong", sortOrder: 2 }
    ],
    "local-user-id"
  );

  assert.equal(reorderedData.songs.length, 3);
  assert.equal(reorderedData.songs[0].title, "In My Life");
  assert.equal(reorderedData.songs[1].title, "Amazing Grace");
  assert.equal(reorderedData.songs[2].title, "What a Wonderful World");

  console.log("Final Wishes verification test suite passed cleanly!");
}

runFinalWishesTests().catch((err) => {
  console.error("Final Wishes test suite failed:", err);
  process.exit(1);
});
