import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QRPreview } from "@/components/QRPreview";
import { SuccessMessage } from "@/components/SuccessMessage";
import {
  DesignBackdrop,
  DesignImageButtonLink,
  SiteLogo
} from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug, getMemoriesByArchiveSlug, getVisitorMessages } from "@/lib/archive-data";
import { Guestbook } from "@/components/Guestbook";

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

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 text-archive-ivory sm:px-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto max-w-6xl">
        <nav className="flex items-center justify-between pb-10">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <div className="flex items-center gap-4">
            {account.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold"
                >
                  My Archives
                </Link>
                <Link
                  href="/member-card"
                  className="hidden text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:inline-flex"
                >
                  Member Card
                </Link>
              </>
            ) : null}
            <Link
              href={`/archive/${archive.slug}/qr`}
              className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold"
            >
              Share Their Story
            </Link>
          </div>
        </nav>

        {/* Archive Administration Control Bar */}
        {isOwner ? (
          <div className="mb-6 rounded-2xl border border-archive-gold/25 bg-archive-gold/5 p-4 flex flex-wrap items-center justify-between gap-4 text-xs relative z-20">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-archive-gold animate-pulse" />
              <span className="font-semibold uppercase tracking-wider text-archive-gold">
                Archive Custody Active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/archive/${archive.slug}/edit`}
                className="rounded-full border border-archive-gold/30 bg-white/5 px-4 py-2 font-semibold text-archive-ivory transition hover:bg-white/10"
              >
                Configure Keepsake Details
              </Link>
              <Link
                href={`/archive/${archive.slug}/add-memory`}
                className="rounded-full bg-archive-gold px-5 py-2 font-bold text-archive-obsidian transition-all duration-300 hover:bg-archive-champagne hover:scale-[1.03] shadow-md shadow-archive-gold/20"
              >
                + Add a Chapter
              </Link>
              <Link
                href={`/archive/${archive.slug}/legacy-instructions`}
                className="rounded-full border border-archive-gold/30 bg-white/5 px-4 py-2 font-semibold text-archive-ivory transition hover:bg-white/10"
              >
                Legacy Notes
              </Link>
            </div>
          </div>
        ) : null}

        <section className="grid gap-8 py-12 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] shadow-luxury">
            <div className="relative aspect-[16/10] sm:aspect-[16/7]">
              <Image
                src={archive.profilePhotoUrl}
                alt={archive.personName}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 760px, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-archive-obsidian/88 via-archive-obsidian/36 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white sm:p-8">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/18 bg-black/24 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                    {archive.visibility === "public"
                      ? "Public · visible to everyone"
                      : "Private · authorized people only"}
                  </span>
                  {archive.memorialMode ? (
                    <span className="rounded-full border border-white/18 bg-black/24 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                      Memorial
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-4 font-serif text-5xl leading-tight">
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

              {/* Elegant Heritage Seal */}
              <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-archive-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-archive-gold animate-pulse" />
                <span>Digitally Preserved Sanctuary</span>
              </div>

              {/* Beautiful drop-cap Biography */}
              <div className="border-t border-archive-gold/15 pt-6 mt-4">
                <p className="max-w-3xl font-serif text-lg leading-9 text-archive-ivory/80 whitespace-pre-line first-letter:text-5xl first-letter:font-bold first-letter:text-archive-gold first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                  {archive.bio}
                </p>
              </div>

              <p className="mt-6 max-w-3xl text-xs leading-6 text-archive-ivory/50 italic border-t border-white/5 pt-4">
                {archive.visibility === "public"
                  ? "This is a public keepsake archive. Anyone with this link or scanning the physical QR can view and leave a tribute."
                  : "This is a private keepsake archive. Only authorized family and friends can access this digital sanctuary."}
              </p>

              {/* Clean Visitor Button Links (Owner actions streamlined into header drawer) */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/archive/${archive.slug}/random`}
                  className="rounded-full bg-archive-gold px-6 py-3.5 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
                >
                  Reveal a Memory
                </Link>
                <Link
                  href={`/archive/${archive.slug}/memories`}
                  className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                >
                  Browse Memory Chapters
                </Link>
                <Link
                  href={`/archive/${archive.slug}/qr`}
                  className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                >
                  Share Their Story
                </Link>
              </div>

              {memories.length === 0 ? (
                <div className="mt-12 border-t border-archive-gold/15 pt-12">
                  <div className="text-center max-w-2xl mx-auto mb-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                      THE STORY BEGINS HERE
                    </p>
                    <h2 className="mt-3 font-serif text-3xl text-archive-ivory">
                      Begin Your Archive
                    </h2>
                    <p className="mt-3 text-sm text-archive-ivory/55">
                      Your archive is currently empty, but the canvas is ready. Select a starting point below to begin bringing this sanctuary to life.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Link
                      href={`/archive/${archive.slug}/add-memory`}
                      className="group rounded-2xl border border-archive-gold/15 bg-white/[0.02] p-6 hover:border-archive-gold/45 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-archive-gold font-serif text-2xl">◆</span>
                        <h3 className="font-serif text-xl text-archive-champagne mt-3 group-hover:text-archive-gold transition-colors">
                          Add First Chapter
                        </h3>
                        <p className="text-xs leading-6 text-archive-ivory/60 mt-2">
                          Write a core memory, an overarching story of childhood, or describe a defining childhood turning point.
                        </p>
                      </div>
                      <span className="text-xs text-archive-gold font-bold uppercase tracking-wider mt-6 inline-flex items-center">
                        Add Chapter →
                      </span>
                    </Link>

                    <Link
                      href={`/archive/${archive.slug}/add-memory?type=photo`}
                      className="group rounded-2xl border border-archive-gold/15 bg-white/[0.02] p-6 hover:border-archive-gold/45 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-archive-gold font-serif text-2xl">◆</span>
                        <h3 className="font-serif text-xl text-archive-champagne mt-3 group-hover:text-archive-gold transition-colors">
                          Upload Photos
                        </h3>
                        <p className="text-xs leading-6 text-archive-ivory/60 mt-2">
                          Keep precious family portraits, childhood alleys, or hand-written letters safe in digital high-fidelity archives.
                        </p>
                      </div>
                      <span className="text-xs text-archive-gold font-bold uppercase tracking-wider mt-6 inline-flex items-center">
                        Upload Photo →
                      </span>
                    </Link>

                    <Link
                      href={`/archive/${archive.slug}/add-memory?type=voice`}
                      className="group rounded-2xl border border-archive-gold/15 bg-white/[0.02] p-6 hover:border-archive-gold/45 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-archive-gold font-serif text-2xl">◆</span>
                        <h3 className="font-serif text-xl text-archive-champagne mt-3 group-hover:text-archive-gold transition-colors">
                          Record Voice note
                        </h3>
                        <p className="text-xs leading-6 text-archive-ivory/60 mt-2">
                          The voice is always forgotten first. Record comforting advice, laughter, or spoken history directly from your phone.
                        </p>
                      </div>
                      <span className="text-xs text-archive-gold font-bold uppercase tracking-wider mt-6 inline-flex items-center">
                        Record Audio →
                      </span>
                    </Link>

                    <Link
                      href={`/archive/${archive.slug}/add-memory?type=song`}
                      className="group rounded-2xl border border-archive-gold/15 bg-white/[0.02] p-6 hover:border-archive-gold/45 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-archive-gold font-serif text-2xl">◆</span>
                        <h3 className="font-serif text-xl text-archive-champagne mt-3 group-hover:text-archive-gold transition-colors">
                          Add Favorite Song
                        </h3>
                        <p className="text-xs leading-6 text-archive-ivory/60 mt-2">
                          Music links us immediately to specific days. Pin their favorite cookout anthem or a song they sang at the piano.
                        </p>
                      </div>
                      <span className="text-xs text-archive-gold font-bold uppercase tracking-wider mt-6 inline-flex items-center">
                        Add Song →
                      </span>
                    </Link>
                  </div>
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
            <QRPreview archiveSlug={archive.slug} />

            {/* Keepsake Upsell Sidebar Card */}
            <div className="rounded-2xl border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold mb-2">
                STORYKEEPER KEEPSAKE
              </p>
              <h4 className="font-serif text-lg text-archive-ivory leading-snug">
                Carry This Story Anywhere
              </h4>
              <p className="mt-2 text-xs leading-5 text-archive-ivory/60">
                Turn this digital sanctuary into a physical wallet card, keychain, pendant, or brass plaque. Hand-finished keys of remembrance.
              </p>
              <Link
                href="/keepsakes"
                className="mt-4 block w-full text-center rounded-full bg-archive-gold/10 border border-archive-gold/25 py-2 text-xs font-bold text-archive-gold hover:bg-archive-gold hover:text-archive-obsidian transition"
              >
                Explore Keepsakes
              </Link>
            </div>
          </aside>
        </section>

        <section className="mt-4 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                Memory Chapters
              </p>
              <h2 className="mt-2 font-serif text-3xl text-archive-ivory sm:text-4xl">
                Explore their story by chapter
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-archive-ivory/58">
              Each button opens a beautifully preserved section of this story.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {archiveChapterButtons.map((button) => (
              <DesignImageButtonLink
                key={button.label}
                href={`/archive/${archive.slug}/memories?type=${button.hrefSuffix}`}
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

        {/* Guestbook Section */}
        <Guestbook
          archiveSlug={archive.slug}
          initialMessages={visitorMessages}
          isOwner={isOwner}
        />
      </div>
    </main>
  );
}
