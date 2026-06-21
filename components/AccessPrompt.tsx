import Link from "next/link";

type AccessPromptProps = {
  eyebrow: string;
  title: string;
  message: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function AccessPrompt({
  eyebrow,
  title,
  message,
  primaryHref,
  primaryLabel,
  secondaryHref = "/",
  secondaryLabel = "Return Home"
}: AccessPromptProps) {
  return (
    <main className="flex min-h-screen items-center bg-archive-obsidian px-5 py-16 text-archive-ivory sm:px-8">
      <section className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
          {eyebrow}
        </p>
        <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-archive-ivory/68">
          {message}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={primaryHref}
            className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className="rounded-full border border-archive-gold/45 px-6 py-3 text-sm font-semibold text-archive-champagne transition hover:border-archive-gold hover:bg-white/5 focus:outline-none focus:ring-4 focus:ring-archive-gold/20"
          >
            {secondaryLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
