import crypto from "node:crypto";

const KEEPSAKE_CODE_PATTERN = /^ks_[A-Za-z0-9_-]{24}$/;

/**
 * Generates a cryptographically secure, unguessable bearer keepsake code.
 * 18 random bytes -> unpadded base64url -> 24 characters -> prefixed with "ks_".
 * Provides 144 bits of CSPRNG entropy.
 */
export function generateSecureKeepsakeCode(): string {
  const randomBuf = crypto.randomBytes(18);
  const base64UrlToken = randomBuf.toString("base64url");
  return `ks_${base64UrlToken}`;
}

/**
 * Validates whether a string matches the required bearer keepsake code format.
 */
export function isValidKeepsakeCode(code: string | null | undefined): boolean {
  if (!code || typeof code !== "string") return false;
  return KEEPSAKE_CODE_PATTERN.test(code.trim());
}
