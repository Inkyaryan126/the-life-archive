import Link from "next/link";
import type { Metadata } from "next";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { PublicDeliveredMemoryView } from "@/components/time-capsules/PublicDeliveredMemoryView";
import {
  resolveDeliveredScheduledMemoryDeliveryByToken,
  type PublicDeliveredTimeCapsule
} from "@/lib/time-capsules";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "A memory from The Life Archive",
  robots: {
    index: false,
    follow: false
  }
};

function formatDeliveredDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: timezone
  }).format(new Date(value));
}

function PublicUnavailableState() {
  return (
    <section className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-archive-gold">
        Delivery unavailable
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
        This memory isn’t available
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-archive-ivory/68 sm:text-lg sm:leading-8">
        The delivery link may be invalid, no longer active, or the memory may
        have been removed.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
        >
          Return Home
        </Link>
      </div>
    </section>
  );
}

function DeliveredSummary({
  delivery
}: {
  delivery: Extract<PublicDeliveredTimeCapsule, { status: "available" }>["delivery"];
}) {
  return (
    <section className="grid gap-5 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
            Delivered to
          </p>
          <p className="mt-2 font-serif text-2xl text-archive-ivory">
            {delivery.recipientName}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
            Prepared by
          </p>
          <p className="mt-2 font-serif text-2xl text-archive-ivory">
            {delivery.ownerDisplayName}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
            Archive
          </p>
          <p className="mt-2 font-serif text-2xl text-archive-ivory">
            {delivery.archive.name}
          </p>
          <p className="mt-1 text-sm text-archive-ivory/60">
            {delivery.archive.personName}
          </p>
        </div>
      </div>

      {delivery.personalNote ? (
        <div className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/42 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
            A note for you
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-archive-ivory/74">
            {delivery.personalNote}
          </p>
        </div>
      ) : null}

      <PublicDeliveredMemoryView memory={delivery.memory} />

      <div className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/42 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
          Delivered
        </p>
        <p className="mt-2 text-sm leading-7 text-archive-ivory/72">
          {formatDeliveredDate(delivery.deliveredAt, delivery.timezone)}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-archive-ivory/46">
          {delivery.timezone}
        </p>
      </div>
    </section>
  );
}

export default async function DeliveryPage({
  params
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  const { token } = await params;
  const result = await resolveDeliveredScheduledMemoryDeliveryByToken(token);

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8 sm:py-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link href="/" className="inline-flex w-fit">
          <SiteLogo width={220} height={55} />
        </Link>

        <section className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-archive-gold">
            The Life Archive
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
            A memory was left for you
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-archive-ivory/68 sm:text-lg sm:leading-8">
            This memory was prepared in advance and delivered through The Life
            Archive.
          </p>
        </section>

        {result.status === "available" ? (
          <DeliveredSummary delivery={result.delivery} />
        ) : (
          <PublicUnavailableState />
        )}

        <footer className="pb-4 text-center text-sm text-archive-ivory/52">
          <Link
            href="/"
            className="font-semibold text-archive-gold transition hover:text-archive-champagne"
          >
            Return to The Life Archive
          </Link>
        </footer>
      </div>
    </main>
  );
}
