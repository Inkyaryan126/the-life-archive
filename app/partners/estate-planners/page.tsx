import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const useCases = [
  {
    title: "The Legacy Ledger",
    context: "Structured non-legal documentation.",
    description: "Organize client values, important digital accounts, personal family stories, and burial preferences into a highly structured, encrypted repository for their descendants."
  },
  {
    title: "Guided Family Onboarding",
    context: "Simplifying legacy transition.",
    description: "We provide your clients with gentle, conversational guidelines to document oral history, write down handwritten recipes, and map family trees, completing their estate registry."
  },
  {
    title: "Heirloom Closing Gifts",
    context: "An elegant, lasting value-add.",
    description: "Present clients with a custom-etched physical Storykeeper Card upon signing their estate documents—giving them a beautiful physical key to store their life's personal heritage."
  }
];

const faqs = [
  {
    q: "Does this platform store wills, trusts, or other legal documents?",
    a: "No. The Life Archive is strictly a personal, non-legal memory and heritage preservation platform. We do not draft, store, or execute legal documents, nor do we provide legal or financial advice. Our platform is a dedicated home for personal voice recordings, stories, values, and guidelines."
  },
  {
    q: "How does this benefit my advisory practice?",
    a: "It allows you to provide a comprehensive, holistic legacy service. While you construct the financial and legal structures that protect their assets, we offer their families a premium, dignified sanctuary to protect their personal identity and voice."
  },
  {
    q: "Is client data safe and protected from monetization?",
    a: "Absolutely. Absolute privacy is our foundation. We sell no client data, host no ads, and run no tracking algorithms. All stories and audios are encrypted and secured under client-controlled privacy protocols."
  }
];

export default async function EstatePlannersPartnerPage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn ? "Enter Dashboard" : "Partner with Us";

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
              PERSONAL HERITAGE PRESERVATION
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold/90">
              For Estate Planners
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-archive-ivory/74 font-serif italic">
              &ldquo;Seamlessly organizing personal legacy, family stories, and final wishes alongside your legal structures.&rdquo;
            </p>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-archive-ivory/60">
              Estate planning attorneys and wealth advisors construct the legal and financial frameworks that secure a family&apos;s physical assets. But once the wills, trusts, and deeds are signed, clients often wonder how to pass down their personal guidelines, values, stories, and quiet wishes to their descendants. We help you bridge this gap. By offering a beautiful, non-legal heritage sanctuary, you provide clients with a complete legacy experience.
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
              HOLISTIC ASSET PROTECTION
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              Organizing the Assets of Character and Voice
            </h2>
            <p className="mt-6 text-sm leading-7 text-archive-ivory/70">
              While wills and trusts distribute properties and protect capital, they cannot capture the warmth of a voice, the values that guided a client&apos;s decisions, or the histories of their childhood homes. These personal assets are often lost in a single generation.
            </p>
            <p className="mt-4 text-sm leading-7 text-archive-ivory/70">
              By introducing a quiet digital heritage vault to your advisory services, you allow clients to secure their intangible values. They can draft messages destined for future milestones—such as a grandchild&apos;s wedding—consolidate non-legal burial wishes, and store spoken guidelines, leaving behind total ease and care.
            </p>
          </div>
        </section>

        {/* Benefits Grid Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Holistic Aftercare</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                Help clients organize physical estates alongside personal digital heritage. Ensure family history, voice recordings, and rules survive alongside material inheritances.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Absolute Security &amp; Trust</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                No ads, no data monetization, no social algorithms. Your clients&apos; sensitive journals, voices, and family origin details remain under their absolute, gated control.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">A Dignified Closing Gift</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                Provide custom Storykeeper keepsakes to clients upon trust signing, giving them a heavy, beautiful physical key to lock their family&apos;s personal archives.
              </p>
            </div>
          </div>
        </section>

        {/* Practical Use Cases Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              CLIENT SERVICES
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              Holistic Planning Frameworks
            </h2>
            <p className="mt-3 text-sm text-archive-ivory/55">
              Three quiet, practical methods to incorporate personal legacy planning into your advisory practice.
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
                TRUST STANDARDS
              </p>
              <h2 className="mt-4 font-serif text-3xl text-archive-ivory leading-tight">
                Frequently Asked Inquiries
              </h2>
              <p className="mt-4 text-xs text-archive-ivory/55 leading-relaxed">
                Learn more about our non-legal compliance, security standards, and client care.
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
              An Extra Layer of Profound Care
            </h2>
            <p className="mt-4 text-sm leading-6 text-archive-ivory/55">
              Contact our team today to request high-end sample keepsake keys, informational leaflets, or to establish tailored partner accounts for your client base.
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
