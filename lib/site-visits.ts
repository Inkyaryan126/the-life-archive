import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  summarizeSiteVisitRows,
  type BotProbeVisit,
  type RecentSiteVisit,
  type SiteVisitRow,
  type SiteVisitStats
} from "@/lib/site-visit-utils";

export type {
  BotProbeVisit,
  RecentSiteVisit,
  SiteVisitRow,
  SiteVisitStats
};

export { summarizeSiteVisitRows };

const MAX_ANALYTICS_ROWS = 10_000;
const BASE_SITE_VISIT_SELECT =
  "id,path,referrer,user_agent,anonymous_visitor_id,is_admin,created_at";
const LOCATION_SITE_VISIT_SELECT =
  "id,path,referrer,user_agent,anonymous_visitor_id,is_admin,visitor_city,visitor_region,visitor_country,created_at";

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

export async function getSiteVisitStats(): Promise<SiteVisitStats> {
  const supabase = getSiteVisitClient();
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const [allRows, recentRows, countResult] = await Promise.all([
    selectSiteVisitRows(supabase),
    selectSiteVisitRows(supabase, last30Days.toISOString()),
    supabase
      .from("site_visits")
      .select("id", { count: "exact", head: true })
      .eq("is_admin", false)
  ]);

  const stats = summarizeSiteVisitRows({
    allRows,
    recentRows
  });

  if (countResult.count !== null && countResult.count > stats.totalPublicVisits) {
    stats.totalPublicVisits = countResult.count;
  }

  return stats;
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
