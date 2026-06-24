import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";

export const dynamic = "force-dynamic";

const voiceExamples = [
  {
    title: "Advice from a Parent",
    scenario: "Unspoken rules and gentle direction.",
    description: "Whether it is quiet reassurance during a career struggle or practical guidance on building a home, hearing a parent's actual voice navigate these guidelines carries ultimate comfort."
  },
  {
    title: "Grandparent Stories",
    scenario: "Bridging the century.",
    description: "Capture descriptions of childhood, first dates, historical transitions, and long-lost neighborhoods in the warm, slow cadence of those who walked the earth before us."
  },
  {
    title: "Family Recipes",
    scenario: "The auditory kitchen guide.",
    description: "Instead of a stained index card, preserve the verbal secrets to the perfect holiday roast or pie—complete with the ambient kitchen sounds, laughter, and corrections."
  },
  {
    title: "Birthday Messages",
    scenario: "An annual return.",
    description: "An archive of simple, loving annual congratulations that future grandchildren can play on their own milestones, feeling the immediate warmth of their ancestors' presence."
  },
  {
    title: "Core Life Lessons",
    scenario: "Hard-won personal philosophy.",
    description: "Record the definitions of honor, kindness, failure, and defining principles straight from the person who formulated them through years of living."
  }
];

export default function PreserveTheirVoicePage() {
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
            Preserve Now
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl py-12 sm:py-16">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            THE STRONGEST EMOTIONAL ASSET
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl text-archive-ivory">
            Preserve Their Voice
          </h1>
          <p className="mt-6 text-xl leading-8 text-archive-ivory/72 max-w-2xl mx-auto font-serif italic">
            &ldquo;We forget the sound of their voice first. Let&apos;s make sure that never happens.&rdquo;
          </p>
          <p className="mt-4 text-sm leading-7 text-archive-ivory/60 max-w-2xl mx-auto">
            A photograph tells you what someone looked like. A written note tells you what they thought. But a voice recording—the cadence, the deep sigh, the laughter, the subtle warmth of their accent—tells you exactly who they were. Our voice is our most immediate, human thumbprint. Over time, it becomes the single most precious heirloom a family can possibly hold.
          </p>
        </section>

        {/* Why Voices Matter & How to Do It */}
        <section className="grid gap-8 md:grid-cols-2 items-stretch mb-20">
          <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-archive-gold">
                THE MEMORY VALUATION
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-archive-ivory mb-4">
                Why Voices Become Priceless
              </h2>
              <p className="text-xs leading-6 text-archive-ivory/65 mb-4">
                Years after a parent or grandparent is gone, we find ourselves yearning not just for their static portrait, but for their presence. We wish we could sit across the kitchen table and hear them say our name, offer a piece of casual advice, or tell that repetitive, hilarious story one more time.
              </p>
              <p className="text-xs leading-6 text-archive-ivory/65">
                Voices don&apos;t just hold information; they carry emotion. They contain comfort that science has proven can physically lower our stress levels just by listening. Preserving voice is the closest we can get to keeping a piece of their spirit close.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-archive-gold">
                THE PRACTICE OF PRESERVATION
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-archive-ivory mb-4">
                How Families Preserve Spoken Stories
              </h2>
              <p className="text-xs leading-6 text-archive-ivory/65 mb-4">
                The Life Archive makes voice preservation silent and natural. You can easily record audio directly from your smartphone, upload existing voicemails left on cellular systems, or import voice memos from family interviews.
              </p>
              <p className="text-xs leading-6 text-archive-ivory/65">
                By organizing these audios into clean, secure, categorizable chapters (such as &ldquo;Life Lessons&rdquo; or &ldquo;Stories&rdquo;), you create a durable verbal museum that future generations can instantly return to with a physical Storykeeper Card scan.
              </p>
            </div>
          </div>
        </section>

        {/* The Auditory Keepsake Examples */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
              AUDITORY KEEPSAKES
            </p>
            <h2 className="mt-3 font-serif text-3xl text-archive-ivory">
              Examples of What to Preserve
            </h2>
            <p className="mt-3 text-xs leading-5 text-archive-ivory/50">
              Start with these simple spoken capsules to begin capturing their warmth.
            </p>
          </div>

          <div className="grid gap-6">
            {voiceExamples.map((ex) => (
              <div
                key={ex.title}
                className="rounded-2xl border border-archive-gold/14 bg-white/[0.015] p-6 transition hover:border-archive-gold/30 hover:bg-white/[0.03] grid gap-4 sm:grid-cols-[220px_1fr] items-center"
              >
                <div>
                  <h3 className="font-serif text-lg text-archive-champagne mb-1">
                    {ex.title}
                  </h3>
                  <span className="text-[10px] text-archive-gold uppercase tracking-wider font-semibold">
                    {ex.scenario}
                  </span>
                </div>
                <p className="text-xs leading-6 text-archive-ivory/60">
                  {ex.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Action callout */}
        <section className="mt-16 rounded-[2.5rem] border border-archive-gold/22 bg-archive-obsidian p-8 sm:p-12 shadow-luxury text-center max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold mb-3">
            GIVE THE GIFT OF PRESENCE
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-archive-ivory mb-4">
            Preserve Their Presence Today
          </h2>
          <p className="text-sm leading-7 text-archive-ivory/68 max-w-2xl mx-auto mb-8">
            Do not wait until a voice is a memory. Create a free archive, pull out your phone, and record a 2-minute greeting or family memory. Future generations will thank you for making sure they can hear exactly who you were.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Begin Your Voice Archive
            </Link>
            <Link
              href="/build-your-legacy"
              className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
            >
              Explore Legacy Guide
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
