const PROFILE_PHOTO_HOSTS = new Set(["images.unsplash.com"]);
const PROFILE_PHOTO_PATHS = new Set([
  "/images/dustin-sigley.png",
  "/images/dustin-sigley.jpg",
  "/images/sari-rae.png"
]);
const MEMORY_MEDIA_HOSTS = new Set([
  "images.unsplash.com",
  "open.spotify.com"
]);
const MEMORY_MEDIA_PATHS = new Set(["/images/sari-rae.png"]);

export type UrlValidationResult =
  | { ok: true; value: string }
  | { ok: false; message: string };

function validateAllowedHttpsUrl(
  value: string,
  allowedHosts: Set<string>,
  fieldName: string,
  unsupportedMessage: string
): UrlValidationResult {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { ok: true, value: "" };
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(trimmedValue);
  } catch {
    return {
      ok: false,
      message: `That ${fieldName.toLowerCase()} doesn't look complete. Check it and try again.`
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.username ||
    parsedUrl.password ||
    (parsedUrl.port && parsedUrl.port !== "443") ||
    !allowedHosts.has(hostname)
  ) {
    return {
      ok: false,
      message: unsupportedMessage
    };
  }

  return { ok: true, value: parsedUrl.toString() };
}

export function validateProfilePhotoUrl(value: string) {
  const trimmedValue = value.trim();

  if (PROFILE_PHOTO_PATHS.has(trimmedValue)) {
    return { ok: true as const, value: trimmedValue };
  }

  return validateAllowedHttpsUrl(
    trimmedValue,
    PROFILE_PHOTO_HOSTS,
    "profile photo link",
    "Please use an Unsplash image link for the profile photo."
  );
}

export function validateMemoryMediaUrl(value: string) {
  const trimmedValue = value.trim();

  if (MEMORY_MEDIA_PATHS.has(trimmedValue)) {
    return { ok: true as const, value: trimmedValue };
  }

  return validateAllowedHttpsUrl(
    trimmedValue,
    MEMORY_MEDIA_HOSTS,
    "media link",
    "Please use an Unsplash image link or Spotify song link."
  );
}
