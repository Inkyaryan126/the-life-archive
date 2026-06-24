import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";

type PartnerPageTemplateProps = {
  partnerType: string;
  tagline: string;
  intro: string;
  familyBenefits: { title: string; description: string }[];
  partnerBenefits: { title: string; description: string }[];
  integrations: { title: string; description: string }[];
  lastingValue: string;
};

export function PartnerPageTemplate({
  partnerType,
  tagline,
  intro,
  familyBenefits,
  partnerBenefits,
  integrations,
  lastingValue
}: PartnerPageTemplateProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8">
      <DesignBackdrop />

      {/* Header */}
      <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between border-b border-archive-gold/20 pb-5">
        <Link href="/">
          <SiteLogo width={160} height={40} />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
          >
            Dashboard
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
            Partner Ecosystem
          </span>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl py-12 sm:py-16">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            PRESERVATION INFRASTRUCTURE
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl text-archive-ivory">
            The Life Archive for {partnerType}
          </h1>
          <p className="mt-6 text-lg leading-8 text-archive-ivory/72 max-w-2xl mx-auto font-serif italic">
            {tagline}
          </p>
          <p className="mt-4 text-sm leading-7 text-archive-ivory/60 max-w-2xl mx-auto">
            {intro}
          </p>
        </section>

        {/* Value Prop Columns */}
        <section className="mt-20 grid gap-8 md:grid-cols-2">
          {/* Family Benefits */}
          <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.02] p-8 shadow-luxury">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold mb-3">
              CLIENT ENGAGEMENT
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-archive-ivory mb-6">
              Benefits to Families
            </h2>
            <div className="grid gap-5">
              {familyBenefits.map((b) => (
                <div key={b.title}>
                  <h4 className="font-serif text-lg text-archive-champagne mb-1">{b.title}</h4>
                  <p className="text-xs leading-5 text-archive-ivory/60">{b.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Partner Benefits */}
          <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.02] p-8 shadow-luxury">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold mb-3">
              MUTUAL INTEGRITY
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-archive-ivory mb-6">
              Benefits to Partners
            </h2>
            <div className="grid gap-5">
              {partnerBenefits.map((b) => (
                <div key={b.title}>
                  <h4 className="font-serif text-lg text-archive-champagne mb-1">{b.title}</h4>
                  <p className="text-xs leading-5 text-archive-ivory/60">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Future Integrations */}
        <section className="mt-16 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 sm:p-10 shadow-luxury">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold mb-3">
            TECHNICAL HORIZONS
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-archive-ivory mb-6">
            Future Integration Opportunities
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {integrations.map((i) => (
              <div key={i.title} className="border-l border-archive-gold/40 pl-4 py-2">
                <h4 className="font-serif text-base text-archive-ivory mb-2">{i.title}</h4>
                <p className="text-xs leading-5 text-archive-ivory/55">{i.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Lasting Value & Callout */}
        <section className="mt-16 rounded-[2rem] border border-archive-gold/22 bg-archive-obsidian p-8 sm:p-10 shadow-luxury text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold mb-3">
            THE VALUE OF STORIES
          </p>
          <h3 className="font-serif text-2xl text-archive-ivory mb-4">
            How Preserving Stories Creates Lasting Value
          </h3>
          <p className="text-sm leading-7 text-archive-ivory/68 mb-6">
            {lastingValue}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Contact Our Team
            </Link>
            <Link
              href="/build-your-legacy"
              className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
            >
              Explore Legacy Hub
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
