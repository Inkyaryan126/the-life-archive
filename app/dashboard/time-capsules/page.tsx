import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { DesignBackdrop, HeartbeatLogoDivider, SiteLogo } from "@/components/SiteDesign";
import { TimeCapsuleConfirmAction } from "@/components/time-capsules/TimeCapsuleConfirmAction";
import { getAccountContext } from "@/lib/account";
import { cancelTimeCapsuleAction, retryTimeCapsuleAction } from "./actions";
import { listOwnerScheduledMemoryDeliveries } from "@/lib/time-capsules";
import {
  getTimeCapsuleStatusLabel,
  getTimeCapsuleStatusTone,
  formatTimeCapsuleLocalDate
} from "./utils";

export const dynamic = "force-dynamic";

type TimeCapsulesPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function TimeCapsulesPage({
  searchParams
}: TimeCapsulesPageProps) {
  const params = await searchParams;
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login?next=%2Fdashboard%2Ftime-capsules");
  }

  const deliveries = await listOwnerScheduledMemoryDeliveries();
  const scheduledCount = deliveries.filter((delivery) => delivery.status === "scheduled").length;
  const processingCount = deliveries.filter((delivery) => delivery.status === "processing").length;
  const deliveredCount = deliveries.filter((delivery) => delivery.status === "delivered").length;
  const failedCount = deliveries.filter((delivery) => delivery.status === "failed").length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-6 py-6 text-archive-ivory lg:px-12 xl:px-16 sm:py-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-[96rem] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <AppSidebar
          active="time-capsules"
          archiveSlug={account.defaultArchive?.slug ?? null}
          archiveName={account.defaultArchive?.archiveName ?? null}
          archivePersonName={account.defaultArchive?.personName ?? null}
          showArchiveActions={Boolean(account.defaultArchive?.slug)}
        />

        <div className="min-w-0">
          <nav className="relative z-10 flex flex-col gap-4 border-b border-archive-gold/20 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:hidden">
            <Link href="/" className="block">
              <SiteLogo width={240} height={60} />
            </Link>
            <div className="flex flex-wrap items-center gap-4 sm:justify-end sm:gap-6">
              <Link href="/dashboard" className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base">
                My Archives
              </Link>
              <Link href="/dashboard/settings" className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base">
                Settings
              </Link>
              <Link href="/dashboard/time-capsules" className="text-sm font-semibold text-archive-gold sm:text-base">
                Time Capsules
              </Link>
            </div>
          </nav>

          <div className="pb-20 pt-10 sm:pt-14">
            <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end lg:gap-10">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-archive-gold">
                  Dashboard
                </p>
                <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-archive-ivory sm:text-6xl">
                  Time Capsules
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-archive-ivory/62 sm:text-lg sm:leading-8">
                  Choose a memory and decide when it should reach someone you care about.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-archive-gold/18 bg-white/[0.03] px-3 py-1.5 font-semibold uppercase tracking-[0.14em] text-archive-gold">
                  {account.user.displayName}
                </span>
                <Link href="/dashboard/time-capsules/new" className="rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne">
                  Schedule a Time Capsule
                </Link>
                <Link href="/dashboard/settings" className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">
                  Settings
                </Link>
              </div>
            </header>

            <div className="mt-8 flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-archive-ivory/56">
              <span className="rounded-full border border-archive-gold/18 bg-white/[0.03] px-3 py-1">Scheduled {scheduledCount}</span>
              <span className="rounded-full border border-archive-gold/18 bg-white/[0.03] px-3 py-1">Processing {processingCount}</span>
              <span className="rounded-full border border-archive-gold/18 bg-white/[0.03] px-3 py-1">Delivered {deliveredCount}</span>
              <span className="rounded-full border border-archive-gold/18 bg-white/[0.03] px-3 py-1">Failed {failedCount}</span>
            </div>

            <HeartbeatLogoDivider className="py-8 sm:py-10" />

            {params?.success === "created" ? (
              <div className="mb-8 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                Your Time Capsule is scheduled.
              </div>
            ) : null}
            {params?.error ? (
              <div className="mb-8 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
                {params.error}
              </div>
            ) : null}

            {deliveries.length > 0 ? (
              <section className="grid gap-4">
                {deliveries.map((delivery) => {
                  const statusLabel = getTimeCapsuleStatusLabel(delivery.status);
                  const statusTone = getTimeCapsuleStatusTone(delivery.status);
                  const showAttempts = delivery.status === "processing" || delivery.status === "failed";

                  return (
                    <article key={delivery.id} className="rounded-[2rem] border border-archive-gold/16 bg-white/[0.03] p-5 shadow-luxury sm:p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] ${statusTone}`}>
                              {statusLabel}
                            </span>
                            {showAttempts ? (
                              <span className="rounded-full border border-archive-gold/18 bg-archive-gold/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-archive-champagne">
                                Attempt {delivery.attemptCount} of {delivery.maxAttempts}
                              </span>
                            ) : null}
                          </div>

                          <h2 className="mt-3 break-words font-serif text-2xl leading-tight text-archive-ivory sm:text-3xl">
                            {delivery.memory?.title ?? "Memory unavailable"}
                          </h2>
                          <p className="mt-2 text-sm uppercase tracking-[0.16em] text-archive-ivory/56">
                            {delivery.archive.name}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-archive-ivory/70">
                            Recipient: {delivery.recipientName} · {delivery.recipientEmailDisplay}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-archive-ivory/70">
                            Scheduled for {formatTimeCapsuleLocalDate(delivery.scheduledFor, delivery.timezone)} · {delivery.timezone}
                          </p>
                          {delivery.status === "failed" && delivery.lastErrorMessage ? (
                            <p className="mt-3 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100">
                              {delivery.lastErrorMessage}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link href={`/dashboard/time-capsules/${delivery.id}`} className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">
                            View
                          </Link>
                          {delivery.archive.slug && delivery.memory ? (
                            <Link href={`/archive/${delivery.archive.slug}/memories/${delivery.memory.id}`} className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">
                              Open memory
                            </Link>
                          ) : null}
                          {delivery.status === "scheduled" ? (
                            <Link href={`/dashboard/time-capsules/${delivery.id}/edit`} className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">
                              Edit
                            </Link>
                          ) : null}
                          {delivery.status === "scheduled" ? (
                            <TimeCapsuleConfirmAction
                              action={cancelTimeCapsuleAction}
                              deliveryId={delivery.id}
                              heading="Cancel this delivery?"
                              body="This memory won’t be sent on the scheduled date. The memory itself will stay in your archive."
                              triggerLabel="Cancel"
                              confirmLabel="Cancel delivery"
                              confirmPendingLabel="Canceling..."
                              destructive
                              triggerClassName="rounded-full border border-red-300/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-200 hover:bg-red-400/15"
                            />
                          ) : null}
                          {delivery.status === "failed" ? (
                            <TimeCapsuleConfirmAction
                              action={retryTimeCapsuleAction}
                              deliveryId={delivery.id}
                              heading="Retry this delivery?"
                              body="This will schedule another delivery attempt using the same memory and recipient details."
                              triggerLabel="Retry"
                              confirmLabel="Retry delivery"
                              confirmPendingLabel="Retrying..."
                              triggerClassName="rounded-full border border-archive-gold/28 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                            />
                          ) : null}
                        </div>
                      </div>

                      {delivery.status === "processing" ? (
                        <p className="mt-4 text-sm leading-7 text-archive-ivory/58">
                          This Time Capsule is being prepared for delivery.
                        </p>
                      ) : null}
                      {delivery.status === "canceled" ? (
                        <p className="mt-4 text-sm leading-7 text-archive-ivory/58">
                          This Time Capsule was canceled and will not be sent.
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </section>
            ) : (
              <section className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-archive-gold">
                  No Time Capsules scheduled yet
                </p>
                <h2 className="mt-3 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
                  Choose one of your memories and schedule it to reach someone on a future date.
                </h2>
                <div className="mt-6">
                  <Link href="/dashboard/time-capsules/new" className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne">
                    Schedule your first Time Capsule
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
