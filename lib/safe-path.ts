const defaultAllowedPrefixes = [
  "/dashboard",
  "/archive",
  "/claim",
  "/create",
  "/forgot-password",
  "/invite",
  "/login",
  "/reset-password"
];

export function getSafeInternalPath(
  value: string | null | undefined,
  fallback: string,
  allowedPrefixes: string[] = defaultAllowedPrefixes
) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();

  if (
    !trimmedValue ||
    !trimmedValue.startsWith("/") ||
    trimmedValue.startsWith("//") ||
    trimmedValue.includes("\\") ||
    trimmedValue.includes("://") ||
    trimmedValue.includes("..")
  ) {
    return fallback;
  }

  const pathname = trimmedValue.split(/[?#]/)[0];
  const isAllowed = allowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  return isAllowed ? trimmedValue : fallback;
}
