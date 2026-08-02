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

  // 1. Image Assets & Guide Image Verification
  const guidePath = join(process.cwd(), "site-design/archive-building-design/final-wishes-guide.png");
  const siteDesignBgPath = join(process.cwd(), "site-design/archive-building-design/final-wishes.png");
  const prodBgPath = join(process.cwd(), "public/images/archive-building/final-wishes.png");

  assert.ok(existsSync(guidePath), "Guide image site-design/archive-building-design/final-wishes-guide.png must exist");
  assert.ok(existsSync(siteDesignBgPath), "Site design background image must exist");
  assert.ok(existsSync(prodBgPath), "Production background image must exist");

  const guideBuf = readFileSync(guidePath);
  const guideWidth = guideBuf.readUInt32BE(16);
  const guideHeight = guideBuf.readUInt32BE(20);

  assert.equal(guideWidth, 1535, "Guide image width must be 1535px");
  assert.equal(guideHeight, 1024, "Guide image height must be 1024px");

  // 2. Guide Box Region Coordinates in FinalWishesClient.tsx
  const clientComponentPath = join(process.cwd(), "components/final-wishes/FinalWishesClient.tsx");
  const clientContent = readFileSync(clientComponentPath, "utf8");

  // Upper-left identity region coordinates (x: 301, y: 37, w: 212, h: 70)
  assert.match(clientContent, /upperLeftIdentityRegion/, "Client component must define upperLeftIdentityRegion");
  assert.match(clientContent, /left:\s*19\.6091/, "upperLeftIdentityRegion must use measured left coordinate (19.6091%)");
  assert.match(clientContent, /top:\s*3\.6133/, "upperLeftIdentityRegion must use measured top coordinate (3.6133%)");
  assert.match(clientContent, /width:\s*13\.8111/, "upperLeftIdentityRegion must use measured width coordinate (13.8111%)");
  assert.match(clientContent, /height:\s*6\.8359/, "upperLeftIdentityRegion must use measured height coordinate (6.8359%)");

  // Upper-right navigation region coordinates (x: 1283, y: 28, w: 214, h: 71)
  assert.match(clientContent, /upperRightNavRegion/, "Client component must define upperRightNavRegion");
  assert.match(clientContent, /left:\s*83\.5831/, "upperRightNavRegion must use measured left coordinate (83.5831%)");
  assert.match(clientContent, /top:\s*2\.7344/, "upperRightNavRegion must use measured top coordinate (2.7344%)");
  assert.match(clientContent, /width:\s*13\.9414/, "upperRightNavRegion must use measured width coordinate (13.9414%)");
  assert.match(clientContent, /height:\s*6\.9336/, "upperRightNavRegion must use measured height coordinate (6.9336%)");

  // Large parchment region coordinates (x: 574, y: 454, w: 762, h: 494)
  assert.match(clientContent, /parchmentRegion/, "Client component must define parchmentRegion");
  assert.match(clientContent, /left:\s*37\.3941/, "parchmentRegion must use measured left coordinate (37.3941%)");
  assert.match(clientContent, /top:\s*44\.3359/, "parchmentRegion must use measured top coordinate (44.3359%)");
  assert.match(clientContent, /width:\s*49\.6417/, "parchmentRegion must use measured width coordinate (49.6417%)");
  assert.match(clientContent, /height:\s*48\.2422/, "parchmentRegion must use measured height coordinate (48.2422%)");

  // 3. UI Element Verification
  assert.doesNotMatch(clientContent, /activeArchiveImageRegion|profilePhotoUrl/i, "User photo / avatar must be removed from Final Wishes");
  assert.doesNotMatch(clientContent, /<select/i, "Archive selector dropdown must be removed from Final Wishes page");
  const identityBlock = clientContent.slice(
    clientContent.indexOf("region={upperLeftIdentityRegion}"),
    clientContent.indexOf("</ArchiveOverlayRegion>")
  );
  assert.doesNotMatch(identityBlock, /Living Archive/i, "LIVING ARCHIVE subtitle must be removed from upper-left identity region");

  assert.match(clientContent, /activeArchive\.archiveName/, "Identity box must render active archive name");
  assert.match(clientContent, /line-clamp-2/, "Archive name must support balanced multi-line wrapping");
  assert.match(clientContent, /href="\/dashboard"/, "Upper-right navigation region must link to /dashboard");
  assert.match(clientContent, /aria-label="Return to My Archives"/, "Upper-right region must have accessible aria-label");

  // 4. Form Styling, Fixed Rectangular Safe Fit & Placeholder Contrast Verification
  const formComponentPath = join(process.cwd(), "components/final-wishes/FinalWishesForm.tsx");
  const formContent = readFileSync(formComponentPath, "utf8");

  assert.match(formContent, /bg-transparent/, "Form background must be transparent");
  assert.match(formContent, /scrollbar-none/, "Form must hide scrollbars while preserving scrolling");
  assert.doesNotMatch(formContent, /clip-path|clipPath|polygon/i, "Form must not use clip-path or polygon clipping");
  assert.match(formContent, /max-w-\[560px\]/, "Form must use a fixed safe rectangular content width (max-w-[560px])");
  assert.match(formContent, /px-5/, "Form container must use generous safe horizontal padding");
  assert.doesNotMatch(formContent, /-left-|-ml-|-mr-|-translate-x/i, "Form content must not use negative horizontal offsets");
  assert.match(formContent, /placeholder-\[#6b4a2f\]/, "Placeholder text must use dark brown contrast (#6b4a2f)");
  assert.match(formContent, /italic text-\[#5e472a\]/, "Disclaimer must be simple italic parchment text");
  assert.doesNotMatch(formContent, /rounded-md border border-\[#7a5b28\]\/35 bg-\[#3c2a1e\]\/5/i, "Form fields must not use solid card containers");

  // 5. Security & Eligibility Tests
  const routePath = join(process.cwd(), "app/dashboard/final-wishes/page.tsx");
  const pageContent = readFileSync(routePath, "utf8");
  assert.match(pageContent, /eligibleArchives/, "Page must filter eligible living archives");
  assert.match(pageContent, /redirect\(/, "Page must redirect when query parameter attempts to access ineligible archive");

  const migrationPath = join(process.cwd(), "supabase/migrations/20260801140000_create_final_wishes.sql");
  const migrationContent = readFileSync(migrationPath, "utf8");
  assert.match(migrationContent, /memorial_mode = false/, "RLS must enforce Living-only archive status");
  assert.match(migrationContent, /owner_id = auth\.uid\(\)/, "RLS must restrict access to authenticated owners");

  // Server-side Central Validation Unit Tests
  const testSlug = "dustin-sigley-2";
  const validatedArchive = await requireEligibleFinalWishesArchive("local-user-id", testSlug);
  assert.ok(validatedArchive, "Valid living archive must pass eligibility check");

  await assert.rejects(
    async () => {
      await requireEligibleFinalWishesArchive("other-user-id", "nonexistent-archive-slug");
    },
    /Archive not found/i,
    "Validation must reject nonexistent archives"
  );

  // Data Save, Reload & Playlist Verification
  const savedData = await saveFinalWishes(
    testSlug,
    {
      servicePreference: "memorial",
      serviceLocation: "St. Jude Chapel",
      dispositionPreference: "cremation",
      firstContact: "Jane Sigley",
      finalMessage: "Peace and love."
    },
    [
      { title: "Amazing Grace", artist: "Judy Collins", sortOrder: 0 },
      { title: "In My Life", artist: "The Beatles", sortOrder: 1 }
    ],
    "local-user-id"
  );

  assert.equal(savedData.servicePreference, "memorial");
  assert.equal(savedData.songs.length, 2);

  const reloaded = await getFinalWishesByArchiveSlug(testSlug, "local-user-id");
  assert.ok(reloaded, "Saved Final Wishes must reload correctly");
  assert.equal(reloaded?.serviceLocation, "St. Jude Chapel");

  console.log("Final Wishes verification test suite passed cleanly!");
}

runFinalWishesTests().catch((err) => {
  console.error("Final Wishes test suite failed:", err);
  process.exit(1);
});
