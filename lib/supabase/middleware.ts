import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { recordSiteVisit } from "@/lib/site-visit-tracking";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return response;
    }

    const supabase = createServerClient(supabaseUrl, anonKey, {
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
    });

    const {
      data: { user }
    } = await supabase.auth.getUser();

    try {
      await recordSiteVisit({
        request,
        response,
        supabase,
        userEmail: user?.email ?? null
      });
    } catch (visitError) {
      console.error("Unable to record site visit:", visitError);
    }
  } catch (sessionError) {
    console.error("Unable to update session in middleware:", sessionError);
  }

  return response;
}
