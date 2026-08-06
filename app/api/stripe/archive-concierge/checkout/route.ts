import { NextResponse } from "next/server";
import { ArchiveConciergeError } from "@/lib/archive-concierge";
import { createArchiveConciergeCheckout } from "@/lib/archive-concierge-payments";
import { isValidStripeCheckoutUrl } from "@/lib/archive-concierge-payment-rules";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const includeMemorialPriority = formData.get("memorialPriority") === "on";

  if (!orderId) {
    return NextResponse.json(
      { error: "Choose an Archive Concierge order before checkout." },
      { status: 400 }
    );
  }

  try {
    const result = await createArchiveConciergeCheckout({
      orderId,
      includeMemorialPriority,
      request
    });

    if (!isValidStripeCheckoutUrl(result.redirectUrl)) {
      return NextResponse.json(
        { error: "Checkout is already complete or could not be opened safely." },
        { status: 409 }
      );
    }

    return NextResponse.json({ url: result.redirectUrl });
  } catch (error) {
    const message =
      error instanceof ArchiveConciergeError
        ? error.message
        : "Checkout could not start. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
