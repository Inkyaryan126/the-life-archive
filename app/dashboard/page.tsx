import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SuccessMessage } from "@/components/SuccessMessage";
import {
  DesignBackdrop,
  DesignImageButtonLink,
  SiteLogo
} from "@/components/SiteDesign";
import { regenerateLegacyActivationCodeAction } from "@/app/dashboard/actions";
import { signOutAction } from "@/app/login/actions";
import { getAccountContext, type AccountArchive } from "@/lib/account";
import { getArchiveRelationshipLabel } from "@/lib/archive-relationships";
import {
  getArchiveBySlug,
  getLegacyInstructionByArchiveSlug,
  getMemoriesByArchiveSlug
} from "@/lib/archive-data";
import { legacyInstructionAccessLevelLabels } from "@/lib/legacy-instructions";
import { formatMemoryDate } from "@/lib/format";
import type { Memory, MemoryType } from "@/lib/types";

export const dynamic = "force-dynamic";

type ArchiveOverview = {
  archive: AccountArchive;
  archiveDetails: NonNullable<Awaited<ReturnType<typeof getArchiveBySlug>>> | null;
  memories: Memory[];
  loadFailed: boolean;
};

type MemoryWithArchive = Memory & {
  archiveName: string;
  archiveSlug: string;
};

type DashboardActionProps = {
  description: string;
  href: string;
  label: string;
};

type DashboardArchiveCardProps = {
  archive: AccountArchive;
  memoryCount: number;
  latestMemory?: MemoryWithArchive | null;
  isDefault: boolean;
};

type MemoryBreakdownCardProps = {
  label: string;
  count: number;
};

const memoryBreakdownOrder: Array<{
  type: MemoryType;
  label: string;
}> = [
  { type: "photo", label: "Photos" },
  { type: "video", label: "Videos" },
  { type: "voice", label: "Voice Recordings" },
  { type: "journal", label: "Journal Entries" },
  { type: "lesson", label: "Lessons" },
  { type: "song", label: "Songs" }
];

const chapterButtonOrder: Array<{
  type: MemoryType;
  label: string;
  hrefSuffix: string;
  image: string;
}> = [
  {
    type: "photo",
    label: "Photos",
    hrefSuffix: "photo",
    image: "/images/site-design/photos-button.jpg"
  },
  {
    type: "video",
    label: "Videos",
    hrefSuffix: "video",
    image: "/images/site-design/videos-button.jpg"
  },
  {
    type: "voice",
    label: "Voice Notes",
    hrefSuffix: "voice",
    image: "/images/site-design/voicenotes-button.jpg"
  },
  {
    type: "journal",
    label: "Journals",
    hrefSuffix: "journal",
    image: "/images/site-design/journals-button.jpg"
  },
  {
    type: "lesson",
    label: "Life Lessons",
    hrefSuffix: "lesson",
    image: "/images/site-design/lifelessons-button.jpg"
  },
  {
    type: "song",
    label: "Songs",
    hrefSuffix: "song",
    image: "/images/site-design/songs-button.jpg"
  }
];

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function getArchiveInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function MemoryBreakdownCard({ label, count }: MemoryBreakdownCardProps) {
  return (
    <article className="rounded-2xl border border-archive-gold/18 bg-white/[0.04] p-5 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
        {label}
      </p>
      <p className="mt-4 font-serif text-4xl leading-none text-archive-ivory">
        {count.toString().padStart(2, "0")}
      </p>
    </article>
  );
}

function DashboardAction({ description, href, label }: DashboardActionProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-archive-gold/22 bg-white/[0.04] p-5 transition hover:border-archive-gold/55 hover:bg-white/[0.065] sm:p-6"
    >
      <p className="font-serif text-2xl leading-tight text-archive-ivory">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-archive-ivory/62">
        {description}
      </p>
      <span className="mt-5 inline-flex text-sm font-semibold text-archive-champagne transition group-hover:translate-x-1">
        Continue →
      </span>
    </Link>
  );
}

function DashboardArchiveCard({
  archive,
  memoryCount,
  latestMemory,
  isDefault
}: DashboardArchiveCardProps) {
  const relationshipLabel = getArchiveRelationshipLabel(
    archive.relationshipToOwner
  );

  return (
    <article className="rounded-3xl border border-archive-gold/18 bg-white/[0.04] p-5 shadow-luxury sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
            {archive.personName}
          </p>
          <h3 className="mt-2 font-serif text-2xl leading-tight text-archive-ivory sm:text-[2rem]">
            {archive.archiveName}
          </h3>
        </div>
        {isDefault ? (
          <span className="rounded-full border border-archive-gold/28 bg-archive-gold/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-archive-champagne">
            Primary archive
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
        <span className="rounded-full border border-archive-gold/18 px-3 py-1.5 text-archive-ivory/66">
          {archive.visibility === "public"
            ? "Public · discoverable"
            : "Private · authorized people only"}
        </span>
        <span className="rounded-full border border-archive-gold/18 px-3 py-1.5 text-archive-ivory/66">
          {archive.memorialMode ? "Memorial Archive" : "Living Archive"}
        </span>
        <span className="rounded-full border border-archive-gold/18 px-3 py-1.5 text-archive-ivory/66">
          {relationshipLabel}
        </span>
      </div>

      <div className="mt-6 grid gap-4 border-t border-archive-gold/12 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
            Memories
          </p>
          <p className="mt-2 font-serif text-3xl text-archive-ivory">
            {memoryCount.toString().padStart(2, "0")}
          </p>
          <p className="mt-1 text-sm leading-6 text-archive-ivory/58">
            Created {formatTimestamp(archive.createdAt)}
          </p>
        </div>
        {latestMemory ? (
          <div className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/35 px-4 py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-archive-gold">
              Most recent memory
            </p>
            <p className="mt-2 text-sm font-semibold text-archive-ivory">
              {latestMemory.title}
            </p>
            <p className="mt-1 text-xs leading-5 text-archive-ivory/58">
              {latestMemory.archiveName} · {formatMemoryDate(latestMemory.date)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/archive/${archive.slug}`}
          className="rounded-full bg-archive-gold px-4 py-2.5 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
        >
          Open archive
        </Link>
        <Link
          href={`/archive/${archive.slug}/add-memory`}
          className="rounded-full border border-archive-gold/32 px-4 py-2.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.06]"
        >
          Add memory
        </Link>
        <Link
          href={`/archive/${archive.slug}/qr`}
          className="rounded-full border border-archive-gold/32 px-4 py-2.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.06]"
        >
          QR card
        </Link>
      </div>
    </article>
  );
}

function MemoryPreviewCard({ memory }: { memory: MemoryWithArchive }) {
  const isImage = memory.type === "photo" && memory.mediaUrl;
  const typeLabel =
    memory.type === "voice"
      ? "Voice recording"
      : memory.type === "song"
        ? "Song"
        : memory.type === "lesson"
          ? "Lesson"
          : memory.type === "journal"
            ? "Journal entry"
            : memory.type === "video"
              ? "Video"
              : "Photo";

  return (
    <article className="overflow-hidden rounded-3xl border border-archive-gold/16 bg-white/[0.04] shadow-luxury">
      {isImage ? (
        <div className="relative aspect-[16/10]">
          <Image
            src={memory.mediaUrl as string}
            alt={memory.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 26rem, 100vw"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-end bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(198,161,91,0.14))] p-5">
          <div className="max-w-full">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-archive-gold">
              {typeLabel}
            </p>
            <p className="mt-3 text-lg font-semibold text-archive-ivory">
              {memory.title}
            </p>
          </div>
        </div>
      )}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
            {typeLabel}
          </p>
          <p className="text-xs text-archive-ivory/58">
            {formatMemoryDate(memory.date)}
          </p>
        </div>
        <h3 className="mt-3 font-serif text-2xl leading-tight text-archive-ivory">
          {memory.title}
        </h3>
        <p className="mt-2 text-sm leading-7 text-archive-ivory/64">
          {memory.content}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-archive-ivory/48">
            {memory.archiveName}
          </p>
          <Link
            href={`/archive/${memory.archiveSlug}`}
            className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
          >
            Open archive
          </Link>
        </div>
      </div>
    </article>
  );
}

function ActivityCard({
  date,
  title,
  detail
}: {
  date: string;
  title: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-archive-gold/14 bg-white/[0.035] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
        {formatTimestamp(date)}
      </p>
      <h3 className="mt-2 font-serif text-xl text-archive-ivory">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-archive-ivory/60">{detail}</p>
    </article>
  );
}

async function loadArchiveOverviews(
  archives: AccountArchive[]
): Promise<ArchiveOverview[]> {
  const settled = await Promise.allSettled(
    archives.map(async (archive) => {
      const [archiveDetails, memories] = await Promise.all([
        getArchiveBySlug(archive.slug),
        getMemoriesByArchiveSlug(archive.slug)
      ]);

      return {
        archive,
        archiveDetails,
        memories,
        loadFailed: false
      };
    })
  );

  return settled.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    return {
      archive: archives[index],
      archiveDetails: null,
      memories: [],
      loadFailed: true
    };
  });
}

type DashboardPageProps = {
  searchParams?: Promise<{
    legacyCode?: string;
    legacyCodeError?: string;
    welcome?: string;
  }>;
};

export default async function DashboardPage({
  searchParams
}: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login");
  }

  const { archives, defaultArchive, user } = account;
  const archiveOverviews = archives.length > 0 ? await loadArchiveOverviews(archives) : [];
  const selectedOverview =
    archiveOverviews.find((item) => item.archive.slug === defaultArchive?.slug) ??
    null;
  const selectedArchive = selectedOverview?.archiveDetails ?? null;
  const archiveLoadFailed = archiveOverviews.some((item) => item.loadFailed);
  const legacyInstruction = defaultArchive
    ? await getLegacyInstructionByArchiveSlug(defaultArchive.slug, true).catch(
        () => null
      )
    : null;

  const allMemories: MemoryWithArchive[] = archiveOverviews.flatMap((overview) =>
    overview.memories.map((memory) => ({
      ...memory,
      archiveName: overview.archiveDetails?.personName ?? overview.archive.personName,
      archiveSlug: overview.archive.slug
    }))
  );
  const totalMemories = allMemories.length;
  const memoryCounts = memoryBreakdownOrder.reduce<Record<MemoryType, number>>(
    (counts, { type }) => {
      counts[type] = allMemories.filter((memory) => memory.type === type).length;
      return counts;
    },
    {
      photo: 0,
      video: 0,
      voice: 0,
      journal: 0,
      lesson: 0,
      song: 0
    }
  );
  const recentMemories = [...allMemories]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const memberActivity = [
    {
      date: user.createdAt,
      title: "Account created",
      detail: user.emailConfirmed
        ? "The account is confirmed and ready for archive access."
        : "The account is waiting on email confirmation before it can be fully used."
    },
    ...archives.map((archive) => ({
      date: archive.createdAt,
      title:
        archive.slug === defaultArchive?.slug
          ? `Personal archive created: ${archive.archiveName}`
          : `Archive created: ${archive.archiveName}`,
      detail: `${archive.visibility === "public" ? "Public archive" : "Private archive"} · ${getArchiveRelationshipLabel(archive.relationshipToOwner)}`
    }))
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const memberSince = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(new Date(user.createdAt));
  const archiveCreatedLabel = selectedArchive
    ? formatTimestamp(selectedArchive.createdAt)
    : null;
  const archiveMemories = selectedOverview?.memories.length ?? 0;
  const archivePhoto = selectedArchive?.profilePhotoUrl ?? null;
  const archiveTitle =
    selectedArchive?.archiveName ?? defaultArchive?.archiveName ?? "Your archive";
  const archivePerson =
    selectedArchive?.personName ?? defaultArchive?.personName ?? "Your story";
  const archiveBio =
    selectedArchive?.bio ??
    "This archive keeps together the memories, stories, and lessons that matter most.";
  const archiveVisibility = defaultArchive
    ? defaultArchive.visibility === "public"
      ? "Public · discoverable"
      : "Private · authorized people only"
    : null;
  const legacyInstructionLabel = legacyInstruction
    ? legacyInstructionAccessLevelLabels[legacyInstruction.accessLevel]
    : "Not started";
  const legacyInstructionSummary = legacyInstruction
    ? legacyInstruction.accessLevel === "released"
      ? "Publicly shared. Review it whenever your wishes change."
      : "Only you can read these notes. Return whenever you are ready."
    : "Keep final wishes, practical details, and personal messages in one thoughtful place.";

  const hasArchives = archives.length > 0;
  const hasPersonalArchive = Boolean(defaultArchive);
  const livingDefaultArchive =
    defaultArchive && !defaultArchive.memorialMode ? defaultArchive : null;
  const quickActions = defaultArchive
    ? [
        {
          href: `/archive/${defaultArchive.slug}/add-memory`,
          label: "Add Memory",
          description: "Add a photo, voice note, lesson, or story to this archive."
        },
        ...(livingDefaultArchive
          ? [
              {
                href: "/member-card",
                label: "Generate Member Card",
                description:
                  "Print the wallet card that keeps this Living Archive within reach."
              }
            ]
          : []),
        {
          href: `/archive/${defaultArchive.slug}/qr`,
          label: "Generate QR Card",
          description: "Create a QR card for funerals, reunions, and family gatherings."
        },
        {
          href: `/archive/${defaultArchive.slug}/qr`,
          label: "Share Archive",
          description: "Open the sharing tools for this archive."
        }
      ]
    : [];
  const chapterButtons = defaultArchive
    ? chapterButtonOrder.map((button) => ({
        ...button,
        href: `/archive/${defaultArchive.slug}/memories?type=${button.hrefSuffix}`
      }))
    : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8 sm:py-8">
      <DesignBackdrop />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-b border-archive-gold/20 pb-5">
        <Link href="/" className="block">
          <SiteLogo width={160} height={40} />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/keepsakes"
            className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold"
          >
            Keepsakes
          </Link>
          {livingDefaultArchive ? (
            <Link
              href="/member-card"
              className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold"
            >
              Member Card
            </Link>
          ) : null}
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-archive-gold/35 px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/5"
            >
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl pb-20 pt-10 sm:pt-14">
        {resolvedSearchParams?.welcome === "back" ? (
          <SuccessMessage
            eyebrow="Welcome back"
            message="Your archives are ready whenever you are."
          />
        ) : null}

        {resolvedSearchParams?.legacyCode === "regenerated" ? (
          <SuccessMessage
            eyebrow="Legacy code updated"
            message="Your previous Legacy Activation Code was replaced. Use the new code shown in your dashboard and Member Card."
          />
        ) : null}

        <header className="flex flex-col md:flex-row justify-between items-start gap-6 max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
              Legacy overview
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold/90 font-bold">
              Preserve your authentic voice, wisdom, and living legacy.
            </h1>
            <p className="mt-4 text-base leading-7 text-archive-ivory/64 sm:text-lg sm:leading-8">
              See the archive you are preserving, the memories already inside it,
              and the next steps that help loved ones find what you chose to keep.
            </p>
          </div>
          {hasArchives && (
            <Link
              href="/create"
              className="mt-4 md:mt-10 rounded-full bg-archive-gold px-6 py-3.5 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10 inline-flex shrink-0"
            >
              + Create Another Archive
            </Link>
          )}
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
              Archive summary
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
                  {hasArchives
                    ? hasPersonalArchive
                      ? "Build a home for the memories that matter most."
                      : "Your personal archive spot is ready."
                    : "Create the archive that begins the story."}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-archive-ivory/62 sm:text-base sm:leading-8">
                  {hasArchives
                    ? hasPersonalArchive
                      ? "Your My Archives gathers the archive, the memories inside it, and the ways family can return to it later."
                      : "You are preserving archives for other people. Your own archive still has a reserved primary place and will become the account's main archive when you create it."
                    : "Start with one archive for yourself or for someone you love. Then add the stories, photos, and legacy details that belong to them."}
                </p>
              </div>
            </div>

            {hasArchives ? (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-archive-gold/18 bg-archive-ivory px-5 py-4 text-archive-obsidian">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                      {hasPersonalArchive ? "Total archives" : "Other archives"}
                    </p>
                    <p className="mt-3 font-serif text-3xl">{archives.length}</p>
                  </div>
                  <div className="rounded-2xl border border-archive-gold/18 bg-archive-ivory px-5 py-4 text-archive-obsidian">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                      Total memories
                    </p>
                    <p className="mt-3 font-serif text-3xl">{totalMemories}</p>
                  </div>
                  <div className="rounded-2xl border border-archive-gold/18 bg-archive-ivory px-5 py-4 text-archive-obsidian">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                      Member since
                    </p>
                    <p className="mt-3 font-serif text-2xl leading-tight">
                      {memberSince}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-archive-gold/18 bg-archive-ivory px-5 py-4 text-archive-obsidian">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                      Email status
                    </p>
                    <p className="mt-3 font-serif text-2xl leading-tight">
                      {user.emailConfirmed ? "Confirmed" : "Pending"}
                    </p>
                  </div>
                </div>
                {!hasPersonalArchive ? (
                  <div className="mt-8">
                    <DashboardAction
                      href="/create?relationshipToOwner=self"
                      label="Create My Personal Archive"
                      description="Reserve the account's primary archive for your own story. Archives for friends and family stay listed separately."
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-8">
                <DashboardAction
                  href="/create"
                  label="Create an Archive"
                  description="Build the place where a life can be remembered, shared, and carried forward."
                />
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] shadow-luxury">
            {hasArchives && selectedArchive ? (
              <>
                <div className="relative aspect-[4/3]">
                  {archivePhoto ? (
                    <Image
                      src={archivePhoto}
                      alt={selectedArchive.personName}
                      fill
                      priority
                      className="object-cover"
                      sizes="(min-width: 1024px) 38rem, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-end bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(198,161,91,0.18))] p-8">
                      <div className="rounded-3xl border border-white/12 bg-black/20 px-5 py-4 text-archive-ivory">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
                          {getArchiveInitials(selectedArchive.personName)}
                        </p>
                        <p className="mt-2 font-serif text-3xl">
                          {selectedArchive.personName}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-archive-obsidian/80 via-archive-obsidian/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                          Selected archive
                        </p>
                        <h2 className="mt-2 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
                          {archiveTitle}
                        </h2>
                        <p className="mt-2 text-sm uppercase tracking-[0.16em] text-archive-ivory/55">
                          {archivePerson}
                        </p>
                      </div>
                      {archiveVisibility ? (
                        <span className="rounded-full border border-white/18 bg-black/24 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-archive-gold">
                          {archiveVisibility}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-6 sm:p-8">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/50 px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                        Memories inside
                      </p>
                      <p className="mt-2 font-serif text-3xl text-archive-ivory">
                        {archiveMemories}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/50 px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                        Created
                      </p>
                      <p className="mt-2 font-serif text-2xl text-archive-ivory">
                        {archiveCreatedLabel}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-archive-ivory/62">
                    {archiveBio}
                  </p>
                </div>
              </>
            ) : hasArchives && !hasPersonalArchive ? (
              <div className="flex h-full min-h-[28rem] items-end bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(198,161,91,0.18))] p-6 sm:p-8">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                    Personal archive reserved
                  </p>
                  <h2 className="mt-2 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
                    Your own archive will become the primary account archive.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-archive-ivory/62">
                    The archives you created for other people are still safe and
                    available below. Create the archive for yourself when you are
                    ready, and the dashboard will use it for member cards, QR
                    tools, legacy instructions, and quick actions.
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/create?relationshipToOwner=self"
                      className="inline-flex rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
                    >
                      Create My Personal Archive
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[28rem] items-end bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(198,161,91,0.18))] p-6 sm:p-8">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                    No archive yet
                  </p>
                  <h2 className="mt-2 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
                    Create the archive that will hold the story.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-archive-ivory/62">
                    A single archive can hold photos, memories, lessons, voice
                    notes, and the details a family will need later.
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/create"
                      className="inline-flex rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
                    >
                      Create an Archive
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {hasArchives ? (
          <>
            {defaultArchive ? (
              <>
                <section className="mt-12 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="max-w-2xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                        Chapters
                      </p>
                      <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                        Browse the life in chapters
                      </h2>
                    </div>
                    <p className="max-w-xl text-sm leading-6 text-archive-ivory/58">
                      Choose a chapter to enter one part of the story.
                    </p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                    {chapterButtons.map((button) => (
                      <DesignImageButtonLink
                        key={button.type}
                        href={button.href}
                        label={button.label}
                        className="mx-auto w-full max-w-[19rem]"
                        images={[
                          {
                            src: button.image,
                            alt: `${button.label} chapter`,
                            width: 476,
                            height: 417,
                            className: "block"
                          }
                        ]}
                      />
                    ))}
                  </div>
                </section>

                <section className="mt-12 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury sm:p-6">
                  <Image
                    src="/images/site-design/quickactions-banner.jpg"
                    alt="Quick actions"
                    width={1070}
                    height={82}
                    priority={false}
                    className="h-auto w-full"
                  />
                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {quickActions.map((action) => {
                      const image =
                        action.label === "Add Memory"
                          ? {
                              desktop: "/images/site-design/addmemory-button.jpg",
                              tablet: "/images/site-design/addmemory-smallbutton.jpg",
                              mobile: "/images/site-design/addmemory-tinybutton.jpg"
                            }
                          : action.label === "Generate Member Card"
                              ? {
                                  desktop: "/images/site-design/membercard-button.jpg",
                                  tablet: "/images/site-design/membercard-smallbutton.jpg",
                                  mobile: "/images/site-design/membercard-tinybutton.jpg"
                                }
                              : action.label === "Generate QR Card"
                                ? {
                                    desktop: "/images/site-design/qrcard-button.jpg",
                                    tablet: "/images/site-design/qrcard-smallbutton.jpg",
                                    mobile: "/images/site-design/qrcard-tinybutton.jpg"
                                  }
                                : {
                                    desktop: "/images/site-design/sharearchive-tinybutton.jpg",
                                    tablet: "/images/site-design/sharearchive-tinybutton.jpg",
                                    mobile: "/images/site-design/sharearchive-tinybutton.jpg"
                                  };

                      return (
                        <DesignImageButtonLink
                          key={action.label}
                          href={action.href}
                          label={action.label}
                          className="mx-auto w-full max-w-[19rem]"
                          images={[
                            {
                              src: image.mobile,
                              alt: `${action.label} button`,
                              width:
                                action.label === "Share Archive" ? 170 : 170,
                              height:
                                action.label === "Share Archive" ? 214 : 214,
                              className: "block md:hidden"
                            },
                            {
                              src: image.tablet,
                              alt: `${action.label} button`,
                              width:
                                action.label === "Share Archive" ? 170 : 366,
                              height:
                                action.label === "Share Archive" ? 214 : 136,
                              className: "hidden md:max-xl:block"
                            },
                            {
                              src: image.desktop,
                              alt: `${action.label} button`,
                              width:
                                action.label === "Share Archive" ? 170 : 365,
                              height:
                                action.label === "Share Archive" ? 214 : 488,
                              className: "hidden xl:block"
                            }
                          ]}
                        />
                      );
                    })}
                  </div>
                </section>
              </>
            ) : null}

            <section className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                    Memory breakdown
                  </p>
                  <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                    What this archive holds
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-archive-ivory/58">
                  A quick look at the kinds of memories preserved across your
                  archives.
                </p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {memoryBreakdownOrder.map(({ type, label }) => (
                  <MemoryBreakdownCard
                    key={type}
                    label={label}
                    count={memoryCounts[type]}
                  />
                ))}
              </div>
            </section>

            <section className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                    Recent memories
                  </p>
                  <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                    The latest pieces of the story
                  </h2>
                </div>
                {defaultArchive ? (
                  <Link
                    href={`/archive/${defaultArchive.slug}`}
                    className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
                  >
                    Open my archive →
                  </Link>
                ) : (
                  <Link
                    href="/create?relationshipToOwner=self"
                    className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
                  >
                    Create My Personal Archive →
                  </Link>
                )}
              </div>

              {recentMemories.length > 0 ? (
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  {recentMemories.map((memory) => (
                    <MemoryPreviewCard key={memory.id} memory={memory} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-archive-gold/16 bg-white/[0.035] p-6 text-sm leading-7 text-archive-ivory/62">
                  No memories yet. Add the first photo, lesson, voice note, or
                  journal entry when you are ready.
                </div>
              )}
            </section>

            {defaultArchive ? (
              <section className="mt-12 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                      Legacy instructions
                    </p>
                    <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                      Keep the guidance that matters most.
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-archive-ivory/62 sm:text-base sm:leading-8">
                      Final wishes, practical details, and personal messages
                      belong in one thoughtful place.
                    </p>
                  </div>
                  <span className="rounded-full border border-archive-gold/28 bg-archive-gold/10 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-archive-champagne">
                    {legacyInstructionLabel}
                  </span>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="rounded-2xl border border-archive-gold/14 bg-archive-ivory px-5 py-4 text-archive-obsidian">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                      {defaultArchive.archiveName}
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {defaultArchive.personName}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-archive-obsidian/72">
                      {legacyInstructionSummary}
                    </p>
                    {legacyInstruction ? (
                      <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-7 text-archive-obsidian/84">
                        {legacyInstruction.body}
                      </p>
                    ) : null}
                  </div>

                  <Link
                    href={`/archive/${defaultArchive.slug}/legacy-instructions`}
                    className="rounded-full bg-archive-gold px-5 py-3 text-center text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
                  >
                    {legacyInstruction
                      ? "Open Legacy Instructions"
                      : "Write Legacy Instructions"}
                  </Link>
                </div>
              </section>
            ) : null}

            {livingDefaultArchive?.legacyActivationCode ? (
              <section className="mt-12 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                      Private Legacy Activation Code
                    </p>
                    <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                      Keep this code somewhere trusted.
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-archive-ivory/62 sm:text-base sm:leading-8">
                      This single-use code begins memorial review if you can no
                      longer update your archive. It is not shown publicly and
                      should only be entered at /activate-legacy.
                    </p>
                    <Link
                      href="/activate-legacy"
                      className="mt-4 inline-flex rounded-full border border-archive-gold/30 bg-white/[0.04] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-archive-champagne transition hover:border-archive-gold hover:bg-white/[0.08]"
                    >
                      Open Activation Page
                    </Link>
                  </div>
                  <span className="rounded-full border border-archive-gold/28 bg-archive-gold/10 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-archive-champagne">
                    {livingDefaultArchive.legacyCodeUsedAt
                      ? "Used"
                      : "Unused"}
                  </span>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                      Legacy Activation Code
                    </p>
                    <p className="mt-3 break-all font-mono text-2xl font-bold tracking-[0.16em] text-archive-champagne sm:text-3xl">
                      {livingDefaultArchive.legacyActivationCode}
                    </p>
                    {livingDefaultArchive.legacyCodeUsedAt ? (
                      <p className="mt-3 text-sm leading-6 text-archive-ivory/60">
                        Submitted by {livingDefaultArchive.legacyActivatedBy || "a requester"} and Pending Memorial Review.
                      </p>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-archive-ivory/60">
                        If compromised, regenerate it and reprint your Member
                        Card.
                      </p>
                    )}
                  </div>

                  <form action={regenerateLegacyActivationCodeAction}>
                    <input
                      type="hidden"
                      name="archiveSlug"
                      value={livingDefaultArchive.slug}
                    />
                    <button
                      type="submit"
                      className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-5 py-3 text-center text-sm font-bold text-archive-champagne transition hover:border-archive-gold hover:bg-white/[0.08]"
                    >
                      Regenerate Code
                    </button>
                  </form>
                </div>
              </section>
            ) : null}

            <section className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                    Recent member activity
                  </p>
                  <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                    Real account and archive milestones
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-archive-ivory/58">
                  This timeline is built only from live account and archive
                  records.
                </p>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {memberActivity.map((item) => (
                  <ActivityCard
                    key={`${item.title}-${item.date}`}
                    date={item.date}
                    title={item.title}
                    detail={item.detail}
                  />
                ))}
              </div>
            </section>

            <section className="mt-12 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                    Your archives
                  </p>
                  <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                    Each archive you are preserving
                  </h2>
                </div>
                <Link
                  href="/create"
                  className="rounded-full border border-archive-gold/35 px-5 py-2.5 text-sm font-semibold text-archive-champagne transition hover:border-archive-gold hover:bg-white/5"
                >
                  Create another archive
                </Link>
              </div>

              {account.archiveLookupFailed ? (
                <p className="mt-6 rounded-2xl border border-archive-gold/20 bg-archive-gold/10 px-4 py-3 text-sm leading-6 text-archive-champagne">
                  We could not load every archive detail right now. The page is
                  still ready, and your saved archives remain available.
                </p>
              ) : archiveLoadFailed ? (
                <p className="mt-6 rounded-2xl border border-archive-gold/20 bg-archive-gold/10 px-4 py-3 text-sm leading-6 text-archive-champagne">
                  We could not load every memory record right now, but your My Archives
                  is still open. Refresh if you want to try again.
                </p>
              ) : null}

              <div className="mt-6 grid gap-5 xl:grid-cols-2">
                {archives.map((archive) => {
                  const overview = archiveOverviews.find(
                    (item) => item.archive.slug === archive.slug
                  );
                  const latestMemory = overview?.memories.length
                    ? overview.memories
                        .slice()
                        .sort((a, b) => b.date.localeCompare(a.date))[0]
                    : null;

                  return (
                    <DashboardArchiveCard
                      key={archive.slug}
                      archive={archive}
                      memoryCount={overview?.memories.length ?? 0}
                      latestMemory={
                        latestMemory
                          ? {
                              ...latestMemory,
                              archiveName:
                                overview?.archiveDetails?.personName ??
                                archive.personName,
                              archiveSlug: archive.slug
                            }
                          : null
                      }
                      isDefault={archive.slug === defaultArchive?.slug}
                    />
                  );
                })}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
