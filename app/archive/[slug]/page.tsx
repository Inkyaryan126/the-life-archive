import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QRPreview } from "@/components/QRPreview";
import { SuccessMessage } from "@/components/SuccessMessage";
import { AuthenticatedMobileBottomNavigation } from "@/components/navigation/AuthenticatedMobileBottomNavigation";
import {
  DesignBackdrop,
  DesignImageButtonLink,
  SiteLogo
} from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug, getMemoriesByArchiveSlug, getVisitorMessages } from "@/lib/archive-data";
import { Guestbook } from "@/components/Guestbook";
import { ArchiveMobileScene } from "@/components/archive-building/ArchiveBuildingShell";
import { archiveBuildingMobileScenes } from "@/lib/archive-building-scenes";

export const dynamic = "force-dynamic";

const archiveChapterButtons = [
  {
    label: "Photos",
    hrefSuffix: "photo",
    image: "/images/site-design/photos-button.jpg"
  },
  {
    label: "Videos",
    hrefSuffix: "video",
    image: "/images/site-design/videos-button.jpg"
  },
  {
    label: "Voice Notes",
    hrefSuffix: "voice",
    image: "/images/site-design/voicenotes-button.jpg"
  },
  {
    label: "Journals",
    hrefSuffix: "journal",
    image: "/images/site-design/journals-button.jpg"
  },
  {
    label: "Life Lessons",
    hrefSuffix: "lesson",
    image: "/images/site-design/lifelessons-button.jpg"
  },
  {
    label: "Songs",
    hrefSuffix: "song",
    image: "/images/site-design/songs-button.jpg"
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

  const [memories, visitorMessages] = await Promise.all([
    getMemoriesByArchiveSlug(slug),
    getVisitorMessages(slug)
  ]);
  const isOwner = account.archives.some((item) => item.slug === archive.slug);
  const isMemorialArchive = archive.memorialMode;
  const isLivingArchive = !isMemorialArchive;
  const archiveStatusLabel = isMemorialArchive ? "Memorial Archive" : "Living Archive";
  const canUseMemberCard = isOwner && !isMemorialArchive;

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-6 text-archive-ivory lg:px-12 xl:px-16 sm:py-8">
        <ArchiveMobileScene
          image={{ ...(archive.memorialMode ? archiveBuildingMobileScenes.memorial : archiveBuildingMobileScenes.library), priority: true }}
          sceneLabel="Archive home mobile room"
          title={archive.archiveName}
          subtitle="Every preserved story becomes part of what remains."
          backgroundOnly
        />

      <DesignBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-[96rem]">
        <nav className="flex flex-col gap-4 pb-10 sm:flex-row sm:items-center sm:justify-between">
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
            <Link
              href={`/archive/${archive.slug}/qr`}
              className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base"
            >
              Share Their Story
            </Link>
          </div>
        </nav>

        {/* Archive Administration Control Bar */}
        {isOwner ? (
          <div className="relative z-20 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-archive-gold/25 bg-archive-gold/5 p-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-archive-gold animate-pulse" />
              <span className="font-semibold uppercase tracking-[0.18em] text-archive-gold">
                {isMemorialArchive
                  ? "Memorial Archive Active"
                  : "Archive Custody Active"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isMemorialArchive ? (
                <>
                  <Link
                    href={`/archive/${archive.slug}/memories`}
                    className="rounded-full border border-archive-gold/30 bg-white/5 px-4 py-2.5 font-semibold text-archive-ivory transition hover:bg-white/10"
                  >
                    Browse Chapters
                  </Link>
                  <Link
                    href={`/archive/${archive.slug}/qr`}
                    className="rounded-full bg-archive-gold px-5 py-2.5 font-bold text-archive-obsidian transition-all duration-300 hover:scale-[1.03] hover:bg-archive-champagne shadow-md shadow-archive-gold/20"
                  >
                    View Memorial QR
                  </Link>
                  <Link
                    href={`/archive/${archive.slug}/legacy-instructions`}
                    className="rounded-full border border-archive-gold/30 bg-white/5 px-4 py-2.5 font-semibold text-archive-ivory transition hover:bg-white/10"
                  >
                    Legacy Notes
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={`/archive/${archive.slug}/edit`}
                    className="rounded-full border border-archive-gold/30 bg-white/5 px-4 py-2.5 font-semibold text-archive-ivory transition hover:bg-white/10"
                  >
                    Configure Keepsake Details
                  </Link>
                  <Link
                    href={`/archive/${archive.slug}/add-memory`}
                    className="rounded-full bg-archive-gold px-5 py-2.5 font-bold text-archive-obsidian transition-all duration-300 hover:scale-[1.03] hover:bg-archive-champagne shadow-md shadow-archive-gold/20"
                  >
                    + Add a Chapter
                  </Link>
                  <Link
                    href={`/archive/${archive.slug}/legacy-instructions`}
                    className="rounded-full border border-archive-gold/30 bg-white/5 px-4 py-2.5 font-semibold text-archive-ivory transition hover:bg-white/10"
                  >
                    Legacy Notes
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}

        <section className="grid gap-8 py-12 lg:grid-cols-[minmax(0,1.12fr)_360px] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] shadow-luxury">
            <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:h-[520px]">
              <Image
                src={archive.profilePhotoUrl}
                alt={archive.personName}
                fill
                priority
                className="object-cover object-[center_25%]"
                sizes="(min-width: 1024px) 760px, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-archive-obsidian/88 via-archive-obsidian/36 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white sm:p-8">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/18 bg-black/24 px-3 py-1 text-sm font-semibold uppercase tracking-wide backdrop-blur">
                    {archiveStatusLabel}
                  </span>
                  <span className="rounded-full border border-white/18 bg-black/24 px-3 py-1 text-sm font-semibold uppercase tracking-wide backdrop-blur">
                    {archive.visibility === "public"
                      ? "Public · visible to everyone"
                      : "Private · authorized people only"}
                  </span>
                </div>
                <h1 className="mt-4 max-w-[16ch] font-serif text-4xl leading-tight sm:text-5xl">
                  {archive.personName}
                </h1>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              {resolvedSearchParams?.created === "1" ? (
                <SuccessMessage
                  eyebrow="Their story has begun"
                  message="The first chapter is ready. Add a chapter whenever you are ready to begin the story."
                />
              ) : null}

              <div className="border-t border-archive-gold/15 pt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-archive-gold">
                  {isMemorialArchive ? "Memorial Archive" : "Living Archive"}
                </p>
                <h2 className="mt-3 font-serif text-3xl text-archive-ivory sm:text-4xl">
                  {isMemorialArchive ? "Legacy Preserved" : "Continue Building This Archive"}
                </h2>
                <p className="mt-3 text-base leading-7 text-archive-ivory/64">
                  {isMemorialArchive
                    ? "This memorial archive preserves the stories, tributes, photos, lessons, and memories shared in honor of this life."
                    : "This archive is being built while life is still being lived. Add memories, voice notes, lessons, songs, and instructions that can become a lasting legacy when the time comes."}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 text-sm uppercase tracking-[0.22em] text-archive-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-archive-gold animate-pulse" />
                <span>{isMemorialArchive ? "In Loving Memory" : "Living Legacy"}</span>
              </div>

              <div className="mt-4 border-t border-archive-gold/15 pt-6">
                <p className="max-w-3xl font-serif text-lg leading-9 text-archive-ivory/80 whitespace-pre-line first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-5xl first-letter:font-bold first-letter:text-archive-gold">
                  {archive.bio}
                </p>
              </div>

              <p className="mt-6 max-w-3xl border-t border-white/5 pt-4 text-sm leading-7 italic text-archive-ivory/55">
                {isMemorialArchive
                  ? archive.visibility === "public"
                    ? "This memorial archive is open to anyone with the link or the physical QR. Friends and family can leave tributes and revisit the preserved story here."
                    : "This memorial archive is private. Only authorized family and friends can access the preserved story and leave tributes."
                  : archive.visibility === "public"
                    ? "This living archive is open to anyone with the link or the physical QR. It is still being built, and it will grow into a lasting legacy over time."
                    : "This living archive is private. Only authorized family and friends can access the archive as it is being built."}
              </p>

              {/* Clean Visitor Button Links (Owner actions streamlined into header drawer) */}
              <div className="mt-8 flex flex-wrap gap-3">
                {isLivingArchive && isOwner ? (
                  <Link
                    href={`/archive/${archive.slug}/add-memory`}
                    className="rounded-full bg-archive-gold px-6 py-3.5 text-base font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
                  >
                    Add a Memory
                  </Link>
                ) : (
                  <Link
                    href={`/archive/${archive.slug}/random`}
                    className="rounded-full bg-archive-gold px-6 py-3.5 text-base font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
                  >
                    Reveal a Memory
                  </Link>
                )}
                <Link
                  href={`/archive/${archive.slug}/memories`}
                  className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-6 py-3.5 text-base font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                >
                  {isMemorialArchive ? "Browse Memorial Chapters" : "View Chapters"}
                </Link>
                <Link
                  href={`/archive/${archive.slug}/qr`}
                  className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-6 py-3.5 text-base font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                >
                  {isMemorialArchive ? "View Memorial QR" : "Open QR Card"}
                </Link>
                {isLivingArchive && isOwner ? (
                  <Link
                    href={`/archive/${archive.slug}/edit`}
                    className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-6 py-3.5 text-base font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                  >
                    Edit Archive
                  </Link>
                ) : null}
              </div>

              {memories.length === 0 ? (
                <div className="mt-12 border-t border-archive-gold/15 pt-12">
                  <div className="text-center max-w-2xl mx-auto mb-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-archive-gold">
                      {isMemorialArchive ? "THE STORY IS PRESERVED HERE" : "THE STORY IS STILL BEING BUILT"}
                    </p>
                    <h2 className="mt-3 font-serif text-3xl text-archive-ivory sm:text-4xl">
                      {isMemorialArchive ? "Memorial Archive" : "Living Archive"}
                    </h2>
                    <p className="mt-3 text-base leading-7 text-archive-ivory/60">
                      {isMemorialArchive
                        ? "This archive is now preserved as a memorial. Additions remain closed, but chapters and keepsakes can still be revisited."
                        : "This archive is being built while life is still being lived. Add memories, voice notes, lessons, songs, and instructions that can become a lasting legacy when the time comes."}
                    </p>
                  </div>

                  {isMemorialArchive ? (
                    <div className="flex flex-wrap justify-center gap-3">
                      <Link
                        href={`/archive/${archive.slug}/memories`}
                        className="rounded-full bg-archive-gold px-6 py-3 text-base font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
                      >
                        Browse Chapters
                      </Link>
                      <Link
                        href={`/archive/${archive.slug}/qr`}
                        className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-6 py-3 text-base font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                      >
                        View Memorial QR
                      </Link>
                    </div>
                  ) : isOwner ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Link
                        href={`/archive/${archive.slug}/add-memory`}
                        className="group rounded-2xl border border-archive-gold/15 bg-white/[0.02] p-6 transition-all duration-300 hover:border-archive-gold/45 hover:bg-white/[0.04] flex flex-col justify-between"
                      >
                        <div>
                          <span className="font-serif text-2xl text-archive-gold">◆</span>
                          <h3 className="mt-3 font-serif text-xl text-archive-champagne transition-colors group-hover:text-archive-gold">
                            Add a Memory
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-archive-ivory/62">
                            Add a photograph, voice note, lesson, or story while the archive is still being lived.
                          </p>
                        </div>
                        <span className="mt-6 inline-flex items-center text-sm font-bold uppercase tracking-[0.16em] text-archive-gold">
                          Continue Building →
                        </span>
                      </Link>

                      <Link
                        href={`/archive/${archive.slug}/memories`}
                        className="group rounded-2xl border border-archive-gold/15 bg-white/[0.02] p-6 transition-all duration-300 hover:border-archive-gold/45 hover:bg-white/[0.04] flex flex-col justify-between"
                      >
                        <div>
                          <span className="font-serif text-2xl text-archive-gold">◆</span>
                          <h3 className="mt-3 font-serif text-xl text-archive-champagne transition-colors group-hover:text-archive-gold">
                            View Chapters
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-archive-ivory/62">
                            Review the chapters that already exist and choose where to continue next.
                          </p>
                        </div>
                        <span className="mt-6 inline-flex items-center text-sm font-bold uppercase tracking-[0.16em] text-archive-gold">
                          Open Chapters →
                        </span>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-archive-gold/15 bg-archive-obsidian/70 p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
                          Have a Life Archive activation code?
                        </p>
                        <h3 className="mt-3 font-serif text-2xl text-archive-ivory">
                          Connect this keepsake to the right archive.
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-archive-ivory/62">
                          Enter the code from a Life Archive card or keepsake to link access to the correct archive.
                        </p>
                        <Link
                          href="/activate-legacy"
                          className="mt-5 inline-flex rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
                        >
                          Activate a Code
                        </Link>
                      </div>

                      <div className="rounded-2xl border border-archive-gold/15 bg-white/[0.02] p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
                          Living Archive
                        </p>
                        <h3 className="mt-3 font-serif text-2xl text-archive-ivory">
                          Add a memory when you are ready.
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-archive-ivory/62">
                          Keep adding photos, voice notes, songs, and lessons so this archive can become a lasting legacy over time.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <Link
                            href={`/archive/${archive.slug}/memories`}
                            className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                          >
                            View Chapters
                          </Link>
                          <Link
                            href={`/archive/${archive.slug}/qr`}
                            className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                          >
                            Open QR Card
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-2xl border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
                Preserved
              </p>
              <p className="mt-3 text-3xl font-semibold text-archive-ivory">
                {memories.length}
              </p>
              <p className="mt-1 text-sm text-archive-ivory/64">
                chapters recorded
              </p>
            </div>
            <QRPreview archiveSlug={archive.slug} archiveMode={isMemorialArchive ? "memorial" : "living"} />

            {/* Keepsake Upsell Sidebar Card */}
            <div className="rounded-2xl border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
                ARCHIVE KEEPSAKE
              </p>
              <h4 className="font-serif text-xl leading-snug text-archive-ivory">
                Carry This Story Anywhere
              </h4>
              <p className="mt-2 text-sm leading-6 text-archive-ivory/62">
                Turn this digital sanctuary into a physical wallet card, keychain, pendant, or engraved slate plaque. Hand-finished keepsakes made to carry their story beyond the screen.
              </p>
              <Link
                href="/keepsakes"
                className="mt-4 block w-full rounded-full border border-archive-gold/25 bg-archive-gold/10 py-2.5 text-center text-sm font-bold text-archive-gold transition hover:bg-archive-gold hover:text-archive-obsidian"
              >
                Explore Keepsakes
              </Link>
            </div>
          </aside>
        </section>

        <section className="mt-4 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">
                Memory Chapters
              </p>
              <h2 className="mt-2 font-serif text-3xl text-archive-ivory sm:text-4xl">
                Explore their story by chapter
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-archive-ivory/60">
              Each button opens a beautifully preserved section of this story.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {archiveChapterButtons.map((button) => (
              <DesignImageButtonLink
                key={button.label}
                href={`/archive/${archive.slug}/memories?type=${button.hrefSuffix}`}
                label={button.label}
                className="w-full"
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

        {isMemorialArchive ? (
          <Guestbook
            archiveSlug={archive.slug}
            initialMessages={visitorMessages}
            isOwner={isOwner}
            archiveMode="memorial"
          />
        ) : !isOwner ? (
          <section className="mt-8 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_400px] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">
                  Living Archive
                </p>
                <h2 className="mt-2 font-serif text-3xl text-archive-ivory sm:text-4xl">
                  This archive is still being built.
                </h2>
                <p className="mt-2 text-base leading-7 text-archive-ivory/62">
                  Memories, voice notes, songs, and instructions can be added over time, and the archive can later be transitioned into memorial mode when needed.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/archive/${archive.slug}/memories`}
                    className="rounded-full bg-archive-gold px-6 py-3.5 text-base font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
                  >
                    View Chapters
                  </Link>
                  <Link
                    href={`/archive/${archive.slug}/qr`}
                    className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-6 py-3.5 text-base font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                  >
                    Open QR Card
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-archive-gold/18 bg-archive-obsidian/80 p-5 shadow-luxury">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
                  Have a Life Archive activation code?
                </p>
                <p className="mt-3 text-base leading-7 text-archive-ivory/68">
                  Enter the code from a Life Archive card or keepsake to connect it to the right archive.
                </p>
                <Link
                  href="/activate-legacy"
                  className="mt-5 inline-flex rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
                >
                  Activate a Code
                </Link>
              </div>
            </div>
          </section>
        ) : null}
      </div>
      {account.user ? (
        <AuthenticatedMobileBottomNavigation activeArchiveSlug={slug} />
      ) : null}
    </main>
  );
}
