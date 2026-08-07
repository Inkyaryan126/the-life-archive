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
const FULL_SITE_VISIT_SELECT =
  "id,path,referrer,user_agent,anonymous_visitor_id,is_admin,visitor_city,visitor_region,visitor_country,user_email,user_display_name,created_at,utm_source,utm_medium,utm_campaign,utm_content,utm_term,tla_campaign_id,tla_link_id,tla_qr_id,tla_channel,tla_placement,tla_variant,tla_material,tla_location,tla_partner,first_touch_utm_source,first_touch_utm_medium,first_touch_utm_campaign,first_touch_tla_campaign_id,bot_score,bot_classification,bot_reasons";
const LOCATION_SITE_VISIT_SELECT =
  "id,path,referrer,user_agent,anonymous_visitor_id,is_admin,visitor_city,visitor_region,visitor_country,created_at";

type RawSiteVisitRow = Omit<
  SiteVisitRow,
  "visitor_city" | "visitor_region" | "visitor_country" | "user_email" | "user_display_name"
> &
  Partial<
    Pick<
      SiteVisitRow,
      "visitor_city" | "visitor_region" | "visitor_country" | "user_email" | "user_display_name"
    >
  >;

function getSiteVisitClient() {
  return createAdminClient() as SupabaseClient<any, "public", any>;
}

export async function getArchiveVisitorCount(archiveSlug: string): Promise<number> {
  const normalizedSlug = archiveSlug.trim();

  if (!normalizedSlug) {
    return 0;
  }

  if (!/^[a-z0-9][a-z0-9-]*$/i.test(normalizedSlug)) {
    return 0;
  }

  try {
    const supabase = getSiteVisitClient();
    const archivePath = `/archive/${normalizedSlug}`;
    const nestedArchivePath = `${archivePath}/%`;
    const { count, error } = await supabase
      .from("site_visits")
      .select("id", { count: "exact", head: true })
      .eq("is_admin", false)
      .or(`path.eq.${archivePath},path.like.${nestedArchivePath}`);

    if (error) {
      console.error("Unable to load archive visitor count:", error.message);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error(
      "Unable to initialize archive visitor count query:",
      error instanceof Error ? error.message : error
    );
    return 0;
  }
}

export async function getSiteVisitStats(options?: {
  currentAdminEmail?: string | null;
  currentAdminName?: string | null;
}): Promise<SiteVisitStats> {
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
    recentRows,
    currentAdminEmail: options?.currentAdminEmail,
    currentAdminName: options?.currentAdminName
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
  const fullQuery = supabase
    .from("site_visits")
    .select(FULL_SITE_VISIT_SELECT)
    .order("created_at", { ascending: false })
    .limit(MAX_ANALYTICS_ROWS);

  const fullResult = since ? await fullQuery.gte("created_at", since) : await fullQuery;

  if (!fullResult.error) {
    return normalizeSiteVisitRows((fullResult.data ?? []) as RawSiteVisitRow[]);
  }

  const query = supabase
    .from("site_visits")
    .select(LOCATION_SITE_VISIT_SELECT)
    .order("created_at", { ascending: false })
    .limit(MAX_ANALYTICS_ROWS);
  const result = since ? await query.gte("created_at", since) : await query;

  if (!result.error) {
    return normalizeSiteVisitRows((result.data ?? []) as RawSiteVisitRow[]);
  }

  if (!isMissingVisitorColumnError(result.error)) {
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
    visitor_country: row.visitor_country ?? null,
    user_email: row.user_email ?? null,
    user_display_name: row.user_display_name ?? null
  }));
}

function isMissingVisitorColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /visitor_|user_/i.test(error.message ?? "")
  );
}
