import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateVisitorWindowSummary,
  classifyVisitTraffic,
  detectBrowser,
  detectDeviceType,
  formatVisitorLocation,
  getVisitorDisplayName,
  formatReferrerSource,
  getVisitorStatus,
  type DeviceType,
  type VisitorLocation,
  type VisitTrafficType,
  type VisitorStatus
} from "@/lib/site-visit-utils";

const MAX_ANALYTICS_ROWS = 10_000;
const BASE_SITE_VISIT_SELECT =
  "id,path,referrer,user_agent,anonymous_visitor_id,is_admin,created_at";
const LOCATION_SITE_VISIT_SELECT =
  "id,path,referrer,user_agent,anonymous_visitor_id,is_admin,visitor_city,visitor_region,visitor_country,created_at";

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

export type VisitorJourney = {
  visitorId: string;
  displayName: string;
  location: string;
  firstSeenAt: string;
  lastSeenAt: string;
  totalPageViews: number;
  deviceType: DeviceType;
  browser: string;
  referrerSource: string;
  visitorStatus: VisitorStatus;
  recentPages: Array<{
    id: string;
    path: string;
    createdAt: string;
  }>;
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
  visitorJourneys: VisitorJourney[];
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
  visitor_city: string | null;
  visitor_region: string | null;
  visitor_country: string | null;
  created_at: string;
};

type RawSiteVisitRow = Omit<
  SiteVisitRow,
  "visitor_city" | "visitor_region" | "visitor_country"
> &
  Partial<
    Pick<SiteVisitRow, "visitor_city" | "visitor_region" | "visitor_country">
  >;

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

function getRowLocation(row: SiteVisitRow): VisitorLocation {
  return {
    city: row.visitor_city,
    region: row.visitor_region,
    country: row.visitor_country
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
    visitorJourneys: getVisitorJourneys(allHumanRows, firstVisitByVisitorId),
    topPaths: getTopHumanPaths(recentHumanRows)
  };
}

export async function getSiteVisitStats(): Promise<SiteVisitStats> {
  const supabase = getSiteVisitClient();
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const [allRows, recentRows] = await Promise.all([
    selectSiteVisitRows(supabase),
    selectSiteVisitRows(supabase, last30Days.toISOString())
  ]);

  return summarizeSiteVisitRows({
    allRows,
    recentRows
  });
}

async function selectSiteVisitRows(
  supabase: SupabaseClient<any, "public", any>,
  since?: string
) {
  const query = supabase
    .from("site_visits")
    .select(LOCATION_SITE_VISIT_SELECT)
    .order("created_at", { ascending: false })
    .limit(MAX_ANALYTICS_ROWS);
  const result = since ? await query.gte("created_at", since) : await query;

  if (!result.error) {
    return normalizeSiteVisitRows((result.data ?? []) as RawSiteVisitRow[]);
  }

  if (!isMissingVisitorLocationColumnError(result.error)) {
    throw new Error(result.error.message);
  }

  const fallbackQuery = supabase
    .from("site_visits")
    .select(BASE_SITE_VISIT_SELECT)
    .order("created_at", { ascending: false })
    .limit(MAX_ANALYTICS_ROWS);
  const fallbackResult = since
    ? await fallbackQuery.gte("created_at", since)
    : await fallbackQuery;

  if (fallbackResult.error) {
    throw new Error(fallbackResult.error.message);
  }

  return normalizeSiteVisitRows(
    (fallbackResult.data ?? []) as RawSiteVisitRow[]
  );
}

function normalizeSiteVisitRows(rows: RawSiteVisitRow[]): SiteVisitRow[] {
  return rows.map((row) => ({
    ...row,
    visitor_city: row.visitor_city ?? null,
    visitor_region: row.visitor_region ?? null,
    visitor_country: row.visitor_country ?? null
  }));
}

function isMissingVisitorLocationColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /visitor_(city|region|country)/i.test(error.message ?? "")
  );
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

function getVisitorJourneys(
  rows: SiteVisitRow[],
  firstVisitByVisitorId: Map<string, string>
) {
  const rowsByVisitorId = new Map<string, SiteVisitRow[]>();

  for (const row of rows) {
    if (!row.anonymous_visitor_id) {
      continue;
    }

    rowsByVisitorId.set(row.anonymous_visitor_id, [
      ...(rowsByVisitorId.get(row.anonymous_visitor_id) ?? []),
      row
    ]);
  }

  return Array.from(rowsByVisitorId.entries())
    .map(([visitorId, visitorRows]) => {
      const sortedRows = [...visitorRows].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latestRow = sortedRows[0];
      const oldestRow = sortedRows[sortedRows.length - 1];

      return {
        visitorId,
        displayName: getVisitorDisplayName(visitorId),
        location: latestRow
          ? formatVisitorLocation(getRowLocation(latestRow))
          : "Unknown location",
        firstSeenAt: oldestRow?.created_at ?? latestRow?.created_at ?? "",
        lastSeenAt: latestRow?.created_at ?? "",
        totalPageViews: visitorRows.length,
        deviceType: detectDeviceType(latestRow?.user_agent),
        browser: detectBrowser(latestRow?.user_agent),
        referrerSource: formatReferrerSource(latestRow?.referrer),
        visitorStatus: latestRow
          ? getVisitorStatus({
              visitorId,
              createdAt: latestRow.created_at,
              firstVisitByVisitorId
            })
          : "unknown",
        recentPages: sortedRows.slice(0, 6).map((row) => ({
          id: row.id,
          path: row.path,
          createdAt: row.created_at
        }))
      };
    })
    .sort(
      (a, b) =>
        new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
    )
    .slice(0, 20);
}
