import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { isConfiguredAdminEmail } from "@/lib/admin-emails";
import {
  createLastVisitSignature,
  createVisitorId,
  evaluateBotConfidence,
  extractAttributionFromUrl,
  getApproximateVisitorLocation,
  getSafeHeaderValue,
  isDuplicateRecentVisit,
  isValidVisitorId,
  LAST_VISIT_COOKIE_NAME,
  LAST_VISIT_MAX_AGE_SECONDS,
  shouldRecordSiteVisit,
  VISITOR_ID_COOKIE_NAME,
  VISITOR_ID_MAX_AGE_SECONDS
} from "@/lib/site-visit-utils";

let siteVisitInsertClient: SupabaseClient<any, "public", any> | null = null;

function getSiteVisitInsertClient(
  fallbackClient: SupabaseClient<any, "public", any>
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return fallbackClient;
  }

  if (!siteVisitInsertClient) {
    siteVisitInsertClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }) as SupabaseClient<any, "public", any>;
  }

  return siteVisitInsertClient;
}

export function getSiteVisitAdminFlag(userEmail: string | null | undefined) {
  return isConfiguredAdminEmail(userEmail);
}

export async function recordSiteVisit(input: {
  request: NextRequest;
  response: NextResponse;
  supabase: SupabaseClient<any, "public", any>;
  userEmail: string | null;
}) {
  const path = input.request.nextUrl.pathname;

  if (
    !shouldRecordSiteVisit({
      method: input.request.method,
      path,
      headers: input.request.headers
    })
  ) {
    return;
  }

  if (
    isDuplicateRecentVisit({
      lastVisitCookie: input.request.cookies.get(LAST_VISIT_COOKIE_NAME)?.value,
      path
    })
  ) {
    return;
  }

  const existingVisitorId = input.request.cookies.get(VISITOR_ID_COOKIE_NAME)?.value;
  const visitorId = isValidVisitorId(existingVisitorId)
    ? existingVisitorId
    : createVisitorId();
  const isAdmin = getSiteVisitAdminFlag(input.userEmail);
  const location = getApproximateVisitorLocation(input.request.headers);

  // Evaluate bot confidence score & classification
  const botEval = evaluateBotConfidence({
    userAgent: input.request.headers.get("user-agent"),
    path,
    referrer: input.request.headers.get("referer"),
    isAdmin
  });

  // Extract attribution parameters from URL
  const attr = extractAttributionFromUrl(input.request.nextUrl);

  // Manage First-Touch cookie preservation
  let firstTouch = {
    source: attr.utm_source,
    medium: attr.utm_medium,
    campaign: attr.utm_campaign,
    campaignId: attr.tla_campaign_id
  };

  const existingFtCookie = input.request.cookies.get("tla_ft_attr")?.value;

  if (existingFtCookie) {
    try {
      const parsed = JSON.parse(existingFtCookie);
      firstTouch = {
        source: parsed.s ?? firstTouch.source,
        medium: parsed.m ?? firstTouch.medium,
        campaign: parsed.c ?? firstTouch.campaign,
        campaignId: parsed.cid ?? firstTouch.campaignId
      };
    } catch {
      // Keep initial extraction
    }
  } else if (attr.utm_source || attr.tla_campaign_id) {
    input.response.cookies.set("tla_ft_attr", JSON.stringify({
      s: attr.utm_source,
      m: attr.utm_medium,
      c: attr.utm_campaign,
      cid: attr.tla_campaign_id
    }), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });
  }

  const baseInsert = {
    path,
    referrer: getSafeHeaderValue(input.request.headers.get("referer"), 500),
    user_agent: getSafeHeaderValue(input.request.headers.get("user-agent"), 500),
    is_admin: isAdmin,
    anonymous_visitor_id: visitorId,
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
    utm_content: attr.utm_content,
    utm_term: attr.utm_term,
    tla_campaign_id: attr.tla_campaign_id,
    tla_link_id: attr.tla_link_id,
    tla_qr_id: attr.tla_qr_id,
    tla_channel: attr.tla_channel,
    tla_placement: attr.tla_placement,
    tla_variant: attr.tla_variant,
    tla_material: attr.tla_material,
    tla_location: attr.tla_location,
    tla_partner: attr.tla_partner,
    first_touch_utm_source: firstTouch.source,
    first_touch_utm_medium: firstTouch.medium,
    first_touch_utm_campaign: firstTouch.campaign,
    first_touch_tla_campaign_id: firstTouch.campaignId,
    bot_score: botEval.score,
    bot_classification: botEval.classification,
    bot_reasons: botEval.reasons
  };

  const supabase = getSiteVisitInsertClient(input.supabase);

  // Try inserting with full attribution & location fields
  const { error } = await supabase
    .from("site_visits")
    .insert({
      ...baseInsert,
      user_email: input.userEmail,
      visitor_city: location.city,
      visitor_region: location.region,
      visitor_country: location.country
    });

  if (error) {
    if (!isMissingColumnError(error)) {
      console.error("Unable to record site visit:", error.message);
      return;
    }

    // Fallback try without attribution columns
    const { error: locError } = await supabase.from("site_visits").insert({
      path,
      referrer: baseInsert.referrer,
      user_agent: baseInsert.user_agent,
      is_admin: isAdmin,
      anonymous_visitor_id: visitorId,
      user_email: input.userEmail,
      visitor_city: location.city,
      visitor_region: location.region,
      visitor_country: location.country
    });

    if (locError) {
      if (!isMissingColumnError(locError)) {
        console.error("Unable to record site visit:", locError.message);
        return;
      }

      // Minimal fallback insert
      await supabase.from("site_visits").insert({
        path,
        referrer: baseInsert.referrer,
        user_agent: baseInsert.user_agent,
        is_admin: isAdmin,
        anonymous_visitor_id: visitorId
      });
    }
  }

  input.response.cookies.set(VISITOR_ID_COOKIE_NAME, visitorId, {
    httpOnly: true,
    maxAge: VISITOR_ID_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  input.response.cookies.set(LAST_VISIT_COOKIE_NAME, createLastVisitSignature(path), {
    httpOnly: true,
    maxAge: LAST_VISIT_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

function isMissingColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /visitor_|user_/i.test(error.message ?? "")
  );
}
