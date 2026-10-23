import { getSafeInternalPath } from "./safe-path";

// Only the exact checkout endpoint is eligible for a post-login API redirect.
// Other destinations retain the existing allowlist.
export function getSafeKeepsakeLoginNext(
  value: string | null | undefined,
  fallback: string
): string {
  const checkout = getSafeInternalPath(value, "", ["/api/keepsakes/checkout"]);
  const pathname = checkout.split(/[?#]/)[0];
  if (pathname === "/api/keepsakes/checkout") {
    const params = new URLSearchParams(checkout.split("?")[1]?.split("#")[0] ?? "");
    const type = params.get("type");
    if (type && ["member-card", "card", "keychain", "dogtag", "plaque"].includes(type)) {
      return checkout;
    }
  }
  const keepsakes = getSafeInternalPath(value, "", ["/keepsakes"]);
  if (keepsakes.split(/[?#]/)[0] === "/keepsakes") return keepsakes;
  return getSafeInternalPath(value, fallback);
}
