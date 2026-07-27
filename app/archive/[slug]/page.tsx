import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SuccessMessage } from "@/components/SuccessMessage";
import { AuthenticatedMobileBottomNavigation } from "@/components/navigation/AuthenticatedMobileBottomNavigation";
import {
  DesignBackdrop,
  DesignImageButtonLink,
  SiteLogo
} from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";
import {
  getArchiveBySlug,
  getMemoriesByArchiveSlug,
  getVisitorMessages
} from "@/lib/archive-data";
import { Guestbook } from "@/components/Guestbook";
import { ArchiveMobileScene } from "@/components/archive-building/ArchiveBuildingShell";
import { archiveBuildingMobileScenes } from "@/lib/archive-building-scenes";
import {
  generateQrSvg,
  getRandomMemoryUrl,
  getRequestSiteUrl,
  svgToDataUri
} from "@/lib/qr";
import { ShareArchiveDialog } from "@/components/archive/ShareArchiveDialog";

export const dynamic = "force-dynamic";

const archiveChapterButtons = [
  {
    label: "All Chapters",
    href: "memories",
    image: "/images/site-design/journals-button.jpg",
    desc: "Browse every preserved story and chapter"
  },
  {
    label: "Photos",
    href: "memories?type=photo",
    image: "/images/site-design/photos-button.jpg",
    desc: "Visual moments and family photographs"
  },
  {
    label: "Voice Notes",
    href: "memories?type=voice",
    image: "/images/site-design/voicenotes-button.jpg",
    desc: "Audio recordings and spoken reflections"
  },
  {
    label: "Life Lessons",
    href: "memories?type=lesson",
    image: "/images/site-design/lifelessons-button.jpg",
    desc: "Wisdom, principles, and personal guidelines"
  },
  {
    label: "Songs",
    href: "memories?type=song",
    image: "/images/site-design/songs-button.jpg",
    desc: "Music, playlists, and auditory memories"
  },
  {
    label: "Random Chapter",
    href: "random",
    image: "/images/site-design/videos-button.jpg",
    desc: "Discover a random chapter from this archive"
  }
] as const;

type ArchivePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    created?: string;
  }>;
};

export default async function ArchivePage({
  params,
  searchParams
}: ArchivePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const [archive, account] = await Promise.all([
    getArchiveBySlug(slug),
    getAccountContext()
  ]);

  if (!archive) {
    notFound();
  }

  const [memories, visitorMessages, requestHeaders] = await Promise.all([
    getMemoriesByArchiveSlug(slug),
    getVisitorMessages(slug),
    headers()
  ]);

  const isOwner = account.archives.some((item) => item.slug === archive.slug);
  const isMemorialArchive = archive.memorialMode;
  const isLivingArchive = !isMemorialArchive;
  const archiveStatusLabel = isMemorialArchive ? "Memorial Archive" : "Living Archive";
  const canUseMemberCard = isOwner && !isMemorialArchive;

  // Generate QR & Random URL
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";
  const siteUrl = getRequestSiteUrl(host, protocol);
  const randomMemoryUrl = getRandomMemoryUrl(archive.slug, siteUrl);
  const qrSvg = await generateQrSvg(randomMemoryUrl);
  const qrDataUri = svgToDataUri(qrSvg);

  // Featured memory: first available memory
  const featuredMemory = memories.length > 0 ? memories[0] : null;

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-6 text-archive-ivory lg:px-12 xl:px-16 sm:py-8">
      <ArchiveMobileScene
        image={{
          ...(archive.memorialMode
            ? archiveBuildingMobileScenes.memorial
            : archiveBuildingMobileScenes.library),
          priority: true
        }}
        sceneLabel="Archive home mobile room"
        title={archive.archiveName}
        subtitle="Every preserved story becomes part of what remains."
        backgroundOnly
      />

      <DesignBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-[96rem]">
        {/* Navigation Bar */}
        <nav className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/">
            <SiteLogo width={240} height={60} />
          </Link>
          <div className="flex flex-wrap items-center gap-4 sm:justify-end sm:gap-6">
            {account.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base"
                >
                  My Archives
                </Link>
                {canUseMemberCard ? (
                  <Link
                    href="/member-card"
                    className="hidden text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:inline-flex sm:text-base"
                  >
                    Member Card
                  </Link>
                ) : null}
              </>
            ) : null}
            <ShareArchiveDialog
              archiveSlug={archive.slug}
              personName={archive.personName}
              qrDataUri={qrDataUri}
              targetUrl={randomMemoryUrl}
              triggerLabel="Share Archive"
              triggerClassName="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base"
            />
          </div>
        </nav>

        {/* Owner Custody Admin Control Bar */}
        {isOwner ? (
          <div className="relative z-20 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-archive-gold/25 bg-archive-gold/5 p-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-archive-gold animate-pulse" />
              <span className="font-semibold uppercase tracking-[0.18em] text-archive-gold">
                {isMemorialArchive ? "Memorial Archive Active" : "Archive Custody Active"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/archive/${archive.slug}/memories`}
                className="rounded-full border border-archive-gold/30 bg-white/5 px-4 py-2 font-semibold text-archive-ivory transition hover:bg-white/10"
              >
                Browse Chapters
              </Link>
              {isLivingArchive ? (
                <>
                  <Link
                    href={`/archive/${archive.slug}/add-memory`}
                    className="rounded-full bg-archive-gold px-4 py-2 font-bold text-archive-obsidian transition hover:bg-archive-champagne"
                  >
                    + Add a Chapter
                  </Link>
                  <Link
                    href={`/archive/${archive.slug}/edit`}
                    className="rounded-full border border-archive-gold/30 bg-white/5 px-4 py-2 font-semibold text-archive-ivory transition hover:bg-white/10"
                  >
                    Edit Archive
                  </Link>
                </>
              ) : null}
              <Link
                href={`/archive/${archive.slug}/legacy-instructions`}
                className="rounded-full border border-archive-gold/30 bg-white/5 px-4 py-2 font-semibold text-archive-ivory transition hover:bg-white/10"
              >
                Legacy Notes
              </Link>
            </div>
          </div>
        ) : null}

        {resolvedSearchParams?.created === "1" ? (
          <div className="mb-6">
            <SuccessMessage
              eyebrow="Their story has begun"
              message="The first chapter is ready. Add a chapter whenever you are ready to begin the story."
            />
          </div>
        ) : null}

        {/* 1. CINEMATIC HERO SECTION */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-archive-gold/20 bg-archive-obsidian shadow-luxury group">
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
            <Image
              src={archive.profilePhotoUrl}
              alt={archive.personName}
              fill
              priority
              className="object-cover object-[center_25%] transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
              sizes="(min-width: 1280px) 1440px, 100vw"
            />
            {/* Dark bottom gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#11100e] via-[#11100e]/65 to-transparent" />

            {/* Hero Text & Primary Action Overlay */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14">
              <div className="flex flex-wrap gap-2.5">
                <span className="rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-archive-gold backdrop-blur-md">
                  {archiveStatusLabel}
                </span>
                <span className="rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-archive-ivory/80 backdrop-blur-md">
                  {archive.visibility === "public"
                    ? "Public Sanctuary"
                    : "Private Sanctuary"}
                </span>
              </div>

              {/* Constrained Responsive Person Name */}
              <h1 className="mt-4 max-w-[18ch] font-serif text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.08] tracking-tight text-archive-ivory break-words">
                {archive.personName}
              </h1>

              <p className="mt-2 font-serif text-lg italic text-archive-champagne/90 sm:text-xl">
                {archive.archiveName}
              </p>

              {/* Small Elegant Preserved Statistic */}
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold/90">
                {memories.length} {memories.length === 1 ? "preserved chapter" : "preserved chapters"}
              </p>

              {/* Primary Hero Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href={`/archive/${archive.slug}/memories`}
                  className="rounded-full bg-archive-gold px-7 py-3.5 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
                >
                  Explore Memories
                </Link>

                <Link
                  href={`/archive/${archive.slug}/random`}
                  className="rounded-full border border-archive-gold/35 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                >
                  Random Chapter
                </Link>

                {isLivingArchive && isOwner ? (
                  <Link
                    href={`/archive/${archive.slug}/add-memory`}
                    className="rounded-full border border-archive-gold/35 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                  >
                    + Add a Memory
                  </Link>
                ) : null}

                <ShareArchiveDialog
                  archiveSlug={archive.slug}
                  personName={archive.personName}
                  qrDataUri={qrDataUri}
                  targetUrl={randomMemoryUrl}
                  triggerLabel="Share Archive"
                  triggerClassName="rounded-full border border-archive-gold/35 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. BIOGRAPHY / TRIBUTE SECTION */}
        <section className="mt-12 border-t border-archive-gold/15 pt-12">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              {isMemorialArchive ? "In Loving Memory" : "Living Legacy"}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-archive-ivory sm:text-4xl">
              {isMemorialArchive ? "A Life Remembered" : "The Living Story"}
            </h2>
            <p className="mt-6 font-serif text-lg leading-relaxed text-archive-ivory/85 whitespace-pre-line sm:text-xl sm:leading-loose">
              {archive.bio}
            </p>
          </div>
        </section>

        {/* 3. EXPLORE THIS ARCHIVE SECTION */}
        <section className="mt-16 border-t border-archive-gold/15 pt-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                Exhibition Chapters
              </p>
              <h2 className="mt-2 font-serif text-3xl text-archive-ivory sm:text-4xl">
                Explore This Archive
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-archive-ivory/60">
              Browse stories, photographs, voice recordings, and life lessons.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {archiveChapterButtons.map((button) => (
              <Link
                key={button.label}
                href={`/archive/${archive.slug}/${button.href}`}
                className="group relative overflow-hidden rounded-[1.8rem] border border-archive-gold/18 bg-white/[0.025] p-6 shadow-luxury transition-all duration-300 hover:-translate-y-1 hover:border-archive-gold/45 hover:bg-white/[0.05] motion-reduce:transform-none"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                  <Image
                    src={button.image}
                    alt={button.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="mt-4">
                  <h3 className="font-serif text-xl text-archive-ivory transition-colors group-hover:text-archive-gold">
                    {button.label}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-archive-ivory/62">
                    {button.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center text-xs font-bold uppercase tracking-[0.16em] text-archive-gold">
                    Open Chapter →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. FEATURED MEMORY SECTION */}
        <section className="mt-16 border-t border-archive-gold/15 pt-16">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              Featured Chapter
            </p>
            <h2 className="mt-2 font-serif text-3xl text-archive-ivory sm:text-4xl">
              From the Vault
            </h2>

            {featuredMemory ? (
              <div className="mt-8 overflow-hidden rounded-[2rem] border border-archive-gold/20 bg-white/[0.03] p-8 shadow-luxury">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full border border-archive-gold/30 bg-archive-gold/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-archive-gold">
                    {featuredMemory.type}
                  </span>
                  <time className="text-xs font-mono text-archive-ivory/50">
                    {featuredMemory.date}
                  </time>
                </div>
                <h3 className="mt-4 font-serif text-2xl text-archive-ivory sm:text-3xl">
                  {featuredMemory.title}
                </h3>
                <p className="mt-4 font-serif text-base leading-relaxed text-archive-ivory/75 line-clamp-4">
                  {featuredMemory.content}
                </p>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <Link
                    href={`/archive/${archive.slug}/memories`}
                    className="inline-flex items-center text-sm font-bold uppercase tracking-[0.16em] text-archive-gold transition hover:text-archive-champagne"
                  >
                    Read Full Story →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-[2rem] border border-archive-gold/15 bg-white/[0.02] p-8 text-center">
                <p className="font-serif text-lg text-archive-ivory/70">
                  {isMemorialArchive
                    ? "This memorial archive has no recorded chapters yet."
                    : "No chapters have been added to this living archive yet."}
                </p>
                {isLivingArchive && isOwner ? (
                  <Link
                    href={`/archive/${archive.slug}/add-memory`}
                    className="mt-6 inline-flex rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
                  >
                    + Add the First Chapter
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </section>

        {/* 5. GUESTBOOK / TRIBUTES (For Memorial Archives) */}
        {isMemorialArchive ? (
          <div className="mt-16 border-t border-archive-gold/15 pt-16">
            <Guestbook
              archiveSlug={archive.slug}
              initialMessages={visitorMessages}
              isOwner={isOwner}
              archiveMode="memorial"
            />
          </div>
        ) : null}

        {/* 6. KEEPSAKE PROMOTION SECTION (Moved lower down, secondary) */}
        <section className="mt-20 border-t border-archive-gold/15 pt-16 pb-12">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-archive-gold/18 bg-white/[0.025] p-8 text-center shadow-luxury sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              ARCHIVE KEEPSAKES
            </p>
            <h3 className="mt-3 font-serif text-2xl text-archive-ivory sm:text-3xl">
              Carry This Story Anywhere
            </h3>
            <p className="mt-4 text-base leading-relaxed text-archive-ivory/70">
              Turn this digital sanctuary into a physical wallet card, keychain, pendant, or engraved slate plaque. Hand-finished keepsakes made to carry their story beyond the screen.
            </p>
            <div className="mt-8">
              <Link
                href="/keepsakes"
                className="inline-flex rounded-full border border-archive-gold/30 bg-white/[0.04] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-archive-gold transition hover:border-archive-gold hover:bg-archive-gold hover:text-archive-obsidian"
              >
                Explore Keepsakes
              </Link>
            </div>
          </div>
        </section>
      </div>

      {account.user ? (
        <AuthenticatedMobileBottomNavigation activeArchiveSlug={slug} />
      ) : null}
    </main>
  );
}
