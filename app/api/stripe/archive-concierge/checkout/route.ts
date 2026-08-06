import { NextResponse } from "next/server";
import { ArchiveConciergeError } from "@/lib/archive-concierge";
import { createArchiveConciergeCheckout } from "@/lib/archive-concierge-payments";

export const runtime = "nodejs";

function getOrigin(request: Request) {
  const { origin } = new URL(request.url);
  return process.env.NEXT_PUBLIC_SITE_URL || origin;
}

function redirectToOrder(request: Request, orderId: string, params?: Record<string, string>) {
  const url = new URL(`/dashboard/concierge/${encodeURIComponent(orderId)}`, getOrigin(request));
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const includeMemorialPriority = formData.get("memorialPriority") === "on";

  if (!orderId) {
    return NextResponse.redirect(new URL("/dashboard/concierge", getOrigin(request)));
  }

  try {
    const result = await createArchiveConciergeCheckout({
      orderId,
      includeMemorialPriority,
      request
    });

    return NextResponse.redirect(result.redirectUrl);
  } catch (error) {
    const message =
      error instanceof ArchiveConciergeError
        ? error.message
        : "Checkout could not start. Please try again.";
    return redirectToOrder(request, orderId, { checkout_error: message });
  }
}
