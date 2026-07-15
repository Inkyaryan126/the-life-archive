import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  calculateVisitorWindowSummary,
  classifyVisitTraffic,
  createLastVisitSignature,
  detectBrowser,
  detectDeviceType,
  formatReferrerSource,
  getCanonicalHostRedirectUrl,
  getSafeHeaderValue,
  getVisitorStatus,
  isDuplicateRecentVisit,
  isProbePath,
  shouldRecordSiteVisit
} from "../lib/site-visit-utils";
import { isConfiguredAdminEmail } from "../lib/admin-emails";
import { getSiteVisitAdminFlag } from "../lib/site-visit-tracking";

function headers(values: Record<string, string>) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null;
    }
  } as Pick<Headers, "get">;
}

{
  const redirectUrl = getCanonicalHostRedirectUrl({
    requestUrl: "https://www.thelifearchive.vip/create?from=test",
    hostHeader: "www.thelifearchive.vip",
    siteUrl: "https://thelifearchive.vip"
  });

  assert.equal(
    redirectUrl?.toString(),
    "https://thelifearchive.vip/create?from=test"
  );

  assert.equal(
    getCanonicalHostRedirectUrl({
      requestUrl: "https://thelifearchive.vip/create",
      hostHeader: "thelifearchive.vip",
      siteUrl: "https://thelifearchive.vip"
    }),
    null
  );

  assert.equal(
    getCanonicalHostRedirectUrl({
      requestUrl: "https://preview.vercel.app/create",
      hostHeader: "preview.vercel.app",
      siteUrl: "https://thelifearchive.vip"
    }),
    null
  );

  assert.equal(
    getCanonicalHostRedirectUrl({
      requestUrl: "http://localhost:3000/create",
      hostHeader: "localhost:3000",
      siteUrl: "http://localhost:3000"
    }),
    null
  );
}

{
  assert.equal(
    shouldRecordSiteVisit({
      method: "GET",
      path: "/",
      headers: headers({
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 Chrome/126 Safari/537.36"
      })
    }),
    true
  );

  assert.equal(
    shouldRecordSiteVisit({
      method: "GET",
      path: "/archive/family-story",
      headers: headers({})
    }),
    true
  );

  assert.equal(
    shouldRecordSiteVisit({
      method: "GET",
      path: "/admin/visitors",
      headers: headers({})
    }),
    false
  );

  assert.equal(
    shouldRecordSiteVisit({
      method: "GET",
      path: "/api/keepsakes/checkout",
      headers: headers({})
    }),
    false
  );

  assert.equal(
    shouldRecordSiteVisit({
      method: "GET",
      path: "/_next/static/app.js",
      headers: headers({})
    }),
    false
  );

  assert.equal(
    shouldRecordSiteVisit({
      method: "GET",
      path: "/legacy-question",
      headers: headers({ "user-agent": "Googlebot/2.1" })
    }),
    false
  );

  assert.equal(
    shouldRecordSiteVisit({
      method: "GET",
      path: "/wp-admin/install.php",
      headers: headers({ "user-agent": "Mozilla/5.0" })
    }),
    false
  );

  assert.equal(
    shouldRecordSiteVisit({
      method: "GET",
      path: "/archive/family-story",
      headers: headers({ "user-agent": "Mozilla/5.0 zgrab/0.x" })
    }),
    false
  );

  assert.equal(isProbePath("/wp-login.php"), true);
  assert.equal(isProbePath("/xmlrpc.php"), true);
  assert.equal(isProbePath("/.env"), true);
  assert.equal(isProbePath("/.git/config"), true);
  assert.equal(isProbePath("/phpmyadmin/index.php"), true);
  assert.equal(isProbePath("/administrator/index.php"), true);
  assert.equal(isProbePath("/admin.php"), true);
  assert.equal(isProbePath("/archive/administering-a-life"), false);
}

{
  const now = new Date("2026-07-15T18:00:00.000Z");
  const lastVisitCookie = createLastVisitSignature("/archive/family-story", now);

  assert.equal(
    isDuplicateRecentVisit({
      lastVisitCookie,
      path: "/archive/family-story",
      now: new Date("2026-07-15T18:00:20.000Z")
    }),
    true
  );

  assert.equal(
    isDuplicateRecentVisit({
      lastVisitCookie,
      path: "/archive/family-story",
      now: new Date("2026-07-15T18:00:31.000Z")
    }),
    false
  );

  assert.equal(
    isDuplicateRecentVisit({
      lastVisitCookie,
      path: "/keepsakes",
      now: new Date("2026-07-15T18:00:20.000Z")
    }),
    false
  );
}

{
  assert.equal(
    classifyVisitTraffic({
      path: "/archive/family-story",
      userAgent: "Mozilla/5.0 Chrome/126.0 Safari/537.36",
      isAdmin: false
    }),
    "human"
  );
  assert.equal(
    classifyVisitTraffic({
      path: "/wp-admin/install.php",
      userAgent: "Mozilla/5.0",
      isAdmin: false
    }),
    "bot_probe"
  );
  assert.equal(
    classifyVisitTraffic({
      path: "/legacy-question",
      userAgent: "Googlebot/2.1",
      isAdmin: false
    }),
    "bot_probe"
  );
  assert.equal(
    classifyVisitTraffic({
      path: "/dashboard",
      userAgent: "Mozilla/5.0",
      isAdmin: true
    }),
    "admin"
  );
  assert.equal(
    classifyVisitTraffic({
      path: "/api/cron/time-capsules",
      userAgent: "Mozilla/5.0",
      isAdmin: false
    }),
    "ignored"
  );

  assert.deepEqual(
    calculateVisitorWindowSummary({
      visitorIdsInWindow: ["visitor-a", "visitor-a", "visitor-b"],
      earlierVisitorIds: new Set(["visitor-b", "visitor-c"])
    }),
    {
      uniqueVisitors: 2,
      newVisitors: 1,
      returningVisitors: 1
    }
  );

  const firstVisitByVisitorId = new Map([
    ["visitor-a", "2026-07-15T15:00:00.000Z"],
    ["visitor-b", "2026-07-15T16:00:00.000Z"]
  ]);

  assert.equal(
    getVisitorStatus({
      visitorId: "visitor-a",
      createdAt: "2026-07-15T15:00:00.000Z",
      firstVisitByVisitorId
    }),
    "new"
  );

  assert.equal(
    getVisitorStatus({
      visitorId: "visitor-a",
      createdAt: "2026-07-15T15:05:00.000Z",
      firstVisitByVisitorId
    }),
    "returning"
  );

  assert.equal(
    getVisitorStatus({
      visitorId: null,
      createdAt: "2026-07-15T15:05:00.000Z",
      firstVisitByVisitorId
    }),
    "unknown"
  );

  assert.deepEqual(
    calculateVisitorWindowSummary({
      visitorIdsInWindow: [],
      earlierVisitorIds: new Set(["historical-null-id-does-not-count"])
    }),
    {
      uniqueVisitors: 0,
      newVisitors: 0,
      returningVisitors: 0
    }
  );
}

{
  assert.equal(
    getSafeHeaderValue("https://example.com/\u0000bad", 200),
    "https://example.com/bad"
  );
  assert.equal(formatReferrerSource("https://example.com/path?x=1"), "example.com/path");
  assert.equal(formatReferrerSource("not a url\u0000"), "not a url");
  assert.equal(formatReferrerSource(null), "Direct");
  assert.equal(
    detectDeviceType(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile Safari/604.1"
    ),
    "mobile"
  );
  assert.equal(detectDeviceType("Mozilla/5.0 (iPad; CPU OS 17_0) Safari/604.1"), "tablet");
  assert.equal(detectBrowser("Mozilla/5.0 Chrome/126.0 Safari/537.36"), "Chrome");
  assert.equal(detectBrowser("bad\u0000agent"), "Unknown");
}

{
  process.env.ADMIN_EMAILS = "owner@example.com";

  assert.equal(isConfiguredAdminEmail("owner@example.com"), true);
  assert.equal(isConfiguredAdminEmail("OWNER@example.com"), true);
  assert.equal(isConfiguredAdminEmail("member@example.com"), false);
  assert.equal(isConfiguredAdminEmail(null), false);
  assert.equal(getSiteVisitAdminFlag("owner@example.com"), true);
  assert.equal(getSiteVisitAdminFlag("member@example.com"), false);
  assert.equal(getSiteVisitAdminFlag(null), false);
}

{
  const helper = readFileSync("lib/site-visits.ts", "utf8");
  const tracking = readFileSync("lib/site-visit-tracking.ts", "utf8");
  const middleware = readFileSync("lib/supabase/middleware.ts", "utf8");
  const visitorsPage = readFileSync("app/admin/visitors/page.tsx", "utf8");
  const migration = readFileSync(
    "supabase/migrations/20260708120000_create_site_visits.sql",
    "utf8"
  );

  assert.match(helper, /classifyRow\(row\) === "human"/);
  assert.match(helper, /recentHumanRows/);
  assert.match(helper, /getTopHumanPaths\(recentHumanRows\)/);
  assert.match(helper, /recentBotProbeRows/);
  assert.match(helper, /anonymous_visitor_id/);
  assert.match(tracking, /is_admin: isAdmin/);
  assert.match(tracking, /getSiteVisitAdminFlag\(input\.userEmail\)/);
  assert.match(tracking, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(middleware, /getCanonicalHostRedirectUrl/);
  assert.ok(
    middleware.indexOf("const canonicalRedirectUrl") <
      middleware.indexOf("const supabase = createServerClient")
  );
  assert.ok(
    middleware.indexOf("await supabase.auth.getUser") <
      middleware.indexOf("await recordSiteVisit")
  );
  assert.match(visitorsPage, /getAdminAccess\(\)/);
  assert.match(visitorsPage, /redirect\("\/login\?next=%2Fadmin%2Fvisitors"\)/);
  assert.match(visitorsPage, /Human page views today/);
  assert.match(visitorsPage, /Unique visitors since IDs began/);
  assert.match(visitorsPage, /Bot\/probe requests last 30 days/);
  assert.match(visitorsPage, /Page views are not people/);
  assert.match(migration, /with check \(is_admin = false\)/);
}

console.log("site-visit-utils tests passed");
