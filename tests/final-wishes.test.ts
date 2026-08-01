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
  const newBgPath = join(process.cwd(), "public/images/archive-building/final-wishes.png");
  const siteDesignBgPath = join(process.cwd(), "site-design/archive-building-design/final-wishes.png");
  const updatedMyArchivesGuide = join(process.cwd(), "site-design/archive-building-design/my-archives-guide.png");

  assert.ok(existsSync(newBgPath), "Production image public/images/archive-building/final-wishes.png must exist");
  assert.ok(existsSync(siteDesignBgPath), "Site design image site-design/archive-building-design/final-wishes.png must exist");
  assert.ok(existsSync(updatedMyArchivesGuide), "Updated guide image site-design/archive-building-design/my-archives-guide.png must exist");

  // 2. Hotspot on My Archive (app/dashboard/page.tsx)
  const dashboardPagePath = join(process.cwd(), "app/dashboard/page.tsx");
  const dashboardContent = readFileSync(dashboardPagePath, "utf8");

  assert.match(dashboardContent, /finalWishesRegion/, "Dashboard page must define finalWishesRegion");
  assert.match(dashboardContent, /ariaLabel="Open Final Wishes"/, "Dashboard page must render accessible label 'Open Final Wishes'");
  assert.match(dashboardContent, /href="\/dashboard\/final-wishes"/, "Hotspot must link to /dashboard/final-wishes");

  // Verify existing hotspots remain present
  assert.match(dashboardContent, /activeArchiveImageRegion/, "Active archive image region must remain present");
  assert.match(dashboardContent, /activeArchiveInfoRegion/, "Active archive info region must remain present");
  assert.match(dashboardContent, /shelfBookRegions/, "Shelf book regions must remain present");
  assert.match(dashboardContent, /recentMemoryRegions/, "Recent memory regions must remain present");
  assert.match(dashboardContent, /addArchiveActionRegions/, "Add archive action regions must remain present");

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
