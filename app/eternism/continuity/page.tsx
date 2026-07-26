import type { Metadata } from "next";
import Link from "next/link";
import { HeartbeatLogoDivider } from "@/components/SiteDesign";
import { EternismPageShell } from "@/components/eternism/EternismPageShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Continuity Capsule | Six Dimensions of Eternism | The Life Archive",
  description:
    "Eternism is the practice of becoming harder to destroy—physically, mentally, morally, creatively, spiritually, and evolutionarily. Build your Continuity Capsule.",
  openGraph: {
    title: "Continuity Capsule | Six Dimensions of Eternism | The Life Archive",
    description:
      "Eternism is the practice of becoming harder to destroy—physically, mentally, morally, creatively, spiritually, and evolutionarily."
  },
  twitter: {
    card: "summary",
    title: "Continuity Capsule | The Life Archive",
    description:
      "Eternism is the practice of becoming harder to destroy—physically, mentally, morally, creatively, spiritually, and evolutionarily."
  }
};

const sixDimensions = [
  {
    number: "01",
    name: "Physical Dimension",
    coreLine: "Your body is the first structure carrying you into the future.",
    focusAreas: "Healthspan, energy, strength, sleep, mobility, prevention, biological maintenance.",
    description:
      "Biological health is the baseline for all human potential. Sustaining physical strength, cellular vitality, and restorative sleep ensures you move into the future with capability."
  },
  {
    number: "02",
    name: "Mental Dimension",
    coreLine: "A longer life means little if the mind remains ruled by fear, confusion, and habit.",
    focusAreas: "Continuous learning, focus, emotional regulation, self-awareness, adaptability, resilience.",
    description:
      "Cultivating cognitive clarity, intellectual curiosity, and emotional mastery prevents internal stagnation and equips you to navigate complex change across decades."
  },
  {
    number: "03",
    name: "Moral Dimension",
    coreLine: "Do not inherit your entire code from people who never had to live your life.",
    focusAreas: "Personal values, responsibility, integrity, boundaries, courage, deliberate ethics.",
    description:
      "Examining inherited assumptions and defining a conscious code of conduct ensures your actions align with truth, accountability, and honor."
  },
  {
    number: "04",
    name: "Creative Dimension",
    coreLine: "To create is to place something in the future before you arrive there.",
    focusAreas: "Building, writing, art, invention, business, contribution, unfinished work.",
    description:
      "Creating durable works, ideas, projects, and expressions places your spirit and intellect into the future, contributing to the human tapestry."
  },
  {
    number: "05",
    name: "Spiritual Without Required Religion",
    coreLine: "Eternism does not require one answer about God. It requires that life be taken seriously.",
    focusAreas: "Meaning, awe, mortality awareness, consciousness, purpose, personal philosophy.",
    description:
      "Engaging deeply with purpose, mystery, gratitude, and moral seriousness creates profound inner grounding without imposing religious dogma."
  },
  {
    number: "06",
    name: "Conscious Evolution",
    coreLine: "You do not awaken the species by waiting for humanity to change. You awaken the part of humanity that is you.",
    focusAreas: "Self-awareness, interconnectedness, personal responsibility, fear vs love-based choices, conscious culture.",
    description:
      "Recognizing that individual growth affects collective human culture. Self-overcoming changes the individual; conscious evolution changes what the individual contributes to humanity. The future of the species is built one consciously created human at a time."
  }
];

const healthspanDomains = [
  { title: "Sleep & Circadian Rhythm", detail: "Prioritizing 7-9 hours of consistent, deep sleep to support neurorestoration and tissue repair." },
  { title: "Movement & Strength", detail: "Building cardiovascular reserve and muscle mass as metabolic armor against age-related frailty." },
  { title: "Metabolic Nutrition", detail: "Fueling cellular health with nutrient-dense foods while minimizing systemic inflammation." },
  { title: "Preventive Diagnostics", detail: "Partnering with physicians for routine screening, early biomarker detection, and health tracking." },
  { title: "Stress & Nervous System", detail: "Practicing emotional regulation, breathwork, and downtime to reduce chronic cortisol exposure." },
  { title: "Purpose & Connection", detail: "Maintaining meaningful relationships and dedicated personal purpose as psychological protective factors." }
];

export default function EternismContinuityPublicPage() {
  return (
    <EternismPageShell>
      <div className="space-y-14">
        {/* Hero Section */}
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-archive-gold sm:text-sm">
            Self-Creation &amp; Personal Continuity
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl font-serif text-3xl leading-tight text-archive-ivory sm:text-5xl lg:text-6xl">
            “Eternism is the practice of becoming harder to destroy.”
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-archive-ivory/80 sm:text-lg">
            Physically. Mentally. Morally. Creatively. Spiritually. Evolutionarily.
            Create yourself. Awaken yourself. Strengthen yourself. Preserve yourself.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard/continuity"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-archive-gold px-8 py-3.5 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
            >
              Build My Continuity Capsule
            </Link>
            <Link
              href="#six-dimensions"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
            >
              Explore The 6 Dimensions
            </Link>
          </div>
        </header>

        <HeartbeatLogoDivider />

        {/* Intro Concept */}
        <section className="rounded-[2.5rem] border border-archive-gold/22 bg-black/60 p-8 text-center shadow-luxury sm:p-12">
          <h2 className="font-serif text-2xl text-archive-champagne sm:text-4xl">
            “You do not awaken the species by waiting for humanity to change. You awaken the part of humanity that is you.”
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-archive-ivory/78">
            The future of the species is built one consciously created human at a time.
            Longer life without greater awareness would only extend our existing mistakes.
          </p>
        </section>

        {/* The Six Dimensions */}
        <section id="six-dimensions">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
              The Six Dimensions of Self-Overcoming &amp; Evolution
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
              Becoming Harder to Destroy
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-archive-ivory/70">
              A comprehensive framework for personal resilience, healthspan, and conscious human development.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sixDimensions.map((dim) => (
              <article
                key={dim.number}
                className="rounded-[2rem] border border-archive-gold/18 bg-black/50 p-6 shadow-luxury transition hover:border-archive-gold/40"
              >
                <span className="font-mono text-xs font-bold tracking-widest text-archive-gold/70">
                  {dim.number}
                </span>
                <h3 className="mt-2 font-serif text-xl text-archive-champagne">
                  {dim.name}
                </h3>
                <p className="mt-3 font-serif text-sm italic text-archive-gold/90">
                  “{dim.coreLine}”
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-archive-ivory/60">
                  Focus: {dim.focusAreas}
                </p>
                <p className="mt-3 text-sm leading-6 text-archive-ivory/72">
                  {dim.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Self-Overcoming & Conscious Evolution Philosophy */}
        <section id="self-overcoming">
          <div className="rounded-[2.5rem] border border-archive-gold/20 bg-black/65 p-8 sm:p-12">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
                Philosophy of Conscious Growth
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
                Self-Overcoming &amp; Conscious Evolution
              </h2>
            </div>

            <div className="mt-6 rounded-2xl border border-archive-gold/30 bg-archive-gold/10 p-6 text-center">
              <p className="font-serif text-xl italic text-archive-champagne sm:text-2xl">
                “Self-overcoming changes the individual. Conscious evolution changes what the individual contributes to humanity.”
              </p>
            </div>

            <div className="mt-8 grid gap-6 text-sm leading-7 text-archive-ivory/78 md:grid-cols-2">
              <div className="space-y-4">
                <p>
                  Human beings are not finished objects; we are ongoing projects. The values, habits, and assumptions you inherited do not need to rule the rest of your life. Conscious evolution begins when you stop waiting for society to change and embody the standards you demand first.
                </p>
                <p>
                  True strength is responsibility, courage, and self-mastery—never domination over others. Overcoming your own fears, weaknesses, and destructive habits matters infinitely more than competing with anyone else.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  Compassion does not require surrendering discernment, strength, boundaries, or self-respect. Acting from love rather than fear means standing firmly in truth without becoming passive or weak.
                </p>
                <p className="rounded-xl border border-archive-gold/14 bg-white/[0.02] p-4 text-xs text-archive-ivory/70">
                  <strong className="text-archive-gold font-semibold">Integrity Commitment:</strong> Conscious Evolution explicitly rejects biological superiority, racial hierarchy, domination, cult obedience, forced spirituality, denying suffering, and tolerating abuse. Becoming a &quot;higher human&quot; means becoming a more deliberate, courageous, and compassionate version of oneself.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsible Healthspan Section */}
        <section id="healthspan">
          <div className="rounded-[2.5rem] border border-archive-gold/18 bg-black/60 p-8 sm:p-12">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
                Biological Maintenance
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
                Healthspan &amp; Biological Resilience
              </h2>
              <p className="mt-4 text-sm leading-7 text-archive-ivory/74">
                Healthspan is the portion of life spent in full physical and cognitive capability. Biological maintenance focuses on daily foundational habits that optimize resilience.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {healthspanDomains.map((h) => (
                <div key={h.title} className="rounded-2xl border border-archive-gold/14 bg-white/[0.03] p-5">
                  <h3 className="font-serif text-base text-archive-gold">
                    {h.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-archive-ivory/68">
                    {h.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Medical Disclaimer */}
            <div className="mt-8 rounded-2xl border border-archive-gold/20 bg-archive-gold/5 p-5 text-xs leading-6 text-archive-ivory/70">
              <p className="font-bold text-archive-gold">Educational &amp; Wellness Notice</p>
              <p className="mt-1">
                This content is provided for educational self-reflection and general wellness inspiration only. It is not medical advice, diagnosis, or treatment. Individual health needs vary greatly. Always consult qualified healthcare professionals for medical decisions, diagnostic testing, or health changes. No habit guarantees longevity; the goal is increasing the odds of capable, vibrant years.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-6 text-center">
          <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-archive-gold/24 bg-black/75 p-8 shadow-luxury sm:p-12">
            <h2 className="font-serif text-2xl text-archive-ivory sm:text-3xl">
              Begin Your Continuity Capsule
            </h2>
            <p className="mt-3 text-sm leading-7 text-archive-ivory/74">
              Step into the 6-stage personal development blueprint. Define who you are, what you refuse to remain, who you are becoming, and how you consciously evolve.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard/continuity"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-archive-gold px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
              >
                Build My Continuity Capsule
              </Link>
              <Link
                href="/eternism/manifesto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:border-archive-gold"
              >
                Read Manifesto
              </Link>
            </div>
          </div>
        </section>
      </div>
    </EternismPageShell>
  );
}
