import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const useCases = [
  {
    title: "Guided Audio Anthologies",
    context: "Bedside memory collection.",
    description: "Provide clients with quiet, comforting prompts that guide them to record short audio reflections. This helps families capture oral history, life tips, or simple bedtime notes without any fatigue."
  },
  {
    title: "Family Memory Portals",
    context: "Collaborating with close relatives.",
    description: "Create a silent, secure digital vault where family members can join together to compile old images, scan hand-written notes, and write down family trees in absolute privacy."
  },
  {
    title: "Bereavement Preparation",
    context: "Reducing stress during transition.",
    description: "Help families construct their historical records in advance of loss. By building their archive slowly and with quiet care, they spare descendants from searching for details later."
  }
];

const faqs = [
  {
    q: "Is The Life Archive a medical or palliative care service?",
    a: "No. The Life Archive is strictly a digital legacy preservation platform. We do not provide medical, clinical, or counseling services. We act solely as a gentle companion tool to support personal legacy conversations and memory archiving."
  },
  {
    q: "How do we introduce legacy work without causing emotional distress?",
    a: "We find that legacy work is a source of profound comfort. We provide quiet, unbranded informational leaflets and conversational guides that focus on the beauty of a person's life lessons, helping them discover the process at their own pace."
  },
  {
    q: "Can hospice staff help families record their memories?",
    a: "Yes. Our mobile interface is incredibly intuitive. Care coordinators or family members can easily record voice files directly from a phone at the bedside with a single tap, requiring no technical experience."
  }
];

export default async function HospiceCarePartnerPage() {
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
              LEGACY CONVERSATION COMPANIONS
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold/90">
              For Hospice Care Providers
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-archive-ivory/74 font-serif italic">
              &ldquo;Supporting quiet reflection and sensitive memory collection during life&apos;s final chapters.&rdquo;
            </p>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-archive-ivory/60">
              Hospice and palliative care teams provide unmatched grace, dignity, and comfort to families during their most sensitive transitions. While your team supports physical comfort, we provide a gentle digital companion for the spirit. We help you support families in recording authentic spoken voices, organizing childhood stories, and preparing legacy books—ensuring their presence remains clear for generations.
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
              THERAPEUTIC PRESERVATION
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              A Quiet Harbor for Spoken History
            </h2>
            <p className="mt-6 text-sm leading-7 text-archive-ivory/70">
              When a family enters palliative or hospice care, the focus shifts to quality of time. Beyond medical charts, families feel a profound urge to record the spoken cadence, values, and memories of the person they are preparing to let go of—yet they often do not know where to start.
            </p>
            <p className="mt-4 text-sm leading-7 text-archive-ivory/70">
              Offering a dignified, non-clinical archive platform provides families with a constructive and deeply therapeutic focus. It turns bedside conversations into permanent family heirlooms. Simply holding a phone to record a parent&apos;s story gives comfort that outlasts physical absence.
            </p>
          </div>
        </section>

        {/* Benefits Grid Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Unpressured Pacing</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                We believe memory is too sacred to rush. Our platform allows families to build their archives slowly and quietly, entirely at their own comfort level.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Absolute Security &amp; Trust</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                Every memory remains fully private and gated behind strict enterprise security, completely free from ads, public social exposure, or algorithmic recommendations.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Physical Storyteller Keys</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                Link the completed digital archive to custom-milled physical cards or keepsakes, giving descendants a tangible portal they can touch and pass down.
              </p>
            </div>
          </div>
        </section>

        {/* Practical Use Cases Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              BEDSIDE ASSISTANCE
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              Dignified Support Models
            </h2>
            <p className="mt-3 text-sm text-archive-ivory/55">
              Three gentle, non-disruptive ways families can compile their personal heritage.
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
                CARE ETHICS
              </p>
              <h2 className="mt-4 font-serif text-3xl text-archive-ivory leading-tight">
                Frequently Asked Inquiries
              </h2>
              <p className="mt-4 text-xs text-archive-ivory/55 leading-relaxed">
                Understand how we support hospice coordinators in preserving patient memories.
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
              An Extra Layer of Compassionate Support
            </h2>
            <p className="mt-4 text-sm leading-6 text-archive-ivory/55">
              Contact our team today to request physical conversational templates, demo materials, or to establish custom legacy programs for your hospice care facility.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={primaryHref}
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
              >
                {primaryLabel}
              </Link>
              <Link
                href="/preserve-their-voice"
                className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/[0.08]"
              >
                Explore Voice Preservation
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
