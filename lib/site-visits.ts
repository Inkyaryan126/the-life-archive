import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateVisitorWindowSummary,
  classifyVisitTraffic,
  detectBrowser,
  detectDeviceType,
  formatReferrerSource,
  getVisitorStatus,
  type DeviceType,
  type VisitTrafficType,
  type VisitorStatus
} from "@/lib/site-visit-utils";

const MAX_ANALYTICS_ROWS = 10_000;

export type RecentSiteVisit = {
  id: string;
  path: string;
  referrerSource: string;
  deviceType: DeviceType;
  browser: string;
  createdAt: string;
  visitorStatus: VisitorStatus;
};

export type BotProbeVisit = {
  id: string;
  path: string;
  browser: string;
  createdAt: string;
};

export type SiteVisitStats = {
  totalPublicVisits: number;
  visitsToday: number;
  visitsLast7Days: number;
  visitsLast30Days: number;
  humanPageViewsToday: number;
  humanPageViewsLast7Days: number;
  humanPageViewsLast30Days: number;
  uniqueVisitorsSinceTrackingBegan: number;
  newVisitorsLast30Days: number;
  returningVisitorsLast30Days: number;
  botProbeRequestsLast30Days: number;
  adminRequestsLast30Days: number;
  visitorIdTrackingStartedAt: string | null;
  mostRecentVisit: RecentSiteVisit | null;
  recentVisits: RecentSiteVisit[];
  recentBotProbeVisits: BotProbeVisit[];
  topPaths: Array<{
    path: string;
    visitCount: number;
  }>;
};

export type SiteVisitRow = {
  id: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  anonymous_visitor_id: string | null;
  is_admin: boolean;
  created_at: string;
};

function getSiteVisitClient() {
  return createAdminClient() as SupabaseClient<any, "public", any>;
}

function getStartOfToday(now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today;
}

function classifyRow(row: SiteVisitRow): VisitTrafficType {
  return classifyVisitTraffic({
    path: row.path,
    userAgent: row.user_agent,
    referrer: row.referrer,
    isAdmin: row.is_admin
  });
}

function isAtOrAfter(value: string, boundary: Date) {
  return new Date(value).getTime() >= boundary.getTime();
}

function toRecentVisit(
  row: SiteVisitRow,
  firstVisitByVisitorId: Map<string, string>
): RecentSiteVisit {
  return {
    id: row.id,
    path: row.path,
    referrerSource: formatReferrerSource(row.referrer),
    deviceType: detectDeviceType(row.user_agent),
    browser: detectBrowser(row.user_agent),
    createdAt: row.created_at,
    visitorStatus: getVisitorStatus({
      visitorId: row.anonymous_visitor_id,
      createdAt: row.created_at,
      firstVisitByVisitorId
    })
  };
}

function toBotProbeVisit(row: SiteVisitRow): BotProbeVisit {
  return {
    id: row.id,
    path: row.path,
    browser: detectBrowser(row.user_agent),
    createdAt: row.created_at
  };
}

export function summarizeSiteVisitRows(input: {
  allRows: SiteVisitRow[];
  recentRows: SiteVisitRow[];
  now?: Date;
}): SiteVisitStats {
  const now = input.now ?? new Date();
  const today = getStartOfToday(now);
  const last7Days = new Date(now);
  last7Days.setDate(last7Days.getDate() - 7);
  const last30Days = new Date(now);
  last30Days.setDate(last30Days.getDate() - 30);

  const allHumanRows = input.allRows.filter((row) => classifyRow(row) === "human");
  const recentHumanRows = input.recentRows.filter(
    (row) => classifyRow(row) === "human"
  );
  const recentBotProbeRows = input.recentRows.filter(
    (row) => classifyRow(row) === "bot_probe"
  );
  const recentAdminRows = input.recentRows.filter(
    (row) => classifyRow(row) === "admin"
  );
  const humanRowsLast7Days = recentHumanRows.filter((row) =>
    isAtOrAfter(row.created_at, last7Days)
  );
  const humanRowsToday = recentHumanRows.filter((row) =>
    isAtOrAfter(row.created_at, today)
  );
  const firstVisitByVisitorId = getFirstVisitByVisitorId(allHumanRows);
  const visitorIdTrackingStartedAt = getVisitorIdTrackingStartedAt(allHumanRows);
  const visitorWindowSummary = getVisitorWindowSummary(
    firstVisitByVisitorId,
    recentHumanRows,
    last30Days
  );

  return {
    totalPublicVisits: allHumanRows.length,
    visitsToday: humanRowsToday.length,
    visitsLast7Days: humanRowsLast7Days.length,
    visitsLast30Days: recentHumanRows.length,
    humanPageViewsToday: humanRowsToday.length,
    humanPageViewsLast7Days: humanRowsLast7Days.length,
    humanPageViewsLast30Days: recentHumanRows.length,
    uniqueVisitorsSinceTrackingBegan: firstVisitByVisitorId.size,
    newVisitorsLast30Days: visitorWindowSummary.newVisitors,
    returningVisitorsLast30Days: visitorWindowSummary.returningVisitors,
    botProbeRequestsLast30Days: recentBotProbeRows.length,
    adminRequestsLast30Days: recentAdminRows.length,
    visitorIdTrackingStartedAt,
    mostRecentVisit: recentHumanRows[0]
      ? toRecentVisit(recentHumanRows[0], firstVisitByVisitorId)
      : null,
    recentVisits: recentHumanRows
      .slice(0, 25)
      .map((row) => toRecentVisit(row, firstVisitByVisitorId)),
    recentBotProbeVisits: recentBotProbeRows.slice(0, 8).map(toBotProbeVisit),
    topPaths: getTopHumanPaths(recentHumanRows)
  };
}

export async function getSiteVisitStats(): Promise<SiteVisitStats> {
  const supabase = getSiteVisitClient();
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const [allRowsResult, recentRowsResult] = await Promise.all([
    supabase
      .from("site_visits")
      .select("id,path,referrer,user_agent,anonymous_visitor_id,is_admin,created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_ANALYTICS_ROWS),
    supabase
      .from("site_visits")
      .select("id,path,referrer,user_agent,anonymous_visitor_id,is_admin,created_at")
      .gte("created_at", last30Days.toISOString())
      .order("created_at", { ascending: false })
      .limit(MAX_ANALYTICS_ROWS)
  ]);

  if (allRowsResult.error) {
    throw new Error(allRowsResult.error.message);
  }

  if (recentRowsResult.error) {
    throw new Error(recentRowsResult.error.message);
  }

  return summarizeSiteVisitRows({
    allRows: (allRowsResult.data ?? []) as SiteVisitRow[],
    recentRows: (recentRowsResult.data ?? []) as SiteVisitRow[]
  });
}

function getFirstVisitByVisitorId(rows: SiteVisitRow[]) {
  const firstVisitByVisitorId = new Map<string, string>();

  for (const row of [...rows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )) {
    if (row.anonymous_visitor_id && !firstVisitByVisitorId.has(row.anonymous_visitor_id)) {
      firstVisitByVisitorId.set(row.anonymous_visitor_id, row.created_at);
    }
  }

  return firstVisitByVisitorId;
}

function getVisitorIdTrackingStartedAt(rows: SiteVisitRow[]) {
  return (
    [...rows]
      .filter((row) => row.anonymous_visitor_id)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )[0]?.created_at ?? null
  );
}

function getVisitorWindowSummary(
  firstVisitByVisitorId: Map<string, string>,
  recentHumanRows: SiteVisitRow[],
  windowStart: Date
) {
  const visitorIdsInWindow = Array.from(
    new Set(
      recentHumanRows
        .map((row) => row.anonymous_visitor_id)
        .filter((visitorId): visitorId is string => Boolean(visitorId))
    )
  );
  const earlierVisitorIds = new Set<string>();

  for (const visitorId of visitorIdsInWindow) {
    const firstSeenAt = firstVisitByVisitorId.get(visitorId);

    if (firstSeenAt && !isAtOrAfter(firstSeenAt, windowStart)) {
      earlierVisitorIds.add(visitorId);
    }
  }

  return calculateVisitorWindowSummary({
    visitorIdsInWindow,
    earlierVisitorIds
  });
}

function getTopHumanPaths(rows: SiteVisitRow[]) {
  const pathCounts = new Map<string, number>();

  for (const row of rows) {
    pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);
  }

  return Array.from(pathCounts.entries())
    .map(([path, visitCount]) => ({ path, visitCount }))
    .sort((a, b) => b.visitCount - a.visitCount || a.path.localeCompare(b.path))
    .slice(0, 5);
}
