"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center bg-archive-obsidian px-5 py-16 text-archive-ivory sm:px-8">
      <section className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
          A quiet pause
        </p>
        <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">
          We could not open this part of the story.
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-archive-ivory/68">
          Nothing you intended to preserve has been forgotten. Please try again,
          or return to a familiar place.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border border-archive-gold/45 px-6 py-3 text-sm font-semibold text-archive-champagne"
          >
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
