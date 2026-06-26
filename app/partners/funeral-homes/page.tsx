import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const useCases = [
  {
    title: "Interactive Memorial Cards",
    context: "Physical keepsakes given to attendees.",
    description: "Integrate a secure, unique QR key onto the service program. Attendees can scan the card to hear the loved one's spoken cadence, view childhood photo galleries, or read legacy instructions."
  },
  {
    title: "Digital Memory Gathering",
    context: "Collaborative heritage collections.",
    description: "Provide families with a centralized, silent sanctuary where relatives scattered across the world can record private stories, upload photos, and organize ancestral details without public social exposure."
  },
  {
    title: "Tribute Continuity",
    context: "Supporting families after the service.",
    description: "We help you extend your aftercare. Offering a permanent, structured home for stories gives families a constructive, therapeutic space to slowly build a legacy at their own pace."
  }
];

const faqs = [
  {
    q: "How does this compare to standard funeral video tributes?",
    a: "Standard slideshow videos are beautiful for the service but remain static and linear. The Life Archive is a lifetime digital vault—an interactive, structured repository that families can continue to build, listen to, and share across generations."
  },
  {
    q: "How do we introduce this to families without sounding sales-focused?",
    a: "We believe in quiet discovery. We provide high-end, minimalist informational cards that you can include in your arrangement folders or display on a side table, letting families explore voice and legacy preservation at their own comfort level."
  },
  {
    q: "Do we need to manage the digital technology for families?",
    a: "Not at all. The Life Archive is designed to be fully autonomous. Our platform guides the family step-by-step through setting up their sanctuary and uploading memory media, leaving you to focus entirely on your core service."
  }
];

export default async function FuneralHomesPartnerPage() {
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

        {/* Hero Section */}
        <header className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-archive-gold/90">
              TRIBUTE CONTINUITY
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold/90">
              For Funeral Homes
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-archive-ivory/74 font-serif italic">
              &ldquo;Dignified companion care that bridges the physical service with a permanent digital sanctuary.&rdquo;
            </p>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-archive-ivory/60">
              Funeral directors guide families through their most critical days, creating a warm, respectful space for profound farewells. We help you extend that dedication after the service concludes. By pairing physical programs and keepsakes with a secure digital archive, you provide families with a quiet place to safeguard their loved one&apos;s spoken tone, small chapters, and permanent spirit.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={primaryHref}
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
              >
                {primaryLabel}
              </Link>
              <a
                href="#value"
                className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/[0.08]"
              >
                Explore Benefits ↓
              </a>
            </div>
          </div>
        </header>

        {/* Why This Partner Type Matters Section */}
        <section id="value" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 border-t border-archive-gold/15 scroll-mt-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              AFTERCARE EVOLUTION
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              Honoring Stories Beyond the Final Gathering
            </h2>
            <p className="mt-6 text-sm leading-7 text-archive-ivory/70">
              A beautifully arranged service brings immediate comfort, but when the floral arrangements fade and guests go home, the quiet of grief sets in. Families are left with the delicate responsibility of protecting a lifetime of memories. 
            </p>
            <p className="mt-4 text-sm leading-7 text-archive-ivory/70">
              Integrating a digital legacy companion into your services ensures that the tribute doesn&apos;t end at the cemetery gates. It gives families a continuous, therapeutic pathway to record oral histories, digitize old letters, and keep their ancestor&apos;s authentic presence active within their home.
            </p>
          </div>
        </section>

        {/* Benefits Grid Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Seamless Stationers Integration</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                Incorporate custom, subtle QR access nodes directly on your high-end register books, printed memory folders, or keepsake cards without cluttering the aesthetic.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Comfort for Remote Relatives</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                Provide a secure, private hub where relatives who are unable to travel can easily record stories, upload pictures, and share written chapters in real-time.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Resilient Infrastructure</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                Unlike local hard drives or transient video-sharing sites, our platform uses robust enterprise-grade cloud servers to guarantee that these memories survive the generations.
              </p>
            </div>
          </div>
        </section>

        {/* Practical Use Cases Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              SERVICE IMPLEMENTATION
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              Dignified Integration Models
            </h2>
            <p className="mt-3 text-sm text-archive-ivory/55">
              Three quiet, practical use cases to offer a complete legacy experience.
            </p>
          </div>

          <div className="grid gap-6">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="group rounded-[2rem] border border-archive-gold/10 bg-white/[0.01] p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-archive-gold/35 hover:bg-white/[0.03] hover:shadow-lg hover:shadow-archive-gold/5 grid gap-6 sm:grid-cols-[250px_1fr] items-center"
              >
                <div>
                  <h3 className="font-serif text-xl text-archive-champagne mb-1 group-hover:text-archive-gold transition-colors duration-300">
                    {uc.title}
                  </h3>
                  <span className="text-[10px] text-archive-gold/80 uppercase tracking-wider font-semibold">
                    {uc.context}
                  </span>
                </div>
                <p className="text-xs leading-6 text-archive-ivory/65">
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
                COLLABORATION DETAILS
              </p>
              <h2 className="mt-4 font-serif text-3xl text-archive-ivory leading-tight">
                Frequently Asked Inquiries
              </h2>
              <p className="mt-4 text-xs text-archive-ivory/55 leading-relaxed">
                Understand how we support your team in delivering high-fidelity legacy services.
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

        {/* Gentle Implementation/Partnership CTA Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              A Quiet Partnership in Care
            </h2>
            <p className="mt-4 text-sm leading-6 text-archive-ivory/55">
              Contact our team today to discover how we provide unbranded partner folders, samples, and digital onboarding support to elevate your home&apos;s aftercare.
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
