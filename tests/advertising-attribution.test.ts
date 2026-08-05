import assert from "node:assert/strict";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import {
  evaluateBotConfidence,
  extractAttributionFromUrl,
  buildGroupedVisitorProfiles,
  detectOperatingSystem,
  type SiteVisitRow
} from "../lib/site-visit-utils";
import {
  sanitizeCsvField,
  getTrackableLinkBySlug,
  ensureSeedData,
  updateTrackableLink,
  DEPRECATED_ROUTES
} from "../lib/advertising-campaigns";
import { generateAdvertisingQrAssets, buildShortTrackableUrl } from "../lib/qr-generator";

async function runTests() {
  console.log("Starting Trackable Links & Prologue Redirect Routing Test Suite...");

  // 1. Grouping Multiple Session Visits under one Visitor Profile
  const now = new Date();
  const timeSess1 = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const timeSess2 = new Date(now.getTime() - 10 * 60 * 1000).toISOString();

  const mockVisitRows: SiteVisitRow[] = [
    {
      id: "v1_row1",
      path: "/",
      referrer: "https://facebook.com",
      user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      anonymous_visitor_id: "vis_1234567890abcdef",
      is_admin: false,
      visitor_city: "Canton",
      visitor_region: "OH",
      visitor_country: "US",
      created_at: timeSess1,
      utm_source: "facebook",
      utm_medium: "cpc",
      utm_campaign: "fb_campaign_v1",
      first_touch_utm_source: "facebook",
      first_touch_utm_campaign: "fb_campaign_v1"
    },
    {
      id: "v1_row2",
      path: "/legacy-prologue",
      referrer: "https://facebook.com",
      user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      anonymous_visitor_id: "vis_1234567890abcdef",
      is_admin: false,
      visitor_city: "Canton",
      visitor_region: "OH",
      visitor_country: "US",
      created_at: new Date(new Date(timeSess1).getTime() + 45_000).toISOString()
    },
    {
      id: "v1_row3",
      path: "/claim/test-token",
      referrer: "https://google.com",
      user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      anonymous_visitor_id: "vis_1234567890abcdef",
      is_admin: false,
      visitor_city: "Canton",
      visitor_region: "OH",
      visitor_country: "US",
      created_at: timeSess2,
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "brand_search",
      first_touch_utm_source: "facebook",
      first_touch_utm_campaign: "fb_campaign_v1"
    }
  ];

  const profiles = buildGroupedVisitorProfiles({ rows: mockVisitRows });

  assert.equal(profiles.length, 1);
  const p = profiles[0];
  assert.equal(p.visitorId, "vis_1234567890abcdef");
  assert.equal(p.totalPageViews, 3);
  assert.equal(p.sessions.length, 2);
  assert.equal(p.firstAttributionSource, "facebook");
  assert.equal(p.latestAttributionSource, "google");

  // 2. Attribution Extraction from URL
  const testUrl = new URL("https://www.thelifearchive.vip/legacy-prologue?utm_source=business_card&utm_medium=card_qr&utm_campaign=business_card_test&tla_material=Black+Metal+Business+Card");
  const extracted = extractAttributionFromUrl(testUrl);
  assert.equal(extracted.utm_source, "business_card");
  assert.equal(extracted.utm_medium, "card_qr");
  assert.equal(extracted.utm_campaign, "business_card_test");
  assert.equal(extracted.tla_material, "Black Metal Business Card");

  // 3. Bot Confidence Scoring
  const humanEval = evaluateBotConfidence({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    path: "/legacy-prologue"
  });
  assert.equal(humanEval.classification, "likely_human");

  // 4. CSV Sanitization
  assert.equal(sanitizeCsvField("=SUM(1,2)"), "'=SUM(1,2)");
  assert.equal(sanitizeCsvField("Normal Text"), "Normal Text");

  // 5. Operating System Detection
  assert.equal(detectOperatingSystem("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"), "macOS");

  // 6. QR Code Asset Generation & Scanability
  const targetShortUrl = buildShortTrackableUrl("business-card-test", "https://www.thelifearchive.vip");
  assert.equal(targetShortUrl, "https://www.thelifearchive.vip/go/business-card-test");

  const qrAssets = await generateAdvertisingQrAssets(targetShortUrl);
  const parsedPng = PNG.sync.read(qrAssets.pngBuffer);
  const decoded = jsQR(new Uint8ClampedArray(parsedPng.data), parsedPng.width, parsedPng.height);
  assert.equal(decoded !== null, true);
  assert.equal(decoded?.data, "https://www.thelifearchive.vip/go/business-card-test");

  // 7. Seed Logic & Destination Routing Assertions
  console.log("Verifying Seed Logic & Legacy Prologue Destination Routing...");

  // Mock DB seed check
  await ensureSeedData();

  // Test Business Card Link Target Destination
  const link = await getTrackableLinkBySlug("business-card-test");

  if (link) {
    assert.equal(
      link.destinationPath,
      "/legacy-prologue",
      "Business Card Test link MUST resolve to newest approved prologue route (/legacy-prologue), NOT deprecated /legacy-question"
    );

    assert.equal(
      link.destinationPath.includes("/legacy-question"),
      false,
      "Destination path must NOT contain deprecated route /legacy-question"
    );

    // Verify Deprecated Route helper
    assert.equal(
      DEPRECATED_ROUTES.includes("/legacy-question"),
      true,
      "/legacy-question must be registered in DEPRECATED_ROUTES list"
    );

    // 8. Test Destination Path Edit & Admin Protection
    console.log("Testing Destination Edit and Seed Non-Destructiveness...");
    await updateTrackableLink({
      id: link.id,
      destinationPath: "/build-your-legacy",
      linkName: "Business Card Custom Test"
    });

    const updatedLink = await getTrackableLinkBySlug("business-card-test");
    assert.equal(updatedLink?.destinationPath, "/build-your-legacy", "Admin edit must persist destination path");
    assert.equal(updatedLink?.slug, "business-card-test", "Short URL slug must remain business-card-test");

    // Re-run ensureSeedData() to verify it does NOT overwrite admin edits
    await ensureSeedData();
    const afterSeedLink = await getTrackableLinkBySlug("business-card-test");
    assert.equal(
      afterSeedLink?.destinationPath,
      "/build-your-legacy",
      "ensureSeedData() MUST NOT overwrite administrator-customized destination path"
    );

    // Reset back to approved prologue for clean state
    await updateTrackableLink({
      id: link.id,
      destinationPath: "/legacy-prologue",
      linkName: "Business Card Test QR"
    });
  }

  console.log("Trackable Links & Prologue Redirect Routing Test Suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("Advertising Attribution test suite failed:", err);
  process.exit(1);
});
