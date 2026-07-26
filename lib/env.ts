import "server-only";

import { validateEnvironment, type EnvProfile, type TargetEnvironment } from "./env-validation";

function detectTargetEnvironment(): TargetEnvironment {
  const vercelEnv = process.env.VERCEL_ENV?.trim();
  if (vercelEnv === "production") return "production";
  if (vercelEnv === "preview") return "preview";

  const nodeEnv = process.env.NODE_ENV?.trim();
  if (nodeEnv === "test") return "test";
  if (nodeEnv === "production") return "production";

  return "development";
}

export function getValidatedProfileEnv(profile: EnvProfile) {
  const env = process.env;
  const targetEnv = detectTargetEnvironment();
  const result = validateEnvironment(env, { profile, environment: targetEnv });

  if (!result.ok) {
    const errorMsgs = result.errors.map((e) => ` - ${e.variable}: ${e.message}`).join("\n");
    throw new Error(`Environment validation failed for profile [${profile}]:\n${errorMsgs}`);
  }

  return result.normalized;
}

export function getCoreEnv() {
  const norm = getValidatedProfileEnv("core");
  return {
    siteUrl: norm.NEXT_PUBLIC_SITE_URL,
    supabaseUrl: norm.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: norm.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: norm.SUPABASE_SERVICE_ROLE_KEY,
    adminEmails: norm.ADMIN_EMAILS ? norm.ADMIN_EMAILS.split(",") : []
  };
}

export function getPaymentEnv() {
  const norm = getValidatedProfileEnv("payments");
  return {
    stripeMode: norm.STRIPE_MODE as "test" | "live",
    stripeSecretKey: norm.STRIPE_SECRET_KEY,
    stripeWebhookSecret: norm.STRIPE_WEBHOOK_SECRET,
    priceMemberCard: norm.STRIPE_PRICE_MEMBER_CARD,
    priceMemoryCard: norm.STRIPE_PRICE_MEMORY_CARD,
    priceMemorialKeychain: norm.STRIPE_PRICE_MEMORIAL_KEYCHAIN,
    priceMemorialDogTag: norm.STRIPE_PRICE_MEMORIAL_DOG_TAG,
    priceMemorialPlaque: norm.STRIPE_PRICE_MEMORIAL_PLAQUE
  };
}

export function getEmailEnv() {
  const norm = getValidatedProfileEnv("email");
  return {
    resendApiKey: norm.RESEND_API_KEY,
    fromEmail: norm.TLA_FROM_EMAIL,
    claimTokenSecret: norm.CLAIM_TOKEN_SECRET
  };
}

export function getCronEnv() {
  const norm = getValidatedProfileEnv("cron");
  return {
    cronSecret: norm.CRON_SECRET
  };
}

export function getRateLimitEnv() {
  const norm = getValidatedProfileEnv("public-submission-security");
  return {
    rateLimitHashSecret: norm.RATE_LIMIT_HASH_SECRET
  };
}

export function getSharePassEnv() {
  const norm = getValidatedProfileEnv("keepsake-security");
  return {
    sharePassTokenSecret: norm.SHARE_PASS_TOKEN_SECRET
  };
}
