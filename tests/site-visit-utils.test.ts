import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  calculateVisitorWindowSummary,
  createLastVisitSignature,
  detectBrowser,
  detectDeviceType,
  formatReferrerSource,
  getSafeHeaderValue,
  getVisitorStatus,
  isDuplicateRecentVisit,
  shouldRecordSiteVisit
} from "../lib/site-visit-utils";

function headers(values: Record<string, string>) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null;
    }
  } as Pick<Headers, "get">;
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
  const helper = readFileSync("lib/site-visits.ts", "utf8");
  const tracking = readFileSync("lib/site-visit-tracking.ts", "utf8");
  const visitorsPage = readFileSync("app/admin/visitors/page.tsx", "utf8");
  const migration = readFileSync(
    "supabase/migrations/20260708120000_create_site_visits.sql",
    "utf8"
  );

  assert.match(helper, /\.eq\("is_admin", false\)/);
  assert.match(tracking, /is_admin: isAdmin/);
  assert.match(tracking, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(visitorsPage, /getAdminAccess\(\)/);
  assert.match(visitorsPage, /redirect\("\/login\?next=%2Fadmin%2Fvisitors"\)/);
  assert.match(migration, /with check \(is_admin = false\)/);
}

console.log("site-visit-utils tests passed");
