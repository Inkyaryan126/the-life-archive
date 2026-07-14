import { NextResponse } from "next/server";
import { getAccountContext } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

type CheckoutType = "member-card" | "card" | "keychain" | "dogtag" | "plaque";

const products: Record<
  CheckoutType,
  {
    name: string;
    productId?: string;
    unitAmount?: number;
    priceIdEnv?: string;
    requiresArchive: boolean;
  }
> = {
  "member-card": {
    name: "The Life Archive Member Card",
    priceIdEnv: "STRIPE_PRICE_MEMBER_CARD",
    requiresArchive: true
  },
  card: {
    name: "The Life Archive Memorial Card",
    productId: "prod_Umoxxb4aF5MuPL",
    unitAmount: 1900,
    requiresArchive: true
  },
  keychain: {
    name: "The Life Archive Memorial Keychain",
    productId: "prod_Umopvhs6gAemhj",
    unitAmount: 2400,
    requiresArchive: true
  },
  dogtag: {
    name: "The Life Archive Memorial Dog Tag",
    unitAmount: 2900,
    requiresArchive: true
  },
  plaque: {
    name: "The Life Archive Memorial Plaque",
    productId: "prod_Ump23cb9KHhhNQ",
    unitAmount: 7900,
    requiresArchive: true
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

async function resolveAuthorizedArchiveSlug(input: {
  account: Awaited<ReturnType<typeof getAccountContext>>;
  requestedArchiveSlug: string | null;
  requiresArchive: boolean;
}) {
  const { account, requestedArchiveSlug, requiresArchive } = input;

  if (!account.user) {
    return {
      archiveSlug: null,
      error: "Sign in to your account before checkout."
    };
  }

  const supabase = await createClient();

  if (requestedArchiveSlug) {
    if (account.archives.some((archive) => archive.slug === requestedArchiveSlug)) {
      return { archiveSlug: requestedArchiveSlug, error: null };
    }

    const { data: archive, error: archiveError } = await supabase
      .from("archives")
      .select("id, slug, owner_id")
      .eq("slug", requestedArchiveSlug)
      .maybeSingle();

    if (archiveError) {
      return {
        archiveSlug: null,
        error: "Checkout temporarily unavailable."
      };
    }

    if (!archive) {
      return {
        archiveSlug: null,
        error: "That archive was not found."
      };
    }

    if (archive.owner_id === account.user.id) {
      return { archiveSlug: archive.slug as string, error: null };
    }

    const { data: membership, error: membershipError } = await supabase
      .from("archive_members")
      .select("role")
      .eq("archive_id", archive.id)
      .eq("user_id", account.user.id)
      .maybeSingle();

    if (membershipError) {
      return {
        archiveSlug: null,
        error: "Checkout temporarily unavailable."
      };
    }

    if (!membership) {
      return {
        archiveSlug: null,
        error: "That archive does not belong to this account."
      };
    }

    return { archiveSlug: archive.slug as string, error: null };
  }

  if (requiresArchive) {
    if (account.defaultArchive?.slug) {
      return { archiveSlug: account.defaultArchive.slug, error: null };
    }

    return {
      archiveSlug: null,
      error: "Choose an archive from My Archives before checkout."
    };
  }

  return { archiveSlug: null, error: null };
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
  const { archiveSlug, error: archiveError } = await resolveAuthorizedArchiveSlug({
    account,
    requestedArchiveSlug,
    requiresArchive: product.requiresArchive
  });

  if (archiveError) {
    return redirectWithError(request, archiveError);
  }

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
    "metadata[keepsake_type]": checkoutType,
    "metadata[product_slug]": checkoutType,
    "metadata[product_name]": product.name
  });

  if (product.priceIdEnv) {
    const priceId = process.env[product.priceIdEnv];

    if (!priceId) {
      return redirectWithError(
        request,
        `${product.name} checkout is not configured yet. Missing ${product.priceIdEnv}.`
      );
    }

    body.set("line_items[0][price]", priceId);
  } else {
    if (typeof product.unitAmount !== "number") {
      return redirectWithError(request, "Checkout is not configured yet.");
    }

    body.set("line_items[0][price_data][currency]", "usd");
    body.set("line_items[0][price_data][unit_amount]", String(product.unitAmount));

    if (product.productId) {
      body.set("line_items[0][price_data][product]", product.productId);
    } else {
      body.set("line_items[0][price_data][product_data][name]", product.name);
    }
  }

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
