import type { Metadata } from "next";
import Link from "next/link";
import { DesignBackdrop, HeartbeatLogoDivider, SiteLogo } from "@/components/SiteDesign";
import { publicSupportEmail } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Eternism and Human Continuity | The Life Archive",
  description:
    "The Life Archive preserves memory, identity, voice, and human continuity while humanity works toward longer and healthier lives."
};

const preservedToday = [
  {
    title: "Voice",
    description: "Cadence, tone, laugh, spoken memories, and authentic spoken wisdom."
  },
  {
    title: "Video",
    description: "Gestures, presence, expressions, and personal life recordings."
  },
  {
    title: "Photographs",
    description: "Curated moments, portraits, family milestones, and visual history."
  },
  {
    title: "Journals",
    description: "Written thoughts, personal reflections, diaries, and private notes."
  },
  {
    title: "Lessons",
    description: "Hard-won advice, principles, values, and practical guidance."
  },
  {
    title: "Values",
    description: "Core beliefs, moral frameworks, and personal codes of living."
  },
  {
    title: "Memories",
    description: "Specific life events, defining moments, and quiet daily experiences."
  },
  {
    title: "Creative Work",
    description: "Writing, music, art, projects, essays, and intellectual legacy."
  },
  {
    title: "Future Messages",
    description: "Scheduled time capsules for future dates, milestones, and loved ones."
  },
  {
    title: "Family History",
    description: "Lineage, oral history, origin stories, and ancestral records."
  }
];

const futureContinuityUses = [
  {
    title: "Revisiting earlier versions of yourself",
    description: "Look back at your thoughts, voice, and aspirations across decades to maintain a true sense of personal identity."
  },
  {
    title: "Preserving beliefs and identity over decades",
    description: "Safeguard your core values, worldview, and personal evolution over long spans of time."
  },
  {
    title: "Recording family and relationship history",
    description: "Keep living lineage, stories, and shared heritage intact for children and descendants."
  },
  {
    title: "Safeguarding creative work",
    description: "Protect written works, songs, art, and ideas in a durable, private digital sanctuary."
  },
  {
    title: "Storing messages for future versions of yourself",
    description: "Prepare letters, audio, or video messages to be received by future versions of yourself or family members."
  },
  {
    title: "Creating a record before major milestones or transitions",
    description: "Build a complete archive before dangerous travel, major medical procedures, cryonics preservation, or long separations."
  }
];

const whatTLADoesNotPromise = [
  {
    title: "Resurrection",
    description: "The Life Archive does not promise bringing anyone back from death or reversing mortality."
  },
  {
    title: "Consciousness Uploading",
    description: "We do not claim to transfer human consciousness, mind, or soul into digital code."
  },
  {
    title: "Biological Immortality",
    description: "We do not offer medical treatments, biological reverse-aging, or physical immortality."
  },
  {
    title: "Medical Treatment",
    description: "We are not a medical provider and make no claims regarding health interventions or clinical outcomes."
  },
  {
    title: "An AI Replacement for a Human Being",
    description: "We do not build synthetic AI clones to replace or impersonate living or deceased human beings."
  }
];

export default function EternismPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8 lg:px-10">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        {/* Navigation Bar */}
        <nav className="flex flex-col gap-4 border-b border-archive-gold/18 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="Return to Grand Hall">
            <SiteLogo width={220} height={54} />
          </Link>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-archive-ivory/72">
            <Link className="hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/50" href="/">
              Grand Hall
            </Link>
            <Link className="hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/50" href="#problem">
              The Problem
            </Link>
            <Link className="hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/50" href="#two-fronts">
              Two Fronts
            </Link>
            <Link className="hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/50" href="#continuity">
              Continuity
            </Link>
            <Link
              className="rounded-full border border-archive-gold/35 px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-archive-gold hover:bg-archive-gold/10 focus:outline-none focus:ring-2 focus:ring-archive-gold/50"
              href="/create"
            >
              Begin Archive
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="py-16 text-center sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold sm:text-sm">
            Eternism &amp; Human Continuity
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl font-serif text-4xl leading-tight text-archive-ivory sm:text-6xl lg:text-7xl">
            Human life is too valuable to disappear.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-archive-ivory/78 sm:text-xl sm:leading-9">
            The Life Archive preserves the person we are today while humanity
            continues the longer fight to preserve human life itself.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/create"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-archive-gold px-8 py-3.5 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
            >
              Begin Your Archive
            </Link>
            <Link
              href="#two-fronts"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
            >
              Read The Philosophy
            </Link>
          </div>
        </header>

        <HeartbeatLogoDivider />

        {/* Section 1: The Problem */}
        <section id="problem" className="py-12 sm:py-16">
          <div className="rounded-[2rem] border border-archive-gold/18 bg-black/40 p-8 shadow-luxury sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
              The Fundamental Challenge
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-snug text-archive-champagne sm:text-4xl">
              “We lose people twice: first when life ends, and again when their
              voice, perspective, lessons, and inner world disappear.”
            </h2>
            <div className="mt-6 grid gap-6 text-base leading-8 text-archive-ivory/76 sm:text-lg">
              <p>
                When a life reaches its conclusion, the physical absence is immediate
                and profound. But over the decades that follow, a second loss occurs:
                the gradual erosion of who that person truly was. Their specific tone
                of voice, their unique humor, their hard-won life lessons, and their
                ways of seeing the world quietly fade from living memory.
              </p>
              <p>
                Without deliberate preservation, even the most vibrant identity is
                reduced to a few static photographs, official documents, and sparse
                dates. Eternism begins with the conviction that human identity is too
                rich, complex, and irreplaceable to be allowed to dissolve.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Two Fronts */}
        <section id="two-fronts" className="py-12 sm:py-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              The Dual Mission
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
              Preserve the life. Extend the life.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl font-serif text-lg italic text-archive-champagne/90 sm:text-xl">
              “The Life Archive preserves who we are while humanity works toward
              preserving that we are.”
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <article className="rounded-[2rem] border border-archive-gold/22 bg-white/[0.035] p-8 shadow-luxury">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">
                Front One · Preservation Now
              </p>
              <h3 className="mt-3 font-serif text-2xl text-archive-ivory">
                The Life Archive
              </h3>
              <p className="mt-4 text-base leading-7 text-archive-ivory/72">
                The Life Archive works on the urgent, practical preservation of
                identity, memory, voice, and meaning today. It provides a quiet,
                permanent sanctuary for stories, lessons, and personal guidance
                across a lifetime and beyond.
              </p>
            </article>

            <article className="rounded-[2rem] border border-archive-gold/22 bg-white/[0.035] p-8 shadow-luxury">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">
                Front Two · The Long Horizon
              </p>
              <h3 className="mt-3 font-serif text-2xl text-archive-ivory">
                Eternism
              </h3>
              <p className="mt-4 text-base leading-7 text-archive-ivory/72">
                Eternism represents the broader philosophy and intellectual refusal
                to accept involuntary death as humanity’s permanent, unalterable ceiling.
                It champions the long-term work of scientific research, longevity, and
                preserving human life itself.
              </p>
            </article>
          </div>
        </section>

        {/* Section 3: Continuity Across Time */}
        <section id="continuity" className="py-12 sm:py-16">
          <div className="rounded-[2rem] border border-archive-gold/18 bg-[#0a0806] p-8 sm:p-12">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                Human Continuity
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-snug text-archive-ivory sm:text-4xl">
                “Even a life that lasts centuries would still need memory, context, and continuity.”
              </h2>
              <p className="mt-4 text-base leading-7 text-archive-ivory/72">
                Preservation is not only for the end of life. A Living Archive can also
                become your <strong className="text-archive-champagne font-semibold">Continuity Archive</strong>—a record of who you were, who you are, and who you are becoming across decades.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {futureContinuityUses.map((use) => (
                <article key={use.title} className="rounded-xl border border-archive-gold/14 bg-white/[0.025] p-6">
                  <h3 className="font-serif text-xl text-archive-champagne">
                    {use.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-archive-ivory/68">
                    {use.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: What TLA Can Preserve Today */}
        <section className="py-12 sm:py-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
              Capabilities Today
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
              What The Life Archive Can Preserve Today
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-archive-ivory/68">
              A refined suite of media and records designed to keep human identity whole and accessible.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {preservedToday.map((item) => (
              <div key={item.title} className="rounded-xl border border-archive-gold/16 bg-white/[0.03] p-5">
                <h3 className="font-serif text-lg text-archive-gold">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-archive-ivory/68">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: What TLA Does Not Promise */}
        <section id="preserve-and-promise" className="py-12 sm:py-16">
          <div className="rounded-[2rem] border border-archive-gold/20 bg-black/60 p-8 sm:p-12">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                Clarity &amp; Integrity
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
                What The Life Archive Does Not Promise
              </h2>
              <p className="mt-4 text-base leading-7 text-archive-ivory/72">
                We maintain absolute transparency about our role. The Life Archive is a
                dedicated memory and continuity platform, grounded in real technology
                and human emotion. We do not make speculative or unproven claims.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {whatTLADoesNotPromise.map((item) => (
                <div key={item.title} className="rounded-xl border border-archive-gold/14 bg-white/[0.02] p-6">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-archive-gold/80">
                    Not Offered
                  </span>
                  <h3 className="mt-2 font-serif text-xl text-archive-ivory">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-archive-ivory/64">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Closing Invitation & CTA */}
        <section className="py-16 text-center sm:py-24">
          <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-archive-gold/24 bg-[linear-gradient(180deg,rgba(202,164,92,0.08),rgba(7,6,5,0.92))] p-10 shadow-luxury sm:p-16">
            <HeartbeatLogoDivider className="py-4" />
            <h2 className="font-serif text-3xl leading-tight text-archive-ivory sm:text-5xl">
              “If death remains, your story remains.
              <br />
              If life expands, your continuity remains.”
            </h2>
            <p className="mt-6 text-base leading-8 text-archive-ivory/72 sm:text-lg">
              Whether life ends too soon or stretches farther than any generation
              before us imagined, your story should remain intact.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/create"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-archive-gold px-8 py-3.5 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
              >
                Begin Your Archive
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
              >
                Return to Grand Hall
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-archive-gold/14 pt-8 text-center text-xs text-archive-ivory/46">
          <p>© 2026 The Life Archive. All rights reserved.</p>
          <p className="mt-2">Questions regarding Eternism and archive continuity can be directed to {publicSupportEmail}.</p>
        </footer>
      </div>
    </main>
  );
}
