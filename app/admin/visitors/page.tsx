import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { AdminVisitorStream } from "@/components/AdminVisitorStream";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAdminAccess } from "@/lib/admin";
import { countAdminAccounts } from "@/lib/admin-users";
import { listKeepsakeOrders } from "@/lib/keepsake-orders";
import { listLegacyActivationRequests } from "@/lib/legacy-activation";
import {
  type BotProbeVisit,
  getSiteVisitStats,
  type SiteVisitStats
} from "@/lib/site-visits";
import {
  buildGroupedVisitorProfiles,
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
    <div className="relative overflow-hidden rounded-2xl border border-archive-gold/18 bg-[#171511]/80 p-5 shadow-luxury transition hover:border-archive-gold/35">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-archive-gold/90">
          {label}
        </p>
        {badge ? (
          <span className="rounded-full border border-archive-gold/30 bg-archive-gold/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-archive-gold shadow-soft">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-serif text-4xl text-archive-ivory">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </p>
      {detail ? (
        <p className="mt-2 text-xs leading-5 text-archive-ivory/60">{detail}</p>
      ) : null}
    </div>
  );
}

function TopPages({ stats }: { stats: SiteVisitStats }) {
  return (
    <section className="rounded-3xl border border-archive-gold/18 bg-[#171511]/80 p-6 shadow-luxury">
      <h2 className="font-serif text-2xl text-archive-ivory">
        Top Visited Pages (Human Traffic)
      </h2>
      {stats.topPaths.length > 0 ? (
        <div className="mt-4 divide-y divide-archive-gold/10">
          {stats.topPaths.map((path) => (
            <div
              key={path.path}
              className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="break-all font-mono text-xs font-semibold text-archive-champagne">
                {path.path}
              </span>
              <span className="rounded-md border border-archive-gold/15 bg-black/40 px-2.5 py-1 font-mono text-xs text-archive-gold">
                {path.visitCount.toLocaleString("en-US")} views
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

function BotProbeSummary({ visits }: { visits: BotProbeVisit[] }) {
  return (
    <section className="rounded-3xl border border-archive-gold/18 bg-[#171511]/80 p-6 shadow-luxury">
      <h2 className="font-serif text-2xl text-archive-ivory">
        Automated Scans & Bot Traffic
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
        <section className="mt-16 rounded-3xl border border-archive-gold/20 bg-white/[0.035] p-8 shadow-luxury">
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

  let stats: SiteVisitStats = {
    totalPublicVisits: 0,
    visitsToday: 0,
    visitsLast7Days: 0,
    visitsLast30Days: 0,
    humanPageViewsToday: 0,
    humanPageViewsLast7Days: 0,
    humanPageViewsLast30Days: 0,
    uniqueVisitorsToday: 0,
    uniqueVisitorsLast7Days: 0,
    uniqueVisitorsLast30Days: 0,
    uniqueVisitorsSinceTrackingBegan: 0,
    newVisitorsLast30Days: 0,
    returningVisitorsLast30Days: 0,
    multiPageVisitorsLast30Days: 0,
    signedInVisitorsLast30Days: 0,
    botProbeRequestsLast30Days: 0,
    adminRequestsLast30Days: 0,
    visitorIdTrackingStartedAt: null,
    mostRecentVisit: null,
    recentVisits: [],
    recentBotProbeVisits: [],
    topPaths: []
  };
  let accountCount = 0;
  let newOrdersCount = 0;
  let pendingReviewsCount = 0;
  let loadError: string | null = null;

  try {
    const [statsData, accCount, ordersData, legacyRequestsData] = await Promise.all([
      getSiteVisitStats({
        currentAdminEmail: account.user.email,
        currentAdminName: account.user.displayName
      }),
      countAdminAccounts(),
      listKeepsakeOrders(),
      listLegacyActivationRequests()
    ]);
    stats = statsData;
    accountCount = accCount;
    newOrdersCount = ordersData.filter((o) => o.fulfillmentStatus === "New").length;
    pendingReviewsCount = legacyRequestsData.filter(
      (r) => r.status === "pending_memorial_review"
    ).length;
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load visitor statistics.";
  }

  const latestVisitDetail = stats.mostRecentVisit
    ? `${stats.mostRecentVisit.path} · ${formatVisitorAnalyticsDateTime(
        stats.mostRecentVisit.createdAt
      )}`
    : "No human activity yet";

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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-archive-gold">
                Executive Intelligence Console
              </p>
              <h1 className="mt-3 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
                Visitor Movements & Traffic
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-archive-ivory/70">
                Track visitor navigation paths across pages, measure page dwell durations, resolve locations, and recognize logged-in members. Normalized to {VISITOR_ANALYTICS_TIME_ZONE}.
              </p>
            </div>

            {/* Signed In Admin Recognized Pill */}
            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 shadow-luxury">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-200">
                ★ Active Administrator Session
              </p>
              <p className="mt-1 font-serif text-xl font-medium text-archive-ivory">
                {account.user.displayName || "Inky Aryan"}
              </p>
              <p className="text-xs text-archive-champagne/80">
                {account.user.email}
              </p>
            </div>
          </div>
        </header>

        {loadError ? (
          <p className="mb-6 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
            {loadError}
          </p>
        ) : null}

        {/* Primary Traffic Metrics Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Human page views today"
            value={stats.humanPageViewsToday}
            detail={`Unique visitors today: ${stats.uniqueVisitorsToday.toLocaleString("en-US")} (${VISITOR_ANALYTICS_TIME_ZONE})`}
            badge="Live Today"
          />
          <StatCard
            label="Multi-Page Journeys (30d)"
            value={stats.multiPageVisitorsLast30Days}
            detail="Visitors who explored 2+ pages in a session"
            badge="Explorers"
          />
          <StatCard
            label="Signed-in Member Sessions"
            value={stats.signedInVisitorsLast30Days}
            detail="Identified member sessions in last 30 days"
            badge="Members"
          />
          <StatCard
            label="Most Recent Visit"
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
            label="Human page views (30 Days)"
            value={stats.humanPageViewsLast30Days}
            detail={`${stats.uniqueVisitorsLast30Days.toLocaleString("en-US")} unique visitors`}
          />
          <StatCard
            label="Lifetime Unique Visitors"
            value={stats.uniqueVisitorsSinceTrackingBegan}
            detail="Tracked unique visitor cookies"
          />
          <StatCard
            label="Registered Accounts"
            value={accountCount}
            detail="Total authenticated member accounts"
          />
          <StatCard
            label="Bot/probe requests filtered"
            value={stats.botProbeRequestsLast30Days}
            detail={`${stats.adminRequestsLast30Days.toLocaleString("en-US")} admin visits also excluded`}
          />
        </section>

        {/* Interactive Visitor Stream & Movement Visualizer */}
        <div className="mt-10">
          <AdminVisitorStream
            profiles={buildGroupedVisitorProfiles({
              rows: stats.recentVisits.map((v) => ({
                id: v.id,
                path: v.path,
                referrer: v.referrerSource,
                user_agent: `${v.deviceType} ${v.browser}`,
                anonymous_visitor_id: v.visitorDisplayName.includes("Visitor") ? v.id : null,
                is_admin: v.isCurrentUser,
                visitor_city: v.location.split(",")[0] || null,
                visitor_region: v.location.split(",")[1] || null,
                visitor_country: v.location.split(",")[2] || null,
                user_email: v.userEmail,
                user_display_name: v.userDisplayName,
                created_at: v.createdAt
              })),
              currentAdminEmail: account.user.email,
              currentAdminName: account.user.displayName
            })}
            currentAdminEmail={account.user.email}
            currentAdminName={account.user.displayName}
          />
        </div>

        {/* Top Pages & Bot Probe Summary */}
        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          <TopPages stats={stats} />
          <BotProbeSummary visits={stats.recentBotProbeVisits} />
        </div>
      </div>
    </main>
  );
}
