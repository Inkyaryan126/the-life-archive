import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SuccessMessage } from "@/components/SuccessMessage";
import { AuthenticatedMobileBottomNavigation } from "@/components/navigation/AuthenticatedMobileBottomNavigation";
import {
  DesignBackdrop,
  SiteLogo
} from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";
import {
  getArchiveBySlug,
  getMemoriesByArchiveSlug,
  getVisitorMessages
} from "@/lib/archive-data";
import { Guestbook } from "@/components/Guestbook";
import {
  generateQrSvg,
  getRandomMemoryUrl,
  getRequestSiteUrl,
  svgToDataUri
} from "@/lib/qr";
import { ShareArchiveDialog } from "@/components/archive/ShareArchiveDialog";
import { ArchiveCinematicScene } from "@/components/archive/ArchiveCinematicScene";
import { getArchiveVisitorCount } from "@/lib/site-visits";

export const dynamic = "force-dynamic";

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

  const [memories, visitorMessages, archiveVisitorCount, requestHeaders] = await Promise.all([
    getMemoriesByArchiveSlug(slug),
    getVisitorMessages(slug),
    getArchiveVisitorCount(slug),
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
    <main className="relative min-h-screen overflow-hidden bg-[#030201] px-6 py-6 text-archive-ivory lg:px-12 xl:px-16 sm:py-8">
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
            {isOwner ? (
              <Link
                href={`/archive/${archive.slug}/edit`}
                className="text-sm font-semibold text-archive-gold transition hover:text-archive-champagne sm:text-base"
              >
                Edit Archive
              </Link>
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

        {resolvedSearchParams?.created === "1" ? (
          <div className="mb-6">
            <SuccessMessage
              eyebrow="Their story has begun"
              message="The first chapter is ready. Add a chapter whenever you are ready to begin the story."
            />
          </div>
        ) : null}

        <ArchiveCinematicScene
          archive={archive}
          chapters={memories}
          isOwner={isOwner}
          isLivingArchive={isLivingArchive}
          archiveStatusLabel={archiveStatusLabel}
          visitorCount={archiveVisitorCount}
          shareAction={
            <ShareArchiveDialog
              archiveSlug={archive.slug}
              personName={archive.personName}
              qrDataUri={qrDataUri}
              targetUrl={randomMemoryUrl}
              triggerLabel="Share Archive"
              triggerClassName="rounded-full border border-archive-gold/35 bg-black/22 px-5 py-2.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:text-archive-gold"
            />
          }
        />

        {/* Featured memory */}
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
