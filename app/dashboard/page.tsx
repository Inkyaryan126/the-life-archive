import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileArchiveHeader } from "@/components/archive-building/MobileArchiveHeader";
import { SuccessMessage } from "@/components/SuccessMessage";
import { DesignBackdrop, HeartbeatLogoDivider, SiteLogo } from "@/components/SiteDesign";
import {
  ArchiveBuildingShell,
  ArchiveOverlayRegion,
  ArchiveSoftHighlight
} from "@/components/archive-building/ArchiveBuildingShell";
import { getAccountContext, type AccountArchive } from "@/lib/account";
import { archiveBuildingScenes } from "@/lib/archive-building-scenes";
import { getArchiveRelationshipLabel } from "@/lib/archive-relationships";
import { getArchiveBySlug, getLegacyInstructionByArchiveSlug, getMemoriesByArchiveSlug } from "@/lib/archive-data";
import { legacyInstructionAccessLevelLabels } from "@/lib/legacy-instructions";
import { DashboardProloguePart3Container } from "@/components/dashboard/DashboardProloguePart3Container";
import { MobileDashboard } from "@/components/dashboard/MobileDashboard";
import { getArchiveHeroImageStyle } from "@/lib/archive-hero-image";
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
  left: 1.6287,
  top: 21.6797,
  width: 13.8762,
  height: 71.4844
};

const activeArchiveImageRegion = {
  left: 19.8697,
  top: 6.543,
  width: 15.5049,
  height: 28.0273
};

const activeArchiveInfoRegion = {
  left: 38.7622,
  top: 2.6367,
  width: 18.3062,
  height: 43.0664
};

const finalWishesRegion = {
  left: 85.0163,
  top: 73.5352,
  width: 14.5277,
  height: 21.6797
};

const shelfBookRegions = [
  { left: 61.0423, top: 14.9414, width: 5.8632, height: 18.457 },
  { left: 68.8599, top: 14.9414, width: 5.9283, height: 18.5547 },
  { left: 76.6124, top: 15.0391, width: 5.9935, height: 18.5547 },
  { left: 83.9739, top: 14.9414, width: 5.9283, height: 18.5547 },
  { left: 90.9446, top: 14.8438, width: 5.9935, height: 18.6523 }
];

const recentMemoryRegions = [
  { left: 29.9023, top: 53.125, width: 19.6091, height: 8.8867 },
  { left: 29.1205, top: 62.9883, width: 19.6743, height: 8.9844 },
  { left: 27.7524, top: 72.9492, width: 19.6743, height: 8.9844 },
  { left: 26.5147, top: 82.7148, width: 19.7394, height: 8.9844 }
];

const addArchiveActionRegions = [
  { left: 53.2899, top: 58.2031, width: 22.671, height: 10.2539 },
  { left: 53.2899, top: 68.6523, width: 22.671, height: 10.0586 },
  { left: 53.1596, top: 78.9062, width: 22.7362, height: 10.8398 }
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
    archive?: string;
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
  const requestedSlug = resolvedSearchParams?.archive?.trim();
  const archiveOverviews = archives.length > 0 ? await loadArchiveOverviews(archives) : [];
  const selectedOverview =
    (requestedSlug ? archiveOverviews.find((item) => item.archive.slug === requestedSlug) : null) ??
    archiveOverviews.find((item) => item.archive.slug === defaultArchive?.slug) ??
    archiveOverviews[0] ??
    null;
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

  const sidebarArchive = selectedOverview ??
    archiveOverviews.find((overview) => overview.archive.personName.includes("Dustin Sigley") && overview.archiveDetails) ??
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
      <DashboardProloguePart3Container eligible={account.prologuePart3Eligible} />
      <MobileDashboard
        displayName={account.user?.displayName ?? "Archive Member"}
        activeArchive={activeArchive}
        memories={activeArchiveMemories}
        totalArchivesCount={archives.length}
      />
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
                  className="object-cover"
                  style={getArchiveHeroImageStyle(
                    activeArchiveDetails?.heroImagePositionX,
                    activeArchiveDetails?.heroImagePositionY,
                    activeArchiveDetails?.heroImageZoom
                  )}
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
          const isActive = Boolean(overview && activeArchiveId && overview.archive.slug === activeArchiveId);
          const href = isCreateBook || !overview
            ? "/create"
            : `/dashboard?archive=${encodeURIComponent(overview.archive.slug)}`;
          const label = isCreateBook || !overview ? "Create Archive" : overview.archive.archiveName;
          const ariaLabel = isCreateBook || !overview ? "Create a new archive" : `Select ${overview.archive.archiveName}`;

          return (
            <ArchiveOverlayRegion key={`${label}-${index}`} region={region} ariaLabel={ariaLabel}>
              <Link
                href={href}
                aria-label={ariaLabel}
                className="group relative flex h-full w-full items-center justify-center rounded-[0.45rem] px-1 py-2 text-center focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(232,207,136,0.65),rgba(232,207,136,0.3)_44%,transparent_78%)] blur-[4px] brightness-125 mix-blend-screen transition ${
                    isActive
                      ? "opacity-100 ring-2 ring-archive-gold/80"
                      : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  } motion-reduce:transition-none`}
                />
                <span
                  title={label}
                  className={`relative line-clamp-3 max-h-full px-0.5 font-serif text-[clamp(0.68rem,0.84vw,0.95rem)] leading-tight ${
                    isActive
                      ? "text-archive-gold font-bold drop-shadow-[0_2px_12px_rgba(198,161,91,0.8)]"
                      : "text-archive-ivory drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]"
                  }`}
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

        <ArchiveOverlayRegion
          region={finalWishesRegion}
          ariaLabel="Open Final Wishes"
        >
          <Link
            href="/dashboard/final-wishes"
            aria-label="Open Final Wishes"
            className="group relative block h-full w-full rounded-md focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
          >
            <ArchiveSoftHighlight className="rounded-md bg-[radial-gradient(circle_at_center,rgba(232,207,136,0.56),rgba(232,207,136,0.24)_46%,transparent_80%)]" />
          </Link>
        </ArchiveOverlayRegion>
      </ArchiveBuildingShell>
    </>
  );
}
