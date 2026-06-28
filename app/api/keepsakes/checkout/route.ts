import { NextResponse } from "next/server";
import { getAccountContext } from "@/lib/account";

type CheckoutType = "card" | "keychain" | "plaque";

const products: Record<
  CheckoutType,
  {
    name: string;
    productId: string;
    unitAmount: number;
  }
> = {
  card: {
    name: "The Life Archive Memory Card",
    productId: "prod_Umoxxb4aF5MuPL",
    unitAmount: 1900
  },
  keychain: {
    name: "The Life Archive Memorial Keychain",
    productId: "prod_Umopvhs6gAemhj",
    unitAmount: 2400
  },
  plaque: {
    name: "The Life Archive Memorial Plaque",
    productId: "prod_Ump23cb9KHhhNQ",
    unitAmount: 7900
  }
};

function getSiteOrigin(request: Request) {
  const { origin } = new URL(request.url);

  return process.env.NEXT_PUBLIC_SITE_URL || origin;
}

function redirectWithError(request: Request, message: string) {
  const origin = getSiteOrigin(request);

  return NextResponse.redirect(
    `${origin}/keepsakes?checkout_error=${encodeURIComponent(message)}`
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as CheckoutType | null;
  const product = type ? products[type] : undefined;
  const requestedArchiveSlug = searchParams.get("archive")?.trim() || null;

  if (!type || !product) {
    return redirectWithError(request, "That keepsake is not available for checkout yet.");
  }

  const checkoutType: CheckoutType = type;
  const account = await getAccountContext();
  const archiveSlug =
    requestedArchiveSlug ||
    account.defaultArchive?.slug ||
    account.archives[0]?.slug ||
    null;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return redirectWithError(request, "Checkout is not configured yet.");
  }

  const origin = getSiteOrigin(request);
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/keepsakes/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/keepsakes`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(product.unitAmount),
    "line_items[0][price_data][product]": product.productId,
    "metadata[keepsake_type]": checkoutType,
    "metadata[product_name]": product.name
  });

  if (archiveSlug) {
    body.set("metadata[archive_slug]", archiveSlug);
  }

  if (account.user?.email && account.user.email !== "Email unavailable") {
    body.set("customer_email", account.user.email);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    return redirectWithError(request, "Checkout could not start. Please try again.");
  }

  const session = (await response.json()) as { url?: string };

  if (!session.url) {
    return redirectWithError(request, "Checkout could not start. Please try again.");
  }

  return NextResponse.redirect(session.url);
}
