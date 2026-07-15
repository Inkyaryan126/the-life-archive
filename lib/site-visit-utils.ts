export const VISITOR_ID_COOKIE_NAME = "tla_visitor_id";
export const LAST_VISIT_COOKIE_NAME = "tla_last_visit";

export const VISITOR_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export const LAST_VISIT_MAX_AGE_SECONDS = 60;
export const DUPLICATE_VISIT_WINDOW_MS = 30_000;

const PUBLIC_FILE_PATTERN =
  /\.(?:css|js|map|ico|svg|png|jpg|jpeg|gif|webp|avif|txt|xml|json|woff|woff2|ttf|otf)$/i;

const BOT_USER_AGENT_PATTERN =
  /\b(bot|crawler|spider|crawling|preview|facebookexternalhit|slurp|bingbot|googlebot|duckduckbot|yandex|baiduspider|semrush|ahrefs|pingdom|uptimerobot)\b/i;

export type DeviceType = "mobile" | "tablet" | "desktop";
export type VisitorStatus = "new" | "returning" | "unknown";

export function createVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 18)}`;
}

export function isValidVisitorId(
  value: string | null | undefined
): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9-]{16,80}$/.test(value);
}

export function getSafeHeaderValue(
  value: string | null | undefined,
  maxLength = 500
) {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();

  if (!cleaned) {
    return null;
  }

  return cleaned.slice(0, maxLength);
}

export function shouldRecordSiteVisit(input: {
  method: string;
  path: string;
  headers: Pick<Headers, "get">;
}) {
  if (input.method !== "GET") {
    return false;
  }

  if (
    input.path === "/favicon.ico" ||
    input.path === "/robots.txt" ||
    input.path === "/sitemap.xml" ||
    input.path === "/health" ||
    input.path.startsWith("/admin") ||
    input.path.startsWith("/api") ||
    input.path.startsWith("/_next") ||
    PUBLIC_FILE_PATTERN.test(input.path)
  ) {
    return false;
  }

  if (
    input.headers.get("purpose") === "prefetch" ||
    input.headers.get("next-router-prefetch") === "1" ||
    input.headers.get("x-middleware-prefetch") === "1"
  ) {
    return false;
  }

  const userAgent = input.headers.get("user-agent");

  if (userAgent && BOT_USER_AGENT_PATTERN.test(userAgent)) {
    return false;
  }

  return true;
}

export function createLastVisitSignature(path: string, now = new Date()) {
  return `${encodeURIComponent(path)}|${now.getTime()}`;
}

export function isDuplicateRecentVisit(input: {
  lastVisitCookie: string | null | undefined;
  path: string;
  now?: Date;
}) {
  if (!input.lastVisitCookie) {
    return false;
  }

  const [encodedPath, timestamp] = input.lastVisitCookie.split("|");
  let previousPath = "";

  try {
    previousPath = decodeURIComponent(encodedPath ?? "");
  } catch {
    return false;
  }
  const previousTimestamp = Number(timestamp);

  if (!previousPath || !Number.isFinite(previousTimestamp)) {
    return false;
  }

  return (
    previousPath === input.path &&
    (input.now ?? new Date()).getTime() - previousTimestamp <=
      DUPLICATE_VISIT_WINDOW_MS
  );
}

export function detectDeviceType(userAgent: string | null | undefined): DeviceType {
  const value = userAgent ?? "";

  if (/ipad|tablet|kindle|silk|playbook/i.test(value)) {
    return "tablet";
  }

  if (/android/i.test(value) && !/mobile/i.test(value)) {
    return "tablet";
  }

  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(value)) {
    return "mobile";
  }

  return "desktop";
}

export function detectBrowser(userAgent: string | null | undefined) {
  const value = getSafeHeaderValue(userAgent, 500) ?? "";

  if (!value) {
    return "Unknown";
  }

  if (/Edg\//.test(value)) {
    return "Edge";
  }

  if (/OPR\//.test(value) || /Opera\//.test(value)) {
    return "Opera";
  }

  if (/Firefox\//.test(value)) {
    return "Firefox";
  }

  if (/SamsungBrowser\//.test(value)) {
    return "Samsung Internet";
  }

  if (/Chrome\//.test(value) || /CriOS\//.test(value)) {
    return "Chrome";
  }

  if (/Safari\//.test(value)) {
    return "Safari";
  }

  return "Unknown";
}

export function formatReferrerSource(referrer: string | null | undefined) {
  const value = getSafeHeaderValue(referrer, 500);

  if (!value) {
    return "Direct";
  }

  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`.slice(
      0,
      160
    );
  } catch {
    return value.slice(0, 160) || "Direct";
  }
}

export function getVisitorStatus(input: {
  visitorId: string | null;
  createdAt: string;
  firstVisitByVisitorId: Map<string, string>;
}): VisitorStatus {
  if (!input.visitorId) {
    return "unknown";
  }

  const firstVisitAt = input.firstVisitByVisitorId.get(input.visitorId);

  if (!firstVisitAt) {
    return "unknown";
  }

  return new Date(firstVisitAt).getTime() < new Date(input.createdAt).getTime()
    ? "returning"
    : "new";
}

export function calculateVisitorWindowSummary(input: {
  visitorIdsInWindow: string[];
  earlierVisitorIds: Set<string>;
}) {
  const uniqueVisitorIds = new Set(input.visitorIdsInWindow);
  let returningVisitors = 0;

  for (const visitorId of uniqueVisitorIds) {
    if (input.earlierVisitorIds.has(visitorId)) {
      returningVisitors += 1;
    }
  }

  return {
    uniqueVisitors: uniqueVisitorIds.size,
    newVisitors: uniqueVisitorIds.size - returningVisitors,
    returningVisitors
  };
}
