export type EnvProfile =
  | "core"
  | "payments"
  | "email"
  | "cron"
  | "public-submission-security"
  | "keepsake-security"
  | "all";

export type TargetEnvironment = "production" | "preview" | "development" | "test";

export type ValidationError = {
  variable: string;
  code: "missing" | "invalid_url" | "invalid_email" | "invalid_prefix" | "invalid_format" | "too_short" | "placeholder" | "mismatch";
  message: string;
};

export type ValidationResult = {
  ok: boolean;
  environment: TargetEnvironment;
  profile: EnvProfile;
  errors: ValidationError[];
  normalized: Record<string, string>;
};

const PLACEHOLDERS = new Set([
  "replace_me",
  "change_me",
  "example",
  "your_secret_here",
  "your-supabase-project-url",
  "your-supabase-anon-key",
  "your-supabase-service-role-key",
  "your-resend-api-key",
  "replace-with-a-random-cron-secret",
  "replace_with_a_secure_random_hex_secret",
  "replace_with_at_least_32_random_bytes",
  "sk_test_replace_me",
  "whsec_replace_me",
  "price_replace_me"
]);

const EMAIL_REGEX = /^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[^<>]+\s*<[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}>)$/;
const SIMPLE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const STRIPE_PRICE_REGEX = /^price_[A-Za-z0-9]+$/;

function isPlaceholder(val: string): boolean {
  const normalized = val.trim().toLowerCase();
  return PLACEHOLDERS.has(normalized) || normalized.includes("replace_me") || normalized.includes("change_me");
}

function hasControlChars(val: string): boolean {
  return /[\r\n\t\0]/.test(val);
}

export function validateEnvironment(
  env: Record<string, string | undefined>,
  options: {
    profile?: EnvProfile;
    environment?: TargetEnvironment;
  } = {}
): ValidationResult {
  const profile = options.profile ?? "all";
  const environment = options.environment ?? "development";
  const errors: ValidationError[] = [];
  const normalized: Record<string, string> = {};

  const profilesToValidate: EnvProfile[] =
    profile === "all"
      ? ["core", "payments", "email", "cron", "public-submission-security", "keepsake-security"]
      : [profile];

  const hasProfile = (p: EnvProfile) => profilesToValidate.includes(p);

  // --- 1. CORE PROFILE ---
  if (hasProfile("core")) {
    // NEXT_PUBLIC_SITE_URL
    const siteUrlRaw = env.NEXT_PUBLIC_SITE_URL?.trim();
    if (!siteUrlRaw) {
      errors.push({ variable: "NEXT_PUBLIC_SITE_URL", code: "missing", message: "NEXT_PUBLIC_SITE_URL is missing" });
    } else if (isPlaceholder(siteUrlRaw)) {
      errors.push({ variable: "NEXT_PUBLIC_SITE_URL", code: "placeholder", message: "NEXT_PUBLIC_SITE_URL contains a placeholder" });
    } else {
      try {
        const parsed = new URL(siteUrlRaw);
        if (parsed.username || parsed.password) {
          errors.push({ variable: "NEXT_PUBLIC_SITE_URL", code: "invalid_url", message: "NEXT_PUBLIC_SITE_URL must not contain credentials" });
        } else if (parsed.search || parsed.hash) {
          errors.push({ variable: "NEXT_PUBLIC_SITE_URL", code: "invalid_url", message: "NEXT_PUBLIC_SITE_URL must not contain query parameters or fragments" });
        } else if (environment === "production" && parsed.protocol !== "https:") {
          errors.push({ variable: "NEXT_PUBLIC_SITE_URL", code: "invalid_url", message: "NEXT_PUBLIC_SITE_URL must use HTTPS in production" });
        } else {
          normalized.NEXT_PUBLIC_SITE_URL = parsed.origin;
        }
      } catch {
        errors.push({ variable: "NEXT_PUBLIC_SITE_URL", code: "invalid_url", message: "NEXT_PUBLIC_SITE_URL is not a valid absolute URL" });
      }
    }

    // NEXT_PUBLIC_SUPABASE_URL
    const supabaseUrlRaw = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    if (!supabaseUrlRaw) {
      errors.push({ variable: "NEXT_PUBLIC_SUPABASE_URL", code: "missing", message: "NEXT_PUBLIC_SUPABASE_URL is missing" });
    } else if (isPlaceholder(supabaseUrlRaw)) {
      errors.push({ variable: "NEXT_PUBLIC_SUPABASE_URL", code: "placeholder", message: "NEXT_PUBLIC_SUPABASE_URL contains a placeholder" });
    } else {
      try {
        const parsed = new URL(supabaseUrlRaw);
        if (parsed.username || parsed.password || parsed.search || parsed.hash) {
          errors.push({ variable: "NEXT_PUBLIC_SUPABASE_URL", code: "invalid_url", message: "NEXT_PUBLIC_SUPABASE_URL must be a clean base URL" });
        } else if (environment === "production" && parsed.protocol !== "https:") {
          errors.push({ variable: "NEXT_PUBLIC_SUPABASE_URL", code: "invalid_url", message: "NEXT_PUBLIC_SUPABASE_URL must use HTTPS in production" });
        } else {
          normalized.NEXT_PUBLIC_SUPABASE_URL = parsed.origin;
        }
      } catch {
        errors.push({ variable: "NEXT_PUBLIC_SUPABASE_URL", code: "invalid_url", message: "NEXT_PUBLIC_SUPABASE_URL is not a valid absolute URL" });
      }
    }

    // NEXT_PUBLIC_SUPABASE_ANON_KEY
    const anonKeyRaw = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!anonKeyRaw) {
      errors.push({ variable: "NEXT_PUBLIC_SUPABASE_ANON_KEY", code: "missing", message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing" });
    } else if (isPlaceholder(anonKeyRaw)) {
      errors.push({ variable: "NEXT_PUBLIC_SUPABASE_ANON_KEY", code: "placeholder", message: "NEXT_PUBLIC_SUPABASE_ANON_KEY contains a placeholder" });
    } else if (hasControlChars(anonKeyRaw)) {
      errors.push({ variable: "NEXT_PUBLIC_SUPABASE_ANON_KEY", code: "invalid_format", message: "NEXT_PUBLIC_SUPABASE_ANON_KEY contains invalid control characters" });
    } else {
      normalized.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKeyRaw;
    }

    // SUPABASE_SERVICE_ROLE_KEY
    const serviceKeyRaw = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!serviceKeyRaw) {
      errors.push({ variable: "SUPABASE_SERVICE_ROLE_KEY", code: "missing", message: "SUPABASE_SERVICE_ROLE_KEY is missing" });
    } else if (isPlaceholder(serviceKeyRaw)) {
      errors.push({ variable: "SUPABASE_SERVICE_ROLE_KEY", code: "placeholder", message: "SUPABASE_SERVICE_ROLE_KEY contains a placeholder" });
    } else if (hasControlChars(serviceKeyRaw)) {
      errors.push({ variable: "SUPABASE_SERVICE_ROLE_KEY", code: "invalid_format", message: "SUPABASE_SERVICE_ROLE_KEY contains invalid control characters" });
    } else if (anonKeyRaw && serviceKeyRaw === anonKeyRaw) {
      errors.push({ variable: "SUPABASE_SERVICE_ROLE_KEY", code: "mismatch", message: "SUPABASE_SERVICE_ROLE_KEY cannot be identical to NEXT_PUBLIC_SUPABASE_ANON_KEY" });
    } else {
      normalized.SUPABASE_SERVICE_ROLE_KEY = serviceKeyRaw;
    }

    // ADMIN_EMAILS
    const adminEmailsRaw = env.ADMIN_EMAILS?.trim();
    if (adminEmailsRaw) {
      if (hasControlChars(adminEmailsRaw)) {
        errors.push({ variable: "ADMIN_EMAILS", code: "invalid_format", message: "ADMIN_EMAILS contains invalid control characters" });
      } else {
        const parts = adminEmailsRaw.split(",").map((e) => e.trim()).filter(Boolean);
        const validEmails = new Set<string>();
        let emailErr = false;

        for (const p of parts) {
          if (!SIMPLE_EMAIL_REGEX.test(p)) {
            emailErr = true;
            break;
          }
          validEmails.add(p.toLowerCase());
        }

        if (emailErr || parts.length === 0) {
          errors.push({ variable: "ADMIN_EMAILS", code: "invalid_email", message: "ADMIN_EMAILS must be a comma-separated list of valid email addresses" });
        } else {
          normalized.ADMIN_EMAILS = Array.from(validEmails).join(",");
        }
      }
    }
  }

  // --- 2. PAYMENTS PROFILE ---
  if (hasProfile("payments")) {
    const stripeMode = (env.STRIPE_MODE?.trim() || "test").toLowerCase();
    if (stripeMode !== "test" && stripeMode !== "live") {
      errors.push({ variable: "STRIPE_MODE", code: "invalid_format", message: "STRIPE_MODE must be either 'test' or 'live'" });
    } else {
      normalized.STRIPE_MODE = stripeMode;
    }

    const stripeSecretKey = env.STRIPE_SECRET_KEY?.trim();
    if (!stripeSecretKey) {
      errors.push({ variable: "STRIPE_SECRET_KEY", code: "missing", message: "STRIPE_SECRET_KEY is missing" });
    } else if (isPlaceholder(stripeSecretKey)) {
      errors.push({ variable: "STRIPE_SECRET_KEY", code: "placeholder", message: "STRIPE_SECRET_KEY contains a placeholder" });
    } else if (hasControlChars(stripeSecretKey)) {
      errors.push({ variable: "STRIPE_SECRET_KEY", code: "invalid_format", message: "STRIPE_SECRET_KEY contains control characters" });
    } else if (stripeMode === "test" && !stripeSecretKey.startsWith("sk_test_")) {
      errors.push({ variable: "STRIPE_SECRET_KEY", code: "mismatch", message: "STRIPE_SECRET_KEY must start with sk_test_ when STRIPE_MODE is test" });
    } else if (stripeMode === "live" && !stripeSecretKey.startsWith("sk_live_")) {
      errors.push({ variable: "STRIPE_SECRET_KEY", code: "mismatch", message: "STRIPE_SECRET_KEY must start with sk_live_ when STRIPE_MODE is live" });
    } else {
      normalized.STRIPE_SECRET_KEY = stripeSecretKey;
    }

    const stripeWebhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!stripeWebhookSecret) {
      errors.push({ variable: "STRIPE_WEBHOOK_SECRET", code: "missing", message: "STRIPE_WEBHOOK_SECRET is missing" });
    } else if (isPlaceholder(stripeWebhookSecret)) {
      errors.push({ variable: "STRIPE_WEBHOOK_SECRET", code: "placeholder", message: "STRIPE_WEBHOOK_SECRET contains a placeholder" });
    } else if (!stripeWebhookSecret.startsWith("whsec_") || hasControlChars(stripeWebhookSecret)) {
      errors.push({ variable: "STRIPE_WEBHOOK_SECRET", code: "invalid_prefix", message: "STRIPE_WEBHOOK_SECRET must start with whsec_" });
    } else {
      normalized.STRIPE_WEBHOOK_SECRET = stripeWebhookSecret;
    }

    const priceVars = [
      "STRIPE_PRICE_MEMBER_CARD",
      "STRIPE_PRICE_MEMORY_CARD",
      "STRIPE_PRICE_MEMORIAL_KEYCHAIN",
      "STRIPE_PRICE_MEMORIAL_DOG_TAG",
      "STRIPE_PRICE_MEMORIAL_PLAQUE"
    ];

    for (const pv of priceVars) {
      const val = env[pv]?.trim();
      if (!val) {
        errors.push({ variable: pv, code: "missing", message: `${pv} is missing` });
      } else if (isPlaceholder(val) || !STRIPE_PRICE_REGEX.test(val)) {
        errors.push({ variable: pv, code: "invalid_format", message: `${pv} must match price_[A-Za-z0-9]+` });
      } else {
        normalized[pv] = val;
      }
    }
  }

  // --- 3. EMAIL PROFILE ---
  if (hasProfile("email")) {
    const resendKey = env.RESEND_API_KEY?.trim();
    if (!resendKey) {
      errors.push({ variable: "RESEND_API_KEY", code: "missing", message: "RESEND_API_KEY is missing" });
    } else if (isPlaceholder(resendKey)) {
      errors.push({ variable: "RESEND_API_KEY", code: "placeholder", message: "RESEND_API_KEY contains a placeholder" });
    } else if (hasControlChars(resendKey)) {
      errors.push({ variable: "RESEND_API_KEY", code: "invalid_format", message: "RESEND_API_KEY contains invalid control characters" });
    } else {
      normalized.RESEND_API_KEY = resendKey;
    }

    const fromEmail = env.TLA_FROM_EMAIL?.trim();
    if (!fromEmail) {
      errors.push({ variable: "TLA_FROM_EMAIL", code: "missing", message: "TLA_FROM_EMAIL is missing" });
    } else if (hasControlChars(fromEmail) || !EMAIL_REGEX.test(fromEmail)) {
      errors.push({ variable: "TLA_FROM_EMAIL", code: "invalid_email", message: "TLA_FROM_EMAIL must be a valid email address or Name <email@domain>" });
    } else {
      normalized.TLA_FROM_EMAIL = fromEmail;
    }

    const claimSecret = env.CLAIM_TOKEN_SECRET?.trim();
    if (!claimSecret) {
      errors.push({ variable: "CLAIM_TOKEN_SECRET", code: "missing", message: "CLAIM_TOKEN_SECRET is missing" });
    } else if (isPlaceholder(claimSecret)) {
      errors.push({ variable: "CLAIM_TOKEN_SECRET", code: "placeholder", message: "CLAIM_TOKEN_SECRET contains a placeholder" });
    } else if (hasControlChars(claimSecret) || claimSecret.length < 32) {
      errors.push({ variable: "CLAIM_TOKEN_SECRET", code: "too_short", message: "CLAIM_TOKEN_SECRET must be at least 32 characters long" });
    } else {
      normalized.CLAIM_TOKEN_SECRET = claimSecret;
    }
  }

  // --- 4. CRON PROFILE ---
  if (hasProfile("cron")) {
    const cronSecret = env.CRON_SECRET?.trim();
    if (!cronSecret) {
      errors.push({ variable: "CRON_SECRET", code: "missing", message: "CRON_SECRET is missing" });
    } else if (isPlaceholder(cronSecret)) {
      errors.push({ variable: "CRON_SECRET", code: "placeholder", message: "CRON_SECRET contains a placeholder" });
    } else if (hasControlChars(cronSecret) || cronSecret.length < 32) {
      errors.push({ variable: "CRON_SECRET", code: "too_short", message: "CRON_SECRET must be at least 32 characters long" });
    } else {
      normalized.CRON_SECRET = cronSecret;
    }
  }

  // --- 5. PUBLIC SUBMISSION SECURITY PROFILE ---
  if (hasProfile("public-submission-security")) {
    const rateLimitSecret = env.RATE_LIMIT_HASH_SECRET?.trim();
    if (!rateLimitSecret) {
      errors.push({ variable: "RATE_LIMIT_HASH_SECRET", code: "missing", message: "RATE_LIMIT_HASH_SECRET is missing" });
    } else if (isPlaceholder(rateLimitSecret)) {
      errors.push({ variable: "RATE_LIMIT_HASH_SECRET", code: "placeholder", message: "RATE_LIMIT_HASH_SECRET contains a placeholder" });
    } else if (hasControlChars(rateLimitSecret) || rateLimitSecret.length < 32) {
      errors.push({ variable: "RATE_LIMIT_HASH_SECRET", code: "too_short", message: "RATE_LIMIT_HASH_SECRET must be at least 32 characters long" });
    } else {
      normalized.RATE_LIMIT_HASH_SECRET = rateLimitSecret;
    }
  }

  // --- 6. KEEPSAKE SECURITY PROFILE ---
  if (hasProfile("keepsake-security")) {
    const sharePassSecret = env.SHARE_PASS_TOKEN_SECRET?.trim();
    if (!sharePassSecret) {
      errors.push({ variable: "SHARE_PASS_TOKEN_SECRET", code: "missing", message: "SHARE_PASS_TOKEN_SECRET is missing" });
    } else if (isPlaceholder(sharePassSecret)) {
      errors.push({ variable: "SHARE_PASS_TOKEN_SECRET", code: "placeholder", message: "SHARE_PASS_TOKEN_SECRET contains a placeholder" });
    } else if (hasControlChars(sharePassSecret) || sharePassSecret.length < 32) {
      errors.push({ variable: "SHARE_PASS_TOKEN_SECRET", code: "too_short", message: "SHARE_PASS_TOKEN_SECRET must be at least 32 characters long" });
    } else {
      normalized.SHARE_PASS_TOKEN_SECRET = sharePassSecret;
    }
  }

  return {
    ok: errors.length === 0,
    environment,
    profile,
    errors,
    normalized
  };
}
