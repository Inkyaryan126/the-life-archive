import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  if (request.nextUrl.pathname.startsWith("/k/")) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, noimageindex");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://images.unsplash.com; media-src 'self' blob: https://*.supabase.co https://*.supabase.in https://youtube.com https://www.youtube.com https://youtu.be https://vimeo.com https://player.vimeo.com https://spotify.com https://open.spotify.com https://soundcloud.com https://w.soundcloud.com; object-src 'none'; frame-src 'self' https://youtube.com https://www.youtube.com https://youtu.be https://vimeo.com https://player.vimeo.com https://spotify.com https://open.spotify.com https://soundcloud.com https://w.soundcloud.com; frame-ancestors 'none'; form-action 'none';"
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
