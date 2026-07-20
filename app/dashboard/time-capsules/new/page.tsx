import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { MobileArchiveHeader } from "@/components/archive-building/MobileArchiveHeader";
import { getAccountContext } from "@/lib/account";
import { createTimeCapsuleAction } from "../actions";
import { loadOwnerTimeCapsuleArchiveOptions } from "../data";
import { TimeCapsuleScheduleForm } from "@/components/time-capsules/TimeCapsuleScheduleForm";
import { ArchiveMobileScene } from "@/components/archive-building/ArchiveBuildingShell";
import { archiveBuildingMobileScenes } from "@/lib/archive-building-scenes";

export const dynamic = "force-dynamic";

export default async function NewTimeCapsulePage() {
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login?next=%2Fdashboard%2Ftime-capsules%2Fnew");
  }

  const archives = await loadOwnerTimeCapsuleArchiveOptions(account.archives);
  const totalMemories = archives.reduce(
    (count, archive) => count + archive.memories.length,
    0
  );
  const initialArchive =
    archives.find(
      (archive) =>
        archive.slug === account.defaultArchive?.slug && archive.memories.length > 0
    ) ??
    archives.find((archive) => archive.memories.length > 0) ??
    archives[0] ??
    null;
  const initialMemory = initialArchive?.memories[0] ?? null;

  if (archives.length === 0 || totalMemories === 0) {
    const firstArchiveSlug =
      account.defaultArchive?.slug ?? archives[0]?.slug ?? null;
    const primaryActionHref = firstArchiveSlug
      ? `/archive/${firstArchiveSlug}/add-memory`
      : "/create";
    const primaryActionLabel = firstArchiveSlug
      ? "Add Memory"
      : "Create Archive";

    return (
      <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-6 py-6 text-archive-ivory lg:px-12 xl:px-16 sm:py-8">
        <ArchiveMobileScene
          image={{ ...archiveBuildingMobileScenes.vault, priority: true }}
          sceneLabel="Create Time Capsule mobile vault"
          title={"CREATE A TIME CAPSULE"}
          subtitle="A message preserved now can arrive exactly when it is needed."
          backgroundOnly
        />

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
            <MobileArchiveHeader
              active="time-capsules"
              archiveSlug={account.defaultArchive?.slug ?? null}
              signedIn={true}
            />

            <div className="pb-20 pt-10 sm:pt-14">
              <section className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-archive-gold">
                  No memories yet
                </p>
                <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
                  Create a memory first, then schedule a Time Capsule.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-archive-ivory/64 sm:text-lg sm:leading-8">
                  A Time Capsule can only be scheduled from one of your existing memories. Add the memory you want to send, then return here when you are ready.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={primaryActionHref} className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne">
                    {primaryActionLabel}
                  </Link>
                  <Link href="/dashboard" className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">
                    Back to My Archives
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const activeArchiveId = initialArchive?.id ?? archives[0]?.id ?? "";
  const activeMemoryId = initialMemory?.id ?? "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-6 py-6 text-archive-ivory lg:px-12 xl:px-16 sm:py-8">
        <ArchiveMobileScene
          image={{ ...archiveBuildingMobileScenes.vault, priority: true }}
          sceneLabel="Create Time Capsule mobile vault"
          title={"CREATE A TIME CAPSULE"}
          subtitle="A message preserved now can arrive exactly when it is needed."
          backgroundOnly
        />

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
            <header className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-archive-gold">
                Dashboard
              </p>
              <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-archive-ivory sm:text-6xl">
                Time Capsules
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-archive-ivory/62 sm:text-lg sm:leading-8">
                Choose a memory and decide when it should reach someone you care about.
              </p>
            </header>

            <div className="mt-8">
              <TimeCapsuleScheduleForm
                action={createTimeCapsuleAction}
                archives={archives}
                initialValues={{
                  archiveId: activeArchiveId,
                  memoryId: activeMemoryId,
                  recipientName: "",
                  recipientEmail: "",
                  personalNote: "",
                  timezone: "",
                  localDate: "",
                  localTime: "09:00"
                }}
                mode="create"
                submitLabel="Schedule delivery"
                submitPendingLabel="Scheduling delivery..."
                showArchiveSelector={archives.length > 1}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
