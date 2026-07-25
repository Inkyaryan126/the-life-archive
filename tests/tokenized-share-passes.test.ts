import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  deriveSharePassPublicToken,
  hashSharePassToken,
  isValidSharePassToken
} from "../lib/share-pass-tokens";
import {
  ALLOWED_EXTERNAL_MEDIA_HOSTS,
  parseAndValidateExternalMediaUrl
} from "../lib/share-passes";

const secretEnv = { SHARE_PASS_TOKEN_SECRET: "test_secret_32_bytes_random_string_12345" };

{
  // 1. Token derivation determinism
  const passId = "11111111-2222-3333-4444-555555555555";
  const token1 = deriveSharePassPublicToken(passId, 1, secretEnv);
  const token2 = deriveSharePassPublicToken(passId, 1, secretEnv);
  assert.equal(token1, token2);
  assert.equal(isValidSharePassToken(token1), true);
  assert.ok(token1.startsWith("sp_"));
}

{
  // 2. Different token version creates different token
  const passId = "11111111-2222-3333-4444-555555555555";
  const v1Token = deriveSharePassPublicToken(passId, 1, secretEnv);
  const v2Token = deriveSharePassPublicToken(passId, 2, secretEnv);
  assert.notEqual(v1Token, v2Token);
}

{
  // 3. Different secret creates different token
  const passId = "11111111-2222-3333-4444-555555555555";
  const secretA = { SHARE_PASS_TOKEN_SECRET: "secret_A_32_bytes_random_string_12345" };
  const secretB = { SHARE_PASS_TOKEN_SECRET: "secret_B_32_bytes_random_string_12345" };

  const tokenA = deriveSharePassPublicToken(passId, 1, secretA);
  const tokenB = deriveSharePassPublicToken(passId, 1, secretB);
  assert.notEqual(tokenA, tokenB);
}

{
  // 4. Token format validation & malformed token rejection
  assert.equal(isValidSharePassToken("sp_validBase64UrlTokenStringWithMinimumLengthRequirement12345"), true);
  assert.equal(isValidSharePassToken("invalid_token"), false);
  assert.equal(isValidSharePassToken("sp_short"), false);
  assert.equal(isValidSharePassToken(""), false);
  assert.equal(isValidSharePassToken(null), false);
  assert.equal(isValidSharePassToken("<script>alert(1)</script>"), false);
}

{
  // 5. Missing SHARE_PASS_TOKEN_SECRET fails closed
  assert.throws(
    () => deriveSharePassPublicToken("11111111-2222-3333-4444-555555555555", 1, {}),
    /SHARE_PASS_TOKEN_SECRET is not configured/
  );
}

{
  // 6. Token hashing determinism & rotation invalidation
  const passId = "11111111-2222-3333-4444-555555555555";
  const tokenV1 = deriveSharePassPublicToken(passId, 1, secretEnv);
  const hashV1 = hashSharePassToken(tokenV1);

  const tokenV2 = deriveSharePassPublicToken(passId, 2, secretEnv);
  const hashV2 = hashSharePassToken(tokenV2);

  assert.notEqual(hashV1, hashV2);
  assert.equal(hashV1.length, 64); // SHA-256 hex string
}

{
  // 7. Migration SQL security, indexing, and RPC check
  const sql = readFileSync(
    "supabase/migrations/20260725190000_tokenized_keepsake_share_passes.sql",
    "utf8"
  );
  assert.match(sql, /token_hash TEXT/i);
  assert.match(sql, /token_version INT NOT NULL DEFAULT 1/i);
  assert.match(sql, /create unique index if not exists idx_share_passes_token_hash/i);
  assert.match(sql, /create or replace function public\.get_share_pass_memories_by_token_hash/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /revoke all on function public\.get_share_pass_memories_by_token_hash\(text\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.get_share_pass_memories_by_token_hash\(text\) to service_role/i);
}

{
  // 8. External media host allowlist & SSRF prevention
  assert.ok(ALLOWED_EXTERNAL_MEDIA_HOSTS.has("images.unsplash.com"));
  assert.ok(ALLOWED_EXTERNAL_MEDIA_HOSTS.has("youtube.com"));

  assert.equal(parseAndValidateExternalMediaUrl("https://images.unsplash.com/photo-12345"), "https://images.unsplash.com/photo-12345");
  assert.equal(parseAndValidateExternalMediaUrl("http://images.unsplash.com/photo-12345"), null); // HTTP rejected
  assert.equal(parseAndValidateExternalMediaUrl("https://evil-host.com/image.jpg"), null); // Disallowed host rejected
  assert.equal(parseAndValidateExternalMediaUrl("https://127.0.0.1/image.jpg"), null); // IP host rejected
}

{
  // 9. Middleware security headers & CSP check for /k/
  const middleware = readFileSync("middleware.ts", "utf8");
  assert.match(middleware, /\/k\//);
  assert.match(middleware, /Cache-Control/);
  assert.match(middleware, /private, no-store, max-age=0/);
  assert.match(middleware, /Referrer-Policy/);
  assert.match(middleware, /no-referrer/);
  assert.match(middleware, /X-Robots-Tag/);
  assert.match(middleware, /noindex, nofollow, noarchive, noimageindex/);
  assert.match(middleware, /Content-Security-Policy/);
  assert.match(middleware, /default-src 'self'/);
  assert.match(middleware, /object-src 'none'/);
  assert.match(middleware, /frame-ancestors 'none'/);
  assert.match(middleware, /form-action 'none'/);
}

console.log("tokenized-share-passes security verification tests passed cleanly!");
