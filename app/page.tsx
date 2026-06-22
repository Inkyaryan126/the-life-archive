import Image from "next/image";
import Link from "next/link";
import { ArchiveCard } from "@/components/ArchiveCard";
import { getAccountContext } from "@/lib/account";
import { getFeaturedArchives } from "@/lib/archive-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [archives, account] = await Promise.all([
    getFeaturedArchives(),
    getAccountContext()
  ]);
  const isSignedIn = Boolean(account.user);
  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn ? "Dashboard" : "Create an Archive";

  return (
    <main>
      <section className="relative min-h-[92vh] overflow-hidden px-5 py-6 sm:px-8">
        <Image
          src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1800&q=80"
          alt="Open family album on a quiet table"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-archive-ink/45 via-archive-ink/18 to-archive-paper" />
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-white">
            The Life Archive Home
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {isSignedIn ? (
              <Link
                href="/member-card"
                className="hidden text-sm font-semibold text-white underline-offset-4 hover:underline sm:inline-flex"
              >
                Member Card
              </Link>
            ) : null}
            <Link
              href={primaryHref}
              className="rounded-full bg-white/92 px-3 py-2 text-xs font-semibold text-archive-ink shadow-soft transition hover:bg-white sm:px-4 sm:text-sm"
            >
              {primaryLabel}
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-6xl items-end pb-12 pt-24">
          <div className="max-w-2xl text-white">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-archive-linen">
              Every life leaves a story.
            </p>
            <h1 className="font-serif text-5xl leading-tight sm:text-6xl md:text-7xl">
              The Life Archive
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">
              Create a living collection of photos, journals, songs, voice notes,
              lessons, and memories for the people whose stories should stay
              close.
            </p>
            <div className="mt-6 inline-flex rounded-full border border-white/45 bg-white/14 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              Begin with one story.
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="rounded-full bg-archive-clay px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-archive-ink"
              >
                {primaryLabel}
              </Link>
              <Link
                href="/archive/sari-rae"
                className="rounded-full border border-white/70 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                View Example
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
              How it works
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-archive-ink">
              A lasting home for the stories that matter.
            </h2>
            <p className="mt-5 text-lg leading-8 text-archive-ink/72">
              After you create an archive, you can add the first memory and
              prepare a QR card that leads others back to their story.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-lg border border-archive-ink/10 bg-white/82 p-6 shadow-soft">
              <p className="text-sm font-semibold text-archive-clay">01</p>
              <h3 className="mt-3 font-serif text-2xl text-archive-ink">
                Create an Archive
              </h3>
              <p className="mt-3 leading-7 text-archive-ink/70">
                Build a home for a person&apos;s memories and legacy.
              </p>
            </article>
            <article className="rounded-lg border border-archive-ink/10 bg-white/82 p-6 shadow-soft">
              <p className="text-sm font-semibold text-archive-clay">02</p>
              <h3 className="mt-3 font-serif text-2xl text-archive-ink">
                Add Memories
              </h3>
              <p className="mt-3 leading-7 text-archive-ink/70">
                Collect stories, photos, videos, voice notes, lessons, and
                important moments.
              </p>
            </article>
            <article className="rounded-lg border border-archive-ink/10 bg-white/82 p-6 shadow-soft">
              <p className="text-sm font-semibold text-archive-clay">03</p>
              <h3 className="mt-3 font-serif text-2xl text-archive-ink">
                Share Their Story
              </h3>
              <p className="mt-3 leading-7 text-archive-ink/70">
                Use QR cards, keepsakes, and links to help others discover their
                archive.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
              Digital heirlooms
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-archive-ink">
              Choose who can discover their story.
            </h2>
            <p className="mt-5 text-lg leading-8 text-archive-ink/72">
              Build an archive for yourself, a parent, a mentor, or someone you
              love. Private archives are limited to authorized people. Public
              archives can be viewed by anyone and may appear here on the
              homepage. Either can be connected to a QR card or keepsake.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {archives.map((archive) => (
              <ArchiveCard key={archive.slug} archive={archive} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
