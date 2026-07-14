import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Temporal } from "@js-temporal/polyfill";
import { AppSidebar } from "@/components/AppSidebar";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";
import { TimeCapsuleScheduleForm } from "@/components/time-capsules/TimeCapsuleScheduleForm";
import { getOwnerScheduledMemoryDelivery } from "@/lib/time-capsules";
import { updateTimeCapsuleAction } from "../../actions";

export const dynamic = "force-dynamic";

type TimeCapsuleEditPageProps = {
  params: Promise<{
    deliveryId: string;
  }>;
};

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function getLocalDateTimeValues(scheduledFor: string, timezone: string) {
  const zonedDateTime = Temporal.Instant.from(scheduledFor).toZonedDateTimeISO(
    timezone
  );

  return {
    localDate: zonedDateTime.toPlainDate().toString(),
    localTime: `${pad(zonedDateTime.hour)}:${pad(zonedDateTime.minute)}`
  };
}

export default async function EditTimeCapsulePage({
  params
}: TimeCapsuleEditPageProps) {
  const { deliveryId } = await params;
  const account = await getAccountContext();

  if (!account.user) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/dashboard/time-capsules/${deliveryId}/edit`
      )}`
    );
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

  if (delivery.status !== "scheduled") {
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
              <section className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-archive-gold">
                  Time Capsules
                </p>
                <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
                  This Time Capsule can’t be edited right now
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-archive-ivory/64 sm:text-lg sm:leading-8">
                  Only scheduled Time Capsules can be changed. This one is already {delivery.status}.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/dashboard/time-capsules/${delivery.id}`} className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne">
                    View Time Capsule
                  </Link>
                  <Link href="/dashboard/time-capsules" className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">
                    Back to Time Capsules
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { localDate, localTime } = getLocalDateTimeValues(
    delivery.scheduledFor,
    delivery.timezone
  );

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
            <header className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-archive-gold">
                Time Capsules
              </p>
              <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-archive-ivory sm:text-6xl">
                Edit Time Capsule
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-archive-ivory/62 sm:text-lg sm:leading-8">
                Update the recipient, the note, or the delivery time before this memory reaches them.
              </p>
            </header>

            <div className="mt-8">
              <TimeCapsuleScheduleForm
                action={updateTimeCapsuleAction}
                archives={[]}
                initialValues={{
                  archiveId: delivery.archive.id,
                  memoryId: delivery.memory?.id ?? "",
                  recipientName: delivery.recipientName,
                  recipientEmail: delivery.recipientEmail,
                  personalNote: delivery.personalNote ?? "",
                  timezone: delivery.timezone,
                  localDate,
                  localTime
                }}
                deliveryId={delivery.id}
                mode="edit"
                submitLabel="Save changes"
                submitPendingLabel="Saving changes..."
                archiveSummary={{
                  archiveName: delivery.archive.name,
                  personName: delivery.archive.personName
                }}
                memorySummary={{
                  title: delivery.memory?.title ?? "Memory unavailable",
                  type: delivery.memory?.type ?? "Unavailable",
                  date: null
                }}
                showArchiveSelector={false}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
