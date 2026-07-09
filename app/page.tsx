import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Life Archive - Preserve Voices, Stories, and Memories",
  description:
    "Create a private digital archive for yourself or a loved one. Save voice recordings, stories, photos, videos, and memories, then connect them to a QR code family can scan for years."
};

const audienceCards = [
  {
    title: "For someone who passed away",
    copy: "Create a memorial archive where family can collect stories, photos, voice notes, and memories in one place."
  },
  {
    title: "For yourself",
    copy: "Record your lessons, stories, favorite memories, and messages for the people who may need them someday."
  },
  {
    title: "For parents and grandparents",
    copy: "Save the voice, laugh, wisdom, and stories younger generations may not fully appreciate yet."
  },
  {
    title: "For pets, veterans, families, and special moments",
    copy: "Build an archive around a life, a bond, a chapter, or a legacy worth protecting."
  }
];

const steps = [
  {
    title: "Create an archive",
    copy: "Start one for yourself, a loved one, a family member, a pet, or someone who has passed."
  },
  {
    title: "Add memories",
    copy: "Write stories, upload photos and videos, add voice notes, songs, and lessons."
  },
  {
    title: "Invite family",
    copy: "Let others contribute their own memories so the archive becomes fuller over time."
  },
  {
    title: "Create a QR code",
    copy: "Print it, save it, or place it on a keepsake, card, frame, bookmark, or memorial marker."
  },
  {
    title: "Scan and rediscover",
    copy: "Each scan can bring back a different memory from the archive."
  }
];

const trustPoints = [
  "You control what is private, shared with family, or public.",
  "Nothing is posted publicly without permission.",
  "Archives can be created for yourself or someone you love.",
  "Family contributions can be invited and reviewed.",
  "The goal is preservation, not exploitation."
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold sm:text-sm">
      {children}
    </p>
  );
}

function PrimaryCta({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  // TODO: wire event hooks when first-party analytics exists:
  // homepage_primary_cta_clicked, homepage_create_archive_clicked.
  return (
    <Link
      className="inline-flex min-h-14 items-center justify-center rounded-full bg-archive-gold px-7 py-4 text-base font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/35 sm:px-8"
      href={href}
    >
      {children}
    </Link>
  );
}

function SecondaryCta({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  // TODO: wire homepage_legacy_question_clicked when event tracking exists.
  return (
    <Link
      className="inline-flex min-h-14 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-7 py-4 text-base font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-archive-gold/30 sm:px-8"
      href={href}
    >
      {children}
    </Link>
  );
}

export default async function HomePage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const archivesHref = isSignedIn ? "/dashboard" : "/login";
  const archivesLabel = isSignedIn ? "Open My Archives" : "Sign In";

  return (
    <main className="min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory">
      <HeroSection archivesHref={archivesHref} archivesLabel={archivesLabel} />
      <WhatItIsSection />
      <WhoItIsForSection />
      <RandomQrSection />
      <HowItWorksSection />
      <LegacyQuestionSection />
      <PhysicalWorldSection />
      <TrustSection />
      <FinalCtaSection />
      <FooterSection />
    </main>
  );
}

function HeroSection({
  archivesHref,
  archivesLabel
}: {
  archivesHref: string;
  archivesLabel: string;
}) {
  return (
    <header className="relative min-h-[760px] overflow-hidden px-5 pb-16 pt-5 sm:px-8 lg:min-h-[820px] lg:px-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(105deg,rgba(13,13,14,0.98)_0%,rgba(13,13,14,0.9)_42%,rgba(42,33,26,0.54)_72%,rgba(13,13,14,0.92)_100%),url('/images/site-design/tla-background.png')] bg-cover bg-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(198,161,91,0.24),transparent_25rem),radial-gradient(circle_at_82%_34%,rgba(229,207,154,0.13),transparent_30rem),linear-gradient(180deg,rgba(13,13,14,0)_0%,#0d0d0e_96%)]"
      />

      <nav className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-5 border-b border-archive-gold/12 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="inline-flex rounded-xl transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
          href="/"
        >
          <SiteLogo width={230} height={58} />
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold text-archive-ivory/78 sm:justify-end">
          <Link className="transition hover:text-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30" href="#how-it-works">
            How It Works
          </Link>
          <Link className="transition hover:text-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30" href="/legacy-question">
            Legacy Question
          </Link>
          <Link className="transition hover:text-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30" href={archivesHref}>
            {archivesLabel}
          </Link>
          <Link
            className="rounded-full border border-archive-gold/35 px-5 py-2.5 text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
            href="/create"
          >
            Create Archive
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] items-center gap-10 pt-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,0.68fr)] lg:pt-24">
        <section className="max-w-4xl">
          <Eyebrow>A living archive for voices, stories, and memories.</Eyebrow>
          <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.98] text-archive-ivory sm:text-6xl lg:text-7xl xl:text-8xl">
            Preserve the stories they should{" "}
            <span className="text-archive-gold">never lose.</span>
          </h1>
          <p className="mt-7 max-w-3xl text-xl leading-8 text-archive-ivory/86 sm:text-2xl sm:leading-10">
            Create a private digital archive for yourself or someone you love.
            Save voice recordings, stories, photos, videos, and memories, then
            connect them to a QR code family can scan for years to come.
          </p>
          <div className="mt-6 max-w-2xl rounded-2xl border border-archive-gold/22 bg-white/[0.045] p-4 text-base leading-7 text-archive-champagne shadow-luxury">
            One scan can reveal one memory. Scan again later and discover another.
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryCta href="/create">Preserve a Story</PrimaryCta>
            <SecondaryCta href="/legacy-question">Answer One Question First</SecondaryCta>
          </div>
          <p className="mt-5 text-sm font-semibold text-archive-ivory/66">
            Private by default. Share only when you choose.
          </p>
        </section>

        <aside className="rounded-[1.75rem] border border-archive-gold/25 bg-archive-obsidian/72 p-5 shadow-luxury backdrop-blur-md sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-archive-gold">
            Not just a profile
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
            One QR code. A lifetime of memories.
          </h2>
          <p className="mt-5 text-base leading-7 text-archive-ivory/76">
            A normal QR code opens one static page. A Life Archive QR can become
            a doorway into a living archive: a voice note today, a photo next
            week, a lesson years from now.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-archive-gold/18 bg-black/20">
            <Image
              src="/images/site-design/quickactions-banner.jpg"
              alt="A warm Life Archive interface preview"
              width={1536}
              height={512}
              className="h-40 w-full object-cover opacity-82 sm:h-52"
              priority
            />
          </div>
        </aside>
      </div>
    </header>
  );
}

function WhatItIsSection() {
  return (
    <section className="bg-archive-paper px-5 py-16 text-archive-ink sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <Eyebrow>What is The Life Archive?</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            A private digital home for the memories that make a person real.
          </h2>
        </div>
        <div className="text-lg leading-8 text-archive-ink/76 sm:text-xl sm:leading-9">
          <p>
            The Life Archive is a digital place to preserve someone&apos;s voice,
            stories, photos, lessons, favorite songs, and the moments family
            never wants to lose.
          </p>
          <p className="mt-5">
            Each archive can be connected to a QR code for a card, keychain,
            frame, bookmark, memorial marker, or keepsake.
          </p>
          <p className="mt-5 font-serif text-2xl leading-8 text-archive-obsidian">
            It turns an object into a doorway back to someone&apos;s life.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhoItIsForSection() {
  return (
    <section className="bg-[#efe3d1] px-5 py-16 text-archive-ink sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="max-w-4xl">
          <Eyebrow>Who it is for</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Built for the people and stories you refuse to let disappear.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {audienceCards.map((card) => (
            <article
              className="rounded-[1.5rem] border border-archive-gold/24 bg-white/58 p-6 shadow-soft"
              key={card.title}
            >
              <h3 className="font-serif text-2xl leading-tight text-archive-obsidian">
                {card.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-archive-ink/72">
                {card.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RandomQrSection() {
  // TODO: wire homepage_random_qr_section_viewed when event tracking exists.
  const flow = [
    "Scan the QR",
    "Hear her voice tell a story",
    "Scan again later",
    "See a photo you forgot existed",
    "Scan again",
    "Find a lesson she left behind"
  ];

  return (
    <section className="relative overflow-hidden bg-archive-obsidian px-5 py-16 text-archive-ivory sm:px-8 lg:px-10 lg:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,161,91,0.16),transparent_30rem),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]"
      />
      <div className="relative mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,0.7fr)] lg:items-center">
        <div>
          <Eyebrow>The QR difference</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
            One QR code. A lifetime of memories.
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-archive-ivory/78 sm:text-xl sm:leading-9">
            Most QR codes open the same page every time. A Life Archive QR can
            open a random memory from one archive: a voice note, story, photo,
            video, song, or lesson. That means the same card, keychain, frame,
            or marker can reveal something different each time it is scanned.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryCta href="/create">Start an Archive</PrimaryCta>
            <SecondaryCta href="/legacy-question">See the Legacy Question Page</SecondaryCta>
          </div>
        </div>
        <ol className="rounded-[1.75rem] border border-archive-gold/22 bg-white/[0.035] p-5 shadow-luxury sm:p-7">
          {flow.map((item, index) => (
            <li className="flex items-center gap-4 py-3" key={`${item}-${index}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-archive-gold/35 bg-archive-gold/10 text-sm font-bold text-archive-gold">
                {index + 1}
              </span>
              <span className="text-base leading-6 text-archive-ivory/82">
                {item}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section
      className="bg-archive-paper px-5 py-16 text-archive-ink sm:px-8 lg:px-10 lg:py-24"
      id="how-it-works"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="max-w-4xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Start small. Let the archive become fuller over time.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, index) => (
            <article
              className="rounded-[1.5rem] border border-archive-gold/18 bg-white/64 p-5 shadow-soft"
              key={step.title}
            >
              <p className="font-serif text-4xl text-archive-gold">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-5 text-xl font-bold text-archive-obsidian">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-archive-ink/72">
                {step.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LegacyQuestionSection() {
  return (
    <section className="bg-[#2a211a] px-5 py-16 text-archive-ivory sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,0.75fr)] lg:items-center">
        <div>
          <Eyebrow>Start with one question</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Not ready to build a full archive yet?
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-archive-ivory/78 sm:text-xl sm:leading-9">
            In 60 seconds, share one memory, story, or message you never want
            the world to forget. Record your voice, write your answer, or record
            a short video. We&apos;ll save it privately and help you turn it into a
            starter archive.
          </p>
          <div className="mt-8">
            <PrimaryCta href="/legacy-question">Answer the Legacy Question</PrimaryCta>
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-archive-gold/25 bg-white/[0.045] p-6 shadow-luxury">
          <p className="font-serif text-3xl leading-tight text-archive-champagne">
            People are more than dates, photos, and belongings.
          </p>
          <p className="mt-5 text-base leading-7 text-archive-ivory/76">
            They are voices, habits, stories, songs, jokes, recipes, lessons,
            and little moments that disappear when nobody saves them.
          </p>
        </div>
      </div>
    </section>
  );
}

function PhysicalWorldSection() {
  return (
    <section className="bg-[#efe3d1] px-5 py-16 text-archive-ink sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,0.9fr)] lg:items-center">
        <div>
          <Eyebrow>Made for the real world</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            The QR code is the bridge between physical keepsakes and digital memories.
          </h2>
          <p className="mt-6 text-lg leading-8 text-archive-ink/74 sm:text-xl sm:leading-9">
            A Life Archive QR can live on the things people actually keep:
            wallet cards, keychains, bookmarks, picture frames, ornaments, dog
            tags, memorial plaques, grave markers, NFC keepsakes, and more.
          </p>
          <div className="mt-8">
            <Link
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-archive-obsidian px-7 py-4 text-base font-bold text-archive-ivory shadow-soft transition hover:bg-archive-charcoal focus:outline-none focus:ring-4 focus:ring-archive-gold/35 sm:px-8"
              href="/create"
            >
              Create an Archive First
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {["Wallet cards", "Keychains", "Picture frames", "Bookmarks", "Memorial markers", "NFC keepsakes"].map((item) => (
            <div
              className="rounded-2xl border border-archive-gold/22 bg-white/58 p-5 text-lg font-semibold text-archive-obsidian shadow-soft"
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="bg-archive-obsidian px-5 py-16 text-archive-ivory sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
        <div>
          <Eyebrow>Privacy and trust</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Private by default. Shared only by choice.
          </h2>
          <p className="mt-6 text-lg leading-8 text-archive-ivory/74">
            The Life Archive is built for personal memories, family stories, and
            grief-sensitive moments. It should feel like preservation, not a
            public feed.
          </p>
        </div>
        <ul className="grid gap-4">
          {trustPoints.map((point) => (
            <li
              className="rounded-2xl border border-archive-gold/16 bg-white/[0.035] p-5 text-base leading-7 text-archive-ivory/78"
              key={point}
            >
              <span className="mr-3 text-archive-gold" aria-hidden="true">
                -
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="bg-archive-paper px-5 py-16 text-center text-archive-ink sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <Eyebrow>Begin gently</Eyebrow>
        <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
          Start with one story.
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-archive-ink/72 sm:text-xl sm:leading-9">
          You do not have to preserve an entire life today. Begin with one voice
          note, one photo, one lesson, or one memory worth keeping.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-archive-obsidian px-8 py-4 text-base font-bold text-archive-ivory shadow-soft transition hover:bg-archive-charcoal focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
            href="/create"
          >
            Preserve a Story
          </Link>
          <Link
            className="inline-flex min-h-14 items-center justify-center rounded-full border border-archive-gold/35 bg-white/70 px-8 py-4 text-base font-semibold text-archive-obsidian transition hover:border-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
            href="/legacy-question"
          >
            Answer One Question First
          </Link>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="border-t border-archive-gold/14 bg-[#0b0a09] px-5 py-10 text-archive-ivory sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <SiteLogo width={230} height={54} />
          <p className="mt-4 max-w-xl leading-7 text-archive-ivory/66">
            The Life Archive - preserve the voice, stories, and memories that
            should not disappear.
          </p>
          <p className="mt-4 text-sm text-archive-ivory/45">
            Copyright 2026 The Life Archive. All rights reserved.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-archive-ivory/68">
          <Link className="hover:text-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30" href="/legacy-question">
            Legacy Question
          </Link>
          <Link className="hover:text-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30" href="/create">
            Create Archive
          </Link>
          <Link className="hover:text-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30" href="/dashboard">
            My Archives
          </Link>
          <Link className="hover:text-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30" href="/keepsakes">
            Keepsakes
          </Link>
        </nav>
      </div>
    </footer>
  );
}
