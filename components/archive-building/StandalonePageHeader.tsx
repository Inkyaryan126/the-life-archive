import Link from "next/link";
import { SiteLogo } from "@/components/SiteDesign";

type StandalonePageHeaderProps = {
  title?: string;
  backHref: string;
  backLabel: string;
  signedIn?: boolean;
  className?: string;
};

export function StandalonePageHeader({
  title,
  backHref,
  backLabel,
  signedIn = false,
  className = ""
}: StandalonePageHeaderProps) {
  return (
    <header className={`relative z-20 border-b border-archive-gold/14 bg-[#080706]/94 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-10 ${className}`}>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Return to Grand Hall"
            className="inline-flex rounded-xl transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
          >
            <SiteLogo width={210} height={50} />
          </Link>

          {title ? (
            <span className="hidden border-l border-archive-gold/20 pl-4 font-serif text-lg text-archive-champagne md:inline-block">
              {title}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-archive-gold/35 bg-white/[0.04] px-5 text-xs font-bold uppercase tracking-[0.14em] text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
          >
            <span>&larr;</span>
            <span>{backLabel}</span>
          </Link>

          {!signedIn ? (
            <Link
              href="/login"
              className="inline-flex min-h-[42px] items-center rounded-full bg-archive-gold px-5 text-xs font-bold uppercase tracking-[0.14em] text-archive-obsidian shadow-sm transition hover:bg-archive-champagne focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
            >
              Sign In
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
