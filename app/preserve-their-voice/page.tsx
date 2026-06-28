import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const voiceExamples = [
  {
    num: "01",
    title: "Advice from a Parent",
    scenario: "Unspoken guidelines and quiet reassurance.",
    description: "Whether it is reassuring advice during a career transition or practical guidance on building a home, hearing a parent's voice navigate these principles carries ultimate comfort."
  },
  {
    num: "02",
    title: "Grandparent Stories",
    scenario: "Bridging the century.",
    description: "Capture memories of their childhood, first dates, historical shifts, and long-lost neighborhoods in the warm, slow cadence of those who walked the earth before us."
  },
  {
    num: "03",
    title: "Family Recipes",
    scenario: "The auditory kitchen guide.",
    description: "Instead of a faded recipe card, preserve the verbal secrets to the perfect holiday dinner—complete with the ambient kitchen sounds, laughter, and corrections."
  },
  {
    num: "04",
    title: "Milestone Greetings",
    scenario: "An annual return.",
    description: "An archive of simple, loving messages that future descendants can play on their own milestones, feeling the immediate warmth of their ancestors' presence."
  },
  {
    num: "05",
    title: "Core Philosophies",
    scenario: "Hard-won life values.",
    description: "Record the definitions of honor, kindness, failure, and defining guidelines straight from the person who formulated them through years of living."
  }
];

const faqs = [
  {
    q: "How do I record a loved one who is reluctant to speak?",
    a: "We find that starting with simple, specific prompts—like asking about their first job, their childhood pet, or what Sunday dinner felt like—quickly removes any self-consciousness. Once they start remembering, the technology fades into the background and the conversation flows naturally."
  },
  {
    q: "Can I preserve old voicemails or existing recordings?",
    a: "Absolutely. Our platform makes it simple to upload standard audio file formats (MP3, WAV, M4A) from your phone or computer. You can easily transition precious voicemail greetings or old cassette recordings into permanent, safe chapters in your digital vault."
  },
  {
    q: "What is the recording quality like?",
    a: "We support high-fidelity, non-proprietary audio encoding to capture the rich texture, deep sighs, and small laughter of the speaker's voice. We keep the audio raw and pure, exactly as it was recorded, to maintain absolute authenticity."
  }
];

export default async function PreserveTheirVoicePage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn ? "Enter My Archives" : "Begin Your Archive";

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
                  The Life Archive Memory Card
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

        {/* HERO: Asymmetric Left-Heavy Split */}
        <header className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-archive-gold/90">
              THE SOLEMNITY OF PRESENCE
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold/90">
              Preserve Their Voice
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-archive-ivory/60">
              A portrait outlines what someone looked like. A written note defines what they thought. But a voice recording—the laughter, the deep pause, the unique cadence of their speech—tells you exactly who they were. Our voice is our most immediate, emotional thumbprint. Over time, it becomes the single most precious heirloom a family can hold.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={primaryHref}
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.02] to-transparent p-8 sm:p-10 shadow-luxury">
            <h3 className="font-serif text-lg text-archive-gold uppercase tracking-[0.15em] mb-4">Dialogue Log</h3>
            <p className="text-xs italic leading-6 text-archive-ivory/70">
              &ldquo;We spend years learning from those we love, yet the specific sound of their voice is always forgotten first. Let&apos;s make sure it endures.&rdquo;
            </p>
          </div>
        </header>

        {/* DRAMATIC FULL-WIDTH BANNER QUOTE WRAPPED IN GOLD LINES */}
        <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
          <div className="border-t border-b border-archive-gold/20 py-10 text-center max-w-4xl mx-auto">
            <p className="font-serif text-2xl sm:text-3xl italic text-archive-champagne">
              &ldquo;Hearing a parent speak of their youth, with their unique pauses and soft chuckles, brings back genuine warmth more instantly than any other medium.&rdquo;
            </p>
          </div>
        </section>

        {/* Emotional Introduction Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              THE AUDITORY FOOTPRINT
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              The Intimate Resonance of Sound
            </h2>
            <p className="mt-6 text-sm leading-7 text-archive-ivory/70">
              Years after a parent or grandparent is gone, we find ourselves yearning not just for their static picture, but for their presence. We wish we could sit across the kitchen table and hear them say our name, offer a piece of casual advice, or tell that familiar story one more time. Preserving voice is the closest we can get to keeping their spirit close.
            </p>
          </div>
        </section>

        {/* Why Voices Matter Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Authentic Inflection</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                A transcription captures the words, but loses the soul. The deep sigh, the slight crackle, the soft chuckle—these small inflections carry the genuine emotion and vulnerability of the speaker.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Effortless Capturing</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                We make the preservation process natural. You can easily record audio directly from your smartphone, upload precious voicemails from your carrier log, or import audio files from family interviews.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Generation Bridge</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                Give your descendants a priceless legacy. Allow grandchildren born decades from now to hear their ancestors describe childhood, marriage, and struggle in their own words.
              </p>
            </div>
          </div>
        </section>

        {/* PRACTICAL VALUE: Script-Style Screenplay Vertical Timeline */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              AUDIO ANTHOLOGY
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              Examples of What to Preserve
            </h2>
            <p className="mt-3 text-sm text-archive-ivory/55">
              Start with these five thoughtful spoken capsules to build a rich historical record.
            </p>
          </div>

          <div className="grid gap-8 max-w-5xl mx-auto">
            {voiceExamples.map((ex) => (
              <div
                key={ex.title}
                className="group relative border-l-2 border-archive-gold/20 pl-8 pb-4 transition-all duration-300 hover:border-archive-gold/50"
              >
                {/* Timeline node */}
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border border-archive-gold/40 bg-archive-obsidian group-hover:bg-archive-gold/90 transition-colors duration-300" />
                
                <div className="grid sm:grid-cols-[180px_1fr] gap-4">
                  <div>
                    <span className="font-mono text-xs text-archive-gold/50 font-bold block mb-1">
                      ACT {ex.num}
                    </span>
                    <h3 className="font-serif text-lg text-archive-champagne leading-tight">
                      {ex.title}
                    </h3>
                    <p className="text-[10px] text-archive-gold uppercase tracking-wider font-semibold mt-1">
                      {ex.scenario}
                    </p>
                  </div>
                  <p className="text-xs leading-6 text-archive-ivory/65">
                    {ex.description}
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
                COMMON INQUIRIES
              </p>
              <h2 className="mt-4 font-serif text-3xl text-archive-ivory leading-tight">
                Voice Preservation FAQ
              </h2>
              <p className="mt-4 text-xs text-archive-ivory/55 leading-relaxed">
                Learn how we protect and honor the spoken identity of your loved ones.
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
              Keep Their Voice Within Reach
            </h2>
            <p className="mt-4 text-sm leading-6 text-archive-ivory/55">
              Do not wait until a voice is only a memory. Start recording the stories, guidelines, and laughter that carry presence.
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
