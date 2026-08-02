import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getFinalWishesByArchiveSlug,
  saveFinalWishes
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

  // Verify existing hotspots remain present
  assert.match(dashboardContent, /activeArchiveImageRegion/, "Active archive image region must remain present");
  assert.match(dashboardContent, /activeArchiveInfoRegion/, "Active archive info region must remain present");
  assert.match(dashboardContent, /shelfBookRegions/, "Shelf book regions must remain present");
  assert.match(dashboardContent, /recentMemoryRegions/, "Recent memory regions must remain present");
  assert.match(dashboardContent, /addArchiveActionRegions/, "Add archive action regions must remain present");

  // Confirm Final Wishes hotspot does not overlap with any existing interactive regions
  const fwLeft = 85.0163;
  const fwTop = 73.5352;
  const fwRight = fwLeft + 14.5277;
  const fwBottom = fwTop + 21.6797;

  const otherRegions = [
    { name: "dashboardSideNavRegion", left: 1.6287, top: 21.6797, width: 13.8762, height: 71.4844 },
    { name: "activeArchiveImageRegion", left: 19.8697, top: 6.543, width: 15.5049, height: 28.0273 },
    { name: "activeArchiveInfoRegion", left: 38.7622, top: 2.6367, width: 18.3062, height: 43.0664 },
    { name: "shelfBook1", left: 61.0423, top: 14.9414, width: 5.8632, height: 18.457 },
    { name: "recentMemory1", left: 29.9023, top: 53.125, width: 19.6091, height: 8.8867 },
    { name: "addArchiveAction1", left: 53.2899, top: 58.2031, width: 22.671, height: 10.2539 }
  ];

  for (const reg of otherRegions) {
    const regRight = reg.left + reg.width;
    const regBottom = reg.top + reg.height;
    const overlaps = !(fwRight <= reg.left || regRight <= fwLeft || fwBottom <= reg.top || regBottom <= fwTop);
    assert.ok(!overlaps, `Final Wishes hotspot must not overlap with ${reg.name}`);
  }

  // 3. Route & Component Architecture Verification
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

  // Check RLS & non-public policy in migration
  const migrationContent = readFileSync(migrationPath, "utf8");
  assert.match(migrationContent, /enable row level security/, "RLS must be enabled on tables");
  assert.match(migrationContent, /auth\.uid\(\)\s*=\s*user_id/, "RLS must restrict access to authenticated owners");
  assert.doesNotMatch(migrationContent, /anon|public.*read/i, "Final Wishes must not be publicly readable");

  // 4. Data Save, Reload & Validation Unit Tests (Local Fallback)
  const testSlug = "dustin-sigley-2";

  // Test song title validation
  await assert.rejects(
    async () => {
      await saveFinalWishes(
        testSlug,
        { servicePreference: "celebration_of_life" },
        [{ title: "   ", artist: "Unknown" }]
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
    ]
  );

  assert.equal(savedData.servicePreference, "memorial");
  assert.equal(savedData.serviceLocation, "St. Jude Chapel");
  assert.equal(savedData.dispositionPreference, "cremation");
  assert.equal(savedData.songs.length, 2);
  assert.equal(savedData.songs[0].title, "Amazing Grace");
  assert.equal(savedData.songs[1].title, "In My Life");
  assert.equal(savedData.songs[0].sortOrder, 0);
  assert.equal(savedData.songs[1].sortOrder, 1);

  // Test data reloads correctly
  const reloaded = await getFinalWishesByArchiveSlug(testSlug);
  assert.ok(reloaded, "Saved Final Wishes must reload correctly");
  assert.equal(reloaded?.serviceLocation, "St. Jude Chapel");
  assert.equal(reloaded?.songs.length, 2);
  assert.equal(reloaded?.songs[0].title, "Amazing Grace");
  assert.equal(reloaded?.songs[1].title, "In My Life");

  // Test Playlist Reordering & Removal
  const reorderedData = await saveFinalWishes(
    testSlug,
    { servicePreference: "memorial" },
    [
      { title: "In My Life", artist: "The Beatles", sortOrder: 0 },
      { title: "Amazing Grace", artist: "Judy Collins", sortOrder: 1 },
      { title: "What a Wonderful World", artist: "Louis Armstrong", sortOrder: 2 }
    ]
  );

  assert.equal(reorderedData.songs.length, 3);
  assert.equal(reorderedData.songs[0].title, "In My Life");
  assert.equal(reorderedData.songs[1].title, "Amazing Grace");
  assert.equal(reorderedData.songs[2].title, "What a Wonderful World");

  // Check reloaded song order
  const reloaded2 = await getFinalWishesByArchiveSlug(testSlug);
  assert.equal(reloaded2?.songs[0].title, "In My Life");
  assert.equal(reloaded2?.songs[1].title, "Amazing Grace");
  assert.equal(reloaded2?.songs[2].title, "What a Wonderful World");

  // 5. Mobile & Responsive Layout checks
  const clientContent = readFileSync(clientComponentPath, "utf8");
  assert.match(clientContent, /ArchiveMobileScene/, "Client component must use ArchiveMobileScene for mobile view");
  assert.match(clientContent, /max-h-\[80vh\]|overflow-hidden/, "Mobile container must prevent unconstrained overflow");

  console.log("Final Wishes verification test suite passed cleanly!");
}

runFinalWishesTests().catch((err) => {
  console.error("Final Wishes test suite failed:", err);
  process.exit(1);
});
