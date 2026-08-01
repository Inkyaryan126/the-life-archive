import type { Metadata } from "next";
import Link from "next/link";
import { EternismPageShell } from "@/components/eternism/EternismPageShell";
import { ShareableQuote } from "@/components/eternism/ShareableQuote";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Eternist Manifesto | Preserve the Life. Extend the Life. | The Life Archive",
  description:
    "A declaration for preserving identity, resisting involuntary death, creating a self worth preserving, and building a future shaped by science, dignity, and conscious evolution.",
  openGraph: {
    title: "The Eternist Manifesto | Preserve the Life. Extend the Life.",
    description:
      "A declaration for preserving identity, resisting involuntary death, creating a self worth preserving, and building a future shaped by science, dignity, and conscious evolution."
  },
  twitter: {
    card: "summary",
    title: "The Eternist Manifesto | The Life Archive",
    description:
      "A declaration for preserving identity, resisting involuntary death, creating a self worth preserving, and building a future shaped by science, dignity, and conscious evolution."
  }
};

const shortPledge = `We will preserve what we are.
We will extend what we can.
We will not call surrender wisdom.
We will build toward a future where life is protected by choice, knowledge, and courage.`;

const fullPledge = `We will preserve what we are.
We will create who we are becoming.
We will strengthen the structures carrying us into the future.
We will extend what science and courage make possible.
We will not wait for humanity to embody what we refuse to practice ourselves.
We will not call surrender wisdom.
We will build toward a future where life is protected by choice, knowledge, dignity, and courage.`;

export default function EternistManifestoPage() {
  return (
    <EternismPageShell variant="manifesto">
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
              This surrender was rational when humans possessed no tools to fight back. When infection,
              childbirth, injury, and diseases now considered treatable routinely destroyed families,
              myth was often the only solace available. But myths born of helplessness should not govern
              a species that has unlocked the genome.
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
              Machinery can be understood. What can be understood may become repairable. What becomes repairable
              no longer deserves to be called inevitable. We do not accept that human biology is uniquely beyond the reach of engineering.
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
              Every year we delay healthspan research and public-health investment, millions of minds and lives are lost to preventable biological decay.
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
              spoken voice, hard-won values, private reflections, and creative legacy. The Life Archive preserves the person while humanity works to preserve the life.
            </p>
            <p>
              Living archives preserve the evolving person, not merely the dead. Continuity is not resurrection, and preserved data does not equal transferred consciousness.
              While preservation today may serve future uses we cannot yet fully predict, those possibilities must be labeled as speculative. The Life Archive does not claim to recreate or replace a deceased person.
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

        {/* Section 8: The Self Worth Preserving */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            8. The Self Worth Preserving
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p className="font-serif text-lg italic text-archive-champagne/90">
              “Eternism is the practice of becoming harder to destroy. Do not merely preserve yourself. Create a self worth preserving.”
            </p>
            <p>
              Longer life is not enough. To extend an unconscious, destructive, undisciplined existence would merely extend the same mistakes. Survival alone is insufficient; the self is not a finished object.
            </p>
            <p>
              We are not finished objects. We are lives under construction. Self-overcoming means strengthening body, mind, values, creativity, and character to become more deliberate, responsible, capable, and alive. Strength means responsibility, not domination.
            </p>
          </div>
        </section>

        {/* Section 9: Conscious Evolution */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            9. Conscious Evolution
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p className="font-serif text-lg italic text-archive-champagne/90">
              “You do not awaken the species by waiting for humanity to change. You awaken the part of humanity that is you.”
            </p>
            <p>
              Technology alone cannot create a worthy future. Longer life without greater awareness would only extend our existing mistakes—multiplying fear, greed, and division. Personal evolution must accompany scientific progress.
            </p>
            <p>
              The future of the species is built one consciously created human at a time. Compassion does not require weakness, surrender, or loss of boundaries, and interconnectedness may be explored philosophically without imposing religious dogma.
            </p>
          </div>
        </section>

        {/* Section 10: Freedom, Dignity, and Choice */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            10. Freedom, Dignity, and Choice
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p className="font-serif text-lg italic text-archive-champagne/90">
              “The goal is not compulsory immortality. The goal is meaningful choice.”
            </p>
            <p>
              Eternism does not seek to force endless life upon anyone. It seeks to end the condition in which death is forced upon everyone. Autonomy and quality of life are central: no person should be forced to live forever, and no person should be forced to die because medicine, timing, or access failed them.
            </p>
            <p>
              Dignity, informed consent, and equitable access must guide every medical advance. Choice is the moral core of our movement.
            </p>
          </div>
        </section>

        {/* Section 11: A Future Worth Surviving For */}
        <section className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-gold sm:text-3xl">
            11. A Future Worth Surviving For
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-archive-ivory/80">
            <p>
              The future we seek is not a world of stagnant immortals, but a vibrant civilization of healthy, autonomous, evolving human beings paired with deep responsibility and awareness. A future built on creativity, relationships, discovery, compassion, and contribution—with The Life Archive as a bridge between past identity and future possibility.
            </p>
            <p className="font-serif text-lg font-semibold text-archive-champagne">
              We do not seek more life merely to remain who we are. We seek more life to become what humanity has never had enough time to become.
            </p>
          </div>
        </section>

        {/* Section: The Eternist Pledge */}
        <section id="pledge">
          <ShareableQuote
            quoteText={shortPledge}
            expandedQuoteText={fullPledge}
            title="The Eternist Pledge"
            expandedTitle="The Full Eternist Pledge"
          />
        </section>

        {/* Navigation CTAs */}
        <section className="py-6 text-center">
          <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-archive-gold/24 bg-black/75 p-8 shadow-luxury sm:p-12">
            <h2 className="font-serif text-2xl text-archive-ivory sm:text-3xl">
              Join the Mission
            </h2>
            <p className="mt-3 text-sm leading-7 text-archive-ivory/72">
              Preserve your identity today, test your structure, or explore the scientific domains of the Eternist Observatory.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/eternism/trial"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-archive-gold px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
              >
                Take the Eternism Trial →
              </Link>
              <Link
                href="/create"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:border-archive-gold"
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
