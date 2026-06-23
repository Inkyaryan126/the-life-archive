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
import { getArchiveBySlug, getMemoriesByArchiveSlug } from "@/lib/archive-data";

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
  params: {
    slug: string;
  };
  searchParams?: {
    created?: string;
  };
};

export default async function ArchivePage({
  params,
  searchParams
}: ArchivePageProps) {
  const [archive, account] = await Promise.all([
    getArchiveBySlug(params.slug),
    getAccountContext()
  ]);

  if (!archive) {
    notFound();
  }

  const memories = await getMemoriesByArchiveSlug(params.slug);
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
              Share Archive
            </Link>
          </div>
        </nav>

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
              {searchParams?.created === "1" ? (
                <SuccessMessage
                  eyebrow="Archive created"
                  message="The first chapter is ready. Add a memory whenever you are ready to begin the story."
                />
              ) : null}
              <p className="max-w-3xl text-lg leading-8 text-archive-ivory/74">
                {archive.bio}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-archive-ivory/60">
                {archive.visibility === "public"
                  ? "This is a public archive. Anyone can view it, and it may appear on The Life Archive homepage."
                  : "This is a private archive. Only the archive owner and authorized members can view it."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/archive/${archive.slug}/random`}
                  className="rounded-full bg-archive-gold px-5 py-3 text-sm font-semibold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
                >
                  Reveal a Memory
                </Link>
                <Link
                  href={`/archive/${archive.slug}/memories`}
                  className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                >
                  Browse Memories
                </Link>
                {isOwner ? (
                  <Link
                    href={`/archive/${archive.slug}/add-memory`}
                    className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                  >
                    Add Memory
                  </Link>
                ) : null}
                <Link
                  href={`/archive/${archive.slug}/qr`}
                  className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                >
                  QR Card
                </Link>
                {isOwner ? (
                  <Link
                    href={`/archive/${archive.slug}/legacy-instructions`}
                    className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                  >
                    Legacy Notes
                  </Link>
                ) : null}
              </div>
              {memories.length === 0 ? (
                <div className="mt-7 rounded-md border border-archive-gold/18 bg-archive-obsidian/40 px-4 py-3 text-sm leading-6 text-archive-ivory/68">
                  This archive is ready for its first story. Add a memory to
                  begin bringing it to life.
                </div>
              ) : null}
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-2xl border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
                Archive
              </p>
              <p className="mt-3 text-3xl font-semibold text-archive-ivory">
                {memories.length}
              </p>
              <p className="mt-1 text-sm text-archive-ivory/64">
                memories saved
              </p>
            </div>
            <QRPreview archiveSlug={archive.slug} />
          </aside>
        </section>

        <section className="mt-4 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                Chapters
              </p>
              <h2 className="mt-2 font-serif text-3xl text-archive-ivory sm:text-4xl">
                Enter the story by chapter
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-archive-ivory/58">
              Each button opens a filtered view of the memories in this archive.
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
      </div>
    </main>
  );
}
