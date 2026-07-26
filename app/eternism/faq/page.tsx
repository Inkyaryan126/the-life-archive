import type { Metadata } from "next";
import Link from "next/link";
import { EternismPageShell } from "@/components/eternism/EternismPageShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eternism FAQ | Questions & Answers | The Life Archive",
  description:
    "Grounded, honest answers to common questions about Eternism, longevity science, digital continuity, and The Life Archive.",
  openGraph: {
    title: "Eternism FAQ | The Life Archive",
    description:
      "Grounded, honest answers to common questions about Eternism, longevity science, digital continuity, and The Life Archive."
  },
  twitter: {
    card: "summary",
    title: "Eternism FAQ | The Life Archive",
    description:
      "Grounded, honest answers to common questions about Eternism, longevity science, digital continuity, and The Life Archive."
  }
};

type FAQItem = {
  question: string;
  answer: string[];
};

const faqs: FAQItem[] = [
  {
    question: "1. Is Eternism a religion?",
    answer: [
      "No. Eternism is not a religion, church, or dogmatic faith. It does not possess a priesthood, sacred texts, or supernatural requirements.",
      "Eternism is a rational philosophy and medical advocacy movement. It treats biological aging and involuntary death as medical problems to be solved through science, engineering, and human courage."
    ]
  },
  {
    question: "2. Does Eternism promise biological immortality today?",
    answer: [
      "No. We maintain absolute honesty about current scientific boundaries. Neither Eternism nor medical science currently offers biological immortality.",
      "Eternism is a commitment to research, progress, and preservation. It champions the pursuit of longevity while ensuring that human identity and memory are safeguarded today through Living Archives."
    ]
  },
  {
    question: "3. Is aging really a disease process?",
    answer: [
      "Historically, medicine classified 'aging' as a natural background state and 'diseases' (such as cancer, heart disease, or stroke) as pathological events. Modern biogerontology demonstrates that biological aging is the underlying driver of nearly all chronic late-life illness.",
      "Targeting the cellular and molecular mechanisms of aging directly prevents multiple diseases simultaneously, making healthspan extension a legitimate medical goal."
    ]
  },
  {
    question: "4. What about overpopulation if life spans increase?",
    answer: [
      "Demographic studies indicate that population growth is primarily driven by birth rates, which have declined below replacement level across nearly all industrialized nations.",
      "Furthermore, healthy, extended lifespans allow experienced individuals to remain productive contributors to society without consuming long-term end-of-life medical resources. Energy, food, and space technology are expanding faster than human birth rates."
    ]
  },
  {
    question: "5. What about suffering and degenerative decline?",
    answer: [
      "Eternism opposes extending frailty or suffering. The goal of longevity science is healthspan extension—ensuring that biological vitality, cognitive clarity, and physical strength are maintained for as long as possible.",
      "Living longer with chronic suffering is not the goal; living in full health, energy, and mental clarity is."
    ]
  },
  {
    question: "6. Would people be forced to live forever under Eternism?",
    answer: [
      "Never. Personal autonomy is the foundational ethical pillar of Eternism. The goal is choice: giving every person the right to live a healthy, vibrant life for as long as they choose, rather than having their life forcibly ended by biological failure."
    ]
  },
  {
    question: "7. How does The Life Archive connect to Eternism?",
    answer: [
      "The Life Archive acts as the practical preservation arm of the philosophy: 'The Life Archive preserves the person while humanity works to preserve the life.'",
      "While longevity science develops physical interventions, The Life Archive provides a permanent sanctuary for voice, memory, values, identity, and personal wisdom today."
    ]
  },
  {
    question: "8. Is digital immortality real?",
    answer: [
      "We do not claim that current digital archives or AI tools create living, conscious entities or upload human minds. Digital preservation captures high-fidelity authentic records of voice, thought, values, and memory.",
      "This guarantees identity continuity for loved ones and future generations without making unscientific promises about digital consciousness."
    ]
  },
  {
    question: "9. What can someone do today to support this mission?",
    answer: [
      "You can begin by preserving your own identity or creating a Living Archive for a loved one. You can read and share The Eternist Manifesto, follow longevity science in The Eternist Observatory, and support research into healthy human longevity."
    ]
  }
];

export default function EternismFAQPage() {
  return (
    <EternismPageShell>
      <div className="space-y-12">
        {/* Header */}
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-archive-gold sm:text-sm">
            Clarification &amp; Dialogue
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl font-serif text-3xl leading-tight text-archive-ivory sm:text-5xl lg:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-archive-ivory/78 sm:text-lg">
            Grounded, honest answers about Eternism, biological longevity, digital continuity,
            and The Life Archive.
          </p>
        </header>

        {/* FAQ Accordion / Cards */}
        <section className="space-y-6">
          {faqs.map((faq, idx) => (
            <article
              key={idx}
              className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-6 shadow-luxury sm:p-8"
            >
              <h2 className="font-serif text-xl text-archive-champagne sm:text-2xl">
                {faq.question}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-archive-ivory/78 sm:text-base">
                {faq.answer.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>

        {/* Navigation CTAs */}
        <section className="rounded-[2.5rem] border border-archive-gold/24 bg-black/75 p-8 text-center sm:p-12">
          <h2 className="font-serif text-2xl text-archive-ivory sm:text-3xl">
            Ready to Begin?
          </h2>
          <p className="mt-3 text-sm text-archive-ivory/70">
            Create a Living Archive to preserve your voice, memories, and values today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/create"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-archive-gold px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Create Living Archive
            </Link>
            <Link
              href="/eternism"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:border-archive-gold"
            >
              Eternism Overview
            </Link>
            <Link
              href="/eternism/manifesto"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:border-archive-gold"
            >
              Read Manifesto
            </Link>
          </div>
        </section>
      </div>
    </EternismPageShell>
  );
}
