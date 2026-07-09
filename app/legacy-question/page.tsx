import type { Metadata } from "next";
import Link from "next/link";
import { MemoryCaptureWidget } from "@/components/legacy-question/MemoryCaptureWidget";
import { SiteLogo } from "@/components/SiteDesign";

export const metadata: Metadata = {
  title: "Share One Memory | The Life Archive",
  description:
    "In 60 seconds, share one private memory, story, voice note, or video and begin a free Life Archive starter."
};

const howItWorksSteps = [
  {
    title: "You share one memory",
    copy: "Use your voice, your words, or a short video."
  },
  {
    title: "We send it back to you",
    copy: "You receive a private copy and a link to continue."
  },
  {
    title: "You start a free archive",
    copy: "Add stories, photos, videos, songs, lessons, and voice notes."
  },
  {
    title: "Your QR code brings memories back",
    copy: "One scan can reveal one memory. Scan again later and another piece of the story can appear."
  }
];

const privacyPoints = [
  "Your first memory is private by default.",
  "Nothing is made public without permission.",
  "If you create an archive for someone else, you are responsible for only adding memories you have the right to share.",
  "Family members can be invited later to contribute their own memories.",
  "Archive owners should be able to remove entries or change visibility."
];

export default function LegacyQuestionPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#11100e] text-[#f8f1e7]">
      <HeroSection />
      <MemoryCaptureWidget />
      <HowItWorksSection />
      <RandomQrExplainer />
      <PrivacyConsentSection />
      <FooterSection />
    </main>
  );
}

function HeroSection() {
  return (
    <header className="relative min-h-[760px] overflow-hidden px-4 pb-28 pt-5 sm:px-6 lg:min-h-[820px] lg:px-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(115deg,rgba(17,16,14,0.96)_0%,rgba(17,16,14,0.86)_38%,rgba(42,33,26,0.50)_68%,rgba(17,16,14,0.92)_100%),url('/images/site-design/tla-background.png')] bg-cover bg-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(201,164,92,0.26),transparent_23rem),radial-gradient(circle_at_85%_42%,rgba(239,227,209,0.12),transparent_28rem),linear-gradient(180deg,rgba(17,16,14,0.08),#11100e_96%)]"
      />

      <nav className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4">
        <Link
          className="rounded-xl focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/35"
          href="/"
        >
          <SiteLogo width={240} height={58} />
        </Link>
        <Link
          className="hidden rounded-full border border-[#c9a45c]/35 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-[#f8f1e7] transition hover:border-[#c9a45c] hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30 sm:inline-flex"
          href="#how-it-works"
        >
          See How It Works
        </Link>
      </nav>

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] items-center gap-10 pt-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.72fr)] lg:pt-28">
        <section className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a45c] sm:text-base">
            A living archive for voices, stories, and memories.
          </p>
          <h1 className="mt-6 max-w-5xl font-serif text-5xl leading-[0.98] text-[#f8f1e7] sm:text-6xl lg:text-7xl xl:text-8xl">
            Every person has one story that deserves to{" "}
            <span className="text-[#c9a45c]">live forever.</span>
          </h1>
          <p className="mt-7 max-w-3xl text-xl leading-8 text-[#efe3d1] sm:text-2xl sm:leading-10">
            In 60 seconds, share one memory, story, or message you never want the world to forget.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#efe3d1]/78 sm:text-lg">
            Save it privately today. Turn it into a free starter archive when you&apos;re ready.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#c9a45c] px-8 py-4 text-base font-bold text-[#11100e] shadow-[0_18px_45px_rgba(201,164,92,0.22)] transition hover:bg-[#e5cf9a] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/35"
              href="#share-memory"
            >
              Share My Story
            </Link>
            <Link
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#efe3d1]/25 bg-white/[0.04] px-8 py-4 text-base font-semibold text-[#f8f1e7] transition hover:border-[#c9a45c] hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30"
              href="#how-it-works"
            >
              See How It Works
            </Link>
          </div>
        </section>

        <aside className="rounded-[1.75rem] border border-[#c9a45c]/25 bg-[#11100e]/72 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.38)] backdrop-blur-md sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a45c]">
            Not just a profile
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-[#f8f1e7] sm:text-4xl">
            A QR code can become a doorway into a living archive.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#efe3d1]/78">
            Scan once and hear one story. Scan again later and discover another.
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-[#f8f1e7]">
              One QR code. A lifetime of memories.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#efe3d1]/72">
              Voice notes, written stories, photos, and videos can surface over time instead of pointing to one static page.
            </p>
          </div>
        </aside>
      </div>
    </header>
  );
}

function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="bg-[#f8f1e7] px-4 py-16 text-[#211912] sm:px-6 lg:px-10 lg:py-24"
      id="how-it-works"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8e6b2f]">
            Simple and private
          </p>
          <h2 id="how-it-works-heading" className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            What happens next?
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {howItWorksSteps.map((step, index) => (
            <article
              className="rounded-[1.5rem] border border-[#d8c8ad] bg-white/65 p-6 shadow-[0_18px_55px_rgba(39,35,31,0.08)]"
              key={step.title}
            >
              <p className="font-serif text-4xl text-[#c9a45c]">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
              <p className="mt-3 leading-7 text-[#6f675d]">{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RandomQrExplainer() {
  const flowItems = [
    "Scan QR",
    "Hear grandmother's cooking story",
    "Scan again later",
    "See her wedding photo",
    "Scan again",
    "Hear her advice in her own voice"
  ];

  return (
    <section className="bg-[#efe3d1] px-4 py-16 text-[#211912] sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.7fr)] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8e6b2f]">
            The QR difference
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            One QR code. A lifetime of memories.
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5f554a]">
            Most QR codes open the same page every time. A Life Archive QR can reveal a different memory from the same archive each time it&apos;s scanned - a voice, a story, a photo, or a video. Scan once and hear one story. Scan again later and discover another.
          </p>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5f554a]">
            Instead of one static page, each scan can bring back a different piece of someone&apos;s life. A keychain, card, frame, bookmark, or memorial marker can become a doorway into someone&apos;s life.
          </p>
          <Link
            className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-[#211912] px-8 py-4 text-base font-bold text-[#f8f1e7] transition hover:bg-[#352a21] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/35"
            href="#share-memory"
          >
            Create My First Memory
          </Link>
        </div>

        <div className="rounded-[1.75rem] border border-[#c9a45c]/35 bg-[#211912] p-5 text-[#f8f1e7] shadow-[0_28px_80px_rgba(39,35,31,0.22)] sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c9a45c]">
            Example scan path
          </p>
          <ol className="mt-6 grid gap-3">
            {flowItems.map((item, index) => (
              <li className="flex items-center gap-3" key={`${item}-${index}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c9a45c]/35 bg-white/[0.04] text-sm font-bold text-[#c9a45c]">
                  {index + 1}
                </span>
                <span className="text-sm leading-6 text-[#efe3d1]">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function PrivacyConsentSection() {
  return (
    <section className="bg-[#11100e] px-4 py-16 text-[#f8f1e7] sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c9a45c]">
            Privacy and consent
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            Built with privacy and consent in mind.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#efe3d1]/78">
            Your first memory is private by default. Nothing is shared publicly without permission. If you create an archive for someone else, only add memories you have the right to share. Family members can be invited later to contribute their own memories.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-[#c9a45c]/25 bg-white/[0.045] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-7">
          <ul className="grid gap-4">
            {privacyPoints.map((point) => (
              <li className="flex gap-3 text-base leading-7 text-[#efe3d1]" key={point}>
                <span aria-hidden="true" className="mt-1 text-[#c9a45c]">
                  -
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-2xl border border-[#c9a45c]/20 bg-black/20 p-4 text-sm leading-6 text-[#efe3d1]/72">
            This MVP does not need a full legal privacy policy on this page, but the interface should be designed as if privacy matters from day one.
          </p>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="border-t border-[#c9a45c]/15 bg-[#0b0a09] px-4 py-10 text-[#f8f1e7] sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <SiteLogo width={230} height={54} />
          <p className="mt-4 max-w-xl leading-7 text-[#efe3d1]/70">
            Preserve the voice, stories, and memories that should not disappear.
          </p>
          <p className="mt-4 text-sm text-[#efe3d1]/52">
            Copyright 2026 The Life Archive. All rights reserved.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#efe3d1]/72">
          <Link className="hover:text-[#c9a45c] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30" href="#">
            Privacy
          </Link>
          <Link className="hover:text-[#c9a45c] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30" href="#">
            Terms
          </Link>
          <Link className="hover:text-[#c9a45c] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30" href="mailto:hello@thelifearchive.vip">
            Contact
          </Link>
          <Link className="hover:text-[#c9a45c] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30" href="/create">
            Create Archive
          </Link>
        </nav>
      </div>
    </footer>
  );
}
