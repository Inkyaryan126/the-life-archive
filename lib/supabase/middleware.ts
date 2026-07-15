import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { recordSiteVisit } from "@/lib/site-visit-tracking";
import { getCanonicalHostRedirectUrl } from "@/lib/site-visit-utils";

export async function updateSession(request: NextRequest) {
  const canonicalRedirectUrl = getCanonicalHostRedirectUrl({
    requestUrl: request.url,
    hostHeader: request.headers.get("host"),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL
  });

  if (canonicalRedirectUrl) {
    return NextResponse.redirect(canonicalRedirectUrl, 308);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );

          Object.entries(headers).forEach(([name, value]) =>
            response.headers.set(name, value)
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  await recordSiteVisit({
    request,
    response,
    supabase,
    userEmail: user?.email ?? null
  });

  return response;
}
