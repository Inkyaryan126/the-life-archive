import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";

export default function NotFoundPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-16 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <section className="relative z-10 mx-auto max-w-2xl text-center">
        <SiteLogo width={200} height={50} className="mx-auto" />
        <h1 className="mt-10 font-serif text-4xl leading-tight text-archive-ivory sm:text-6xl">
          This page could not be found.
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-archive-ivory/68">
          The story may have moved, or the link may no longer be available. The
          memories entrusted to an archive remain worthy of care.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
          >
            Return Home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-archive-gold/45 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
          >
            Visit My Archives
          </Link>
        </div>
      </section>
    </main>
  );
}
