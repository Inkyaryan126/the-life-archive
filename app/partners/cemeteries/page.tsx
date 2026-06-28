import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const useCases = [
  {
    title: "Weatherproof Grave Markers",
    context: "Permanent physical-to-digital connections.",
    description: "Incorporate elegant, custom-milled QR keepsake plaques directly onto new or existing headstones, markers, or columbarium niches. A brief scan instantly opens their secure living archive."
  },
  {
    title: "Botanical Bench Plaques",
    context: "Quiet spaces of daily reflection.",
    description: "Equip memorial benches, garden trees, or chapel pathways with heavy-gauge bronze or stainless steel plaques, allowing walkers to sit and listen to voice guidelines or historical anecdotes."
  },
  {
    title: "Historical Walking Tours",
    context: "Preserving community history.",
    description: "For historical or heritage parks, connect physical plots of notable historical founders to public educational archives, bringing the cemetery's legacy to life for students and visitors."
  }
];

const faqs = [
  {
    q: "Are the keepsake plaques durable enough for outdoor weathering?",
    a: "Yes. Our physical keepsake keys are designed for permanent outdoor longevity. Requests are reviewed around high-grade architectural bronze or deep-etched stainless steel with UV-resistant coatings designed to survive generations of exposure."
  },
  {
    q: "Do families need permission to attach plaques to existing monuments?",
    a: "Generally, yes. We encourage families and monument owners to consult with your park's administration guidelines. We design our plaques with conservative, high-end aesthetics (ranging from 1 to 2 inches) to comply with traditional memorial park guidelines."
  },
  {
    q: "How does the digital archive handle long-term hosting?",
    a: "The Life Archive is built on decentralized cloud databases structured to endure. Our storage model is funded entirely through physical keepsakes rather than transient monthly plans, guaranteeing that files remain accessible decades from now."
  }
];

export default async function CemeteriesPartnerPage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn ? "Enter My Archives" : "Partner with Us";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory flex flex-col justify-between">
      <DesignBackdrop />

      <div className="relative z-10 flex flex-col flex-grow">
        {/* Navigation Bar with Glass Blur */}
        <nav className="sticky top-0 z-50 mx-auto w-full border-b border-archive-gold/10 bg-archive-obsidian/45 backdrop-blur-md px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="transition opacity-90 hover:opacity-100">
              <SiteLogo width={420} height={120} />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/keepsakes"
                className="text-xs font-semibold uppercase tracking-wider text-archive-ivory/80 transition hover:text-archive-gold"
              >
                Keepsakes
              </Link>
              {isSignedIn && (
                <Link
                  href="/member-card"
                  className="text-xs font-semibold uppercase tracking-wider text-archive-ivory/80 transition hover:text-archive-gold"
                >
                  Storykeeper Card
                </Link>
              )}
              <Link
                href={primaryHref}
                className="rounded-full border border-archive-gold/40 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/5"
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO: Heavy Landscape Spacing Layout */}
        <header className="mx-auto w-full max-w-7xl px-5 py-32 sm:px-8 sm:py-40 text-left border-b border-archive-gold/10">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-archive-gold/90">
              LIVING PLACES OF MEMORY
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold/90">
              Cemeteries & Parks
            </h1>
            <p className="mt-8 max-w-3xl text-xl leading-8 text-archive-ivory/74 font-serif italic">
              &ldquo;Connecting physical stones and quiet gardens with the warmth of living voices and history.&rdquo;
            </p>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-archive-ivory/60">
              Memorial parks serve as beautiful, physical sanctuaries of absolute reflection. They hold names, dates, and silent plots. But standing before a headstone, descendants yearn to hear their loved one&apos;s laugh, study their handwritten letters, and learn how they lived. We help you bridge this distance, offering simple, respectful portals that connect static markers to permanent digital sanctuaries.
            </p>
            <div className="mt-10">
              <Link
                href={primaryHref}
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
        </header>

        {/* Why This Partner Type Matters Section */}
        <section id="value" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              SACRED RECONTEXTUALIZATION
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              Giving Voice to the Graveside Sanctuary
            </h2>
            <p className="mt-6 text-sm leading-7 text-archive-ivory/70">
              Cemeteries are not places of the dead—they are places where the living go to remember. Yet traditional headstones are limited to a handful of carved letters, often reducing an entire lifetime of experiences, relationships, and hard-won lessons to a single static hyphen.
            </p>
            <p className="mt-4 text-sm leading-7 text-archive-ivory/70">
              By introducing custom-milled, weather-proof keepsakes to physical monuments, you allow families to step beyond the cold stone. A visitor standing at a columbarium can scan a small, elegant marker to listen to their grandmother&apos;s comforting vocal cadence, view old family photos, and leave feeling a closer connection.
            </p>
          </div>
        </section>

        {/* BENEFITS GRID: Solid Stone Block Visual Card Layout */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-archive-gold/30 bg-archive-obsidian p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Honoring Monument Rules</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                We craft our plaques with high-end, classic materials to blend naturally with granite, bronze, and stone, preserving your park&apos;s architectural guidelines.
              </p>
            </div>
            <div className="rounded-2xl border border-archive-gold/30 bg-archive-obsidian p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">A Dignified Digital Museum</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                Our platform is completely private, silent, and gated. Families find a space of pure sanctuary—free of ads, public feeds, or social media distraction.
              </p>
            </div>
            <div className="rounded-2xl border border-archive-gold/30 bg-archive-obsidian p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Intergenerational Return</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                By enabling descendants to scan and hear ancestors speak in their own voice, we encourage grandchildren and future generations to actively visit the physical site.
              </p>
            </div>
          </div>
        </section>

        {/* Practical Use Cases Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              PARK INTEGRATION
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              Physical-to-Digital Frameworks
            </h2>
            <p className="mt-3 text-sm text-archive-ivory/55">
              Three respectful, practical methods to add digital legacy options to physical memorials.
            </p>
          </div>

          <div className="grid gap-6">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="group rounded-2xl border border-archive-gold/20 bg-archive-obsidian p-8 transition-all duration-300 hover:border-archive-gold/40 flex flex-col sm:flex-row sm:items-center justify-between"
              >
                <div className="max-w-2xl">
                  <h3 className="font-serif text-xl text-archive-champagne mb-1 group-hover:text-archive-gold transition-colors duration-300">
                    {uc.title}
                  </h3>
                  <span className="text-[10px] text-archive-gold/80 uppercase tracking-wider font-semibold block mb-2">
                    {uc.context}
                  </span>
                  <p className="text-xs leading-6 text-archive-ivory/65">
                    {uc.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                SANCTUARY DETAILS
              </p>
              <h2 className="mt-4 font-serif text-3xl text-archive-ivory leading-tight">
                Frequently Asked Inquiries
              </h2>
              <p className="mt-4 text-xs text-archive-ivory/55 leading-relaxed">
                Learn more about our materials, installation, and architectural compliance.
              </p>
            </div>
            <div className="grid gap-8">
              {faqs.map((faq) => (
                <div key={faq.q} className="border-b border-archive-gold/10 pb-6">
                  <h3 className="font-serif text-lg text-archive-champagne mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-xs leading-6 text-archive-ivory/60">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gentle Partnership CTA Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              An Enduring Digital Canopy
            </h2>
            <p className="mt-4 text-sm leading-6 text-archive-ivory/55">
              Contact our team today to review our architectural product samples, integration blueprints, and quiet options for new cemetery expansions.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={primaryHref}
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
              >
                {primaryLabel}
              </Link>
              <Link
                href="/build-your-legacy"
                className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/[0.08]"
              >
                Explore Legacy Pillars
              </Link>
            </div>
          </div>
        </section>

        {/* Editorial Legacy Footer */}
        <footer className="relative z-10 border-t border-archive-gold/20 bg-archive-obsidian/40 backdrop-blur-md mt-auto py-16 text-xs text-archive-ivory/60">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 grid gap-8 md:grid-cols-4">
            <div>
              <SiteLogo width={360} height={110} className="mb-8 opacity-100" />
              <p className="leading-6 max-w-xs text-[11px]">
                The Life Archive is a quiet, permanent digital sanctuary helping you intentionally decide what survives you. Preserve your voice, identity, and life lessons for generations to come.
              </p>
            </div>
            <div>
              <h4 className="text-archive-gold font-semibold uppercase tracking-wider mb-4">Legacy Hub</h4>
              <ul className="grid gap-3">
                <li>
                  <Link href="/build-your-legacy" className="hover:text-archive-champagne hover:underline transition">
                    Build Your Legacy
                  </Link>
                </li>
                <li>
                  <Link href="/preserve-their-voice" className="hover:text-archive-champagne hover:underline transition">
                    Preserve Their Voice
                  </Link>
                </li>
                <li>
                  <Link href="/keepsakes" className="hover:text-archive-champagne hover:underline transition">
                    Keepsake Store
                  </Link>
                </li>
                <li>
                  <Link href="/help-for-families" className="hover:text-archive-champagne hover:underline transition">
                    Help for Families (After Loss)
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-archive-gold font-semibold uppercase tracking-wider mb-4">Partner Ecosystem</h4>
              <ul className="grid gap-3">
                <li>
                  <Link href="/partners/funeral-homes" className="hover:text-archive-champagne hover:underline transition">
                    Funeral Homes
                  </Link>
                </li>
                <li>
                  <Link href="/partners/cemeteries" className="hover:text-archive-champagne hover:underline transition">
                    Cemeteries &amp; Parks
                  </Link>
                </li>
                <li>
                  <Link href="/partners/monuments" className="hover:text-archive-champagne hover:underline transition">
                    Monument Builders
                  </Link>
                </li>
                <li>
                  <Link href="/partners/hospice" className="hover:text-archive-champagne hover:underline transition">
                    Hospice Care Providers
                  </Link>
                </li>
                <li>
                  <Link href="/partners/estate-planners" className="hover:text-archive-champagne hover:underline transition">
                    Estate Planners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-archive-gold font-semibold uppercase tracking-wider mb-4 font-serif italic">Every Legacy Begins...</h4>
              <p className="leading-5 max-w-xs text-[11px] mb-4">
                &ldquo;What story deserves to be remembered? What mistake taught you the most? What do you hope they remember when you are gone?&rdquo;
              </p>
              <p className="text-[10px] text-archive-gold/60">
                © 2026 The Life Archive. All rights preserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
