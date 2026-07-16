export const VISITOR_ID_COOKIE_NAME = "tla_visitor_id";
export const LAST_VISIT_COOKIE_NAME = "tla_last_visit";
export const VISITOR_ANALYTICS_TIME_ZONE = "America/New_York";

export const VISITOR_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export const LAST_VISIT_MAX_AGE_SECONDS = 60;
export const DUPLICATE_VISIT_WINDOW_MS = 30_000;

const PUBLIC_FILE_PATTERN =
  /\.(?:css|js|map|ico|svg|png|jpg|jpeg|gif|webp|avif|txt|xml|json|woff|woff2|ttf|otf)$/i;

const BOT_USER_AGENT_PATTERN =
  /\b(bot|crawler|spider|crawling|preview|facebookexternalhit|slurp|bingbot|googlebot|duckduckbot|yandex|baiduspider|semrush|ahrefs|pingdom|uptimerobot|zgrab|masscan|nmap|nikto|sqlmap|acunetix|nessus|openvas|wpscan|dirbuster|gobuster|python-requests|curl|wget)\b/i;

const PROBE_PATH_PATTERNS = [
  /^\/wp-admin(?:\/|$)/i,
  /^\/wp-login\.php$/i,
  /^\/xmlrpc\.php$/i,
  /^\/\.env(?:\.|\/|$)/i,
  /^\/\.git(?:\/|$)/i,
  /^\/phpmyadmin(?:\/|$)/i,
  /^\/pma(?:\/|$)/i,
  /^\/administrator(?:\/|$)/i,
  /^\/admin\.php$/i,
  /^\/wp(?:\/|$)/i,
  /^\/wordpress(?:\/|$)/i,
  /^\/wp-admin\/install\.php$/i,
  /^\/wp-admin\/setup-config\.php$/i,
  /^\/wp-content(?:\/|$)/i,
  /^\/wp-includes(?:\/|$)/i,
  /^\/setup-config\.php$/i,
  /^\/install\.php$/i
];

export type DeviceType = "mobile" | "tablet" | "desktop";
export type VisitorStatus = "new" | "returning" | "unknown";
export type VisitTrafficType = "human" | "admin" | "bot_probe" | "ignored";
export type VisitorLocation = {
  city: string | null;
  region: string | null;
  country: string | null;
};

export type ClassifiableVisit = {
  path: string;
  userAgent?: string | null;
  referrer?: string | null;
  isAdmin?: boolean;
};

const visitorDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: VISITOR_ANALYTICS_TIME_ZONE,
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short"
});

function getDecodedLocationValue(value: string | null | undefined, maxLength = 120) {
  const safeValue = getSafeHeaderValue(value, maxLength);

  if (!safeValue) {
    return null;
  }

  try {
    return decodeURIComponent(safeValue).slice(0, maxLength);
  } catch {
    return safeValue;
  }
}

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

  if (
    classifyVisitTraffic({
      path: input.path,
      userAgent: input.headers.get("user-agent"),
      referrer: input.headers.get("referer")
    }) !== "human"
  ) {
    return false;
  }

  return true;
}

export function isKnownBotUserAgent(userAgent: string | null | undefined) {
  const value = getSafeHeaderValue(userAgent, 500);

  return Boolean(value && BOT_USER_AGENT_PATTERN.test(value));
}

export function isProbePath(path: string | null | undefined) {
  if (!path) {
    return false;
  }

  const normalizedPath = path.split("?")[0]?.toLowerCase() ?? "";

  return PROBE_PATH_PATTERNS.some((pattern) => pattern.test(normalizedPath));
}

export function isIgnoredInternalPath(path: string | null | undefined) {
  if (!path) {
    return true;
  }

  return (
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path === "/health" ||
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    PUBLIC_FILE_PATTERN.test(path)
  );
}

export function classifyVisitTraffic(input: ClassifiableVisit): VisitTrafficType {
  if (input.isAdmin) {
    return "admin";
  }

  if (isIgnoredInternalPath(input.path)) {
    return "ignored";
  }

  if (isProbePath(input.path) || isKnownBotUserAgent(input.userAgent)) {
    return "bot_probe";
  }

  return "human";
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

export function formatVisitorAnalyticsDateTime(value: string | Date) {
  return visitorDateTimeFormatter.format(new Date(value));
}

export function formatVisitorAnalyticsRelativeTime(
  value: string | Date,
  now = new Date()
) {
  const differenceMs = now.getTime() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(differenceMs / 60_000));

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

export function getApproximateVisitorLocation(
  headers: Pick<Headers, "get">
): VisitorLocation {
  return {
    city: getDecodedLocationValue(headers.get("x-vercel-ip-city")),
    region: getDecodedLocationValue(headers.get("x-vercel-ip-country-region")),
    country: getDecodedLocationValue(
      headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry"),
      80
    )
  };
}

export function formatVisitorLocation(location: VisitorLocation) {
  const parts = [location.city, location.region, location.country].filter(
    (part): part is string => Boolean(part)
  );

  return parts.length > 0 ? parts.join(", ") : "Unknown location";
}

export function getVisitorDisplayName(visitorId: string | null | undefined) {
  if (!visitorId) {
    return "Visitor unknown";
  }

  const suffix = visitorId.replace(/[^a-zA-Z0-9]/g, "").slice(-6);

  return suffix ? `Visitor ${suffix.toUpperCase()}` : "Visitor unknown";
}
