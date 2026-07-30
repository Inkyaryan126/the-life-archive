import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { isConfiguredAdminEmail } from "@/lib/admin-emails";
import {
  createLastVisitSignature,
  createVisitorId,
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

  const baseInsert = {
    path,
    referrer: getSafeHeaderValue(input.request.headers.get("referer"), 500),
    user_agent: getSafeHeaderValue(input.request.headers.get("user-agent"), 500),
    is_admin: isAdmin,
    anonymous_visitor_id: visitorId
  };

  const supabase = getSiteVisitInsertClient(input.supabase);

  // Try inserting with full location & user email fields first
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

    // Fallback try with location only
    const { error: locError } = await supabase.from("site_visits").insert({
      ...baseInsert,
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
      const { error: fallbackError } = await supabase
        .from("site_visits")
        .insert(baseInsert);

      if (fallbackError) {
        console.error("Unable to record site visit:", fallbackError.message);
        return;
      }
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
