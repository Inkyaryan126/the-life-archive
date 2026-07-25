import { createHmac, createHash } from "crypto";

const TOKEN_PREFIX = "sp_";
const DOMAIN_SEPARATOR = "tla-keepsake-share-pass";
const TOKEN_PATTERN = /^sp_[A-Za-z0-9_-]{40,100}$/;

function getSharePassTokenSecret(env: Record<string, string | undefined> = process.env): string {
  const secret = env.SHARE_PASS_TOKEN_SECRET?.trim();

  if (!secret) {
    throw new Error("SHARE_PASS_TOKEN_SECRET is not configured.");
  }

  return secret;
}

export function isValidSharePassToken(token: string | null | undefined): token is string {
  return typeof token === "string" && TOKEN_PATTERN.test(token);
}

export function deriveSharePassPublicToken(
  passId: string,
  tokenVersion: number,
  env: Record<string, string | undefined> = process.env
): string {
  const secret = getSharePassTokenSecret(env);
  const data = `${DOMAIN_SEPARATOR}:${passId}:${tokenVersion}`;
  const hmacBuffer = createHmac("sha256", secret).update(data).digest();
  const base64UrlToken = hmacBuffer.toString("base64url");

  return `${TOKEN_PREFIX}${base64UrlToken}`;
}

export function hashSharePassToken(publicToken: string): string {
  if (!isValidSharePassToken(publicToken)) {
    throw new Error("Invalid token format.");
  }

  return createHash("sha256").update(publicToken).digest("hex");
}
