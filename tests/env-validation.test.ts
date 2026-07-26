import assert from "node:assert/strict";
import { validateEnvironment } from "../lib/env-validation";

async function runTests() {
  console.log("Starting env-validation test suite...");

  const validCoreEnv = {
    NEXT_PUBLIC_SITE_URL: "https://thelifearchive.vip",
    NEXT_PUBLIC_SUPABASE_URL: "https://xyzproject.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon",
    SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role",
    ADMIN_EMAILS: "alex@example.com, sam@example.com"
  };

  const validPaymentsEnv = {
    STRIPE_MODE: "test",
    STRIPE_SECRET_KEY: "sk_test_12345678901234567890",
    STRIPE_WEBHOOK_SECRET: "whsec_12345678901234567890",
    STRIPE_PRICE_MEMBER_CARD: "price_1111",
    STRIPE_PRICE_MEMORY_CARD: "price_2222",
    STRIPE_PRICE_MEMORIAL_KEYCHAIN: "price_3333",
    STRIPE_PRICE_MEMORIAL_DOG_TAG: "price_4444",
    STRIPE_PRICE_MEMORIAL_PLAQUE: "price_5555"
  };

  const validEmailEnv = {
    RESEND_API_KEY: "re_123456789",
    TLA_FROM_EMAIL: "The Life Archive <hello@thelifearchive.vip>",
    CLAIM_TOKEN_SECRET: "012345678901234567890123456789012345"
  };

  const validCronEnv = {
    CRON_SECRET: "012345678901234567890123456789012345"
  };

  const validPublicSubmissionSecurityEnv = {
    RATE_LIMIT_HASH_SECRET: "012345678901234567890123456789012345"
  };

  const validKeepsakeSecurityEnv = {
    SHARE_PASS_TOKEN_SECRET: "012345678901234567890123456789012345"
  };

  const validAllEnv = {
    ...validCoreEnv,
    ...validPaymentsEnv,
    ...validEmailEnv,
    ...validCronEnv,
    ...validPublicSubmissionSecurityEnv,
    ...validKeepsakeSecurityEnv
  };

  // 1. Valid core profile
  const coreResult = validateEnvironment(validCoreEnv, { profile: "core", environment: "production" });
  assert.equal(coreResult.ok, true);
  assert.equal(coreResult.normalized.NEXT_PUBLIC_SITE_URL, "https://thelifearchive.vip");

  // 2. Missing core variable
  const missingCore = validateEnvironment({ ...validCoreEnv, NEXT_PUBLIC_SITE_URL: "" }, { profile: "core" });
  assert.equal(missingCore.ok, false);
  assert.equal(missingCore.errors.some((e) => e.variable === "NEXT_PUBLIC_SITE_URL"), true);

  // 3. Malformed site URL / Credentials / Query / Fragments / HTTP in Production
  const httpProd = validateEnvironment({ ...validCoreEnv, NEXT_PUBLIC_SITE_URL: "http://thelifearchive.vip" }, { profile: "core", environment: "production" });
  assert.equal(httpProd.ok, false);

  const credsUrl = validateEnvironment({ ...validCoreEnv, NEXT_PUBLIC_SITE_URL: "https://user:pass@thelifearchive.vip" }, { profile: "core" });
  assert.equal(credsUrl.ok, false);

  const queryUrl = validateEnvironment({ ...validCoreEnv, NEXT_PUBLIC_SITE_URL: "https://thelifearchive.vip?foo=bar" }, { profile: "core" });
  assert.equal(queryUrl.ok, false);

  // 4. Identical Supabase Anon and Service Role keys
  const identicalKeys = validateEnvironment({
    ...validCoreEnv,
    SUPABASE_SERVICE_ROLE_KEY: validCoreEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }, { profile: "core" });
  assert.equal(identicalKeys.ok, false);
  assert.equal(identicalKeys.errors.some((e) => e.variable === "SUPABASE_SERVICE_ROLE_KEY"), true);

  // 5. Stripe Mode & Key Mismatch Checks
  const testModeWithLiveKey = validateEnvironment({ ...validPaymentsEnv, STRIPE_MODE: "test", STRIPE_SECRET_KEY: "sk_live_1234" }, { profile: "payments" });
  assert.equal(testModeWithLiveKey.ok, false);

  const liveModeWithTestKey = validateEnvironment({ ...validPaymentsEnv, STRIPE_MODE: "live", STRIPE_SECRET_KEY: "sk_test_1234" }, { profile: "payments" });
  assert.equal(liveModeWithTestKey.ok, false);

  const liveModeWithLiveKey = validateEnvironment({ ...validPaymentsEnv, STRIPE_MODE: "live", STRIPE_SECRET_KEY: "sk_live_1234" }, { profile: "payments" });
  assert.equal(liveModeWithLiveKey.ok, true);

  // 6. Malformed Stripe Price IDs & Webhook secret
  const badPrice = validateEnvironment({ ...validPaymentsEnv, STRIPE_PRICE_MEMBER_CARD: "invalid_price" }, { profile: "payments" });
  assert.equal(badPrice.ok, false);

  const badWebhook = validateEnvironment({ ...validPaymentsEnv, STRIPE_WEBHOOK_SECRET: "invalid_webhook" }, { profile: "payments" });
  assert.equal(badWebhook.ok, false);

  // 7. Email Formatting & Header Injection Checks
  const validNamedEmail = validateEnvironment({ ...validEmailEnv, TLA_FROM_EMAIL: "The Life Archive <hello@thelifearchive.vip>" }, { profile: "email" });
  assert.equal(validNamedEmail.ok, true);

  const emailInjection = validateEnvironment({ ...validEmailEnv, TLA_FROM_EMAIL: "hello@thelifearchive.vip\r\nBcc: evil@hacker.com" }, { profile: "email" });
  assert.equal(emailInjection.ok, false);

  // 8. Admin Emails Normalization & Deduplication
  const adminNormal = validateEnvironment({ ...validCoreEnv, ADMIN_EMAILS: "Alex@Example.com , sam@example.com , ALEX@EXAMPLE.COM" }, { profile: "core" });
  assert.equal(adminNormal.ok, true);
  assert.equal(adminNormal.normalized.ADMIN_EMAILS, "alex@example.com,sam@example.com");

  // 9. Placeholder Secrets Rejection
  const placeholderSecret = validateEnvironment({ ...validCronEnv, CRON_SECRET: "replace_with_at_least_32_random_bytes" }, { profile: "cron" });
  assert.equal(placeholderSecret.ok, false);

  // 10. Short Secrets Rejection (<32 chars)
  const shortSecret = validateEnvironment({ ...validCronEnv, CRON_SECRET: "too_short_secret" }, { profile: "cron" });
  assert.equal(shortSecret.ok, false);

  // 11. Full Environment Validation
  const fullResult = validateEnvironment(validAllEnv, { profile: "all", environment: "production" });
  assert.equal(fullResult.ok, true);

  // 12. Confirm Error messages never leak raw secrets
  const failedSecretResult = validateEnvironment({ ...validCronEnv, CRON_SECRET: "short_secret_value_123" }, { profile: "cron" });
  const errorJson = JSON.stringify(failedSecretResult.errors);
  assert.doesNotMatch(errorJson, /short_secret_value_123/);

  console.log("env-validation test suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("env-validation tests failed:", err);
  process.exit(1);
});
