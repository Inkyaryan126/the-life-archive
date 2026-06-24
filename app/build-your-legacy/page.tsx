import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const legacyPillars = [
  {
    title: "Preserve Your Voice",
    description: "Your tone, laugh, and cadence carry your presence. Record simple spoken stories or quiet messages to give future generations a way to truly hear you.",
    prompt: "What does your voice sound like when you speak of the things you love?",
    accent: false
  },
  {
    title: "Record Hard-Won Wisdom",
    description: "Write down or speak the core guidelines that kept you grounded. Share the guidelines, values, and philosophies that took you a lifetime to formulate.",
    prompt: "What lesson took you the longest to learn?",
    accent: true // Highlight the central items for asymmetry
  },
  {
    title: "Document Your Chapters",
    description: "Capture the small moments and great turning points alike—childhood memories, first jobs, defining struggles, and quiet triumphs that shaped your character.",
    prompt: "What story deserves to be remembered?",
    accent: false
  },
  {
    title: "Prepare Future Messages",
    description: "Construct thoughtful letters, videos, or audio messages destined for future milestones—graduations, marriages, or simple quiet anniversaries.",
    prompt: "What do you hope they remember when you are not there to tell them?",
    accent: true
  },
  {
    title: "Gather Family Heritage",
    description: "Collect oral history, old photographs, origin stories, and family trees, along with cherished recipes and stories of ancestral homes.",
    prompt: "Where did your family's journey in this country begin?",
    accent: false
  },
  {
    title: "Organize Order and Care",
    description: "Consolidate practical guidance, important documents, and private wishes so your family can proceed tomorrow with clarity and peace.",
    prompt: "How can you leave behind ease, order, and absolute care?",
    accent: false
  }
];

const interviewQuestions = [
  {
    question: "Tell me about your childhood.",
    context: "Describe the house you grew up in, your favorite hiding spot, or what dinner felt like on a quiet winter evening."
  },
  {
    question: "What was your first job?",
    context: "Explore what it taught you about hard work, the value of a dollar, and the path you eventually chose."
  },
  {
    question: "What advice would you give your younger self?",
    context: "Speak directly to the version of you who was struggling, unsure, or just starting out in the world."
  },
  {
    question: "What mistake taught you the most?",
    context: "Reframe a difficult failure or misstep into a priceless guide for those who will follow in your footsteps."
  },
  {
    question: "What do you hope people remember about you?",
    context: "Focus on the quiet impact, the kindness, and the small daily habits that made you who you were."
  }
];

const faqs = [
  {
    q: "Who has access to my legacy archive?",
    a: "You retain absolute, granular control over everything you upload. Your archive remains completely private and locked behind enterprise-grade security until you choose to explicitly share a private link or connect it to a physical Storykeeper keepsake card."
  },
  {
    q: "Is this a monthly subscription? How does it endure?",
    a: "We believe legacy should not be subject to monthly billing cycles. The Life Archive is built on a long-term infrastructure model. We fund the preservation platform through the sale of premium physical keepsakes (such as cards, plaques, and tags). Our infrastructure is structured to survive generations without advertisements or data monetization."
  },
  {
    q: "What file formats do you support?",
    a: "We preserve your voice notes, journals, images, and videos in standard, non-proprietary formats—primarily MP3, MP4, high-resolution JPEG, and PDF. This ensures your assets remain accessible and readable on future operating systems a century from now."
  },
  {
    q: "How much content can I store?",
    a: "Your Life Archive includes generous storage for voice recordings, written lessons, and high-resolution memories. Our goal is to preserve the refined essence of a life—the primary chapters and spoken cadences—rather than unorganized camera rolls."
  }
];

export default async function BuildYourLegacyPage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn ? "Enter Dashboard" : "Begin Your Archive";

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

        {/* HERO: Center-Focused Classical Guide Editorial */}
        <header className="flex items-center px-5 py-28 sm:px-8 sm:py-36 text-center max-w-4xl mx-auto">
          <div className="w-full">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-archive-gold">
              WHAT WILL THEY REMEMBER OF YOU?
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-tight sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold/90">
              The Life Archive
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-xl leading-8 text-archive-ivory/74 font-serif italic">
              &ldquo;What took you a lifetime to learn? What stories deserve to be remembered by your grandchildren?&rdquo;
            </p>
            <p className="mt-6 max-w-2xl mx-auto text-sm leading-7 text-archive-ivory/60">
              The Life Archive is a quiet, permanent digital sanctuary where you intentionally choose what survives you. Far from noisy social feeds, we help families record the spoken cadence, hard-won lessons, and silent turning points that define heritage.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href={primaryHref}
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
              >
                {primaryLabel}
              </Link>
              <a
                href="#pillars"
                className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/[0.08]"
              >
                Explore the Pillars ↓
              </a>
            </div>
          </div>
        </header>

        {/* Emotional Introduction Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 border-t border-archive-gold/15">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              THE PASSAGE OF TIME
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              The Quiet Fade of a Generation
            </h2>
            <p className="mt-6 text-sm leading-7 text-archive-ivory/70">
              Within three generations, most family details are lost. The specific tone of a mother&apos;s laugh, the values that navigated a grandfather through difficulty, the stories told over kitchen tables—they slip away, leaving behind only dates on a cold headstone and a box of silent, unlabeled photographs.
            </p>
            <p className="mt-4 text-sm leading-7 text-archive-ivory/70">
              We believe memory is too precious to be treated like fleeting digital content. The Life Archive was built to disrupt this fading. We offer a permanent, dignified museum for your identity—a place where grandchildren you may never meet can sit and hear your actual voice telling them how you lived.
            </p>
          </div>
        </section>

        {/* Why This Matters Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Intimacy Over Exposure</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                This is a clean, silent sanctuary. There are no public comments, no algorithms, and no notifications. Your heritage is held in absolute safety—private and gated until you choose to share it.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">The Auditory Cadence</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                A photograph captures a silhouette, but the voice carries the spirit. Hearing a parent speak of their youth, with their unique pauses and laughter, brings back warmth more instantly than any other medium.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">A Gift of Clarity</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                An archive is a final act of profound care. Spacing out your stories, core wisdom, and final guidance takes the burden off grieving children, giving them an orderly and clear pathway forward.
              </p>
            </div>
          </div>
        </section>

        {/* THE SIX PILLARS SECTION: Asymmetric Card Offset Grid */}
        <section id="pillars" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-b border-archive-gold/15 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="border-t border-b border-archive-gold/20 py-4 mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                BUILDING BLOCKS OF HERITAGE
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-archive-ivory">
                The Six Legacy Pillars
              </h2>
            </div>
            <p className="text-sm text-archive-ivory/55">
              These six core categories allow you to construct an archive that is complete, beautiful, and deeply human.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {legacyPillars.map((pillar, idx) => (
              <div
                key={pillar.title}
                className={`rounded-[2rem] p-8 shadow-luxury flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] ${
                  pillar.accent 
                    ? "border-2 border-archive-gold/35 bg-gradient-to-b from-archive-gold/[0.05] to-transparent md:-translate-y-2"
                    : "border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-serif text-xl text-archive-champagne">
                      {pillar.title}
                    </h3>
                    <span className="text-[10px] text-archive-gold/50 font-mono font-bold">
                      0{idx + 1}
                    </span>
                  </div>
                  <p className="text-xs leading-6 text-archive-ivory/60 mb-8">
                    {pillar.description}
                  </p>
                </div>
                <div className="border-t border-archive-gold/10 pt-5">
                  <p className="text-[10px] uppercase tracking-wider text-archive-gold font-semibold mb-2">
                    Reflective Inquiry
                  </p>
                  <p className="text-xs italic leading-5 text-archive-ivory/70">
                    &ldquo;{pillar.prompt}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Beautiful Feature Section: Interview Mode */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <div className="rounded-[2.5rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.02] to-transparent p-8 sm:p-12 shadow-luxury relative overflow-hidden backdrop-blur-[2px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-archive-gold/5 blur-3xl rounded-full" />
            <div className="grid gap-12 lg:grid-cols-[1fr_400px] items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                  INNOVATION IN PRESERVATION
                </p>
                <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
                  Guided Legacy: Interview Mode
                </h2>
                <p className="mt-6 text-sm leading-7 text-archive-ivory/70">
                  Reflecting on an entire lifetime can feel overwhelming. To make the process natural and effortless, we are developing <strong className="text-archive-gold">Legacy Interview Mode</strong>.
                </p>
                <p className="mt-4 text-sm leading-7 text-archive-ivory/60">
                  Acting as a silent biographer, this guided experience prompts you, your parents, or your grandparents with simple, evocative inquiries. All you have to do is record a spoken answer. Our platform indexes and structures your voice files, linking them permanently to your secure vault.
                </p>
                <div className="mt-8">
                  <span className="rounded-full bg-archive-gold/10 border border-archive-gold/30 px-5 py-2.5 text-xs font-semibold text-archive-champagne uppercase tracking-wider">
                    Future Platform Capability
                  </span>
                </div>
              </div>

              <div className="grid gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold mb-1">
                  Sample Interview Queries
                </p>
                {interviewQuestions.map((iq) => (
                  <div
                    key={iq.question}
                    className="rounded-xl border border-archive-gold/10 bg-white/[0.015] p-5 text-xs transition hover:bg-white/[0.03]"
                  >
                    <p className="font-semibold text-archive-ivory mb-1">
                      {iq.question}
                    </p>
                    <p className="text-archive-ivory/55 leading-relaxed">
                      {iq.context}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                HONEST RESPONSES
              </p>
              <h2 className="mt-4 font-serif text-3xl text-archive-ivory leading-tight">
                Frequently Asked Inquiries
              </h2>
              <p className="mt-4 text-xs text-archive-ivory/55 leading-relaxed">
                If you have further thoughts on trust, longevity, or privacy, we are always here to discuss them.
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

        {/* Final Call to Action Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              An Archive That Outlasts the Digital Noise
            </h2>
            <p className="mt-4 text-sm leading-6 text-archive-ivory/55">
              The story of a life does not require a volume. It simply requires a quiet, permanent home. Start your sanctuary today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={primaryHref}
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
              >
                {primaryLabel}
              </Link>
              <Link
                href="/keepsakes"
                className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/[0.08]"
              >
                Explore Physical Keepsakes
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
