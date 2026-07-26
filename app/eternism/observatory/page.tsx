import type { Metadata } from "next";
import Link from "next/link";
import { EternismPageShell } from "@/components/eternism/EternismPageShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Eternist Observatory | Longevity & Human Continuity | The Life Archive",
  description:
    "Explore the scientific, technological, and philosophical frontiers of biological longevity, biostasis, digital continuity, and brain preservation.",
  openGraph: {
    title: "The Eternist Observatory | The Life Archive",
    description:
      "Explore the scientific, technological, and philosophical frontiers of biological longevity, biostasis, digital continuity, and brain preservation."
  },
  twitter: {
    card: "summary",
    title: "The Eternist Observatory | The Life Archive",
    description:
      "Explore the scientific, technological, and philosophical frontiers of biological longevity, biostasis, digital continuity, and brain preservation."
  }
};

type ScienceStatus =
  | "Established Science"
  | "Established Technology"
  | "Emerging Research"
  | "Experimental Concept"
  | "Philosophical Horizon"
  | "Scientific Reality";

type ObservatoryDomain = {
  id: string;
  title: string;
  status: ScienceStatus;
  statusColor: string;
  summary: string;
  details: string[];
};

const domains: ObservatoryDomain[] = [
  {
    id: "biological-aging",
    title: "1. Biological Aging & Cellular Drivers",
    status: "Established Science",
    statusColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    summary:
      "Biological aging is driven by specific hallmarks: genomic instability, telomere attrition, epigenetic alterations, loss of proteostasis, and mitochondrial dysfunction.",
    details: [
      "Cellular senescence causes 'zombie cells' to secrete inflammatory factors that damage surrounding tissue.",
      "Targeted clearance of senescent cells in preclinical models reverses age-related organ decline.",
      "Epigenetic clocks can accurately measure biological age separately from chronological time."
    ]
  },
  {
    id: "longevity-science",
    title: "2. Longevity Science & Pharmacology",
    status: "Established Science",
    statusColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    summary:
      "Pharmacological interventions targeting metabolic regulation and nutrient sensing (mTOR, AMPK, sirtuins) extend healthspan in preclinical and clinical research.",
    details: [
      "Caloric restriction mimetics alter cellular recycling (autophagy) to slow tissue degradation.",
      "Senolytics and NAD+ boosters are currently in clinical trials for age-related metabolic and neurodegenerative disease.",
      "Repurposed compounds demonstrate measurable healthspan improvement across multiple species."
    ]
  },
  {
    id: "regenerative-medicine",
    title: "3. Regenerative Medicine & Tissue Engineering",
    status: "Emerging Research",
    statusColor: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    summary:
      "Induced pluripotent stem cells (iPSCs), 3D bioprinting, and organoid technology aim to replace damaged tissues and eliminate organ donor shortages.",
    details: [
      "Patient-derived stem cells can be differentiated into nerve, muscle, and vascular tissue.",
      "3D bioprinting enables complex extracellular scaffolding for vascularized organ models.",
      "Gene therapy vectors demonstrate targeted reversal of organ fibrosis in animal models."
    ]
  },
  {
    id: "ai-biomarkers",
    title: "4. Artificial Intelligence & Longevity Biomarkers",
    status: "Emerging Research",
    statusColor: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    summary:
      "Machine learning accelerates drug discovery, models complex protein folding, and identifies individualized biological aging trajectory markers.",
    details: [
      "Deep learning models simulate molecular interactions in seconds instead of years.",
      "Multi-omic biomarker panels enable early detection of subclinical degenerative changes.",
      "AI-driven clinical trials optimize dosage and patient stratification for longevity interventions."
    ]
  },
  {
    id: "digital-continuity",
    title: "5. Digital Continuity & Voice Encoding",
    status: "Established Technology",
    statusColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    summary:
      "High-fidelity preservation of voice, written reflections, oral histories, and personal values guarantees authentic identity continuity across time.",
    details: [
      "Lossless acoustic voice recording captures personal cadence, inflection, and emotional tone.",
      "Structured semantic indexing preserves personal philosophies, life lessons, and decision-making logic.",
      "Private time capsules ensure secure transmission of personal wisdom across generations."
    ]
  },
  {
    id: "cryonics-biostasis",
    title: "6. Cryonics & Biostasis",
    status: "Experimental Concept",
    statusColor: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    summary:
      "Vitrification preserves biological structures at cryogenic temperatures without ice crystal damage, halting chemical decay upon legal death.",
    details: [
      "Cryoprotectant solutions convert cellular water into a glass-like solid state.",
      "Complex organs have been vitrified, rewarmed, and successfully transplanted in animal studies.",
      "Human biostasis remains an unproven bridge to potential future molecular repair technologies."
    ]
  },
  {
    id: "brain-preservation",
    title: "7. Brain Preservation & Connectomics",
    status: "Experimental Concept",
    statusColor: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    summary:
      "Aldehyde-stabilized cryopreservation preserves the brain's complete synaptic wiring diagram (connectome) for long-term structural storage.",
    details: [
      "Electron microscopy demonstrates preservation of individual synaptic connections in preserved brain tissue.",
      "The memory and identity of an organism are encoded in structural synaptic strength and connectivity.",
      "Future decoding or emulation depends on technologies that do not exist today."
    ]
  },
  {
    id: "identity-consciousness",
    title: "8. Identity, Selfhood & Consciousness",
    status: "Philosophical Horizon",
    statusColor: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    summary:
      "Exploring what constitutes personal identity continuity across long spans of time, substrate changes, and psychological evolution.",
    details: [
      "Pattern identity theory posits that identity is the underlying informational structure, not specific atoms.",
      "Temporal continuity examines how a person remains 'themselves' through decades of mental and physical change.",
      "Ethical frameworks must protect personal autonomy and identity integrity over extended lifespans."
    ]
  },
  {
    id: "ethical-questions",
    title: "9. Ethical Questions & Societal Adaptation",
    status: "Philosophical Horizon",
    statusColor: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    summary:
      "Addressing societal questions around longevity: resource distribution, generational renewal, environmental sustainability, and personal choice.",
    details: [
      "Democratic access to life extension is a moral imperative to prevent biological inequality.",
      "Extended healthspan reduces chronic disease burden, transforming global economic productivity.",
      "Choice is paramount: no individual should be forced to extend life or forced to accept early death."
    ]
  },
  {
    id: "current-limitations",
    title: "10. Current Scientific Limitations",
    status: "Scientific Reality",
    statusColor: "border-archive-gold/40 bg-archive-gold/10 text-archive-champagne",
    summary:
      "An honest appraisal of current technological boundaries to guard against hype, false hope, and unscientific claims.",
    details: [
      "Human biological reversal of whole-body aging has not been demonstrated in clinical trials.",
      "Cryopreserved human brains cannot currently be revived or scanned at functional resolution.",
      "Digital voice and text archives preserve identity and memory, but do not create living conscious entities."
    ]
  }
];

export default function EternistObservatoryPage() {
  return (
    <EternismPageShell>
      <div className="space-y-12">
        {/* Header */}
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-archive-gold sm:text-sm">
            Research &amp; Horizon Survey
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl font-serif text-3xl leading-tight text-archive-ivory sm:text-5xl lg:text-6xl">
            The Eternist Observatory
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-archive-ivory/78 sm:text-lg">
            A rigorous survey of biological longevity, biostasis, digital continuity,
            and the technological frontiers of human survival.
          </p>
        </header>

        {/* Framing & Integrity Banner */}
        <section className="rounded-2xl border border-archive-gold/30 bg-archive-gold/10 p-6 text-sm leading-7 text-archive-ivory/85">
          <p className="font-bold uppercase tracking-wider text-archive-gold">
            Responsibility &amp; Scientific Integrity
          </p>
          <p className="mt-2">
            The Observatory clearly categorizes every domain by its current scientific standing.
            We distinguish established science and proven technology from emerging research,
            experimental concepts, and philosophical horizons. We do not offer medical advice,
            make clinical guarantees, or claim that biological immortality exists today.
          </p>
        </section>

        {/* Domain Cards */}
        <section className="space-y-8">
          {domains.map((domain) => (
            <article
              key={domain.id}
              id={domain.id}
              className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-6 shadow-luxury sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-xl text-archive-ivory sm:text-2xl">
                  {domain.title}
                </h2>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${domain.statusColor}`}
                >
                  {domain.status}
                </span>
              </div>

              <p className="mt-4 text-base leading-7 text-archive-champagne/90">
                {domain.summary}
              </p>

              <ul className="mt-5 grid gap-3 text-sm leading-6 text-archive-ivory/72 sm:grid-cols-3">
                {domain.details.map((detail, idx) => (
                  <li
                    key={idx}
                    className="rounded-xl border border-archive-gold/12 bg-white/[0.02] p-4"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {/* Navigation CTAs */}
        <section className="rounded-[2.5rem] border border-archive-gold/24 bg-black/75 p-8 text-center sm:p-12">
          <h2 className="font-serif text-2xl text-archive-ivory sm:text-3xl">
            Continue Exploring Eternism
          </h2>
          <p className="mt-3 text-sm text-archive-ivory/70">
            Read the philosophical core of Eternism or review common questions.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/eternism/manifesto"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-archive-gold px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Read The Manifesto
            </Link>
            <Link
              href="/eternism/faq"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:border-archive-gold"
            >
              Read Eternism FAQ
            </Link>
            <Link
              href="/create"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:border-archive-gold"
            >
              Create Living Archive
            </Link>
          </div>
        </section>
      </div>
    </EternismPageShell>
  );
}
