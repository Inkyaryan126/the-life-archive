import assert from "node:assert/strict";
import {
  isCheckoutType,
  keepsakeProducts,
  resolveStripePriceId,
  validateStripeModeAndSecretKey,
  type CheckoutType
} from "../lib/stripe-checkout-config";

{
  // 1. Valid price_ ID
  const env = { STRIPE_PRICE_MEMBER_CARD: "price_1N23456789abcdef" };
  const result = resolveStripePriceId("STRIPE_PRICE_MEMBER_CARD", "Member Card", env);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.priceId, "price_1N23456789abcdef");
  }
}

{
  // 2. Missing environment variable
  const env = {};
  const result = resolveStripePriceId("STRIPE_PRICE_MEMBER_CARD", "Member Card", env);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /Missing STRIPE_PRICE_MEMBER_CARD/);
    assert.doesNotMatch(result.error, /price_/);
  }
}

{
  // 3. Undefined value
  const env = { STRIPE_PRICE_MEMBER_CARD: undefined };
  const result = resolveStripePriceId("STRIPE_PRICE_MEMBER_CARD", "Member Card", env);
  assert.equal(result.ok, false);
}

{
  // 4. Empty value
  const env = { STRIPE_PRICE_MEMBER_CARD: "" };
  const result = resolveStripePriceId("STRIPE_PRICE_MEMBER_CARD", "Member Card", env);
  assert.equal(result.ok, false);
}

{
  // 5. Whitespace-only value
  const env = { STRIPE_PRICE_MEMBER_CARD: "   " };
  const result = resolveStripePriceId("STRIPE_PRICE_MEMBER_CARD", "Member Card", env);
  assert.equal(result.ok, false);
}

{
  // 6. prod_ rejection
  const env = { STRIPE_PRICE_MEMBER_CARD: "prod_1N23456789abcdef" };
  const result = resolveStripePriceId("STRIPE_PRICE_MEMBER_CARD", "Member Card", env);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /configuration is invalid/);
  }
}

{
  // 7. plan_ rejection
  const env = { STRIPE_PRICE_MEMBER_CARD: "plan_1N23456789abcdef" };
  const result = resolveStripePriceId("STRIPE_PRICE_MEMBER_CARD", "Member Card", env);
  assert.equal(result.ok, false);
}

{
  // 8. Stripe secret key passed as a Price ID rejection
  const envTestKey = { STRIPE_PRICE_MEMBER_CARD: "sk_test_123456789" };
  assert.equal(resolveStripePriceId("STRIPE_PRICE_MEMBER_CARD", "Member Card", envTestKey).ok, false);

  const envLiveKey = { STRIPE_PRICE_MEMBER_CARD: "sk_live_123456789" };
  assert.equal(resolveStripePriceId("STRIPE_PRICE_MEMBER_CARD", "Member Card", envLiveKey).ok, false);
}

{
  // 9. Malformed price_ ID containing spaces
  const env = { STRIPE_PRICE_MEMBER_CARD: "price_1N2345 6789" };
  const result = resolveStripePriceId("STRIPE_PRICE_MEMBER_CARD", "Member Card", env);
  assert.equal(result.ok, false);
}

{
  // 10. Malformed price_ ID containing punctuation
  const env = { STRIPE_PRICE_MEMBER_CARD: "price_1N2345!@#$" };
  const result = resolveStripePriceId("STRIPE_PRICE_MEMBER_CARD", "Member Card", env);
  assert.equal(result.ok, false);
}

{
  // 11. All five product mappings
  const requiredTypes: CheckoutType[] = ["member-card", "card", "keychain", "dogtag", "plaque"];
  const expectedEnvs: Record<CheckoutType, string> = {
    "member-card": "STRIPE_PRICE_MEMBER_CARD",
    card: "STRIPE_PRICE_MEMORY_CARD",
    keychain: "STRIPE_PRICE_MEMORIAL_KEYCHAIN",
    dogtag: "STRIPE_PRICE_MEMORIAL_DOG_TAG",
    plaque: "STRIPE_PRICE_MEMORIAL_PLAQUE"
  };

  for (const type of requiredTypes) {
    assert.equal(isCheckoutType(type), true);
    const config = keepsakeProducts[type];
    assert.equal(config.checkoutType, type);
    assert.equal(config.priceIdEnv, expectedEnvs[type]);
    assert.equal(config.requiresArchive, true);
  }
}

{
  // 12. Unsupported checkout type rejection
  assert.equal(isCheckoutType("unsupported-item"), false);
  assert.equal(isCheckoutType(""), false);
  assert.equal(isCheckoutType(null), false);
  assert.equal(isCheckoutType(undefined), false);
}

{
  // 13. STRIPE_MODE=test with sk_test_ acceptance
  const env = { STRIPE_MODE: "test", STRIPE_SECRET_KEY: "sk_test_999999" };
  const result = validateStripeModeAndSecretKey(env);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.mode, "test");
    assert.equal(result.secretKey, "sk_test_999999");
  }
}

{
  // 14. STRIPE_MODE=test with sk_live_ rejection
  const env = { STRIPE_MODE: "test", STRIPE_SECRET_KEY: "sk_live_999999" };
  const result = validateStripeModeAndSecretKey(env);
  assert.equal(result.ok, false);
}

{
  // 15. STRIPE_MODE=live with sk_live_ acceptance
  const env = { STRIPE_MODE: "live", STRIPE_SECRET_KEY: "sk_live_999999" };
  const result = validateStripeModeAndSecretKey(env);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.mode, "live");
    assert.equal(result.secretKey, "sk_live_999999");
  }
}

{
  // 16. STRIPE_MODE=live with sk_test_ rejection
  const env = { STRIPE_MODE: "live", STRIPE_SECRET_KEY: "sk_test_999999" };
  const result = validateStripeModeAndSecretKey(env);
  assert.equal(result.ok, false);
}

{
  // 17. Missing STRIPE_MODE rejection
  const env = { STRIPE_SECRET_KEY: "sk_test_999999" };
  const result = validateStripeModeAndSecretKey(env);
  assert.equal(result.ok, false);
}

{
  // 18. Invalid STRIPE_MODE rejection
  const env = { STRIPE_MODE: "sandbox", STRIPE_SECRET_KEY: "sk_test_999999" };
  const result = validateStripeModeAndSecretKey(env);
  assert.equal(result.ok, false);
}

console.log("stripe-checkout-config tests passed cleanly!");
