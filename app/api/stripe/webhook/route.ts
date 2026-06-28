import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { upsertKeepsakeOrder } from "@/lib/keepsake-orders";

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
  type: string;
  data: {
    object: StripeCheckoutSession;
  };
};

function verifyStripeSignature(payload: string, signature: string, secret: string) {
  const parts = signature.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split("=");
    if (!key || !value) {
      return acc;
    }

    acc[key] = [...(acc[key] ?? []), value];
    return acc;
  }, {});
  const timestamp = parts.t?.[0];
  const signatures = parts.v1 ?? [];

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);

  return signatures.some((value) => {
    const actualBuffer = Buffer.from(value);

    return (
      actualBuffer.length === expectedBuffer.length &&
      timingSafeEqual(actualBuffer, expectedBuffer)
    );
  });
}

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
