import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const useCases = [
  {
    ref: "SPEC. 01 / INSET",
    title: "Granite Inset Plaques",
    context: "Surgical stone integration.",
    description: "Incorporate a custom-milled, recessed bronze or steel QR plate directly into the face of a granite monument. This provides a flush, seamless, and weather-proof aesthetic that respects the stone's integrity."
  },
  {
    ref: "SPEC. 02 / NICHE",
    title: "Columbarium Keyplates",
    context: "Maximizing limited physical space.",
    description: "For niches and columbaria where physical text is strictly constrained, mount a tiny, highly refined metal code key. Families can scan it to instantly expand the memorial into a deep, living digital catalog of stories."
  },
  {
    ref: "SPEC. 03 / RELIEF",
    title: "Memorial Bench Engravings",
    context: "Thoughtful public tribute spaces.",
    description: "Pair custom engraved stone or wooden memorial benches with a premium metal portal, letting sitters scan to read handwritten journals or listen to spoken histories from those being honored."
  }
];

const faqs = [
  {
    q: "How are the physical keepsake plaques permanently secured to the monument?",
    a: "Our keepsake plaques are engineered to be mounted using high-grade, stone-safe architectural epoxy or rear-threaded mounting studs. This ensures that the plaque becomes an structural, permanent extension of the stone itself."
  },
  {
    q: "What finishes and metals do you offer to match our stone carvings?",
    a: "We understand that aesthetic consistency is critical to monument builders. Each request is reviewed against classic architectural finishes including oil-rubbed bronze, brushed stainless steel, and satin brass so the final direction can complement the stone color or bronze relief."
  },
  {
    q: "Do you supply unlinked plaques for monument showrooms?",
    a: "Yes. We offer blank, non-active demonstration plaques and informational folders for your showroom display, helping clients physically touch the materials and visualize how physical stone and digital stories connect."
  }
];

export default async function MonumentBuildersPartnerPage() {
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

        {/* HERO: Technical schematic grid header layout */}
        <header className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32 grid lg:grid-cols-[1.5fr_1fr] gap-6 items-center">
          <div className="border-l border-archive-gold/30 pl-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-archive-gold/90 mb-1">
              [ CRAFT REFERENCE SHEET ]
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold/90">
              Monument Builders
            </h1>
            <p className="mt-8 max-w-2xl text-sm leading-7 text-archive-ivory/60">
              Monument builders and stonemasons forge the enduring physical markers of our history—carving memories into granite, marble, and bronze. Yet the physical surface of a stone is inherently finite, often reducing a rich life to name and dates. We help you expand your canvas. By integrating premium, custom-milled QR keepsake plaques into your monument designs, you can offer families a dignified portal that connects their physical work with a permanent digital sanctuary.
            </p>
          </div>
          
          {/* Technical blueprint block */}
          <div className="rounded-xl border border-archive-gold/20 bg-archive-obsidian/45 p-6 font-mono text-[10px] text-archive-gold/60 leading-relaxed h-full justify-between flex flex-col min-h-[180px]">
            <div>
              <p className="font-bold text-archive-gold">TECHNICAL INTEGRATION BLUEPRINTS</p>
              <p className="mt-2 text-archive-ivory/50">Recessed Granite Channels</p>
              <p className="text-archive-ivory/50">Stone-Safe Mounting Epoxy Support</p>
              <p className="text-archive-ivory/50">Oxide Finish Weather-Testing Compliance</p>
            </div>
            <div className="border-t border-archive-gold/10 pt-4 mt-4">
              <p className="italic text-archive-champagne">&ldquo;Pairing permanent stonemasonry with secure digital access to voice.&rdquo;</p>
            </div>
          </div>
        </header>

        {/* Why This Partner Type Matters Section */}
        <section id="value" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 border-t border-archive-gold/15">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              EXPANDING THE CANVAS
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              Giving Monumental Craft Infinite Depth
            </h2>
            <p className="mt-6 text-sm leading-7 text-archive-ivory/70">
              The physical monuments you carve stand as reliable anchors across centuries. However, the true legacy of a person lies in the details that a chisel cannot easily capture—their spoken cadence, childhood memories, key advice, and ancestral histories. Pairing your physical engraved craft with custom digital memory access provides the ultimate combination.
            </p>
          </div>
        </section>

        {/* BENEFITS GRID: Thin Sharp Precision Technical Layout */}
        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-archive-gold/20 bg-white/[0.01] p-6">
              <span className="font-mono text-[9px] text-archive-gold/40 block mb-2">[ SEC. 01 / FINISH ]</span>
              <h3 className="font-serif text-lg text-archive-champagne mb-2">Architectural Harmony</h3>
              <p className="text-xs leading-5 text-archive-ivory/60">
                Our keepsake plaques are manufactured with premium, heavyweight metals (bronze, brass, steel) to blend seamlessly with traditional stone carvings, preserving structural elegance.
              </p>
            </div>
            <div className="rounded-xl border border-archive-gold/20 bg-white/[0.01] p-6">
              <span className="font-mono text-[9px] text-archive-gold/40 block mb-2">[ SEC. 02 / ADHESIVE ]</span>
              <h3 className="font-serif text-lg text-archive-champagne mb-2">Stone-Safe Mounting</h3>
              <p className="text-xs leading-5 text-archive-ivory/60">
                Plaques are engineered to be easily and securely mounted using standard stone adhesives or rear-mounting studs, keeping the installation process quick and reliable.
              </p>
            </div>
            <div className="rounded-xl border border-archive-gold/20 bg-white/[0.01] p-6">
              <span className="font-mono text-[9px] text-archive-gold/40 block mb-2">[ SEC. 03 / PRIVACY ]</span>
              <h3 className="font-serif text-lg text-archive-champagne mb-2">Pure, Dignified Space</h3>
              <p className="text-xs leading-5 text-archive-ivory/60">
                Like your monuments, our platform is structured as a dignified sanctuary. Gated behind RLS privacy and entirely free from ads, social media distractions, or public noise.
              </p>
            </div>
          </div>
        </section>

        {/* PRACTICAL USE CASES: Tight Grid Schematic Coordinates */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              DESIGN STANDARDS
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              Physical Stone Integrations
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="group rounded-xl border border-archive-gold/15 bg-archive-obsidian p-6 transition-all duration-300 hover:border-archive-gold/45"
              >
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                  <span className="font-mono text-[9px] text-archive-gold/50 font-bold">{uc.ref}</span>
                  <span className="text-[10px] text-archive-gold uppercase tracking-wider font-semibold">{uc.context}</span>
                </div>
                <h3 className="font-serif text-lg text-archive-champagne mb-2 group-hover:text-archive-gold transition-colors duration-300">
                  {uc.title}
                </h3>
                <p className="text-xs leading-5 text-archive-ivory/60">
                  {uc.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                CRAFT COMPLIANCE
              </p>
              <h2 className="mt-4 font-serif text-3xl text-archive-ivory leading-tight">
                Frequently Asked Inquiries
              </h2>
              <p className="mt-4 text-xs text-archive-ivory/55 leading-relaxed">
                Learn more about our material engineering, mounting options, and design standards.
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
              An Alliance of Stonemasonry and Heritage
            </h2>
            <p className="mt-4 text-sm leading-6 text-archive-ivory/55">
              Contact our team today to request high-end metal plaque samples, mounting templates, and custom ordering structures for monument showrooms.
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
                  <Link href="/storykeeper-products" className="hover:text-archive-champagne hover:underline transition">
                    Storykeeper Products
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
