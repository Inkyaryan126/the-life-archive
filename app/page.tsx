import Link from "next/link";
import { DesignBackdrop, DesignImageButtonLink, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const chapters = [
  { label: "Photos", image: "/images/site-design/photos-button.jpg" },
  { label: "Videos", image: "/images/site-design/videos-button.jpg" },
  { label: "Voice Notes", image: "/images/site-design/voicenotes-button.jpg" },
  { label: "Journals", image: "/images/site-design/journals-button.jpg" },
  { label: "Life Lessons", image: "/images/site-design/lifelessons-button.jpg" },
  { label: "Songs", image: "/images/site-design/songs-button.jpg" }
];

export default async function HomePage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn ? "Enter Dashboard" : "Begin an Archive";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory">
      <DesignBackdrop />
      
      <div className="relative z-10 flex min-h-screen flex-col">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <div className="flex items-center gap-4">
            {isSignedIn && (
              <Link
                href="/member-card"
                className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold"
              >
                Member Card
              </Link>
            )}
            <Link
              href={primaryHref}
              className="rounded-full border border-archive-gold/40 px-5 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/5"
            >
              {primaryLabel}
            </Link>
          </div>
        </nav>

        <header className="flex flex-grow items-center px-5 sm:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-archive-gold">
                Every Life Leaves a Story.
              </p>
              <h1 className="mt-6 font-serif text-6xl leading-tight sm:text-8xl">
                The Life Archive
              </h1>
              <p className="mt-8 max-w-xl text-xl leading-9 text-archive-ivory/70">
                Preserve photos, journals, voice notes, lessons, songs, and memories for future generations.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={primaryHref}
                  className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
                >
                  {primaryLabel}
                </Link>
                <Link
                  href="/archive/sari-rae"
                  className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                >
                  View Example
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {chapters.map((chapter) => (
              <DesignImageButtonLink
                key={chapter.label}
                href={primaryHref}
                label={`Explore ${chapter.label}`}
                className="w-full"
                images={[
                  {
                    src: chapter.image,
                    alt: `${chapter.label} chapter`,
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
