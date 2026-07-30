import Link from "next/link";
import { redirect } from "next/navigation";
import {
  markLegacyActivationMemorializedAction,
  updateOrderAction
} from "@/app/admin/actions";
import { AdminNav } from "@/components/AdminNav";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAdminAccess } from "@/lib/admin";
import {
  fulfillmentStatuses,
  listKeepsakeOrders,
  type KeepsakeOrder
} from "@/lib/keepsake-orders";
import {
  listLegacyActivationRequests,
  type LegacyActivationRequest
} from "@/lib/legacy-activation";
import { getSiteVisitStats, type SiteVisitStats } from "@/lib/site-visits";
import {
  formatVisitorAnalyticsDateTime,
  formatVisitorAnalyticsRelativeTime,
  VISITOR_ANALYTICS_TIME_ZONE
} from "@/lib/site-visit-utils";

export const dynamic = "force-dynamic";

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amount / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function getStatusClass(status: KeepsakeOrder["fulfillmentStatus"]) {
  if (status === "Completed") {
    return "border-emerald-300/35 text-emerald-200 bg-emerald-500/10";
  }

  if (status === "Shipped") {
    return "border-sky-300/35 text-sky-200 bg-sky-500/10";
  }

  if (status === "In Production") {
    return "border-archive-gold/45 text-archive-gold bg-archive-gold/10";
  }

  return "border-amber-300/35 text-amber-200 bg-amber-500/10";
}

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

function SiteVisitSection({ stats }: { stats: SiteVisitStats }) {
  const latestHumanVisit = stats.mostRecentVisit
    ? `${formatVisitorAnalyticsRelativeTime(
        stats.mostRecentVisit.createdAt
      )} · ${formatVisitorAnalyticsDateTime(stats.mostRecentVisit.createdAt)}`
    : "No human page views yet.";

  return (
    <section className="mb-10 rounded-3xl border border-archive-gold/20 bg-[#171511]/90 p-6 shadow-luxury backdrop-blur-md sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-archive-gold/15 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-archive-gold">
              Live Visitor Movement Radar
            </p>
          </div>
          <h2 className="mt-2 font-serif text-3xl text-archive-ivory">
            Site Intelligence & Movement
          </h2>
          <p className="mt-1 text-xs text-archive-ivory/60">
            Timezone: {VISITOR_ANALYTICS_TIME_ZONE} · Latest: {latestHumanVisit}
          </p>
        </div>
        <Link
          href="/admin/visitors"
          className="inline-flex items-center gap-2 rounded-xl border border-archive-gold/30 bg-archive-gold/15 px-4 py-2 text-xs font-bold text-archive-gold transition hover:bg-archive-gold hover:text-archive-obsidian"
        >
          View Interactive Movement Radar &rarr;
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Unique Visitors Today"
          value={stats.uniqueVisitorsToday}
          detail="Human visitors observed today"
          badge="Live Today"
        />
        <StatCard
          label="Human Page Views Today"
          value={stats.humanPageViewsToday}
          detail="Total pages viewed today"
          badge="Live Today"
        />
        <StatCard
          label="Multi-Page Journeys (30d)"
          value={stats.multiPageVisitorsLast30Days}
          detail="Visitors navigating 2+ pages"
          badge="Explorers"
        />
        <StatCard
          label="Total Public Visits"
          value={stats.totalPublicVisits}
          detail="Lifetime verified human views"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-archive-gold/15 bg-black/40 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">
            Top Active Paths & Page Views
          </h3>
          <span className="text-[10px] text-archive-ivory/50">
            Ranked by total page views
          </span>
        </div>
        {stats.topPaths.length > 0 ? (
          <div className="mt-4 divide-y divide-archive-gold/10">
            {stats.topPaths.map((path) => (
              <div
                key={path.path}
                className="flex flex-col gap-1 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="break-all font-mono text-xs text-archive-champagne font-semibold">
                  {path.path}
                </span>
                <span className="font-mono text-xs font-bold text-archive-gold">
                  {path.visitCount.toLocaleString("en-US")} views
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-archive-ivory/50">
            No public visits recorded yet today.
          </p>
        )}
      </div>
    </section>
  );
}

function OrderCard({ order }: { order: KeepsakeOrder }) {
  return (
    <article className="rounded-2xl border border-archive-gold/18 bg-[#171511]/80 p-5 shadow-luxury transition hover:border-archive-gold/35">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${getStatusClass(
                order.fulfillmentStatus
              )}`}
            >
              {order.fulfillmentStatus}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-ivory/45">
              {order.paymentStatus}
            </span>
          </div>
          <h2 className="mt-4 font-serif text-2xl leading-tight text-archive-ivory">
            {order.productName}
          </h2>
          <p className="mt-2 text-sm text-archive-ivory/68">
            {order.customerEmail || "No customer email"}
          </p>
          <p className="mt-1 text-xs text-archive-ivory/48">
            {formatDate(order.createdAt)} · {order.stripeSessionId}
          </p>
        </div>
        <div className="text-left lg:text-right">
          <p className="font-serif text-3xl text-archive-gold">
            {formatAmount(order.amountPaid, order.currency)}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 lg:justify-end">
            {order.stripeSessionUrl ? (
              <a
                href={order.stripeSessionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-archive-champagne underline-offset-4 hover:underline"
              >
                Open in Stripe
              </a>
            ) : null}
            {order.archiveSlug ? (
              <Link
                href={`/archive/${order.archiveSlug}`}
                className="text-xs font-semibold text-archive-champagne underline-offset-4 hover:underline"
              >
                Open archive
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <form
        action={updateOrderAction}
        className="mt-6 grid gap-4 lg:grid-cols-[16rem_1fr_auto] lg:items-end"
      >
        <input type="hidden" name="orderId" value={order.id} />
        <label className="grid gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
            Fulfillment
          </span>
          <select
            name="fulfillmentStatus"
            defaultValue={order.fulfillmentStatus}
            className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none focus:border-archive-gold"
          >
            {fulfillmentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
            Notes
          </span>
          <textarea
            name="notes"
            defaultValue={order.notes}
            rows={2}
            className="min-h-12 rounded-xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none focus:border-archive-gold"
            placeholder="Personalization, production, shipping, or follow-up notes"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-archive-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
        >
          Update
        </button>
      </form>
    </article>
  );
}

function getActivationStatusLabel(status: LegacyActivationRequest["status"]) {
  if (status === "memorial_activated") {
    return "Memorial Activated";
  }

  if (status === "review_closed") {
    return "Review Closed";
  }

  return "Pending Memorial Review";
}

function LegacyActivationCard({
  request
}: {
  request: LegacyActivationRequest;
}) {
  const isPending = request.status === "pending_memorial_review";

  return (
    <article className="rounded-2xl border border-archive-gold/18 bg-[#171511]/80 p-5 shadow-luxury transition hover:border-archive-gold/35">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="rounded-full border border-archive-gold/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-archive-champagne">
            {getActivationStatusLabel(request.status)}
          </span>
          <h2 className="mt-4 font-serif text-2xl leading-tight text-archive-ivory">
            {request.archiveName}
          </h2>
          <p className="mt-2 text-sm text-archive-ivory/68">
            Requested by {request.requesterName} · {request.relationshipToOwner}
          </p>
          <p className="mt-1 text-xs text-archive-ivory/48">
            {formatDate(request.createdAt)}
          </p>
          {request.message ? (
            <p className="mt-4 max-w-2xl rounded-xl border border-archive-gold/12 bg-archive-obsidian px-4 py-3 text-sm leading-6 text-archive-ivory/68">
              {request.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          {request.archiveSlug ? (
            <Link
              href={`/archive/${request.archiveSlug}`}
              className="text-xs font-semibold text-archive-champagne underline-offset-4 hover:underline"
            >
              Open archive
            </Link>
          ) : null}
        </div>
      </div>

      {isPending ? (
        <form action={markLegacyActivationMemorializedAction} className="mt-5">
          <input type="hidden" name="requestId" value={request.id} />
          <button
            type="submit"
            className="rounded-full bg-archive-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
          >
            Mark Memorial Activated
          </button>
        </form>
      ) : null}
    </article>
  );
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();

  if (!account.user) {
    redirect("/login?next=%2Fadmin");
  }

  const params = await searchParams;

  if (!adminEmailsConfigured || !isAdmin) {
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

  let orders: KeepsakeOrder[] = [];
  let legacyActivations: LegacyActivationRequest[] = [];
  let siteVisitStats: SiteVisitStats = {
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
  let loadError: string | null = null;

  try {
    [orders, legacyActivations, siteVisitStats] = await Promise.all([
      listKeepsakeOrders(),
      listLegacyActivationRequests(),
      getSiteVisitStats({
        currentAdminEmail: account.user.email,
        currentAdminName: account.user.displayName
      })
    ]);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load admin records.";
  }

  const newOrders = orders.filter((order) => order.fulfillmentStatus === "New");
  const pendingLegacyActivations = legacyActivations.filter(
    (request) => request.status === "pending_memorial_review"
  );
  const totalRevenueCents = orders.reduce(
    (sum, order) => sum + (order.paymentStatus === "paid" ? order.amountPaid : 0),
    0
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl">
        <AdminNav
          currentPath="/admin"
          todayVisitsCount={siteVisitStats.uniqueVisitorsToday}
          newOrdersCount={newOrders.length}
          pendingReviewsCount={pendingLegacyActivations.length}
        />

        <header className="py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-archive-gold">
                Executive Control Center
              </p>
              <h1 className="mt-3 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
                Welcome back, {account.user.displayName || "Inky Aryan"}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-archive-ivory/70">
                Fulfillment operations, legacy memorial reviews, revenue metrics, and real-time site visitor intelligence.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 shadow-luxury">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-200">
                ★ Signed-in Admin
              </p>
              <p className="mt-1 font-serif text-xl font-medium text-archive-ivory">
                {account.user.displayName || "Inky Aryan"}
              </p>
              <p className="text-xs text-archive-champagne/80">
                {account.user.email}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="New Orders"
              value={newOrders.length}
              detail="Requires fulfillment action"
              badge={newOrders.length > 0 ? "Action Required" : "All Clear"}
            />
            <StatCard
              label="Pending Reviews"
              value={pendingLegacyActivations.length}
              detail="Legacy memorial activation requests"
              badge={pendingLegacyActivations.length > 0 ? "Pending" : "Clean"}
            />
            <StatCard
              label="Total Revenue"
              value={formatAmount(totalRevenueCents, "USD")}
              detail={`Across ${orders.length} total orders`}
            />
            <StatCard
              label="Unique Visitors Today"
              value={siteVisitStats.uniqueVisitorsToday}
              detail={`${siteVisitStats.humanPageViewsToday.toLocaleString("en-US")} page views today (${VISITOR_ANALYTICS_TIME_ZONE})`}
              badge="Live"
            />
          </div>
        </header>

        {params?.success ? (
          <p className="mb-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Order updated successfully.
          </p>
        ) : null}

        {params?.error ? (
          <p className="mb-6 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
            {params.error}
          </p>
        ) : null}

        {loadError ? (
          <section className="rounded-2xl border border-red-300/20 bg-red-400/10 p-6 text-sm text-red-100">
            {loadError}
          </section>
        ) : null}

        {!loadError ? <SiteVisitSection stats={siteVisitStats} /> : null}

        {pendingLegacyActivations.length > 0 ? (
          <section className="mb-10">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl text-archive-ivory">
                Pending Memorial Reviews
              </h2>
              <span className="rounded-full border border-amber-300/35 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">
                {pendingLegacyActivations.length} Pending
              </span>
            </div>
            <div className="mt-5 grid gap-5">
              {pendingLegacyActivations.map((request) => (
                <LegacyActivationCard key={request.id} request={request} />
              ))}
            </div>
          </section>
        ) : null}

        {newOrders.length > 0 ? (
          <section className="mb-10">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl text-archive-ivory">New Keepsake Orders</h2>
              <span className="rounded-full border border-archive-gold/35 bg-archive-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
                {newOrders.length} New
              </span>
            </div>
            <div className="mt-5 grid gap-5">
              {newOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        ) : null}

        {legacyActivations.length > pendingLegacyActivations.length ? (
          <section className="mb-10">
            <h2 className="font-serif text-3xl text-archive-ivory">
              Reviewed Memorial Requests
            </h2>
            <div className="mt-5 grid gap-5">
              {legacyActivations
                .filter((request) => request.status !== "pending_memorial_review")
                .map((request) => (
                  <LegacyActivationCard key={request.id} request={request} />
                ))}
            </div>
          </section>
        ) : null}

        {orders.length > newOrders.length ? (
          <section className="mb-16">
            <h2 className="font-serif text-3xl text-archive-ivory">Fulfilled & Past Orders</h2>
            <div className="mt-5 grid gap-5">
              {orders
                .filter((order) => order.fulfillmentStatus !== "New")
                .map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
            </div>
          </section>
        ) : null}

        {!loadError && orders.length === 0 ? (
          <section className="rounded-2xl border border-archive-gold/18 bg-white/[0.025] p-8 text-center shadow-luxury">
            <h2 className="font-serif text-3xl text-archive-ivory">
              No keepsake orders yet.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-archive-ivory/64">
              Successful Stripe Checkout sessions will appear here after the webhook records them.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
