import assert from "node:assert/strict";
import { getSafeKeepsakeLoginNext } from "../lib/keepsake-login-next";

const fallback = "/dashboard?welcome=back";
assert.equal(getSafeKeepsakeLoginNext("/dashboard", fallback), "/dashboard");
assert.equal(getSafeKeepsakeLoginNext("/keepsakes?archive=family", fallback), "/keepsakes?archive=family");
assert.equal(
  getSafeKeepsakeLoginNext("/api/keepsakes/checkout?type=keychain&archive=family", fallback),
  "/api/keepsakes/checkout?type=keychain&archive=family"
);
assert.equal(getSafeKeepsakeLoginNext("/api/keepsakes/checkout?type=bogus", fallback), fallback);
assert.equal(getSafeKeepsakeLoginNext("/api/keepsakes/checkout", fallback), fallback);
assert.equal(getSafeKeepsakeLoginNext("/api/keepsakes/checkout/other?type=card", fallback), fallback);
assert.equal(getSafeKeepsakeLoginNext("//evil.example/path", fallback), fallback);
assert.equal(getSafeKeepsakeLoginNext("/api/keepsakes/checkout?type=card\\evil", fallback), fallback);
assert.equal(getSafeKeepsakeLoginNext("https://evil.example", fallback), fallback);
console.log("Keepsake login continuation safety: PASS");
