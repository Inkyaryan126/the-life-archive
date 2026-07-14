import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { SuccessMessage } from "@/components/SuccessMessage";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { regenerateLegacyActivationCodeAction } from "@/app/dashboard/actions";
import { saveProfileAction } from "@/app/dashboard/settings/actions";
import { signOutAction } from "@/app/login/actions";
import { getAccountContext, type AccountArchive } from "@/lib/account";
import { getArchiveRelationshipLabel } from "@/lib/archive-relationships";
import { getArchiveBySlug, getLegacyInstructionByArchiveSlug, getMemoriesByArchiveSlug } from "@/lib/archive-data";
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

type MemoryBreakdownCardProps = {
  label: string;
  count: number;
};

const memoryBreakdownOrder: Array<{ type: MemoryType; label: string }> = [
  { type: "photo", label: "Photos" },
  { type: "video", label: "Videos" },
  { type: "voice", label: "Voice Recordings" },
  { type: "journal", label: "Journal Entries" },
  { type: "lesson", label: "Lessons" },
  { type: "song", label: "Songs" }
];

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

function MemoryPreviewCard({ memory }: { memory: MemoryWithArchive }) {
  const typeLabel =
    memory.type === "voice" ? "Voice recording" : memory.type === "song" ? "Song" : memory.type === "lesson" ? "Lesson" : memory.type === "journal" ? "Journal entry" : memory.type === "video" ? "Video" : "Photo";

  return (
    <article className="rounded-2xl border border-archive-gold/14 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-archive-gold">{typeLabel} · {formatMemoryDate(memory.date)}</p>
          <h3 className="mt-2 font-serif text-xl leading-tight text-archive-ivory">{memory.title}</h3>
        </div>
        <Link href={`/archive/${memory.archiveSlug}/memories/${memory.id}`} className="shrink-0 text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline">Open</Link>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-archive-ivory/62">{memory.content}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-archive-ivory/42">{memory.archiveName}</p>
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
    { photo: 0, video: 0, voice: 0, journal: 0, lesson: 0, song: 0 }
  );
  const recentMemories = [...allMemories].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

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
  const otherArchiveOverviews = archiveOverviews.filter((overview) => overview.archive.slug !== activeArchiveId);
  const sidebarArchiveSlug = sidebarArchive?.archiveDetails?.slug ?? sidebarArchive?.archive.slug ?? null;
  const sidebarArchiveName = sidebarArchive?.archiveDetails?.archiveName ?? sidebarArchive?.archive.archiveName ?? null;
  const sidebarArchivePersonName = sidebarArchive?.archiveDetails?.personName ?? sidebarArchive?.archive.personName ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-6 py-6 text-archive-ivory lg:px-12 xl:px-16 sm:py-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-[96rem] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <AppSidebar active="dashboard" archiveSlug={sidebarArchiveSlug} archiveName={sidebarArchiveName} archivePersonName={sidebarArchivePersonName} showArchiveActions={Boolean(sidebarArchiveSlug)} />

        <div className="min-w-0">
            <nav className="relative z-10 flex flex-col gap-4 border-b border-archive-gold/20 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:hidden">
              <Link href="/" className="block"><SiteLogo width={240} height={60} /></Link>
              <div className="flex flex-wrap items-center gap-4 sm:justify-end sm:gap-6">
                <Link href="/keepsakes" className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base">Keepsakes</Link>
                <Link href="/dashboard/settings" className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base">Profile Settings</Link>
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

                <section className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.55fr)]">
                  <div>
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">Recent memories</p>
                        <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Latest activity</h2>
                      </div>
                      {activeArchive ? (
                        <Link href={`/archive/${activeArchive.slug}/memories`} className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline">View all →</Link>
                      ) : null}
                    </div>
                    {recentMemories.length > 0 ? (
                      <div className="mt-5 grid gap-3">
                        {recentMemories.slice(0, 3).map((memory) => <MemoryPreviewCard key={memory.id} memory={memory} />)}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-archive-gold/14 bg-white/[0.03] p-5 text-sm leading-7 text-archive-ivory/62">
                        No memories yet. Add the first photo, lesson, voice note, or journal entry when you are ready.
                      </div>
                    )}
                  </div>

                  {defaultArchive ? (
                    <aside className="rounded-[2rem] border border-archive-gold/16 bg-white/[0.03] p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">Legacy status</p>
                      <div className="mt-5 grid gap-3">
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
                    </aside>
                  ) : null}
                </section>

                {otherArchiveOverviews.length > 0 ? (
                  <section className="mt-10">
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
    </main>
  );
}
