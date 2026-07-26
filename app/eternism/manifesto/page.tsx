import type { Metadata } from "next";
import Link from "next/link";
import { EternismPageShell } from "@/components/eternism/EternismPageShell";
import { ShareableQuote } from "@/components/eternism/ShareableQuote";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Eternist Manifesto | The Life Archive",
  description:
    "A declaration on aging, involuntary death, memory, and the moral duty to extend human life.",
  openGraph: {
    title: "The Eternist Manifesto | The Life Archive",
    description:
      "A declaration on aging, involuntary death, memory, and the moral duty to extend human life."
  },
  twitter: {
    card: "summary",
    title: "The Eternist Manifesto | The Life Archive",
    description:
      "A declaration on aging, involuntary death, memory, and the moral duty to extend human life."
  }
};

const manifestoPledge =
  "We will preserve what we are. We will extend what we can. We will not call surrender wisdom. We will build toward a future where life is protected by choice, knowledge, and courage.";

export default function EternistManifestoPage() {
  return (
    <EternismPageShell>
      <div className="space-y-14">
        {/* Header */}
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-archive-gold sm:text-sm">
            Declaration &amp; Philosophy
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl font-serif text-3xl leading-tight text-archive-ivory sm:text-5xl lg:text-6xl">
            The Eternist Manifesto
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-serif text-lg italic leading-8 text-archive-champagne">
            “Preserve the life. Extend the life.”
          </p>
        </header>

        {/* Section 1: The Ancient Surrender */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            1. The Ancient Surrender
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p>
              For tens of thousands of years, every human being who walked this Earth watched those
              they loved succumb to illness, trauma, and time. Faced with such overwhelming inevitability,
              ancient cultures crafted a coping mechanism: they sanctified their defeat. They declared
              early death to be the natural order, aging to be wisdom, and oblivion to be peaceful rest.
            </p>
            <p>
              This surrender was rational when humans possessed no tools to fight back. When cholera,
              smallpox, and appendicitis killed half of every generation, myth was the only solace available.
              But myths born of helplessness should not govern a species that has unlocked the genome.
            </p>
          </div>
        </section>

        {/* Section 2: Death Is Not Sacred */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            2. Death Is Not Sacred
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p>
              Death does not give life its meaning; love, curiosity, creation, connection, and joy give life
              its meaning. To claim that a life is meaningful only because it ends abruptly is a romantic
              fallacy created by people who had no choice.
            </p>
            <p>
              Involuntary death is a tragedy, a truncation of human potential, and a loss of irreplaceable
              wisdom. When a doctor fights to save a cancer patient, we call it noble. When a researcher
              fights to stop the biological decay that causes cancer, we must call it what it is: the continuation of medicine.
            </p>
          </div>
        </section>

        {/* Section 3: Aging Is Machinery */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            3. Aging Is Machinery
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p>
              Aging is not a spiritual boundary. It is physical machinery: DNA strand breaks, cross-linked
              proteins, senescent cell accumulation, mitochondrial decay, and epigenetic deregulation.
            </p>
            <p>
              Machinery can be understood. What can be understood can be repaired. What can be repaired
              can be mastered. We do not accept that human biology is uniquely beyond the reach of engineering.
            </p>
          </div>
        </section>

        {/* Section 4: The Moral Duty to Resist */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            4. The Moral Duty to Resist
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p>
              If a cure for Alzheimer’s, heart failure, or biological frailty is possible, withholding our efforts is unethical.
              Every year we delay longevity science, millions of minds and lives are lost to preventable biological decay.
            </p>
            <p>
              The fight against involuntary death is not a luxury for the wealthy; it is the ultimate global public health challenge.
              True compassion demands that we invest in extending human healthspan for all.
            </p>
          </div>
        </section>

        {/* Section 5: The Unfinished Human */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            5. The Unfinished Human
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p>
              An 80-year lifespan is a brief spark. A human being at 80 has barely begun to synthesize the knowledge of centuries,
              build deep relationships across generations, or master multiple artistic and scientific crafts.
            </p>
            <p>
              We are an unfinished species living in truncated time. Longer, healthier lives will unlock unprecedented flourishing,
              wisdom, and discovery.
            </p>
          </div>
        </section>

        {/* Section 6: Memory Is Continuity */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            6. Memory Is Continuity
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p>
              While biology works to extend the physical frame, memory safeguards identity. Who we are is built from our experiences,
              our spoken voice, our hard-won values, and our private reflections.
            </p>
            <p>
              The Life Archive serves as the bridge. By recording living archives today, we maintain the thread of human identity
              across time, ensuring that even if biology falters, the person is not forgotten.
            </p>
          </div>
        </section>

        {/* Section 7: The Generation That Refuses */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            7. The Generation That Refuses
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p>
              Every landmark achievement in human history—from sanitation to aviation—required a generation that refused to accept
              traditional limits. We choose to be the generation that refuses to accept involuntary death as an inevitable law.
            </p>
            <p>
              We will support scientific research, preserve our stories, demand medical progress, and refuse to call surrender wisdom.
            </p>
          </div>
        </section>

        {/* Section 8: A Future Worth Surviving For */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            8. A Future Worth Surviving For
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p>
              The future we seek is not a world of stagnant immortals, but a vibrant civilization of healthy, autonomous human beings
              who choose when and how they live. A future built on love, knowledge, and courage.
            </p>
          </div>
        </section>

        {/* Section 9: The Eternist Pledge */}
        <section id="pledge">
          <ShareableQuote quoteText={manifestoPledge} title="The Eternist Pledge" />
        </section>

        {/* Navigation CTAs */}
        <section className="py-6 text-center">
          <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-archive-gold/24 bg-black/75 p-8 shadow-luxury sm:p-12">
            <h2 className="font-serif text-2xl text-archive-ivory sm:text-3xl">
              Join the Mission
            </h2>
            <p className="mt-3 text-sm leading-7 text-archive-ivory/72">
              Preserve your identity today or explore the scientific domains of the Eternist Observatory.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/create"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-archive-gold px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
              >
                Create Living Archive
              </Link>
              <Link
                href="/eternism/observatory"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:border-archive-gold"
              >
                Enter Observatory
              </Link>
              <Link
                href="/eternism/faq"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:border-archive-gold"
              >
                Read Eternism FAQ
              </Link>
            </div>
          </div>
        </section>
      </div>
    </EternismPageShell>
  );
}
