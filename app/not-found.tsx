import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center bg-archive-obsidian px-5 py-16 text-archive-ivory sm:px-8">
      <section className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
          The Life Archive
        </p>
        <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">
          This page could not be found.
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-archive-ivory/68">
          The story may have moved, or the link may no longer be available. The
          memories entrusted to an archive remain worthy of care.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian"
          >
            Return Home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-archive-gold/45 px-6 py-3 text-sm font-semibold text-archive-champagne"
          >
            Visit My Archives
          </Link>
        </div>
      </section>
    </main>
  );
}
