import Link from "next/link";
import {
 redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { DesignBackdrop, HeartbeatLogoDivider, SiteLogo } from "@/components/SiteDesign";
import {
  ArchiveBuildingShell,
  ArchiveHotspot,
  ArchiveOverlayRegion,
  ArchiveMobileScene
} from "@/components/archive-building/ArchiveBuildingShell";
import { TimeCapsuleConfirmAction } from "@/components/time-capsules/TimeCapsuleConfirmAction";
import { getAccountContext } from "@/lib/account";
import {
  archiveBuildingMobileScenes,
  archiveBuildingScenes
} from "@/lib/archive-building-scenes";
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
    <>
      <ArchiveBuildingShell
        image={{ ...archiveBuildingScenes.timeCapsules, priority: true }}
        active="time-capsules"
        archiveSlug={account.defaultArchive?.slug ?? null}
        archiveName={account.defaultArchive?.archiveName ?? null}
        archivePersonName={account.defaultArchive?.personName ?? null}
        showArchiveActions={Boolean(account.defaultArchive?.slug)}
        sceneLabel="Time Capsules archive-building scene"
      >
        <ArchiveOverlayRegion
          region={{ left: 19.14, top: 76.83, width: 74.22, height: 16.26 }}
          className="p-[clamp(1rem,1.45vw,1.55rem)] text-archive-ivory"
          ariaLabel="Time Capsule status and records"
        >
          <div className="grid h-full grid-cols-[0.78fr_1fr] gap-[clamp(1.15rem,1.8vw,2rem)]">
            <div className="min-w-0">
              <div className="grid grid-cols-4 gap-[clamp(0.7rem,1vw,1.1rem)]">
                {[
                  ["Scheduled", scheduledCount],
                  ["Processing", processingCount],
                  ["Delivered", deliveredCount],
                  ["Failed", failedCount]
                ].map(([label, count]) => (
                  <div key={label} className="min-w-0">
                    <p className="font-serif text-[clamp(1.35rem,1.9vw,2.2rem)] leading-none text-archive-ivory drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
                      {count}
                    </p>
                    <p className="mt-1.5 truncate text-[clamp(0.58rem,0.72vw,0.8rem)] font-semibold uppercase tracking-[0.12em] text-archive-gold/82">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-[clamp(0.65rem,1vw,1.15rem)] line-clamp-3 text-[clamp(0.72rem,0.86vw,0.95rem)] leading-[1.55] text-archive-ivory/72">
                Choose a preserved memory, select who should receive it, and decide when it should be delivered.
              </p>
            </div>

            <div className="min-w-0 border-l border-archive-gold/20 pl-[clamp(1rem,1.55vw,1.8rem)]">
              {deliveries.length > 0 ? (
                <div className="grid h-full content-start gap-[clamp(0.28rem,0.46vw,0.55rem)]">
                  {deliveries.slice(0, 3).map((delivery) => (
                    <Link
                      key={delivery.id}
                      href={`/dashboard/time-capsules/${delivery.id}`}
                      className="grid min-h-[clamp(2.2rem,3vw,3.1rem)] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-archive-gold/16 transition hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-serif text-[clamp(0.92rem,1.12vw,1.22rem)] text-archive-ivory">
                          {delivery.memory?.title ?? "Memory unavailable"}
                        </span>
                        <span className="mt-0.5 block truncate text-[clamp(0.64rem,0.76vw,0.84rem)] text-archive-ivory/62">
                          {delivery.recipientName} · {formatTimeCapsuleLocalDate(delivery.scheduledFor, delivery.timezone)}
                        </span>
                      </span>
                      <span className="shrink-0 text-[clamp(0.55rem,0.66vw,0.74rem)] font-bold uppercase tracking-[0.1em] text-archive-gold/82">
                        {getTimeCapsuleStatusLabel(delivery.status)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col justify-center">
                  <h2 className="font-serif text-[clamp(1.35rem,1.85vw,2.15rem)] leading-tight text-archive-ivory">
                    No time capsules scheduled yet.
                  </h2>
                  <p className="mt-2 max-w-[24rem] text-[clamp(0.78rem,0.95vw,1.05rem)] leading-[1.55] text-archive-ivory/68">
                    Use the vault door above to preserve a memory for future delivery.
                  </p>
                </div>
              )}
            </div>
          </div>
        </ArchiveOverlayRegion>

        <ArchiveHotspot
          region={{ left: 52.75, top: 31.25, width: 20.25, height: 12.35 }}
          href="/dashboard/time-capsules/new"
          label="Schedule a Time Capsule"
          className="rounded-full"
        />
      </ArchiveBuildingShell>

      <ArchiveMobileScene
        image={{ ...archiveBuildingMobileScenes.vault, priority: true }}
        sceneLabel="Time Capsules mobile vault room"
        title={"THE VAULT"}
        subtitle={"Some memories are meant to arrive later."}
        className="px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))] sm:px-6"
      >
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
      </ArchiveMobileScene>
    </>
  );
}
