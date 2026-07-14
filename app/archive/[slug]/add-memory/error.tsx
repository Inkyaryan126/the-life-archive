"use client";

import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";

export default function AddMemoryErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-16 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <section className="relative z-10 mx-auto max-w-2xl text-center">
        <SiteLogo width={200} height={50} className="mx-auto" />
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">
          Upload interrupted
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory sm:text-6xl">
          Your recording could not be uploaded
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-archive-ivory/68">
          The upload was interrupted before it finished. Your memory was not
          saved. Return to the add-memory page and try again with a supported
          file.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="rounded-full border border-archive-gold/45 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
          >
            Return to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
