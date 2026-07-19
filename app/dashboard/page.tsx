import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { SuccessMessage } from "@/components/SuccessMessage";
import { DesignBackdrop, HeartbeatLogoDivider, SiteLogo } from "@/components/SiteDesign";
import {
  ArchiveBuildingShell,
  ArchiveMobileScene,
  ArchiveOverlayRegion,
  ArchiveSoftHighlight
} from "@/components/archive-building/ArchiveBuildingShell";
import { regenerateLegacyActivationCodeAction } from "@/app/dashboard/actions";
import { saveProfileAction } from "@/app/dashboard/settings/actions";
import { signOutAction } from "@/app/login/actions";
import { getAccountContext, type AccountArchive } from "@/lib/account";
import {
  archiveBuildingMobileScenes,
  archiveBuildingScenes
} from "@/lib/archive-building-scenes";
import { getArchiveRelationshipLabel } from "@/lib/archive-relationships";
import { getArchiveBySlug, getLegacyInstructionByArchiveSlug, getMemoriesByArchiveSlug } from "@/lib/archive-data";
import { legacyInstructionAccessLevelLabels } from "@/lib/legacy-instructions";
import type { Memory, MemoryType } from "@/lib/types";

export const dynamic = "force-dynamic";

type ArchiveOverview = {
  archive: AccountArchive;
  archiveDetails: NonNullable<Awaited<ReturnType<typeof getArchiveBySlug>>> | null;
  memories: Memory[];
  loadFailed: boolean;
};

type DashboardActionProps = {
  description: string;
  href: string;
  label: string;
};

type MemoryBreakdownCardProps = {
  label: string;
  count: number;
};

type NextStep = {
  title: string;
  description: string;
  status: "Complete" | "Next step" | "Not started";
  href: string;
  action: string;
};

const memoryBreakdownOrder: Array<{ type: MemoryType; label: string }> = [
  { type: "photo", label: "Photos" },
  { type: "video", label: "Videos" },
  { type: "voice", label: "Voice Recordings" },
  { type: "journal", label: "Journal Entries" },
  { type: "lesson", label: "Lessons" },
  { type: "song", label: "Songs" }
];

const dashboardSideNavRegion = {
  left: 2.21,
  top: 25.88,
  width: 13.09,
  height: 67.19
};

const activeArchiveImageRegion = {
  left: 20.13,
  top: 6.05,
  width: 15.18,
  height: 26.17
};

const activeArchiveInfoRegion = {
  left: 39.22,
  top: 3.32,
  width: 20.2,
  height: 36.72
};

const shelfBookRegions = [
  { left: 61.04, top: 14.84, width: 6.06, height: 15.72 },
  { left: 68.73, top: 14.75, width: 6.12, height: 15.82 },
  { left: 76.55, top: 14.84, width: 6.12, height: 15.82 },
  { left: 83.58, top: 14.94, width: 6.12, height: 15.82 },
  { left: 90.88, top: 14.84, width: 6.06, height: 15.72 }
];

const recentMemoryRegions = [
  { left: 28.99, top: 48.73, width: 20.72, height: 7.03 },
  { left: 28.4, top: 57.32, width: 20.78, height: 7.13 },
  { left: 27.62, top: 66.02, width: 20.85, height: 7.13 },
  { left: 26.84, top: 74.22, width: 20.85, height: 7.03 }
];

const addArchiveActionRegions = [
  { left: 53.68, top: 54.59, width: 21.56, height: 8.5 },
  { left: 53.94, top: 63.48, width: 21.3, height: 10.35 },
  { left: 53.55, top: 71.78, width: 22.67, height: 10.94 }
];

const addArchiveActionsConfig: Array<{
  label: string;
  mode: string;
}> = [
  { label: "Add Voice & Sound", mode: "voice-sound" },
  { label: "Add Photos & Video", mode: "photo-video" },
  { label: "Write a Letter or Journal Entry", mode: "letter-journal" }
];

function getArchiveInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatMemoryType(type: MemoryType) {
  return memoryBreakdownOrder.find((item) => item.type === type)?.label ?? type;
}

function formatMemoryDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function getAddMemoryHref(archiveSlug: string, mode: string) {
  return `/archive/${archiveSlug}/add-memory?mode=${encodeURIComponent(mode)}`;
}

function MemoryBreakdownCard({ label, count }: MemoryBreakdownCardProps) {
  return (
    <article className="rounded-2xl border border-archive-gold/14 bg-white/[0.03] px-4 py-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-archive-gold">{label}</p>
      <p className="mt-2 font-serif text-3xl leading-none text-archive-ivory">{count.toString().padStart(2, "0")}</p>
    </article>
  );
}

function DashboardAction({ description, href, label }: DashboardActionProps) {
  return (
    <Link href={href} className="group rounded-2xl border border-archive-gold/22 bg-white/[0.04] p-5 transition hover:border-archive-gold/55 hover:bg-white/[0.065] sm:p-6">
      <p className="font-serif text-2xl leading-tight text-archive-ivory">{label}</p>
      <p className="mt-2 text-base leading-7 text-archive-ivory/62">{description}</p>
      <span className="mt-5 inline-flex text-base font-semibold text-archive-champagne transition group-hover:translate-x-1">Continue →</span>
    </Link>
  );
}

function CompactArchiveRow({ archive, memoryCount }: { archive: AccountArchive; memoryCount: number }) {
  const relationshipLabel = getArchiveRelationshipLabel(archive.relationshipToOwner);

  return (
    <article className="rounded-2xl border border-archive-gold/14 bg-white/[0.028] p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">{archive.personName}</p>
          <h3 className="mt-1 font-serif text-xl leading-tight text-archive-ivory">{archive.archiveName}</h3>
          <p className="mt-2 text-sm text-archive-ivory/52">
            {archive.memorialMode ? "Memorial" : "Living"} · {relationshipLabel} · {memoryCount} {memoryCount === 1 ? "memory" : "memories"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/archive/${archive.slug}`} className="rounded-full border border-archive-gold/28 px-3 py-2 text-xs font-semibold text-archive-champagne transition hover:border-archive-gold hover:bg-white/[0.06]">Open</Link>
          <Link href={`/archive/${archive.slug}/add-memory`} className="rounded-full border border-archive-gold/28 px-3 py-2 text-xs font-semibold text-archive-ivory/72 transition hover:border-archive-gold hover:text-archive-ivory">Add</Link>
          <Link href={`/archive/${archive.slug}/edit`} className="rounded-full border border-archive-gold/28 px-3 py-2 text-xs font-semibold text-archive-ivory/72 transition hover:border-archive-gold hover:text-archive-ivory">Edit</Link>
          <Link href={`/archive/${archive.slug}/qr`} className="rounded-full border border-archive-gold/28 px-3 py-2 text-xs font-semibold text-archive-ivory/72 transition hover:border-archive-gold hover:text-archive-ivory">QR</Link>
        </div>
      </div>
    </article>
  );
}

async function loadArchiveOverviews(archives: AccountArchive[]): Promise<ArchiveOverview[]> {
  const settled = await Promise.allSettled(
    archives.map(async (archive) => {
      const [archiveDetails, memories] = await Promise.all([getArchiveBySlug(archive.slug), getMemoriesByArchiveSlug(archive.slug)]);
      return { archive, archiveDetails, memories, loadFailed: false };
    })
  );

  return settled.map((result, index) =>
    result.status === "fulfilled"
      ? result.value
      : { archive: archives[index], archiveDetails: null, memories: [], loadFailed: true }
  );
}

type DashboardPageProps = {
  searchParams?: Promise<{
    legacyCode?: string;
    legacyCodeError?: string;
    error?: string;
    welcome?: string;
    success?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login");
  }

  const { archives, defaultArchive, user } = account;
  const hasBlankDisplayName = !account.profile?.displayName?.trim();
  const showStarterWelcome = resolvedSearchParams?.welcome === "starter";
  const showStarterProfilePrompt = showStarterWelcome && hasBlankDisplayName;
  const archiveOverviews = archives.length > 0 ? await loadArchiveOverviews(archives) : [];
  const selectedOverview = archiveOverviews.find((item) => item.archive.slug === defaultArchive?.slug) ?? null;
  const selectedArchive = selectedOverview?.archiveDetails ?? null;
  const archiveLoadFailed = archiveOverviews.some((item) => item.loadFailed);
  const legacyInstruction = defaultArchive
    ? await getLegacyInstructionByArchiveSlug(defaultArchive.slug, true).catch(() => null)
    : null;
  const passwordUpdated = resolvedSearchParams?.success === "password-updated";

  const allMemories: Memory[] = archiveOverviews.flatMap((overview) => overview.memories);
  const totalMemories = allMemories.length;
  const memoryCounts = memoryBreakdownOrder.reduce<Record<MemoryType, number>>(
    (counts, { type }) => {
      counts[type] = allMemories.filter((memory) => memory.type === type).length;
      return counts;
    },
    { photo: 0, video: 0, voice: 0, journal: 0, lesson: 0, song: 0 }
  );
  const legacyInstructionLabel = legacyInstruction ? legacyInstructionAccessLevelLabels[legacyInstruction.accessLevel] : "Not started";
  const legacyInstructionSummary = legacyInstruction
    ? legacyInstruction.accessLevel === "released"
      ? "Publicly shared. Review it whenever your wishes change."
      : "Only you can read these notes. Return whenever you are ready."
    : "Keep final wishes, practical details, and personal messages in one thoughtful place.";

  const hasArchives = archives.length > 0;
  const hasPersonalArchive = Boolean(defaultArchive);
  const livingDefaultArchive = defaultArchive && !defaultArchive.memorialMode ? defaultArchive : null;

  const sidebarArchive = archiveOverviews.find((overview) => overview.archive.personName.includes("Dustin Sigley") && overview.archiveDetails) ??
    archiveOverviews.find((overview) => overview.archive.slug === defaultArchive?.slug) ??
    archiveOverviews[0] ??
    null;
  const activeArchive = selectedArchive ?? sidebarArchive?.archiveDetails ?? defaultArchive ?? archives[0] ?? null;
  const activeArchiveOverview = archiveOverviews.find((overview) => overview.archive.slug === activeArchive?.slug) ?? selectedOverview;
  const activeArchiveDetails = activeArchiveOverview?.archiveDetails ?? (selectedArchive?.slug === activeArchive?.slug ? selectedArchive : null);
  const activeArchivePhoto = activeArchiveDetails?.profilePhotoUrl ?? null;
  const activeArchiveBio = activeArchiveDetails?.bio ?? "This archive keeps together the memories, stories, and lessons that matter most.";
  const activeArchiveId = activeArchive?.slug ?? null;
  const activeArchiveMemories = activeArchiveOverview?.archive.slug === activeArchiveId ? activeArchiveOverview.memories : [];
  const activeMemoryTypes = new Set(activeArchiveMemories.map((memory) => memory.type));
  const activeArchiveUsesDefaultLegacy = Boolean(defaultArchive && activeArchive?.slug === defaultArchive.slug);
  const progressCandidates = activeArchive
    ? [
        {
          title: "Add a photo",
          description: "Give the archive one visual anchor people can recognize immediately.",
          complete: activeMemoryTypes.has("photo"),
          href: `/archive/${activeArchive.slug}/add-memory`,
          action: "Add photo"
        },
        {
          title: "Record a voice note",
          description: "A short voice memory makes the archive feel personal and present.",
          complete: activeMemoryTypes.has("voice"),
          href: `/archive/${activeArchive.slug}/add-memory`,
          action: "Record voice note"
        },
        {
          title: "Write a journal or lesson",
          description: "Add the kind of memory that gives context, guidance, or a story behind the facts.",
          complete: activeMemoryTypes.has("journal") || activeMemoryTypes.has("lesson"),
          href: `/archive/${activeArchive.slug}/add-memory`,
          action: "Write memory"
        },
        {
          title: "Share or print the QR",
          description: activeArchive.visibility === "public" ? "The archive is public. Keep the QR ready for the people who should have it." : "Use the QR tools when you are ready to share this archive.",
          complete: activeArchive.visibility === "public",
          href: `/archive/${activeArchive.slug}/qr`,
          action: "Open QR tools"
        },
        ...(activeArchiveUsesDefaultLegacy
          ? [
              {
                title: "Add legacy instructions",
                description: "Keep practical guidance and personal wishes in one place.",
                complete: Boolean(legacyInstruction),
                href: `/archive/${activeArchive.slug}/legacy-instructions`,
                action: legacyInstruction ? "Review instructions" : "Add instructions"
              },
              ...(livingDefaultArchive
                ? [
                    {
                      title: "Keep activation ready",
                      description: livingDefaultArchive.legacyActivationCode ? "The private activation code is available when it needs to be reviewed." : "Create or review the activation path for memorial access.",
                      complete: Boolean(livingDefaultArchive.legacyActivationCode && !livingDefaultArchive.legacyCodeUsedAt),
                      href: "/activate-legacy",
                      action: "Open activation page"
                    }
                  ]
                : [])
            ]
          : [])
      ]
    : [];
  let hasAssignedNextStep = false;
  const nextSteps: NextStep[] = progressCandidates.map(({ complete, ...step }) => {
    if (complete) {
      return { ...step, status: "Complete" };
    }

    if (!hasAssignedNextStep) {
      hasAssignedNextStep = true;
      return { ...step, status: "Next step" };
    }

    return { ...step, status: "Not started" };
  });
  const completedNextSteps = nextSteps.filter((step) => step.status === "Complete").length;
  const otherArchiveOverviews = archiveOverviews.filter((overview) => overview.archive.slug !== activeArchiveId);
  const sidebarArchiveSlug = sidebarArchive?.archiveDetails?.slug ?? sidebarArchive?.archive.slug ?? null;
  const sidebarArchiveName = sidebarArchive?.archiveDetails?.archiveName ?? sidebarArchive?.archive.archiveName ?? null;
  const sidebarArchivePersonName = sidebarArchive?.archiveDetails?.personName ?? sidebarArchive?.archive.personName ?? null;
  const activeMemoryCounts = memoryBreakdownOrder.reduce<Record<MemoryType, number>>(
    (counts, { type }) => {
      counts[type] = activeArchiveMemories.filter((memory) => memory.type === type).length;
      return counts;
    },
    { photo: 0, video: 0, voice: 0, journal: 0, lesson: 0, song: 0 }
  );
  const archiveStatItems = [
    ["Total", activeArchiveMemories.length],
    ["Voice", activeMemoryCounts.voice],
    ["Photos", activeMemoryCounts.photo],
    ["Videos", activeMemoryCounts.video],
    ["Journals", activeMemoryCounts.journal + activeMemoryCounts.lesson],
    ["Songs", activeMemoryCounts.song]
  ];
  const shelfArchives = archiveOverviews.slice(0, 4);
  const addArchiveActions = activeArchive
    ? addArchiveActionsConfig.map((action) => ({
        label: action.label,
        href: getAddMemoryHref(activeArchive.slug, action.mode)
      }))
    : [];

  return (
    <>
      <ArchiveBuildingShell
        image={{ ...archiveBuildingScenes.myArchives, priority: true }}
        active="dashboard"
        archiveSlug={sidebarArchiveSlug}
        archiveName={sidebarArchiveName}
        archivePersonName={sidebarArchivePersonName}
        showArchiveActions={Boolean(sidebarArchiveSlug)}
        navRegion={dashboardSideNavRegion}
        sceneLabel="My Archives archive-building scene"
      >
        <ArchiveOverlayRegion
          region={activeArchiveImageRegion}
          ariaLabel="Active archive image"
        >
          {activeArchive ? (
            <Link
              href={`/archive/${activeArchive.slug}`}
              className="group relative block h-full w-full overflow-hidden rounded-[0.2rem] focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
              aria-label={`Open ${activeArchive.archiveName}`}
            >
              {activeArchivePhoto ? (
                <Image
                  src={activeArchivePhoto}
                  alt={activeArchive.personName}
                  fill
                  priority
                  className="object-cover object-[center_25%]"
                  sizes="16vw"
                />
              ) : (
                <div className="grid h-full place-items-center bg-black/26 text-center">
                  <p className="font-serif text-4xl text-archive-gold">
                    {getArchiveInitials(activeArchive.personName)}
                  </p>
                </div>
              )}
              <ArchiveSoftHighlight className="bg-[radial-gradient(circle_at_center,rgba(232,207,136,0.46),rgba(232,207,136,0.2)_44%,transparent_78%)]" />
            </Link>
          ) : (
            <div className="grid h-full place-items-center bg-black/26 text-center">
              <p className="font-serif text-4xl text-archive-gold">TLA</p>
            </div>
          )}
        </ArchiveOverlayRegion>

        <ArchiveOverlayRegion
          region={activeArchiveInfoRegion}
          className="p-[clamp(1rem,1.55vw,1.75rem)] text-archive-ivory"
          ariaLabel="Active archive information and statistics"
        >
          <div className="flex h-full flex-col justify-center">
            <h1 className="line-clamp-2 font-serif text-[clamp(1.45rem,2.05vw,2.45rem)] leading-tight text-archive-ivory drop-shadow-[0_3px_14px_rgba(0,0,0,0.42)]">
              {activeArchive?.archiveName ?? "Create Your Archive"}
            </h1>
            {activeArchive ? (
              <p className="mt-2 truncate text-[clamp(0.64rem,0.78vw,0.88rem)] font-semibold uppercase tracking-[0.14em] text-archive-gold/82">
                {activeArchive.personName} · {activeArchive.memorialMode ? "Memorial" : "Living"}
              </p>
            ) : null}
            <div className="mt-[clamp(0.85rem,1.25vw,1.35rem)] grid grid-cols-3 gap-x-[clamp(0.9rem,1.35vw,1.6rem)] gap-y-[clamp(0.65rem,0.9vw,1rem)]">
              {archiveStatItems.map(([label, count]) => (
                <div key={label} className="min-w-0">
                  <p className="font-serif text-[clamp(1.25rem,1.7vw,1.95rem)] leading-none text-archive-gold drop-shadow-[0_2px_10px_rgba(0,0,0,0.32)]">
                    {String(count).padStart(2, "0")}
                  </p>
                  <p className="mt-1.5 truncate text-[clamp(0.58rem,0.68vw,0.76rem)] font-semibold uppercase tracking-[0.12em] text-archive-ivory/72">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ArchiveOverlayRegion>

        {shelfBookRegions.map((region, index) => {
          const overview = shelfArchives[index];
          const isCreateBook = index === 4;
          const href = isCreateBook || !overview ? "/create" : `/archive/${overview.archive.slug}`;
          const label = isCreateBook || !overview ? "Create Archive" : overview.archive.archiveName;
          const ariaLabel = isCreateBook || !overview ? "Create a new archive" : `Open ${overview.archive.archiveName}`;

          return (
            <ArchiveOverlayRegion key={`${label}-${index}`} region={region} ariaLabel={ariaLabel}>
              <Link
                href={href}
                aria-label={ariaLabel}
                className="group relative flex h-full w-full items-center justify-center rounded-[0.45rem] px-1 py-2 text-center focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(232,207,136,0.5),rgba(232,207,136,0.22)_44%,transparent_78%)] opacity-0 blur-[4px] brightness-125 mix-blend-screen transition group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                />
                <span
                  title={label}
                  className="relative line-clamp-3 max-h-full px-0.5 font-serif text-[clamp(0.68rem,0.84vw,0.95rem)] leading-tight text-archive-ivory drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]"
                >
                  {label}
                </span>
              </Link>
            </ArchiveOverlayRegion>
          );
        })}

        {recentMemoryRegions.map((region, index) => {
          const memory = activeArchiveMemories[index];
          if (!memory || !activeArchive) {
            return null;
          }

          return (
            <ArchiveOverlayRegion key={memory.id} region={region} ariaLabel={`Recent memory ${index + 1}`}>
              <Link
                href={`/archive/${activeArchive.slug}/memories/${memory.id}`}
                aria-label={`Open memory: ${memory.title}`}
                className="group relative flex h-full w-full flex-col justify-center rounded-sm border-b border-[#7c5524]/22 px-[clamp(0.75rem,1.1vw,1.15rem)] text-[#2f2418] transition hover:bg-[#fff1cc]/18 hover:text-[#6e511f] focus:outline-none focus:ring-2 focus:ring-archive-gold/60"
              >
                <ArchiveSoftHighlight className="bg-[radial-gradient(circle_at_center,rgba(198,139,45,0.38),rgba(198,139,45,0.16)_45%,transparent_80%)]" />
                <span className="relative block truncate font-serif text-[clamp(0.88rem,1.08vw,1.18rem)] leading-tight">
                  {memory.title}
                </span>
                <span className="relative mt-1 block truncate text-[clamp(0.56rem,0.68vw,0.76rem)] uppercase tracking-[0.12em] text-[#6f5732]/78">
                  {formatMemoryType(memory.type)} {memory.date ? `· ${formatMemoryDate(memory.date)}` : ""}
                </span>
              </Link>
            </ArchiveOverlayRegion>
          );
        })}

        {addArchiveActions.map((action, index) => {
          const region = addArchiveActionRegions[index];
          if (!region) {
            return null;
          }

          return (
            <ArchiveOverlayRegion key={action.label} region={region} ariaLabel={action.label}>
              <Link
                href={action.href}
                aria-label={action.label}
                className="group relative block h-full w-full rounded-full focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
              >
                <ArchiveSoftHighlight className="rounded-full bg-[radial-gradient(circle_at_center,rgba(232,207,136,0.56),rgba(232,207,136,0.24)_46%,transparent_80%)]" />
              </Link>
            </ArchiveOverlayRegion>
          );
        })}
      </ArchiveBuildingShell>

      <ArchiveMobileScene
        image={{ ...archiveBuildingMobileScenes.myArchives, priority: true }}
        sceneLabel="My Archives mobile archive-building scene"
        title="MY ARCHIVES"
        subtitle="Every story you preserve becomes part of what remains."
        className="px-4 pb-5 pt-5 sm:px-6 sm:pb-7 sm:pt-7"
      >
        <nav
          aria-label="Mobile Archive Building navigation"
          className="relative z-40 flex items-center justify-between rounded-2xl border border-archive-gold/20 bg-black/58 px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.48)] backdrop-blur-md"
        >
          <Link
            href="/"
            className="font-serif text-lg tracking-wide text-archive-ivory focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
          >
            The Life Archive
          </Link>

          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-full border border-archive-gold/35 bg-black/48 px-4 py-2 text-sm font-semibold text-archive-champagne transition hover:border-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/70">
              Menu
            </summary>

            <div className="absolute right-0 top-[calc(100%+0.65rem)] grid max-h-[72vh] min-w-[17rem] overflow-y-auto rounded-2xl border border-archive-gold/22 bg-[#090806]/97 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.72)] backdrop-blur-xl">
              <p className="px-3 pb-1 pt-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-archive-gold/72">
                Archive
              </p>

              <Link
                href="/dashboard"
                aria-current="page"
                className="rounded-xl bg-archive-gold/8 px-4 py-3 text-sm font-semibold text-archive-gold hover:bg-white/[0.06]"
              >
                My Archives
              </Link>

              <Link
                href={activeArchive ? `/archive/${activeArchive.slug}/add-memory?mode=voice-sound` : "/create"}
                className="rounded-xl px-4 py-3 text-sm text-archive-ivory/82 hover:bg-white/[0.06] hover:text-archive-gold"
              >
                Add Voice & Sound
              </Link>

              <Link
                href={activeArchive ? `/archive/${activeArchive.slug}/add-memory?mode=photo-video` : "/create"}
                className="rounded-xl px-4 py-3 text-sm text-archive-ivory/82 hover:bg-white/[0.06] hover:text-archive-gold"
              >
                Add Photos & Video
              </Link>

              <Link
                href={activeArchive ? `/archive/${activeArchive.slug}/add-memory?mode=letter-journal` : "/create"}
                className="rounded-xl px-4 py-3 text-sm text-archive-ivory/82 hover:bg-white/[0.06] hover:text-archive-gold"
              >
                Write a Letter or Journal
              </Link>

              <div className="my-2 h-px bg-[linear-gradient(90deg,transparent,rgba(202,164,92,0.38),transparent)]" />

              <p className="px-3 pb-1 pt-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-archive-gold/72">
                Preserve
              </p>

              <Link
                href="/dashboard/time-capsules"
                className="rounded-xl px-4 py-3 text-sm text-archive-ivory/82 hover:bg-white/[0.06] hover:text-archive-gold"
              >
                Time Capsules
              </Link>

              <Link
                href="/keepsakes"
                className="rounded-xl px-4 py-3 text-sm text-archive-ivory/82 hover:bg-white/[0.06] hover:text-archive-gold"
              >
                Keepsake Store
              </Link>

              {livingDefaultArchive ? (
                <Link
                  href="/member-card"
                  className="rounded-xl px-4 py-3 text-sm text-archive-ivory/82 hover:bg-white/[0.06] hover:text-archive-gold"
                >
                  Member Card
                </Link>
              ) : null}

              <Link
                href={activeArchive ? `/archive/${activeArchive.slug}/qr` : "/create"}
                className="rounded-xl px-4 py-3 text-sm text-archive-ivory/82 hover:bg-white/[0.06] hover:text-archive-gold"
              >
                QR Code
              </Link>

              <div className="my-2 h-px bg-[linear-gradient(90deg,transparent,rgba(202,164,92,0.38),transparent)]" />

              <p className="px-3 pb-1 pt-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-archive-gold/72">
                Account
              </p>

              <Link
                href="/dashboard/settings"
                className="rounded-xl px-4 py-3 text-sm text-archive-ivory/82 hover:bg-white/[0.06] hover:text-archive-gold"
              >
                Settings
              </Link>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full rounded-xl px-4 py-3 text-left text-sm text-archive-ivory/68 hover:bg-white/[0.06] hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </details>
        </nav>

        {activeArchive ? (
          <Link
            href={`/archive/${activeArchive.slug}`}
            aria-label={`Open ${activeArchive.archiveName}`}
            className="absolute left-1/2 top-[38%] z-20 -translate-x-1/2 rounded-full border border-archive-gold/24 bg-black/42 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-archive-champagne shadow-[0_12px_40px_rgba(0,0,0,0.42)] backdrop-blur-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-archive-gold/80"
          >
            Enter Archive
          </Link>
        ) : null}

        <div className="relative z-30 flex min-h-[calc(100vh-6.25rem)] items-end pb-1">
          <section
            aria-label="Active archive controls"
            className="w-full overflow-hidden rounded-[1.65rem] border border-archive-gold/24 bg-black/68 shadow-[0_26px_80px_rgba(0,0,0,0.66)] backdrop-blur-md"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.64rem] font-bold uppercase tracking-[0.22em] text-archive-gold">
                    Active Archive
                  </p>

                  <h1 className="mt-2 line-clamp-2 font-serif text-[1.45rem] leading-tight text-archive-ivory">
                    {activeArchive?.archiveName ?? "Create Your Archive"}
                  </h1>

                  {activeArchive ? (
                    <p className="mt-1 truncate text-xs text-archive-ivory/62">
                      {activeArchive.personName} · {activeArchive.memorialMode ? "Memorial Archive" : "Living Archive"}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm leading-6 text-archive-ivory/62">
                      Begin preserving the stories, voice, and memories that matter.
                    </p>
                  )}
                </div>

                <Link
                  href="/create"
                  className="shrink-0 rounded-full border border-archive-gold/28 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-archive-champagne transition hover:border-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
                >
                  New
                </Link>
              </div>

              {activeArchive ? (
                <div
                  aria-label="Archive memory statistics"
                  className="mt-4 grid grid-cols-6 gap-1 border-y border-archive-gold/14 py-3"
                >
                  {archiveStatItems.map(([label, count]) => (
                    <div key={label} className="min-w-0 text-center">
                      <p className="font-serif text-base leading-none text-archive-gold">
                        {String(count).padStart(2, "0")}
                      </p>
                      <p className="mt-1 truncate text-[0.5rem] font-bold uppercase tracking-[0.06em] text-archive-ivory/48">
                        {label === "Journals" ? "Writing" : label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href={activeArchive ? `/archive/${activeArchive.slug}` : "/create"}
                  className="flex min-h-12 items-center justify-center rounded-full bg-archive-gold px-4 text-center text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne focus:outline-none focus:ring-2 focus:ring-archive-champagne/80"
                >
                  {activeArchive ? "Open Archive" : "Create Archive"}
                </Link>

                <Link
                  href={activeArchive ? `/archive/${activeArchive.slug}/add-memory` : "/create"}
                  className="flex min-h-12 items-center justify-center rounded-full border border-archive-gold/38 bg-black/42 px-4 text-center text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
                >
                  Add Memory
                </Link>
              </div>
            </div>

            <details className="border-t border-archive-gold/14">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-sm font-semibold text-archive-champagne focus:outline-none focus:ring-2 focus:ring-inset focus:ring-archive-gold/70">
                <span>Preserve Something</span>
                <span aria-hidden="true" className="text-archive-gold/70">+</span>
              </summary>

              <div className="grid grid-cols-2 gap-2 border-t border-archive-gold/10 bg-black/24 p-3">
                <Link
                  href={activeArchive ? `/archive/${activeArchive.slug}/add-memory?mode=voice-sound` : "/create"}
                  className="flex min-h-12 items-center justify-center rounded-xl border border-archive-gold/18 bg-white/[0.035] px-3 text-center text-xs font-semibold text-archive-ivory transition hover:border-archive-gold/55 hover:text-archive-gold"
                >
                  Voice & Sound
                </Link>

                <Link
                  href={activeArchive ? `/archive/${activeArchive.slug}/add-memory?mode=photo-video` : "/create"}
                  className="flex min-h-12 items-center justify-center rounded-xl border border-archive-gold/18 bg-white/[0.035] px-3 text-center text-xs font-semibold text-archive-ivory transition hover:border-archive-gold/55 hover:text-archive-gold"
                >
                  Photos & Video
                </Link>

                <Link
                  href={activeArchive ? `/archive/${activeArchive.slug}/add-memory?mode=letter-journal` : "/create"}
                  className="flex min-h-12 items-center justify-center rounded-xl border border-archive-gold/18 bg-white/[0.035] px-3 text-center text-xs font-semibold text-archive-ivory transition hover:border-archive-gold/55 hover:text-archive-gold"
                >
                  Letter or Journal
                </Link>

                <Link
                  href="/dashboard/time-capsules/new"
                  className="flex min-h-12 items-center justify-center rounded-xl border border-archive-gold/18 bg-white/[0.035] px-3 text-center text-xs font-semibold text-archive-ivory transition hover:border-archive-gold/55 hover:text-archive-gold"
                >
                  Time Capsule
                </Link>
              </div>
            </details>

            <details className="border-t border-archive-gold/14">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-sm font-semibold text-archive-champagne focus:outline-none focus:ring-2 focus:ring-inset focus:ring-archive-gold/70">
                <span>Recent Memories</span>
                <span className="text-xs font-normal text-archive-ivory/42">
                  {activeArchiveMemories.length}
                </span>
              </summary>

              <div className="border-t border-archive-gold/10 bg-black/24 px-3 py-2">
                {activeArchive && activeArchiveMemories.length > 0 ? (
                  <div className="grid">
                    {activeArchiveMemories.slice(0, 4).map((memory) => (
                      <Link
                        key={memory.id}
                        href={`/archive/${activeArchive.slug}/memories/${memory.id}`}
                        className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-archive-gold/10 px-2 py-2 last:border-b-0 hover:bg-white/[0.035] focus:outline-none focus:ring-2 focus:ring-archive-gold/60"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-serif text-sm text-archive-ivory">
                            {memory.title}
                          </span>
                          <span className="mt-1 block truncate text-[0.62rem] uppercase tracking-[0.1em] text-archive-ivory/46">
                            {formatMemoryType(memory.type)}
                            {memory.date ? ` · ${formatMemoryDate(memory.date)}` : ""}
                          </span>
                        </span>

                        <span aria-hidden="true" className="text-archive-gold/56">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-5 text-center">
                    <p className="font-serif text-lg text-archive-ivory">
                      The first page is waiting.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-archive-ivory/52">
                      Preserve a voice, photograph, video, letter, or lesson.
                    </p>
                    <Link
                      href={activeArchive ? `/archive/${activeArchive.slug}/add-memory` : "/create"}
                      className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-archive-gold/30 px-5 text-sm font-semibold text-archive-champagne"
                    >
                      Preserve the First Memory
                    </Link>
                  </div>
                )}
              </div>
            </details>

            {otherArchiveOverviews.length > 0 ? (
              <details className="border-t border-archive-gold/14">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-sm font-semibold text-archive-champagne focus:outline-none focus:ring-2 focus:ring-inset focus:ring-archive-gold/70">
                  <span>Switch Archive</span>
                  <span className="text-xs font-normal text-archive-ivory/42">
                    {otherArchiveOverviews.length}
                  </span>
                </summary>

                <div className="grid gap-1 border-t border-archive-gold/10 bg-black/24 p-3">
                  {otherArchiveOverviews.map((overview) => (
                    <Link
                      key={overview.archive.slug}
                      href={`/dashboard?archive=${encodeURIComponent(overview.archive.slug)}`}
                      className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/[0.045] focus:outline-none focus:ring-2 focus:ring-archive-gold/60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-serif text-sm text-archive-ivory">
                          {overview.archive.archiveName}
                        </span>
                        <span className="mt-1 block truncate text-[0.62rem] uppercase tracking-[0.08em] text-archive-ivory/46">
                          {overview.archive.personName} · {overview.archive.memorialMode ? "Memorial" : "Living"}
                        </span>
                      </span>

                      <span className="shrink-0 text-xs text-archive-gold/68">
                        {overview.memories.length}
                      </span>
                    </Link>
                  ))}
                </div>
              </details>
            ) : null}

            <div className="border-t border-archive-gold/14 p-3">
              <Link
                href="/create"
                className="flex min-h-11 items-center justify-center rounded-xl text-sm font-semibold text-archive-ivory/58 transition hover:bg-white/[0.035] hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/60"
              >
                Create Another Archive
              </Link>
            </div>
          </section>
        </div>

      <div className="hidden">
        <AppSidebar active="dashboard" archiveSlug={sidebarArchiveSlug} archiveName={sidebarArchiveName} archivePersonName={sidebarArchivePersonName} showArchiveActions={Boolean(sidebarArchiveSlug)} />

        <div className="min-w-0">
            <nav className="relative z-10 flex flex-col gap-4 border-b border-archive-gold/20 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:hidden">
              <Link href="/" className="block"><SiteLogo width={240} height={60} /></Link>
              <div className="flex flex-wrap items-center gap-4 sm:justify-end sm:gap-6">
                <Link href="/keepsakes" className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base">Keepsakes</Link>
                <Link href="/dashboard/settings" className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base">Profile Settings</Link>
                <Link href="/dashboard/time-capsules" className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base">Time Capsules</Link>
                {livingDefaultArchive ? <Link href="/member-card" className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base">Member Card</Link> : null}
                <form action={signOutAction}><button type="submit" className="rounded-full border border-archive-gold/35 px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/5 sm:text-base">Sign Out</button></form>
              </div>
            </nav>

            <div className="pb-20 pt-10 sm:pt-14">
              {passwordUpdated ? <SuccessMessage eyebrow="Password updated" message="Your new password is active." /> : null}
              {resolvedSearchParams?.error ? (
                <p className="mb-8 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm leading-6 text-red-100">
                  {resolvedSearchParams.error}
                </p>
              ) : null}
              {showStarterWelcome ? <SuccessMessage eyebrow="Starter archive ready" message="Your first memory is saved. Check your email for the secure link to your archive." /> : null}
              {resolvedSearchParams?.welcome === "back" ? <SuccessMessage eyebrow="Welcome back" message="Your archives are ready whenever you are." /> : null}
              {resolvedSearchParams?.legacyCode === "regenerated" ? <SuccessMessage eyebrow="Legacy code updated" message="Your previous Legacy Activation Code was replaced. Use the new code shown in your dashboard and Member Card." /> : null}

              <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end lg:gap-10">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-archive-gold">Dashboard</p>
                  <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-archive-ivory sm:text-6xl">Archive command center</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-archive-ivory/62 sm:text-lg sm:leading-8">
                    Open the active archive, add what matters next, and keep legacy details within reach.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full border border-archive-gold/18 bg-white/[0.03] px-3 py-1.5 font-semibold uppercase tracking-[0.14em] text-archive-gold">
                    {user.displayName}
                  </span>
                  {hasArchives ? (
                    <Link href="/create" className="rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne">
                      Create Archive
                    </Link>
                  ) : null}
                  <Link href="/dashboard/time-capsules" className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">
                    Time Capsules
                  </Link>
                  <Link href="/dashboard/settings" className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">
                    Settings
                  </Link>
                </div>
              </header>

              {showStarterProfilePrompt ? (
                <section className="mt-8 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
                  <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div className="max-w-2xl">
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">Starter archive</p>
                      <h2 className="mt-2 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">What should we call you?</h2>
                      <p className="mt-3 text-base leading-7 text-archive-ivory/62 sm:text-lg sm:leading-8">This name stays inside your account. You can skip it and fill it in later from Profile Settings.</p>
                    </div>
                    <form action={saveProfileAction} className="grid gap-3 sm:min-w-[28rem] sm:grid-cols-[1fr_auto] sm:items-end">
                      <input type="hidden" name="next" value="/dashboard?welcome=starter" />
                      <label className="grid gap-2 sm:col-span-1">
                        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-archive-gold">Display name</span>
                        <input
                          name="displayName"
                          defaultValue={account.profile?.displayName ?? ""}
                          maxLength={60}
                          placeholder="What should we call you?"
                          className="rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-base text-archive-ivory outline-none transition placeholder:text-archive-ivory/36 focus:border-archive-gold"
                        />
                      </label>
                      <button type="submit" className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne">
                        Save My Name
                      </button>
                    </form>
                  </div>
                </section>
              ) : null}

            {activeArchive ? (
              <section className="mt-8 overflow-hidden rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] shadow-luxury">
                <div className="grid gap-0 lg:grid-cols-[minmax(18rem,0.42fr)_minmax(0,1fr)]">
                  <div className="relative min-h-[18rem]">
                    {activeArchivePhoto ? (
                      <Image src={activeArchivePhoto} alt={activeArchive.personName} fill priority className="object-cover object-[center_25%]" sizes="(min-width: 1024px) 28rem, 100vw" />
                    ) : (
                      <div className="flex h-full items-end bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(198,161,91,0.16))] p-6">
                        <div className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-archive-gold">{getArchiveInitials(activeArchive.personName)}</p>
                          <p className="mt-2 font-serif text-2xl">{activeArchive.personName}</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-archive-obsidian/82 via-archive-obsidian/24 to-transparent" />
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">Active archive</p>
                        <h2 className="mt-2 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">{activeArchive.archiveName}</h2>
                        <p className="mt-2 text-sm uppercase tracking-[0.16em] text-archive-ivory/52">{activeArchive.personName}</p>
                      </div>
                      <span className="rounded-full border border-archive-gold/24 bg-archive-gold/10 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-archive-champagne">
                        {activeArchive.visibility === "public" ? "Public" : "Private"} · {activeArchive.memorialMode ? "Memorial" : "Living"}
                      </span>
                    </div>
                    <p className="mt-5 max-w-3xl text-sm leading-7 text-archive-ivory/62">{activeArchiveBio}</p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <Link href={`/archive/${activeArchive.slug}/add-memory`} className="rounded-2xl bg-archive-gold px-5 py-4 text-sm font-bold uppercase tracking-[0.14em] text-archive-obsidian transition hover:bg-archive-champagne">Add Memory</Link>
                      <Link href={`/archive/${activeArchive.slug}`} className="rounded-2xl border border-archive-gold/24 bg-white/[0.04] px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">Open Archive</Link>
                      <Link href={`/archive/${activeArchive.slug}/qr`} className="rounded-2xl border border-archive-gold/24 bg-white/[0.04] px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">Share / QR</Link>
                      {activeArchive.memorialMode ? (
                        <Link href={`/archive/${activeArchive.slug}/edit`} className="rounded-2xl border border-archive-gold/24 bg-white/[0.04] px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">Edit Archive</Link>
                      ) : (
                        <Link href="/member-card" className="rounded-2xl border border-archive-gold/24 bg-white/[0.04] px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">Member Card</Link>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <Link href={`/archive/${activeArchive.slug}/memories`} className="font-semibold text-archive-champagne underline-offset-4 hover:underline">View all memories</Link>
                      <Link href={`/archive/${activeArchive.slug}/edit`} className="font-semibold text-archive-ivory/62 underline-offset-4 hover:text-archive-champagne hover:underline">Edit archive details</Link>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="mt-8 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
                <h2 className="font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">Create the archive that begins the story.</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-archive-ivory/62">Start with one archive for yourself or for someone you love. Then add stories, photos, voice notes, and legacy details.</p>
                <div className="mt-6"><DashboardAction href="/create" label="Create an Archive" description="Build the place where a life can be remembered, shared, and carried forward." /></div>
              </section>
            )}

            {hasArchives ? (
              <>
                <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <MemoryBreakdownCard label="Total Memories" count={totalMemories} />
                  <MemoryBreakdownCard label="Photos" count={memoryCounts.photo} />
                  <MemoryBreakdownCard label="Voice Notes" count={memoryCounts.voice} />
                  <MemoryBreakdownCard label="Journals" count={memoryCounts.journal} />
                  <article className="rounded-2xl border border-archive-gold/14 bg-white/[0.03] px-4 py-4">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-archive-gold">Archive Status</p>
                    <p className="mt-2 font-serif text-2xl leading-none text-archive-ivory">{activeArchive?.visibility === "public" ? "Public" : "Private"}</p>
                  </article>
                </section>

                <HeartbeatLogoDivider />

                {activeArchive ? (
                  <section className="rounded-[2rem] border border-archive-gold/16 bg-white/[0.032] p-6 shadow-luxury sm:p-8">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                      <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-archive-gold">Build your archive</p>
                        <h2 className="mt-2 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">What to add next</h2>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-archive-ivory/62">
                          A focused checklist based on what this archive already contains. Complete the essentials first, then keep adding in your own rhythm.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-archive-gold/16 bg-archive-obsidian/42 px-5 py-4 text-left lg:min-w-[13rem]">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-archive-gold">Progress</p>
                        <p className="mt-2 font-serif text-3xl text-archive-ivory">{completedNextSteps}/{nextSteps.length}</p>
                        <p className="mt-1 text-sm text-archive-ivory/54">essentials complete</p>
                      </div>
                    </div>

                    <div className="mt-7 grid gap-3 lg:grid-cols-2">
                      {nextSteps.map((step) => (
                        <article key={step.title} className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/38 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-serif text-xl leading-tight text-archive-ivory">{step.title}</p>
                              <p className="mt-2 text-sm leading-6 text-archive-ivory/58">{step.description}</p>
                            </div>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                                step.status === "Complete"
                                  ? "border-archive-gold/20 bg-archive-gold/10 text-archive-champagne"
                                  : step.status === "Next step"
                                    ? "border-archive-gold/34 bg-white/[0.055] text-archive-ivory"
                                    : "border-white/10 bg-white/[0.025] text-archive-ivory/48"
                              }`}
                            >
                              {step.status}
                            </span>
                          </div>
                          <Link href={step.href} className="mt-4 inline-flex text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline">
                            {step.action} →
                          </Link>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}

                {defaultArchive ? (
                  <>
                    <HeartbeatLogoDivider className="py-8 sm:py-10" />

                    <section id="legacy-status" className="rounded-[2rem] border border-archive-gold/14 bg-white/[0.026] p-6 sm:p-7">
                      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                        <div className="max-w-3xl">
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-archive-gold">Legacy status</p>
                          <h2 className="mt-2 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">Keep the important details ready</h2>
                          <p className="mt-3 max-w-2xl text-sm leading-7 text-archive-ivory/58">
                            Legacy tools stay available without becoming the center of the dashboard.
                          </p>
                        </div>
                        <Link href={`/archive/${defaultArchive.slug}/legacy-instructions`} className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]">
                          {legacyInstruction ? "Manage Legacy" : "Add Legacy Instructions"}
                        </Link>
                      </div>

                      <div className="mt-6 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/45 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-archive-ivory">Legacy Instructions</p>
                            <span className="rounded-full border border-archive-gold/24 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-archive-champagne">{legacyInstructionLabel}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-archive-ivory/56">{legacyInstructionSummary}</p>
                          <Link href={`/archive/${defaultArchive.slug}/legacy-instructions`} className="mt-3 inline-flex text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline">
                            {legacyInstruction ? "Manage instructions" : "Write instructions"}
                          </Link>
                        </div>

                        {livingDefaultArchive?.legacyActivationCode ? (
                          <div className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/45 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-archive-ivory">Activation Code</p>
                              <span className="rounded-full border border-archive-gold/24 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-archive-champagne">{livingDefaultArchive.legacyCodeUsedAt ? "Used" : "Ready"}</span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-archive-ivory/56">Kept private for memorial activation if it is ever needed.</p>
                            <details className="mt-3 rounded-xl border border-archive-gold/14 bg-black/20 p-3">
                              <summary className="cursor-pointer text-sm font-semibold text-archive-champagne">View activation code</summary>
                              <p className="mt-3 break-all font-mono text-base font-bold tracking-[0.12em] text-archive-ivory">{livingDefaultArchive.legacyActivationCode}</p>
                              <form action={regenerateLegacyActivationCodeAction} className="mt-3">
                                <input type="hidden" name="archiveSlug" value={livingDefaultArchive.slug} />
                                <button type="submit" className="text-sm font-semibold text-archive-ivory/72 underline-offset-4 hover:text-archive-champagne hover:underline">Regenerate code</button>
                              </form>
                            </details>
                            <Link href="/activate-legacy" className="mt-3 inline-flex text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline">Open activation page</Link>
                          </div>
                        ) : null}
                      </div>
                    </section>
                  </>
                ) : null}

                {otherArchiveOverviews.length > 0 ? (
                  <section className="mt-12">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">Other archives</p>
                        <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Available when you need them</h2>
                      </div>
                      <Link href="/create" className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline">Create another archive →</Link>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {otherArchiveOverviews.map((overview) => (
                        <CompactArchiveRow key={overview.archive.slug} archive={overview.archive} memoryCount={overview.memories.length} />
                      ))}
                    </div>
                  </section>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
      </ArchiveMobileScene>
    </>
  );
}
