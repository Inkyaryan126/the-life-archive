import { NextResponse } from "next/server";
import { processArchiveConciergeStripeEvent } from "@/lib/archive-concierge-payments";
import { upsertKeepsakeOrder } from "@/lib/keepsake-orders";
import { verifyStripeSignature } from "@/lib/stripe-webhook-signature";

export const runtime = "nodejs";

type StripeCheckoutSession = {
  id: string;
  object: "checkout.session";
  amount_total?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  customer_details?: {
    email?: string | null;
  } | null;
  livemode?: boolean;
  metadata?: Record<string, string | undefined> | null;
  payment_intent?: string | null;
  payment_status?: string | null;
};

type StripeEvent = {
  id?: string;
  type: string;
  data: {
    object: StripeCheckoutSession & {
      amount_refunded?: number | null;
    };
  };
};

function getStripeDashboardUrl(session: StripeCheckoutSession) {
  const modePath = session.livemode ? "" : "/test";

  if (session.payment_intent) {
    return `https://dashboard.stripe.com${modePath}/payments/${session.payment_intent}`;
  }

  return `https://dashboard.stripe.com${modePath}/search?query=${encodeURIComponent(session.id)}`;
}

async function getLineItemProductName(sessionId: string) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return null;
  }

  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items?limit=1&expand[]=data.price.product`,
    {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`
      }
    }
  );

  if (!response.ok) {
    return null;
  }

  const lineItems = (await response.json()) as {
    data?: Array<{
      description?: string | null;
      price?: {
        product?: string | { name?: string | null } | null;
      } | null;
    }>;
  };
  const item = lineItems.data?.[0];
  const product = item?.price?.product;

  if (typeof product === "object" && product?.name) {
    return product.name;
  }

  return item?.description ?? null;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 500 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !verifyStripeSignature(payload, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;

  if (
    event.data.object.metadata?.product_type === "archive_concierge" &&
    [
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.async_payment_failed",
      "payment_intent.payment_failed",
      "charge.refunded"
    ].includes(event.type)
  ) {
    try {
      await processArchiveConciergeStripeEvent(event);
      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("Archive Concierge Stripe webhook failed", {
        eventId: event.id,
        eventType: event.type,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return NextResponse.json({ error: "Webhook processing failed." }, { status: 400 });
    }
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const productName =
    session.metadata?.product_name ||
    (await getLineItemProductName(session.id)) ||
    "Keepsake Order";

  await upsertKeepsakeOrder({
    stripeSessionId: session.id,
    customerEmail: session.customer_details?.email || session.customer_email || null,
    productName,
    amountPaid: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    paymentStatus: session.payment_status ?? "paid",
    archiveSlug: session.metadata?.archive_slug || null,
    stripeSessionUrl: getStripeDashboardUrl(session)
  });

  return NextResponse.json({ received: true });
}
