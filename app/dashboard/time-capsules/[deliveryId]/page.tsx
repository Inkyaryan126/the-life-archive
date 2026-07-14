import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { SuccessMessage } from "@/components/SuccessMessage";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { TimeCapsuleConfirmAction } from "@/components/time-capsules/TimeCapsuleConfirmAction";
import { getAccountContext } from "@/lib/account";
import { cancelTimeCapsuleAction, retryTimeCapsuleAction } from "../actions";
import { getOwnerScheduledMemoryDelivery } from "@/lib/time-capsules";
import {
  formatTimeCapsuleCreatedAt,
  formatTimeCapsuleLocalDateTime,
  getTimeCapsuleStatusLabel,
  getTimeCapsuleStatusTone
} from "../utils";

export const dynamic = "force-dynamic";

type TimeCapsuleDetailPageProps = {
  params: Promise<{
    deliveryId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

function getStatusDescription(status: string) {
  if (status === "scheduled") {
    return "This memory is waiting for its delivery date.";
  }

  if (status === "processing") {
    return "This memory is being prepared for delivery.";
  }

  if (status === "delivered") {
    return "This Time Capsule was delivered.";
  }

  if (status === "failed") {
    return "We couldn’t send this Time Capsule.";
  }

  return "This Time Capsule was canceled and won’t be delivered.";
}

export default async function TimeCapsuleDetailPage({
  params,
  searchParams
}: TimeCapsuleDetailPageProps) {
  const { deliveryId } = await params;
  const paramsState = await searchParams;
  const account = await getAccountContext();

  if (!account.user) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/time-capsules/${deliveryId}`)}`);
  }

  let delivery: Awaited<
    ReturnType<typeof getOwnerScheduledMemoryDelivery>
  > | null = null;

  try {
    delivery = await getOwnerScheduledMemoryDelivery(deliveryId);
  } catch {
    notFound();
  }

  if (!delivery) {
    notFound();
  }

  const statusLabel = getTimeCapsuleStatusLabel(delivery.status);
  const statusTone = getTimeCapsuleStatusTone(delivery.status);
  const canEdit = delivery.status === "scheduled";
  const canCancel = delivery.status === "scheduled" || delivery.status === "failed";
  const canRetry = delivery.status === "failed";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-6 py-6 text-archive-ivory lg:px-12 xl:px-16 sm:py-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-[96rem] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <AppSidebar
          active="dashboard"
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
            {paramsState?.success === "created" ? (
              <SuccessMessage eyebrow="Time Capsule scheduled" message="Your Time Capsule is scheduled." />
            ) : null}
            {paramsState?.success === "updated" ? (
              <SuccessMessage eyebrow="Time Capsule updated" message="Time Capsule updated." />
            ) : null}
            {paramsState?.success === "canceled" ? (
              <SuccessMessage eyebrow="Time Capsule canceled" message="Time Capsule canceled." />
            ) : null}
            {paramsState?.success === "retried" ? (
              <SuccessMessage eyebrow="Retry scheduled" message="This Time Capsule is scheduled to try again." />
            ) : null}
            {paramsState?.error ? (
              <div className="mb-8 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm leading-6 text-red-100">
                {paramsState.error}
              </div>
            ) : null}

            <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end lg:gap-10">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-archive-gold">
                  Time Capsules
                </p>
                <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-archive-ivory sm:text-6xl">
                  {delivery.memory?.title ?? "Time Capsule details"}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-archive-ivory/62 sm:text-lg sm:leading-8">
                  {getStatusDescription(delivery.status)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`rounded-full border px-3 py-1.5 font-semibold uppercase tracking-[0.14em] ${statusTone}`}>
                  {statusLabel}
                </span>
                {canEdit ? (
                  <Link href={`/dashboard/time-capsules/${delivery.id}/edit`} className="rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne">
                    Edit
                  </Link>
                ) : null}
              </div>
            </header>

            <section className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-[2rem] border border-archive-gold/16 bg-white/[0.03] p-6 shadow-luxury sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">Archive</p>
                    <p className="mt-2 font-serif text-2xl text-archive-ivory">
                      {delivery.archive.name}
                    </p>
                    <p className="mt-1 text-sm text-archive-ivory/60">
                      {delivery.archive.personName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">Memory</p>
                    <p className="mt-2 font-serif text-2xl text-archive-ivory">
                      {delivery.memory?.title ?? "Memory unavailable"}
                    </p>
                    <p className="mt-1 text-sm text-archive-ivory/60">
                      {delivery.memory?.type ?? "Unavailable"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">Recipient</p>
                    <p className="mt-2 text-base font-semibold text-archive-ivory">
                      {delivery.recipientName}
                    </p>
                    <p className="mt-1 text-sm text-archive-ivory/60">
                      {delivery.recipientEmailDisplay}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">Delivery</p>
                    <p className="mt-2 text-base font-semibold text-archive-ivory">
                      {formatTimeCapsuleLocalDateTime(delivery.scheduledFor, delivery.timezone)}
                    </p>
                    <p className="mt-1 text-sm text-archive-ivory/60">
                      {delivery.timezone}
                    </p>
                  </div>
                </div>

                {delivery.personalNote ? (
                  <div className="mt-6 rounded-2xl border border-archive-gold/14 bg-archive-obsidian/42 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                      Personal note
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-archive-ivory/72">
                      {delivery.personalNote}
                    </p>
                  </div>
                ) : null}
              </article>

              <article className="rounded-[2rem] border border-archive-gold/16 bg-white/[0.03] p-6 shadow-luxury sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                  Delivery status
                </p>
                <p className="mt-3 font-serif text-3xl text-archive-ivory">
                  {statusLabel}
                </p>
                <p className="mt-3 text-sm leading-7 text-archive-ivory/64">
                  {getStatusDescription(delivery.status)}
                </p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-archive-gold/12 bg-archive-obsidian/42 px-4 py-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-archive-gold/80">
                      Attempts
                    </p>
                    <p className="mt-2 text-sm leading-6 text-archive-ivory/72">
                      {delivery.attemptCount} of {delivery.maxAttempts}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-archive-gold/12 bg-archive-obsidian/42 px-4 py-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-archive-gold/80">
                      Created
                    </p>
                    <p className="mt-2 text-sm leading-6 text-archive-ivory/72">
                      {formatTimeCapsuleCreatedAt(delivery.createdAt)}
                    </p>
                  </div>
                  {delivery.deliveredAt ? (
                    <div className="rounded-2xl border border-archive-gold/12 bg-archive-obsidian/42 px-4 py-3">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-archive-gold/80">
                        Delivered
                      </p>
                      <p className="mt-2 text-sm leading-6 text-archive-ivory/72">
                        {formatTimeCapsuleCreatedAt(delivery.deliveredAt)}
                      </p>
                    </div>
                  ) : null}
                  {delivery.failedAt ? (
                    <div className="rounded-2xl border border-archive-gold/12 bg-archive-obsidian/42 px-4 py-3">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-archive-gold/80">
                        Failed
                      </p>
                      <p className="mt-2 text-sm leading-6 text-archive-ivory/72">
                        {formatTimeCapsuleCreatedAt(delivery.failedAt)}
                      </p>
                      {delivery.lastErrorMessage ? (
                        <p className="mt-2 text-sm leading-6 text-red-100">
                          {delivery.lastErrorMessage}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {delivery.canceledAt ? (
                    <div className="rounded-2xl border border-archive-gold/12 bg-archive-obsidian/42 px-4 py-3">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-archive-gold/80">
                        Canceled
                      </p>
                      <p className="mt-2 text-sm leading-6 text-archive-ivory/72">
                        {formatTimeCapsuleCreatedAt(delivery.canceledAt)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </article>
            </section>

            {canCancel || canRetry ? (
              <section className="mt-6 rounded-[2rem] border border-archive-gold/16 bg-white/[0.03] p-6 shadow-luxury sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                  Actions
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {canCancel ? (
                    <TimeCapsuleConfirmAction
                      action={cancelTimeCapsuleAction}
                      deliveryId={delivery.id}
                      heading="Cancel this delivery?"
                      body="This memory won’t be sent on the scheduled date. The memory itself will stay in your archive."
                      triggerLabel="Cancel delivery"
                      confirmLabel="Cancel delivery"
                      confirmPendingLabel="Canceling..."
                      destructive
                    />
                  ) : null}

                  {canRetry ? (
                    <TimeCapsuleConfirmAction
                      action={retryTimeCapsuleAction}
                      deliveryId={delivery.id}
                      heading="Retry this delivery?"
                      body="This will schedule another delivery attempt using the same memory and recipient details."
                      triggerLabel="Retry delivery"
                      confirmLabel="Retry delivery"
                      confirmPendingLabel="Retrying..."
                    />
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
