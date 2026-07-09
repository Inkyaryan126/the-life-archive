import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { isConfiguredAdminEmail } from "@/lib/admin-emails";

const PUBLIC_FILE_PATTERN = /\.(?:css|js|map|ico|svg|png|jpg|jpeg|gif|webp|avif|txt|xml|json|woff|woff2|ttf|otf)$/i;

function shouldRecordSiteVisit(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (request.method !== "GET") {
    return false;
  }

  if (
    path === "/favicon.ico" ||
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    PUBLIC_FILE_PATTERN.test(path)
  ) {
    return false;
  }

  if (
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("next-router-prefetch") === "1"
  ) {
    return false;
  }

  return true;
}

export async function recordSiteVisit(input: {
  request: NextRequest;
  supabase: SupabaseClient<any, "public", any>;
  userEmail: string | null;
}) {
  if (!shouldRecordSiteVisit(input.request)) {
    return;
  }

  if (isConfiguredAdminEmail(input.userEmail)) {
    return;
  }

  const { error } = await input.supabase.from("site_visits").insert({
    path: input.request.nextUrl.pathname,
    referrer: input.request.headers.get("referer"),
    user_agent: input.request.headers.get("user-agent"),
    is_admin: false
  });

  if (error) {
    console.error("Unable to record site visit:", error.message);
  }
}
