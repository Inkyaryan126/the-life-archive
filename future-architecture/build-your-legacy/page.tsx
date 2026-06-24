import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";

export const dynamic = "force-dynamic";

const legacyPillars = [
  {
    title: "Preserve Your Voice",
    description: "Your tone, laughter, and cadence carry your presence. Record stories, casual messages, or simple greetings to give future grandchildren a way to truly hear you.",
    prompt: "What does your voice sound like when you speak of the things you love?"
  },
  {
    title: "Record Your Life Lessons",
    description: "Write down or speak the guidelines that kept you grounded. Share the values, principles, and principles that took you a lifetime to formulate.",
    prompt: "What lesson took you the longest to learn?"
  },
  {
    title: "Tell Your Story",
    description: "Capture the small moments and great turning points alike—childhood memories, first jobs, struggles, and quiet triumphs that shaped your path.",
    prompt: "What story deserves to be remembered?"
  },
  {
    title: "Future Messages",
    description: "Prepare letters, videos, or audio messages destined for future milestones—graduations, marriages, or the simple arrival of a quiet anniversary.",
    prompt: "What do you hope they remember when you are not there to tell them?"
  },
  {
    title: "Family History",
    description: "Gather old photographs, oral histories, and ancestor records, along with cherished details like the heirloom family recipe.",
    prompt: "Where did your family's journey in this country begin?"
  },
  {
    title: "Legacy Planning",
    description: "Thoughtfully consolidate final guidance, practical documents, and private wishes so your family can proceed with clarity and peace.",
    prompt: "How can you leave behind ease, order, and absolute care?"
  }
];

const interviewQuestions = [
  {
    question: "Tell me about your childhood.",
    context: "Describe the house you grew up in, your favorite hiding spot, or what dinner felt like on a quiet evening."
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

export default function BuildYourLegacyPage() {
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
          <Link
            href="/login"
            className="rounded-full border border-archive-gold/40 px-5 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/5"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl py-12 sm:py-16">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            INTENTIONAL STORYTELLING
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl text-archive-ivory">
            Carry Your Story Forward
          </h1>
          <p className="mt-6 text-lg leading-8 text-archive-ivory/72 font-serif italic">
            &ldquo;What do you want future generations to know about you? What lesson took you the longest to learn? What story deserves to be remembered?&rdquo;
          </p>
          <p className="mt-6 text-sm leading-7 text-archive-ivory/60 max-w-2xl mx-auto">
            The Life Archive is not a memorial website. It is a digital sanctuary where you intentionally decide what survives you. It is built to help you preserve your voice, stories, lessons, and identity so your future generations can know exactly who you were.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Begin Your Archive
            </Link>
            <Link
              href="/preserve-their-voice"
              className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
            >
              Explore Voice Preservation
            </Link>
          </div>
        </section>

        {/* The Six Pillars */}
        <section className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
              BUILDING BLOCKS OF LEGACY
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              The Six Legacy Hub Pillars
            </h2>
            <p className="mt-3 text-sm leading-6 text-archive-ivory/55">
              These six core facets allow you to build an archive that is rich, multidimensional, and deeply personal.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {legacyPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-serif text-xl text-archive-champagne mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-xs leading-6 text-archive-ivory/60 mb-5">
                    {pillar.description}
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-[11px] uppercase tracking-wider text-archive-gold font-semibold mb-1">
                    Reflective Question
                  </p>
                  <p className="text-xs italic leading-5 text-archive-ivory/80">
                    &ldquo;{pillar.prompt}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Guided Legacy Experience - Interview Mode */}
        <section className="mt-28 rounded-[2.5rem] border border-archive-gold/20 bg-archive-obsidian/70 backdrop-blur p-8 sm:p-12 shadow-luxury">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px] items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                COMING SOON
              </p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
                Guided Legacy: Interview Mode
              </h2>
              <p className="mt-5 text-sm leading-7 text-archive-ivory/68">
                Building a lifetime archive can feel overwhelming. To make it effortless, we are developing <strong className="text-archive-gold">Legacy Interview Mode</strong>.
              </p>
              <p className="mt-4 text-sm leading-7 text-archive-ivory/60">
                Think of it as a personal biographer in your pocket. Interview Mode guides you, a parent, or a grandparent through carefully curated questions. Simply press record, speak naturally, and let our infrastructure index and preserve your wisdom in a beautifully structured digital sanctuary.
              </p>
              <div className="mt-6">
                <span className="rounded-full bg-archive-gold/10 border border-archive-gold/30 px-4 py-2 text-xs font-semibold text-archive-champagne uppercase tracking-wider">
                  Future Capability placeholder
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold mb-1">
                Sample Interview Prompts
              </p>
              {interviewQuestions.map((iq) => (
                <div
                  key={iq.question}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs"
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
        </section>

        {/* Footer info and pathways */}
        <section className="mt-24 text-center border-t border-archive-gold/15 pt-16">
          <h3 className="font-serif text-2xl text-archive-ivory">
            Start Your Living Legacy Today
          </h3>
          <p className="mt-3 text-sm leading-6 text-archive-ivory/55 max-w-xl mx-auto">
            You don&apos;t have to write your whole autobiography in one sitting. Start with a single story, a short voice note, or a favorite song.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-archive-gold px-8 py-3.5 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Sign Up or Sign In
            </Link>
            <Link
              href="/storykeeper-products"
              className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
            >
              Explore Storykeeper Products
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
