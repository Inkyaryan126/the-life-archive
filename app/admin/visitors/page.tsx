import Link from "next/link";
import { redirect } from "next/navigation";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAdminAccess } from "@/lib/admin";
import {
  type BotProbeVisit,
  getSiteVisitStats,
  type RecentSiteVisit,
  type SiteVisitStats
} from "@/lib/site-visits";

export const dynamic = "force-dynamic";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatRelativeTime(value: string) {
  const differenceMs = Date.now() - new Date(value).getTime();
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

function StatCard({
  label,
  value,
  detail
}: {
  label: string;
  value: number | string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-archive-ivory/48">
        {label}
      </p>
      <p className="mt-3 font-serif text-4xl text-archive-gold">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </p>
      {detail ? (
        <p className="mt-2 text-xs leading-5 text-archive-ivory/56">{detail}</p>
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

  return (
    <span className="rounded-full border border-archive-gold/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-archive-champagne">
      {label}
    </span>
  );
}

function RecentVisitRow({ visit }: { visit: RecentSiteVisit }) {
  return (
    <article className="grid gap-3 border-t border-archive-gold/10 py-4 text-sm md:grid-cols-[10rem_minmax(0,1fr)_8rem_8rem_7rem] md:items-center">
      <div>
        <p className="font-semibold text-archive-ivory">
          {formatRelativeTime(visit.createdAt)}
        </p>
        <p className="mt-1 text-xs text-archive-ivory/48">
          {formatDateTime(visit.createdAt)}
        </p>
      </div>
      <div className="min-w-0">
        <p className="break-all font-semibold text-archive-champagne">
          {visit.path}
        </p>
        <p className="mt-1 break-all text-xs text-archive-ivory/52">
          {visit.referrerSource}
        </p>
      </div>
      <p className="capitalize text-archive-ivory/66">{visit.deviceType}</p>
      <p className="text-archive-ivory/66">{visit.browser}</p>
      <VisitorStatusBadge status={visit.visitorStatus} />
    </article>
  );
}

function TopPages({ stats }: { stats: SiteVisitStats }) {
  return (
    <section className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5">
      <h2 className="font-serif text-2xl text-archive-ivory">
        Most visited human pages
      </h2>
      {stats.topPaths.length > 0 ? (
        <div className="mt-4 divide-y divide-archive-gold/10">
          {stats.topPaths.map((path) => (
            <div
              key={path.path}
              className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="break-all font-semibold text-archive-champagne">
                {path.path}
              </span>
              <span className="text-archive-ivory/58">
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
    <section className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
            Recent visitor activity
          </p>
          <h2 className="mt-3 font-serif text-2xl text-archive-ivory">
            Newest human activity
          </h2>
        </div>
        <span className="inline-flex w-fit rounded-full border border-emerald-300/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">
          Refresh for latest
        </span>
      </div>

      {visits.length > 0 ? (
        <div className="mt-4">
          <div className="hidden border-t border-archive-gold/10 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-archive-ivory/42 md:grid md:grid-cols-[10rem_minmax(0,1fr)_8rem_8rem_7rem]">
            <span>Time</span>
            <span>Page and source</span>
            <span>Device</span>
            <span>Browser</span>
            <span>Visitor</span>
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
    <section className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5">
      <h2 className="font-serif text-2xl text-archive-ivory">
        Bot/probe traffic
      </h2>
      {visits.length > 0 ? (
        <div className="mt-4 divide-y divide-archive-gold/10">
          {visits.map((visit) => (
            <div key={visit.id} className="py-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-all font-semibold text-archive-champagne">
                  {visit.path}
                </span>
                <span className="text-xs text-archive-ivory/48">
                  {formatRelativeTime(visit.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-archive-ivory/52">
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

  const stats = await getSiteVisitStats();
  const latestDetail = stats.mostRecentVisit
    ? `Latest human visit ${formatRelativeTime(stats.mostRecentVisit.createdAt)}`
    : "No human activity yet";
  const trackingStart = stats.visitorIdTrackingStartedAt
    ? formatDateTime(stats.visitorIdTrackingStartedAt)
    : "Not started yet";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl">
        <nav className="flex flex-col gap-4 border-b border-archive-gold/18 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-archive-champagne">
            <Link href="/admin" className="underline-offset-4 hover:underline">
              Admin
            </Link>
            <Link href="/dashboard" className="underline-offset-4 hover:underline">
              Dashboard
            </Link>
            <Link href="/admin/users" className="underline-offset-4 hover:underline">
              Users & Archives
            </Link>
            <Link
              href="/admin/visitors"
              className="inline-flex items-center gap-2 text-archive-gold underline-offset-4 hover:underline"
            >
              Visitors
              <span className="rounded-full border border-archive-gold/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-archive-ivory/60">
                {stats.humanPageViewsToday.toLocaleString("en-US")} today
              </span>
            </Link>
          </div>
        </nav>

        <header className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            Visitor Activity
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
            Visitors
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-archive-ivory/68">
            Human page views are separated from unique visitor estimates,
            bot/probe requests, and admin traffic.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Human page views today"
            value={stats.humanPageViewsToday}
          />
          <StatCard
            label="Human page views last 7 days"
            value={stats.humanPageViewsLast7Days}
          />
          <StatCard
            label="Human page views last 30 days"
            value={stats.humanPageViewsLast30Days}
          />
          <StatCard
            label="Most recent human visit"
            value={
              stats.mostRecentVisit
                ? formatRelativeTime(stats.mostRecentVisit.createdAt)
                : "None"
            }
            detail={stats.mostRecentVisit?.path ?? latestDetail}
          />
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Unique visitors since IDs began"
            value={stats.uniqueVisitorsSinceTrackingBegan}
            detail={`Effective start: ${trackingStart}`}
          />
          <StatCard
            label="New visitors last 30 days"
            value={stats.newVisitorsLast30Days}
            detail="First observed during the last 30 days."
          />
          <StatCard
            label="Returning visitors last 30 days"
            value={stats.returningVisitorsLast30Days}
            detail="Had an earlier human visit before this 30-day window."
          />
          <StatCard
            label="Bot/probe requests last 30 days"
            value={stats.botProbeRequestsLast30Days}
            detail={`${stats.adminRequestsLast30Days.toLocaleString(
              "en-US"
            )} admin requests also excluded.`}
          />
        </section>

        <section className="mt-6 rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 text-sm leading-7 text-archive-ivory/64">
          <p>
            Historical rows before anonymous visitor IDs cannot be counted as
            unique visitors. Unique visitor estimates only include human rows
            with `anonymous_visitor_id`. Bot/probe traffic and configured admin
            traffic are excluded from human totals.
          </p>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="grid gap-6">
            <TopPages stats={stats} />
            <BotProbeSummary visits={stats.recentBotProbeVisits} />
          </div>
          <RecentVisitorFeed visits={stats.recentVisits} />
        </div>
      </div>
    </main>
  );
}
