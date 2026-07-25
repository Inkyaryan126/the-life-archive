import { NextResponse } from "next/server";
import { getAccountContext } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import {
  isCheckoutType,
  keepsakeProducts,
  resolveStripePriceId,
  validateStripeModeAndSecretKey,
  type CheckoutType
} from "@/lib/stripe-checkout-config";

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
  const typeParam = searchParams.get("type")?.trim() || null;

  if (!isCheckoutType(typeParam)) {
    return redirectWithError(request, "That keepsake is not available for checkout yet.");
  }

  const checkoutType: CheckoutType = typeParam;
  const product = keepsakeProducts[checkoutType];
  const requestedArchiveSlug = searchParams.get("archive")?.trim() || null;

  const account = await getAccountContext();
  const { archiveSlug, error: archiveError } = await resolveAuthorizedArchiveSlug({
    account,
    requestedArchiveSlug,
    requiresArchive: product.requiresArchive
  });

  if (archiveError) {
    return redirectWithError(request, archiveError);
  }

  const modeKeyResult = validateStripeModeAndSecretKey(process.env);

  if (!modeKeyResult.ok) {
    console.error(modeKeyResult.logMessage);
    return redirectWithError(request, modeKeyResult.error);
  }

  const priceResult = resolveStripePriceId(product.priceIdEnv, product.name, process.env);

  if (!priceResult.ok) {
    console.error(priceResult.logMessage);
    return redirectWithError(request, priceResult.error);
  }

  const origin = getSiteOrigin(request);
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/keepsakes/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/keepsakes`,
    "line_items[0][quantity]": "1",
    "line_items[0][price]": priceResult.priceId,
    "metadata[keepsake_type]": checkoutType,
    "metadata[product_slug]": checkoutType,
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
      Authorization: `Bearer ${modeKeyResult.secretKey}`,
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
