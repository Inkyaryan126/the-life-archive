export type CheckoutType = "member-card" | "card" | "keychain" | "dogtag" | "plaque";

export type KeepsakeProductConfig = {
  checkoutType: CheckoutType;
  name: string;
  priceIdEnv: string;
  requiresArchive: boolean;
};

export const keepsakeProducts: Record<CheckoutType, KeepsakeProductConfig> = {
  "member-card": {
    checkoutType: "member-card",
    name: "The Life Archive Member Card",
    priceIdEnv: "STRIPE_PRICE_MEMBER_CARD",
    requiresArchive: true
  },
  card: {
    checkoutType: "card",
    name: "The Life Archive Memory Card",
    priceIdEnv: "STRIPE_PRICE_MEMORY_CARD",
    requiresArchive: true
  },
  keychain: {
    checkoutType: "keychain",
    name: "The Life Archive Memorial Keychain",
    priceIdEnv: "STRIPE_PRICE_MEMORIAL_KEYCHAIN",
    requiresArchive: true
  },
  dogtag: {
    checkoutType: "dogtag",
    name: "The Life Archive Memorial Dog Tag",
    priceIdEnv: "STRIPE_PRICE_MEMORIAL_DOG_TAG",
    requiresArchive: true
  },
  plaque: {
    checkoutType: "plaque",
    name: "The Life Archive Memorial Plaque",
    priceIdEnv: "STRIPE_PRICE_MEMORIAL_PLAQUE",
    requiresArchive: true
  }
};

export function isCheckoutType(type: string | null | undefined): type is CheckoutType {
  return typeof type === "string" && type in keepsakeProducts;
}

export type StripeModeResult =
  | { ok: true; mode: "test" | "live"; secretKey: string }
  | { ok: false; error: string; logMessage: string };

export function validateStripeModeAndSecretKey(
  env: Record<string, string | undefined> = process.env
): StripeModeResult {
  const mode = env.STRIPE_MODE?.trim().toLowerCase();

  if (!mode) {
    return {
      ok: false,
      error: "Checkout is not configured yet.",
      logMessage: "Stripe configuration error: STRIPE_MODE environment variable is missing or empty."
    };
  }

  if (mode !== "test" && mode !== "live") {
    return {
      ok: false,
      error: "Checkout configuration is invalid.",
      logMessage: `Stripe configuration error: STRIPE_MODE must be "test" or "live", got "${mode}".`
    };
  }

  const secretKey = env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    return {
      ok: false,
      error: "Checkout is not configured yet.",
      logMessage: "Stripe configuration error: STRIPE_SECRET_KEY environment variable is missing or empty."
    };
  }

  if (mode === "test" && !secretKey.startsWith("sk_test_")) {
    return {
      ok: false,
      error: "Checkout configuration is invalid.",
      logMessage: "Stripe configuration error: STRIPE_MODE is set to 'test', but STRIPE_SECRET_KEY does not start with 'sk_test_'."
    };
  }

  if (mode === "live" && !secretKey.startsWith("sk_live_")) {
    return {
      ok: false,
      error: "Checkout configuration is invalid.",
      logMessage: "Stripe configuration error: STRIPE_MODE is set to 'live', but STRIPE_SECRET_KEY does not start with 'sk_live_'."
    };
  }

  return { ok: true, mode, secretKey };
}

export type PriceIdResult =
  | { ok: true; priceId: string }
  | { ok: false; error: string; logMessage: string };

export function resolveStripePriceId(
  envVarName: string,
  productName: string,
  env: Record<string, string | undefined> = process.env
): PriceIdResult {
  const value = env[envVarName]?.trim();

  if (!value) {
    return {
      ok: false,
      error: `${productName} checkout is not configured yet. Missing ${envVarName}.`,
      logMessage: `Stripe configuration error: Missing environment variable ${envVarName} for ${productName}.`
    };
  }

  if (!/^price_[A-Za-z0-9]+$/.test(value)) {
    return {
      ok: false,
      error: `${productName} checkout configuration is invalid.`,
      logMessage: `Stripe configuration error: Environment variable ${envVarName} must be a valid Stripe Price ID starting with "price_".`
    };
  }

  return { ok: true, priceId: value };
}
