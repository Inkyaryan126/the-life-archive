import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAdminAccess } from "@/lib/admin";
import { countAdminAccounts } from "@/lib/admin-users";
import { listKeepsakeOrders } from "@/lib/keepsake-orders";
import { listLegacyActivationRequests } from "@/lib/legacy-activation";
import {
  type BotProbeVisit,
  getSiteVisitStats,
  type RecentSiteVisit,
  type SiteVisitStats
} from "@/lib/site-visits";
import {
  formatVisitorAnalyticsDateTime,
  formatVisitorAnalyticsRelativeTime,
  VISITOR_ANALYTICS_TIME_ZONE
} from "@/lib/site-visit-utils";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  detail,
  badge
}: {
  label: string;
  value: number | string;
  detail?: string;
  badge?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 shadow-luxury transition hover:border-archive-gold/25">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-archive-ivory/50">
          {label}
        </p>
        {badge ? (
          <span className="rounded-full border border-archive-gold/25 bg-archive-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-archive-gold">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-serif text-4xl text-archive-gold">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </p>
      {detail ? (
        <p className="mt-2 text-xs leading-5 text-archive-ivory/55">{detail}</p>
      ) : null}
    </div>
  );
}

function VisitorStatusBadge({ status }: { status: RecentSiteVisit["visitorStatus"] }) {
  const label =
    status === "returning"
      ? "Returning"
      : status === "new"
        ? "New"
        : "Unknown";

  const colorClass =
    status === "returning"
      ? "border-sky-300/35 text-sky-200 bg-sky-500/10"
      : status === "new"
        ? "border-emerald-300/35 text-emerald-200 bg-emerald-500/10"
        : "border-archive-gold/25 text-archive-champagne bg-archive-gold/10";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${colorClass}`}
    >
      {label}
    </span>
  );
}

function RecentVisitRow({ visit }: { visit: RecentSiteVisit }) {
  return (
    <article className="grid gap-3 border-t border-archive-gold/10 py-4 text-sm lg:grid-cols-[10rem_minmax(0,1.4fr)_minmax(12rem,0.9fr)_8rem_8rem_7rem] lg:items-center">
      <div>
        <p className="font-semibold text-archive-ivory">
          {formatVisitorAnalyticsRelativeTime(visit.createdAt)}
        </p>
        <p className="mt-1 text-xs text-archive-ivory/48">
          {formatVisitorAnalyticsDateTime(visit.createdAt)}
        </p>
      </div>
      <div className="min-w-0">
        <p className="break-all font-mono text-xs font-semibold text-archive-champagne">
          {visit.path}
        </p>
        <p className="mt-1 break-all text-xs text-archive-ivory/52">
          {visit.referrerSource}
        </p>
      </div>
      <div className="min-w-0 text-xs leading-5 text-archive-ivory/58">
        <p className="font-semibold text-archive-ivory/76">
          {visit.visitorDisplayName}
        </p>
        <p>{visit.location}</p>
        <p>
          {visit.totalPageViews.toLocaleString("en-US")} page views
          {visit.firstSeenAt
            ? ` · first seen ${formatVisitorAnalyticsRelativeTime(
                visit.firstSeenAt
              )}`
            : ""}
        </p>
        {visit.recentPages.length > 1 ? (
          <p className="mt-1 truncate font-mono text-[11px] text-archive-ivory/42">
            Prev path: {visit.recentPages[1].path}
          </p>
        ) : null}
      </div>
      <p className="capitalize text-archive-ivory/66">{visit.deviceType}</p>
      <p className="text-archive-ivory/66">{visit.browser}</p>
      <VisitorStatusBadge status={visit.visitorStatus} />
    </article>
  );
}

function TopPages({ stats }: { stats: SiteVisitStats }) {
  return (
    <section className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 shadow-luxury">
      <h2 className="font-serif text-2xl text-archive-ivory">
        Most Visited Human Pages
      </h2>
      {stats.topPaths.length > 0 ? (
        <div className="mt-4 divide-y divide-archive-gold/10">
          {stats.topPaths.map((path) => (
            <div
              key={path.path}
              className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="break-all font-mono text-xs text-archive-champagne">
                {path.path}
              </span>
              <span className="text-xs text-archive-ivory/58">
                {path.visitCount.toLocaleString("en-US")} visits
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-archive-ivory/64">
          No human page views have been recorded in the last 30 days.
        </p>
      )}
    </section>
  );
}

function RecentVisitorFeed({ visits }: { visits: RecentSiteVisit[] }) {
  return (
    <section className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 shadow-luxury">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
            Recent visitor activity
          </p>
          <h2 className="mt-2 font-serif text-2xl text-archive-ivory">
            Newest human activity
          </h2>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Stream
        </span>
      </div>

      {visits.length > 0 ? (
        <div className="mt-4">
          <div className="hidden border-t border-archive-gold/10 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-archive-ivory/42 lg:grid lg:grid-cols-[10rem_minmax(0,1.4fr)_minmax(12rem,0.9fr)_8rem_8rem_7rem]">
            <span>Timestamp</span>
            <span>Page & Referrer</span>
            <span>Visitor context</span>
            <span>Device</span>
            <span>Browser</span>
            <span>Visitor Status</span>
          </div>
          {visits.map((visit) => (
            <RecentVisitRow key={visit.id} visit={visit} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-archive-ivory/64">
          No recent human page views have been recorded yet.
        </p>
      )}
    </section>
  );
}

function BotProbeSummary({ visits }: { visits: BotProbeVisit[] }) {
  return (
    <section className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 shadow-luxury">
      <h2 className="font-serif text-2xl text-archive-ivory">
        Bot & Automated Probe Traffic
      </h2>
      {visits.length > 0 ? (
        <div className="mt-4 divide-y divide-archive-gold/10">
          {visits.map((visit) => (
            <div key={visit.id} className="py-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-all font-mono text-xs text-amber-200/90">
                  {visit.path}
                </span>
                <span className="text-xs text-archive-ivory/48">
                  {formatVisitorAnalyticsRelativeTime(visit.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-archive-ivory/52">
                {formatVisitorAnalyticsDateTime(visit.createdAt)} ·{" "}
                {visit.browser}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-archive-ivory/64">
          No bot or probe requests were classified in the last 30 days.
        </p>
      )}
    </section>
  );
}

function AccessUnavailable() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-3xl">
        <Link href="/">
          <SiteLogo width={160} height={40} />
        </Link>
        <section className="mt-16 rounded-2xl border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
            Admin
          </p>
          <h1 className="mt-4 font-serif text-4xl text-archive-ivory">
            Access not available.
          </h1>
          <p className="mt-4 text-sm leading-7 text-archive-ivory/68">
            This page is limited to emails listed in ADMIN_EMAILS.
          </p>
        </section>
      </div>
    </main>
  );
}

export default async function AdminVisitorsPage() {
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();

  if (!account.user) {
    redirect("/login?next=%2Fadmin%2Fvisitors");
  }

  if (!adminEmailsConfigured || !isAdmin) {
    return <AccessUnavailable />;
  }

  const [stats, accountCount, orders, legacyRequests] = await Promise.all([
    getSiteVisitStats(),
    countAdminAccounts(),
    listKeepsakeOrders(),
    listLegacyActivationRequests()
  ]);

  const newOrdersCount = orders.filter((o) => o.fulfillmentStatus === "New").length;
  const pendingReviewsCount = legacyRequests.filter(
    (r) => r.status === "pending_memorial_review"
  ).length;

  const latestVisitDetail = stats.mostRecentVisit
    ? `${stats.mostRecentVisit.path} · ${formatVisitorAnalyticsDateTime(
        stats.mostRecentVisit.createdAt
      )}`
    : "No human activity yet";
  const trackingStart = stats.visitorIdTrackingStartedAt
    ? formatVisitorAnalyticsDateTime(stats.visitorIdTrackingStartedAt)
    : "Not started yet";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl">
        <AdminNav
          currentPath="/admin/visitors"
          todayVisitsCount={stats.uniqueVisitorsToday}
          newOrdersCount={newOrdersCount}
          pendingReviewsCount={pendingReviewsCount}
        />

        <header className="py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            Analytics Intelligence
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
            Visitors & Site Traffic
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-archive-ivory/68">
            Detailed breakdown of unique human visitors vs page views, timezone-aligned to {VISITOR_ANALYTICS_TIME_ZONE}. Bot/probe scans and admin activity are filtered automatically.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Human page views today"
            value={stats.humanPageViewsToday}
            detail={`Unique visitors today: ${stats.uniqueVisitorsToday.toLocaleString("en-US")} (${VISITOR_ANALYTICS_TIME_ZONE})`}
            badge="Today"
          />
          <StatCard
            label="Human page views last 7 days"
            value={stats.humanPageViewsLast7Days}
            detail={`${stats.uniqueVisitorsLast7Days.toLocaleString("en-US")} unique visitors in last 7 days`}
          />
          <StatCard
            label="Human page views last 30 days"
            value={stats.humanPageViewsLast30Days}
            detail={`${stats.uniqueVisitorsLast30Days.toLocaleString("en-US")} unique visitors in last 30 days`}
          />
          <StatCard
            label="Most recent human visit"
            value={
              stats.mostRecentVisit
                ? formatVisitorAnalyticsRelativeTime(
                    stats.mostRecentVisit.createdAt
                  )
                : "None"
            }
            detail={latestVisitDetail}
          />
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Unique visitors since IDs began"
            value={stats.uniqueVisitorsSinceTrackingBegan}
            detail={`Effective start: ${trackingStart}`}
          />
          <StatCard
            label="New visitors last 30 days"
            value={stats.newVisitorsLast30Days}
            detail="First observed within the last 30 days"
          />
          <StatCard
            label="Accounts created"
            value={accountCount}
            detail="Total authenticated member accounts"
          />
          <StatCard
            label="Bot/probe requests last 30 days"
            value={stats.botProbeRequestsLast30Days}
            detail={`${stats.adminRequestsLast30Days.toLocaleString("en-US")} admin requests also excluded.`}
          />
        </section>

        <section className="mt-6 rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 text-xs leading-6 text-archive-ivory/60">
          <p>
            Historical rows before anonymous visitor IDs cannot be counted as
            unique visitors. Unique visitor estimates only include human rows
            with `anonymous_visitor_id`. Bot/probe traffic and configured admin
            traffic are excluded from human totals.
          </p>
        </section>

        <div className="mt-8">
          <RecentVisitorFeed visits={stats.recentVisits} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <TopPages stats={stats} />
          <BotProbeSummary visits={stats.recentBotProbeVisits} />
        </div>
      </div>
    </main>
  );
}
