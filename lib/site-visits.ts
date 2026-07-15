import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateVisitorWindowSummary,
  detectBrowser,
  detectDeviceType,
  formatReferrerSource,
  getVisitorStatus,
  type DeviceType,
  type VisitorStatus
} from "@/lib/site-visit-utils";

export type RecentSiteVisit = {
  id: string;
  path: string;
  referrerSource: string;
  deviceType: DeviceType;
  browser: string;
  createdAt: string;
  visitorStatus: VisitorStatus;
};

export type SiteVisitStats = {
  totalPublicVisits: number;
  visitsToday: number;
  visitsLast7Days: number;
  visitsLast30Days: number;
  uniqueVisitorsLast30Days: number;
  newVisitorsLast30Days: number;
  returningVisitorsLast30Days: number;
  mostRecentVisit: RecentSiteVisit | null;
  recentVisits: RecentSiteVisit[];
  topPaths: Array<{
    path: string;
    visitCount: number;
  }>;
};

type TopPathRow = {
  path: string;
  visit_count: number | string;
};

type SiteVisitRow = {
  id: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  anonymous_visitor_id: string | null;
  created_at: string;
};

function getSiteVisitClient() {
  return createAdminClient() as SupabaseClient<any, "public", any>;
}

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export async function getSiteVisitStats(): Promise<SiteVisitStats> {
  const supabase = getSiteVisitClient();
  const today = getStartOfToday();
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const [
    totalResult,
    todayResult,
    last7DaysResult,
    last30DaysResult,
    recentVisitsResult,
    visitorWindowResult,
    topPathsResult
  ] = await Promise.all([
      supabase
        .from("site_visits")
        .select("id", { count: "exact", head: true })
        .eq("is_admin", false),
      supabase
        .from("site_visits")
        .select("id", { count: "exact", head: true })
        .eq("is_admin", false)
        .gte("created_at", today.toISOString()),
      supabase
        .from("site_visits")
        .select("id", { count: "exact", head: true })
        .eq("is_admin", false)
        .gte("created_at", last7Days.toISOString()),
      supabase
        .from("site_visits")
        .select("id", { count: "exact", head: true })
        .eq("is_admin", false)
        .gte("created_at", last30Days.toISOString()),
      supabase
        .from("site_visits")
        .select(
          "id,path,referrer,user_agent,anonymous_visitor_id,created_at"
        )
        .eq("is_admin", false)
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("site_visits")
        .select("anonymous_visitor_id")
        .eq("is_admin", false)
        .not("anonymous_visitor_id", "is", null)
        .gte("created_at", last30Days.toISOString())
        .limit(5000),
      supabase.rpc("get_site_visit_top_paths", { limit_count: 5 })
  ]);

  if (totalResult.error) {
    throw new Error(totalResult.error.message);
  }

  if (todayResult.error) {
    throw new Error(todayResult.error.message);
  }

  if (last7DaysResult.error) {
    throw new Error(last7DaysResult.error.message);
  }

  if (last30DaysResult.error) {
    throw new Error(last30DaysResult.error.message);
  }

  if (recentVisitsResult.error) {
    throw new Error(recentVisitsResult.error.message);
  }

  if (visitorWindowResult.error) {
    throw new Error(visitorWindowResult.error.message);
  }

  if (topPathsResult.error) {
    throw new Error(topPathsResult.error.message);
  }

  const windowVisitorIds = Array.from(
    new Set(
      ((visitorWindowResult.data ?? []) as Array<{
        anonymous_visitor_id: string | null;
      }>)
        .map((row) => row.anonymous_visitor_id)
        .filter((visitorId): visitorId is string => Boolean(visitorId))
    )
  );
  const earlierVisitorIds = await getEarlierVisitorIds(
    supabase,
    windowVisitorIds,
    last30Days.toISOString()
  );
  const visitorSummary = calculateVisitorWindowSummary({
    visitorIdsInWindow: windowVisitorIds,
    earlierVisitorIds
  });
  const recentVisits = await shapeRecentVisits(
    supabase,
    (recentVisitsResult.data ?? []) as SiteVisitRow[]
  );

  return {
    totalPublicVisits: totalResult.count ?? 0,
    visitsToday: todayResult.count ?? 0,
    visitsLast7Days: last7DaysResult.count ?? 0,
    visitsLast30Days: last30DaysResult.count ?? 0,
    uniqueVisitorsLast30Days: visitorSummary.uniqueVisitors,
    newVisitorsLast30Days: visitorSummary.newVisitors,
    returningVisitorsLast30Days: visitorSummary.returningVisitors,
    mostRecentVisit: recentVisits[0] ?? null,
    recentVisits,
    topPaths: ((topPathsResult.data ?? []) as TopPathRow[]).map((row) => ({
      path: row.path,
      visitCount: Number(row.visit_count)
    }))
  };
}

async function getEarlierVisitorIds(
  supabase: SupabaseClient<any, "public", any>,
  visitorIds: string[],
  before: string
) {
  if (visitorIds.length === 0) {
    return new Set<string>();
  }

  const { data, error } = await supabase
    .from("site_visits")
    .select("anonymous_visitor_id")
    .eq("is_admin", false)
    .in("anonymous_visitor_id", visitorIds)
    .lt("created_at", before)
    .limit(5000);

  if (error) {
    throw new Error(error.message);
  }

  return new Set(
    (data ?? [])
      .map((row) => row.anonymous_visitor_id as string | null)
      .filter((visitorId): visitorId is string => Boolean(visitorId))
  );
}

async function shapeRecentVisits(
  supabase: SupabaseClient<any, "public", any>,
  rows: SiteVisitRow[]
) {
  const visitorIds = Array.from(
    new Set(
      rows
        .map((row) => row.anonymous_visitor_id)
        .filter((visitorId): visitorId is string => Boolean(visitorId))
    )
  );
  const firstVisitByVisitorId = new Map<string, string>();

  if (visitorIds.length > 0) {
    const { data, error } = await supabase
      .from("site_visits")
      .select("anonymous_visitor_id,created_at")
      .eq("is_admin", false)
      .in("anonymous_visitor_id", visitorIds)
      .order("created_at", { ascending: true })
      .limit(5000);

    if (error) {
      throw new Error(error.message);
    }

    for (const row of data ?? []) {
      const visitorId = row.anonymous_visitor_id as string | null;

      if (visitorId && !firstVisitByVisitorId.has(visitorId)) {
        firstVisitByVisitorId.set(visitorId, row.created_at as string);
      }
    }
  }

  return rows.map((row) => ({
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
  }));
}
