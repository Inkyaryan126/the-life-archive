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

export type RecentSiteVisit = {
  id: string;
  path: string;
  referrerSource: string;
  deviceType: DeviceType;
  browser: string;
  createdAt: string;
  visitorStatus: VisitorStatus;
  visitorDisplayName: string;
  location: string;
  totalPageViews: number;
  firstSeenAt: string | null;
  recentPages: Array<{
    id: string;
    path: string;
    createdAt: string;
  }>;
};

export type BotProbeVisit = {
  id: string;
  path: string;
  browser: string;
  createdAt: string;
};

export type SiteVisitStats = {
  totalPublicVisits: number;
  visitsToday: number;
  visitsLast7Days: number;
  visitsLast30Days: number;
  humanPageViewsToday: number;
  humanPageViewsLast7Days: number;
  humanPageViewsLast30Days: number;
  uniqueVisitorsToday: number;
  uniqueVisitorsLast7Days: number;
  uniqueVisitorsLast30Days: number;
  uniqueVisitorsSinceTrackingBegan: number;
  newVisitorsLast30Days: number;
  returningVisitorsLast30Days: number;
  botProbeRequestsLast30Days: number;
  adminRequestsLast30Days: number;
  visitorIdTrackingStartedAt: string | null;
  mostRecentVisit: RecentSiteVisit | null;
  recentVisits: RecentSiteVisit[];
  recentBotProbeVisits: BotProbeVisit[];
  topPaths: Array<{
    path: string;
    visitCount: number;
  }>;
};

export type SiteVisitRow = {
  id: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  anonymous_visitor_id: string | null;
  is_admin: boolean;
  visitor_city: string | null;
  visitor_region: string | null;
  visitor_country: string | null;
  created_at: string;
};

type VisitorSummary = {
  displayName: string;
  location: string;
  totalPageViews: number;
  firstSeenAt: string | null;
  recentPages: Array<{
    id: string;
    path: string;
    createdAt: string;
  }>;
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

export function getStartOfTodayInTimeZone(
  timeZone = VISITOR_ANALYTICS_TIME_ZONE,
  now = new Date()
): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (!year || !month || !day) {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return today;
  }

  const midnightUtc = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0)
  );

  const tzParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(midnightUtc);

  const tzYear = Number(tzParts.find((p) => p.type === "year")?.value);
  const tzMonth = Number(tzParts.find((p) => p.type === "month")?.value);
  const tzDay = Number(tzParts.find((p) => p.type === "day")?.value);
  let tzHour = Number(tzParts.find((p) => p.type === "hour")?.value);
  if (tzHour === 24) tzHour = 0;
  const tzMin = Number(tzParts.find((p) => p.type === "minute")?.value);
  const tzSec = Number(tzParts.find((p) => p.type === "second")?.value);

  const tzAsUtc = new Date(
    Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, tzSec)
  );
  const offsetMs = tzAsUtc.getTime() - midnightUtc.getTime();

  return new Date(midnightUtc.getTime() - offsetMs);
}

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

function getRowLocation(row: SiteVisitRow): VisitorLocation {
  return {
    city: row.visitor_city,
    region: row.visitor_region,
    country: row.visitor_country
  };
}

function classifyRow(row: SiteVisitRow): VisitTrafficType {
  return classifyVisitTraffic({
    path: row.path,
    userAgent: row.user_agent,
    referrer: row.referrer,
    isAdmin: row.is_admin
  });
}

function isAtOrAfter(value: string, boundary: Date) {
  return new Date(value).getTime() >= boundary.getTime();
}

function getFirstVisitByVisitorId(rows: SiteVisitRow[]) {
  const firstVisitByVisitorId = new Map<string, string>();

  for (const row of [...rows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )) {
    if (row.anonymous_visitor_id && !firstVisitByVisitorId.has(row.anonymous_visitor_id)) {
      firstVisitByVisitorId.set(row.anonymous_visitor_id, row.created_at);
    }
  }

  return firstVisitByVisitorId;
}

function getVisitorIdTrackingStartedAt(rows: SiteVisitRow[]) {
  return (
    [...rows]
      .filter((row) => row.anonymous_visitor_id)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )[0]?.created_at ?? null
  );
}

function getVisitorSummaryById(rows: SiteVisitRow[]) {
  const rowsByVisitorId = new Map<string, SiteVisitRow[]>();

  for (const row of rows) {
    if (!row.anonymous_visitor_id) {
      continue;
    }

    rowsByVisitorId.set(row.anonymous_visitor_id, [
      ...(rowsByVisitorId.get(row.anonymous_visitor_id) ?? []),
      row
    ]);
  }

  return new Map(
    Array.from(rowsByVisitorId.entries()).map(([visitorId, visitorRows]) => {
      const sortedRows = [...visitorRows].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latestRow = sortedRows[0];
      const oldestRow = sortedRows[sortedRows.length - 1];
      const summary: VisitorSummary = {
        displayName: getVisitorDisplayName(visitorId),
        location: latestRow
          ? formatVisitorLocation(getRowLocation(latestRow))
          : "Unknown location",
        firstSeenAt: oldestRow?.created_at ?? latestRow?.created_at ?? null,
        totalPageViews: visitorRows.length,
        recentPages: sortedRows.slice(0, 4).map((row) => ({
          id: row.id,
          path: row.path,
          createdAt: row.created_at
        }))
      };

      return [visitorId, summary];
    })
  );
}

function toRecentVisit(
  row: SiteVisitRow,
  firstVisitByVisitorId: Map<string, string>,
  visitorSummaryById: Map<string, VisitorSummary>
): RecentSiteVisit {
  const visitorSummary = row.anonymous_visitor_id
    ? visitorSummaryById.get(row.anonymous_visitor_id)
    : null;

  return {
    id: row.id,
    path: row.path,
    referrerSource: formatReferrerSource(row.referrer),
    deviceType: detectDeviceType(row.user_agent),
    browser: detectBrowser(row.user_agent),
    createdAt: row.created_at,
    visitorStatus: getVisitorStatus({
      visitorId: row.anonymous_visitor_id,
      createdAt: row.created_at,
      firstVisitByVisitorId
    }),
    visitorDisplayName:
      visitorSummary?.displayName ??
      getVisitorDisplayName(row.anonymous_visitor_id),
    location: visitorSummary?.location ?? formatVisitorLocation(getRowLocation(row)),
    totalPageViews: visitorSummary?.totalPageViews ?? 1,
    firstSeenAt: visitorSummary?.firstSeenAt ?? row.created_at,
    recentPages:
      visitorSummary?.recentPages ?? [
        {
          id: row.id,
          path: row.path,
          createdAt: row.created_at
        }
      ]
  };
}

function toBotProbeVisit(row: SiteVisitRow): BotProbeVisit {
  return {
    id: row.id,
    path: row.path,
    browser: detectBrowser(row.user_agent),
    createdAt: row.created_at
  };
}

function getTopHumanPaths(rows: SiteVisitRow[]) {
  const pathCounts = new Map<string, number>();

  for (const row of rows) {
    pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);
  }

  return Array.from(pathCounts.entries())
    .map(([path, visitCount]) => ({ path, visitCount }))
    .sort((a, b) => b.visitCount - a.visitCount || a.path.localeCompare(b.path))
    .slice(0, 5);
}

function getVisitorWindowSummary(
  firstVisitByVisitorId: Map<string, string>,
  recentHumanRows: SiteVisitRow[],
  windowStart: Date
) {
  const visitorIdsInWindow = Array.from(
    new Set(
      recentHumanRows
        .map((row) => row.anonymous_visitor_id)
        .filter((visitorId): visitorId is string => Boolean(visitorId))
    )
  );
  const earlierVisitorIds = new Set<string>();

  for (const visitorId of visitorIdsInWindow) {
    const firstSeenAt = firstVisitByVisitorId.get(visitorId);

    if (firstSeenAt && !isAtOrAfter(firstSeenAt, windowStart)) {
      earlierVisitorIds.add(visitorId);
    }
  }

  return calculateVisitorWindowSummary({
    visitorIdsInWindow,
    earlierVisitorIds
  });
}

export function summarizeSiteVisitRows(input: {
  allRows: SiteVisitRow[];
  recentRows: SiteVisitRow[];
  now?: Date;
}): SiteVisitStats {
  const now = input.now ?? new Date();
  const today = getStartOfTodayInTimeZone(VISITOR_ANALYTICS_TIME_ZONE, now);
  const last7Days = new Date(now);
  last7Days.setDate(last7Days.getDate() - 7);
  const last30Days = new Date(now);
  last30Days.setDate(last30Days.getDate() - 30);

  const allHumanRows = input.allRows.filter((row) => classifyRow(row) === "human");
  const recentHumanRows = input.recentRows.filter(
    (row) => classifyRow(row) === "human"
  );
  const recentBotProbeRows = input.recentRows.filter(
    (row) => classifyRow(row) === "bot_probe"
  );
  const recentAdminRows = input.recentRows.filter(
    (row) => classifyRow(row) === "admin"
  );
  const humanRowsLast7Days = recentHumanRows.filter((row) =>
    isAtOrAfter(row.created_at, last7Days)
  );
  const humanRowsToday = recentHumanRows.filter((row) =>
    isAtOrAfter(row.created_at, today)
  );
  const firstVisitByVisitorId = getFirstVisitByVisitorId(allHumanRows);
  const visitorIdTrackingStartedAt = getVisitorIdTrackingStartedAt(allHumanRows);
  const visitorSummaryById = getVisitorSummaryById(allHumanRows);
  const visitorWindowSummary = getVisitorWindowSummary(
    firstVisitByVisitorId,
    recentHumanRows,
    last30Days
  );

  const uniqueVisitorsToday = new Set(
    humanRowsToday
      .map((row) => row.anonymous_visitor_id)
      .filter((id): id is string => Boolean(id))
  ).size;

  const uniqueVisitorsLast7Days = new Set(
    humanRowsLast7Days
      .map((row) => row.anonymous_visitor_id)
      .filter((id): id is string => Boolean(id))
  ).size;

  const uniqueVisitorsLast30Days = new Set(
    recentHumanRows
      .map((row) => row.anonymous_visitor_id)
      .filter((id): id is string => Boolean(id))
  ).size;

  return {
    totalPublicVisits: allHumanRows.length,
    visitsToday: uniqueVisitorsToday,
    visitsLast7Days: uniqueVisitorsLast7Days,
    visitsLast30Days: uniqueVisitorsLast30Days,
    humanPageViewsToday: humanRowsToday.length,
    humanPageViewsLast7Days: humanRowsLast7Days.length,
    humanPageViewsLast30Days: recentHumanRows.length,
    uniqueVisitorsToday,
    uniqueVisitorsLast7Days,
    uniqueVisitorsLast30Days,
    uniqueVisitorsSinceTrackingBegan: firstVisitByVisitorId.size,
    newVisitorsLast30Days: visitorWindowSummary.newVisitors,
    returningVisitorsLast30Days: visitorWindowSummary.returningVisitors,
    botProbeRequestsLast30Days: recentBotProbeRows.length,
    adminRequestsLast30Days: recentAdminRows.length,
    visitorIdTrackingStartedAt,
    mostRecentVisit: recentHumanRows[0]
      ? toRecentVisit(recentHumanRows[0], firstVisitByVisitorId, visitorSummaryById)
      : null,
    recentVisits: recentHumanRows
      .slice(0, 25)
      .map((row) =>
        toRecentVisit(row, firstVisitByVisitorId, visitorSummaryById)
      ),
    recentBotProbeVisits: recentBotProbeRows.slice(0, 8).map(toBotProbeVisit),
    topPaths: getTopHumanPaths(recentHumanRows)
  };
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
