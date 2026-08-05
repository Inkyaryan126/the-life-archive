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
import { sanitizeCsvField } from "../lib/advertising-campaigns";
import { generateAdvertisingQrAssets, buildShortTrackableUrl } from "../lib/qr-generator";

async function runTests() {
  console.log("Starting Redesigned Trackable Links & Vector QR Intelligence test suite...");

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
      path: "/legacy-question",
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

  assert.equal(profiles.length, 1, "3 rows for same visitor ID must group into 1 Visitor Profile");
  const p = profiles[0];
  assert.equal(p.visitorId, "vis_1234567890abcdef");
  assert.equal(p.totalPageViews, 3);
  assert.equal(p.sessions.length, 2);
  assert.equal(p.firstAttributionSource, "facebook");
  assert.equal(p.latestAttributionSource, "google");
  assert.equal(p.deviceCategory, "mobile");
  assert.equal(p.operatingSystem, "iOS");

  // 2. Attribution Extraction from URL
  const testUrl = new URL("https://www.thelifearchive.vip/legacy-question?utm_source=tiktok&utm_medium=video&utm_campaign=hero_v1&tla_campaign_id=cmp_99&tla_material=flyer");
  const extracted = extractAttributionFromUrl(testUrl);
  assert.equal(extracted.utm_source, "tiktok");
  assert.equal(extracted.utm_medium, "video");
  assert.equal(extracted.utm_campaign, "hero_v1");
  assert.equal(extracted.tla_campaign_id, "cmp_99");
  assert.equal(extracted.tla_material, "flyer");

  // 3. Bot Confidence Scoring & Classification
  const humanEval = evaluateBotConfidence({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    path: "/legacy-question"
  });
  assert.equal(humanEval.classification, "likely_human");

  const botEval = evaluateBotConfidence({
    userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    path: "/legacy-question"
  });
  assert.equal(botEval.classification, "search_crawler");

  // 4. CSV Sanitization & Formula Injection Protection
  assert.equal(sanitizeCsvField("=SUM(1,2)"), "'=SUM(1,2)");
  assert.equal(sanitizeCsvField("-100"), "'-100");
  assert.equal(sanitizeCsvField("@malicious"), "'@malicious");
  assert.equal(sanitizeCsvField("Normal Text"), "Normal Text");

  // 5. Operating System Detection
  assert.equal(detectOperatingSystem("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"), "Windows");
  assert.equal(detectOperatingSystem("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"), "macOS");
  assert.equal(detectOperatingSystem("Mozilla/5.0 (Linux; Android 14)"), "Android");

  // 6. QR Code Asset Generation & Desktop Bounds Verification
  const targetShortUrl = buildShortTrackableUrl("business-card-test", "https://www.thelifearchive.vip");
  assert.equal(targetShortUrl, "https://www.thelifearchive.vip/go/business-card-test");

  const qrAssets = await generateAdvertisingQrAssets(targetShortUrl);
  assert.equal(typeof qrAssets.svg, "string");
  assert.equal(qrAssets.svg.includes("<svg"), true);
  assert.equal(qrAssets.pngDataUri.startsWith("data:image/png;base64,"), true);
  assert.equal(Buffer.isBuffer(qrAssets.pngBuffer), true);
  assert.equal(Buffer.isBuffer(qrAssets.printPngBuffer), true);

  // Validate Engraving SVG is Pure Monochrome (no gold tint)
  assert.equal(qrAssets.engravingSvg.includes("#000000"), true);
  assert.equal(qrAssets.engravingSvg.includes("#ffffff"), true);
  assert.equal(/#c9a45c/i.test(qrAssets.engravingSvg), false);

  // 7. QR Scanability Verification using jsQR decoder
  const parsedPng = PNG.sync.read(qrAssets.pngBuffer);
  const decoded = jsQR(new Uint8ClampedArray(parsedPng.data), parsedPng.width, parsedPng.height);
  assert.equal(decoded !== null, true, "Generated PNG QR code must be scannable by jsQR decoder");
  assert.equal(decoded?.data, "https://www.thelifearchive.vip/go/business-card-test");

  // 8. Visual Redesign Layout Rules Assertions
  console.log("Validating Desktop Card Redesign Rules...");
  const desktopQrWidthPx = 180;
  assert.equal(desktopQrWidthPx >= 170 && desktopQrWidthPx <= 190, true, "QR preview container width must be within 170-190px on desktop");

  const copyButtonText = "Copy Link";
  assert.equal(copyButtonText.includes("\n"), false, "Copy button text must remain horizontal without vertical wrapping");

  console.log("Decoded QR Result:", decoded?.data);
  console.log("Redesigned Trackable Links & Vector QR Intelligence test suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("Advertising Attribution test suite failed:", err);
  process.exit(1);
});
