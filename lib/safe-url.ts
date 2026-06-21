const PROFILE_PHOTO_HOSTS = new Set(["images.unsplash.com"]);
const MEMORY_MEDIA_HOSTS = new Set([
  "images.unsplash.com",
  "open.spotify.com"
]);

export type UrlValidationResult =
  | { ok: true; value: string }
  | { ok: false; message: string };

function validateAllowedHttpsUrl(
  value: string,
  allowedHosts: Set<string>,
  fieldName: string
): UrlValidationResult {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { ok: true, value: "" };
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(trimmedValue);
  } catch {
    return { ok: false, message: `${fieldName} must be a valid HTTPS URL.` };
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
      message: `${fieldName} must use an approved secure media host.`
    };
  }

  return { ok: true, value: parsedUrl.toString() };
}

export function validateProfilePhotoUrl(value: string) {
  return validateAllowedHttpsUrl(
    value,
    PROFILE_PHOTO_HOSTS,
    "Profile photo URL"
  );
}

export function validateMemoryMediaUrl(value: string) {
  return validateAllowedHttpsUrl(
    value,
    MEMORY_MEDIA_HOSTS,
    "Media URL"
  );
}
