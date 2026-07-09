import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type SiteVisitStats = {
  totalPublicVisits: number;
  visitsToday: number;
  visitsLast7Days: number;
  topPaths: Array<{
    path: string;
    visitCount: number;
  }>;
};

type TopPathRow = {
  path: string;
  visit_count: number | string;
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

  const [totalResult, todayResult, last7DaysResult, topPathsResult] =
    await Promise.all([
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

  if (topPathsResult.error) {
    throw new Error(topPathsResult.error.message);
  }

  return {
    totalPublicVisits: totalResult.count ?? 0,
    visitsToday: todayResult.count ?? 0,
    visitsLast7Days: last7DaysResult.count ?? 0,
    topPaths: ((topPathsResult.data ?? []) as TopPathRow[]).map((row) => ({
      path: row.path,
      visitCount: Number(row.visit_count)
    }))
  };
}
