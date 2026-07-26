import type { Metadata } from "next";
import Link from "next/link";
import { HeartbeatLogoDivider } from "@/components/SiteDesign";
import { EternismPageShell } from "@/components/eternism/EternismPageShell";
import { publicSupportEmail } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eternism | Preserve the Life. Extend the Life. | The Life Archive",
  description:
    "Eternism is the belief that aging and involuntary death are problems to be solved—not traditions to be protected. The Life Archive preserves identity while humanity works to extend life.",
  openGraph: {
    title: "Eternism | Preserve the Life. Extend the Life.",
    description:
      "Eternism is the belief that aging and involuntary death are problems to be solved—not traditions to be protected."
  },
  twitter: {
    card: "summary",
    title: "Eternism | The Life Archive",
    description:
      "Eternism is the belief that aging and involuntary death are problems to be solved—not traditions to be protected."
  }
};

const eternistBeliefs = [
  {
    number: "01",
    title: "Aging is a disease process",
    description:
      "Biological aging is a progressive cellular degradation that can be scientifically understood, targeted, and slowed or reversed through medicine."
  },
  {
    number: "02",
    title: "Death should not be romanticized",
    description:
      "Rationalizing oblivion as 'natural' or 'sacred' is a psychological coping strategy from an era before medical technology was possible."
  },
  {
    number: "03",
    title: "Human life has unfinished potential",
    description:
      "An 80-year lifespan is barely long enough to master a few disciplines, raise a family, and glimpse the universe. We deserve time to thrive."
  },
  {
    number: "04",
    title: "Science should pursue radical life extension",
    description:
      "Humanity has a moral duty to fund and accelerate longevity research, regenerative medicine, and biological preservation."
  },
  {
    number: "05",
    title: "Memory and identity must be preserved",
    description:
      "While biological interventions are developed, preserving voice, identity, wisdom, and consciousness records guarantees human continuity."
  },
  {
    number: "06",
    title: "Future generations deserve more than resignation",
    description:
      "We refuse to pass down involuntary death to our children as an unalterable law of physics when courage and science can change it."
  }
];

const eternismIsNot = [
  {
    title: "Pretending current technology makes people immortal",
    description: "We do not claim that biological immortality exists today or that medical science has already defeated death."
  },
  {
    title: "Denying grief or human loss",
    description: "Honoring those who have passed is essential. Rejecting involuntary death does not mean ignoring the reality of current loss."
  },
  {
    title: "Promising biological resurrection",
    description: "We make no claims of bringing back deceased individuals or transferring living consciousness into code."
  },
  {
    title: "Replacing spiritual or personal faith",
    description: "Eternism is a practical medical and philosophical movement focused on health, choice, and longevity—not a religious doctrine."
  },
  {
    title: "Ignoring quality of life",
    description: "Extending lifespan without extending healthspan is meaningless. The goal is vibrant, healthy, functional life."
  },
  {
    title: "Forcing anyone to live forever",
    description: "Eternism is rooted in autonomy. Choice is the moral core: no person should be forced to die before they are ready."
  }
];

export default function EternismLandingPage() {
  return (
    <EternismPageShell>
      <div className="space-y-14">
        {/* Hero Section */}
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-archive-gold sm:text-sm">
            Preserve the life. Extend the life.
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl font-serif text-3xl leading-tight text-archive-ivory sm:text-5xl lg:text-6xl">
            Death has ruled humanity long enough.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-archive-ivory/80 sm:text-lg sm:leading-8">
            Eternism is the belief that aging and involuntary death are problems
            to be solved—not traditions to be protected.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/eternism/trial"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-archive-gold px-8 py-3.5 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
            >
              Take the Eternism Trial →
            </Link>
            <Link
              href="/eternism/observatory"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
            >
              Enter the Observatory
            </Link>
            <Link
              href="/eternism/manifesto"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
            >
              Read the Manifesto
            </Link>
          </div>
        </header>

        <HeartbeatLogoDivider />

        {/* Section: The Forbidden Question */}
        <section id="forbidden-question">
          <div className="rounded-[2.5rem] border border-archive-gold/22 bg-black/60 p-8 shadow-luxury sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
              The Forbidden Question
            </p>
            <h2 className="mt-4 font-serif text-2xl leading-snug text-archive-champagne sm:text-4xl">
              “What if death is not the meaning of life?
              <br />
              What if it is simply the oldest unsolved problem?”
            </h2>

            <div className="mt-8 grid gap-6 text-base leading-8 text-archive-ivory/80 md:grid-cols-2">
              <div className="space-y-4">
                <p>
                  For centuries, humanity accepted infectious diseases, infant mortality,
                  and organ failure as inevitable aspects of nature. Pain and early death
                  were framed as divine will or cosmic balance. Then, medical science
                  refused to surrender.
                </p>
                <p>
                  Vaccines, antibiotics, surgical hygiene, and organ transplantation
                  fundamentally redefined what society considered natural. Today, biological
                  aging stands as the last major hurdle.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  Aging is not a mystical clock; it is biological machinery that degrades
                  over time. Eternism demands that we investigate this machinery with the
                  same scientific courage we brought to polio or heart disease.
                </p>
                <p>
                  Eternism does not promise biological immortality today. Rather, it rejects
                  surrender as a moral ideal and demands that we work toward a future where
                  life is protected by knowledge and choice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: What Eternism Believes (6 Pillars) */}
        <section id="pillars">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
              The Six Pillars
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
              What Eternism Believes
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-archive-ivory/70">
              A clear, rational framework for extending human healthspan and safeguarding memory.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eternistBeliefs.map((belief) => (
              <article
                key={belief.number}
                className="rounded-[2rem] border border-archive-gold/18 bg-black/50 p-6 shadow-luxury transition hover:border-archive-gold/40"
              >
                <span className="font-mono text-xs font-bold tracking-widest text-archive-gold/70">
                  {belief.number}
                </span>
                <h3 className="mt-2 font-serif text-xl text-archive-champagne">
                  {belief.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-archive-ivory/72">
                  {belief.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Section: Eternism Is Not */}
        <section id="is-not">
          <div className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 sm:p-12">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
                Boundaries &amp; Integrity
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
                What Eternism Is Not
              </h2>
              <p className="mt-4 text-base leading-7 text-archive-ivory/76">
                Eternism is grounded in medical reality and intellectual honesty. It is essential
                to distinguish our philosophy from hype or false promises.
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {eternismIsNot.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-archive-gold/14 bg-white/[0.03] p-5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold/80">
                    Clarification
                  </span>
                  <h3 className="mt-2 font-serif text-base text-archive-ivory">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-archive-ivory/66">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-archive-gold/30 bg-archive-gold/10 p-6 text-center">
              <p className="font-serif text-lg italic text-archive-champagne sm:text-xl">
                “No person should be forced to die because medicine failed to arrive in time.”
              </p>
            </div>
          </div>
        </section>

        {/* Section: The Bridge to The Life Archive */}
        <section id="bridge">
          <div className="rounded-[2.5rem] border border-archive-gold/22 bg-black/60 p-8 shadow-luxury sm:p-12">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
                The Dual Mission
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
                The Bridge to The Life Archive
              </h2>
              <p className="mx-auto mt-4 max-w-3xl font-serif text-xl italic text-archive-champagne">
                “The Life Archive preserves the person while humanity works to preserve the life.”
              </p>
            </div>

            <div className="mt-8 grid gap-6 text-sm leading-7 text-archive-ivory/76 md:grid-cols-2">
              <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.02] p-6">
                <h3 className="font-serif text-lg text-archive-gold">
                  1. Identity is Human Continuity
                </h3>
                <p className="mt-2">
                  Stories, voice, lessons, memories, and values form the true architecture of
                  who we are. Preserving identity matters today—whether a life lasts 80 years
                  or several centuries.
                </p>
              </div>

              <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.02] p-6">
                <h3 className="font-serif text-lg text-archive-gold">
                  2. Living Archives Define Us Now
                </h3>
                <p className="mt-2">
                  Archives are not merely memorials for the deceased. A Living Archive serves
                  as a personal sanctuary where individuals define their values, record their
                  authentic voice, and guide future generations today.
                </p>
              </div>

              <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.02] p-6">
                <h3 className="font-serif text-lg text-archive-gold">
                  3. Preserving Options for the Future
                </h3>
                <p className="mt-2">
                  Future technologies may interact with preserved memory data in ways impossible
                  today. By establishing high-fidelity voice, text, and media records now, we safeguard options for tomorrow.
                </p>
              </div>

              <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.02] p-6">
                <h3 className="font-serif text-lg text-archive-gold">
                  4. Responsible Commitment
                </h3>
                <p className="mt-2">
                  The Life Archive does not make unsupported claims to recreate deceased individuals.
                  We provide a secure, durable, and private sanctuary for authentic human memory.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Next Navigation CTAs */}
        <section className="py-6 text-center">
          <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-archive-gold/24 bg-black/75 p-8 shadow-luxury sm:p-12">
            <h2 className="font-serif text-2xl leading-tight text-archive-ivory sm:text-4xl">
              Explore the Mission &amp; Science
            </h2>
            <p className="mt-4 text-sm leading-7 text-archive-ivory/74 sm:text-base">
              Step into the Eternist Observatory to examine longevity science, read the full
              Eternist Manifesto, or create your own Living Archive.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/create"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-archive-gold px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
              >
                Create Your Living Archive
              </Link>
              <Link
                href="/eternism/observatory"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-archive-gold/40 bg-archive-gold/14 px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-champagne transition hover:border-archive-gold hover:bg-archive-gold/25 focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
              >
                Enter Observatory
              </Link>
              <Link
                href="/eternism/manifesto"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-archive-gold/30 bg-white/[0.04] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
              >
                Read Manifesto
              </Link>
              <Link
                href="/eternism/faq"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-archive-gold/30 bg-white/[0.04] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
              >
                Read FAQ
              </Link>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <footer className="border-t border-archive-gold/14 pt-8 text-center text-xs text-archive-ivory/46">
          <p>© 2026 The Life Archive. All rights reserved.</p>
          <p className="mt-2">
            Direct inquiries regarding Eternism and human continuity to {publicSupportEmail}.
          </p>
        </footer>
      </div>
    </EternismPageShell>
  );
}
