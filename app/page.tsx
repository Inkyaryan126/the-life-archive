import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { SiteFooter } from "@/components/SiteFooter";
import { getAccountContext } from "@/lib/account";
import { HomePageTracker } from "@/components/analytics/HomePageTracker";
import { TrackedLink } from "@/components/analytics/TrackedLink";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Life Archive — Be there, even when you can't be.",
  description:
    "Leave voice messages, videos, stories, and advice connected to a permanent physical keepsake for someone you care about. One special gift. A lifetime of surprises waiting inside.",
  openGraph: {
    title: "The Life Archive — Be there, even when you can't be.",
    description:
      "Leave voice messages, videos, stories, and advice connected to a permanent physical keepsake for someone you care about."
  }
};

export default async function HomePage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0806] text-[#fdfbf7]">
      <DesignBackdrop />
      <HomePageTracker />

      {/* Modern Public Header Navigation */}
      <header className="relative z-20 border-b border-[#c5a059]/15 bg-[#0a0806]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <SiteLogo width={180} height={42} />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#fdfbf7]/80 md:flex">
            <Link href="#how-it-works" className="transition hover:text-[#c5a059]">
              How It Works
            </Link>
            <Link href="/keepsakes" className="transition hover:text-[#c5a059]">
              Keepsakes
            </Link>
            <Link href="#use-cases" className="transition hover:text-[#c5a059]">
              For Families
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href={isSignedIn ? "/dashboard" : "/login"}
              className="text-xs font-semibold text-[#fdfbf7]/70 transition hover:text-[#fdfbf7] sm:text-sm"
            >
              {isSignedIn ? "Dashboard" : "Sign In"}
            </Link>
            <TrackedLink
              href="/create/gift"
              eventName="primary_cta_clicked"
              eventProperties={{ cta_location: "header", destination: "/create/gift" }}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#c5a059] px-5 text-xs font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37] sm:text-sm"
            >
              Make Something
            </TrackedLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-12 pb-16 text-center sm:px-6 sm:pt-20 sm:pb-24">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c5a059]">
          THE LIFE ARCHIVE
        </p>

        <h1 className="mt-4 font-serif text-4xl font-normal leading-[1.15] text-[#fdfbf7] sm:text-6xl lg:text-7xl">
          Be there,<br />
          even when you can&apos;t be.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl font-serif text-lg leading-relaxed text-[#fdfbf7]/75 sm:text-2xl">
          Your voice. Your memories. Your advice.<br />
          Connected to something they can carry.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <TrackedLink
            href="/create/gift"
            eventName="primary_cta_clicked"
            eventProperties={{ cta_location: "hero", destination: "/create/gift" }}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#c5a059] px-8 text-base font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37] sm:w-auto"
          >
            Make Something for Someone &rarr;
          </TrackedLink>
          <TrackedLink
            href="/create"
            eventName="secondary_cta_clicked"
            eventProperties={{ cta_location: "hero", destination: "/create" }}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-[#c5a059]/40 bg-white/[0.04] px-8 text-base font-semibold text-[#fdfbf7] backdrop-blur-sm transition hover:border-[#c5a059] hover:bg-white/[0.08] sm:w-auto"
          >
            Build Mine
          </TrackedLink>
        </div>

        {/* Supporting Callout */}
        <div className="mx-auto mt-12 max-w-xl rounded-full border border-[#c5a059]/20 bg-white/[0.03] px-6 py-3 shadow-luxury backdrop-blur-md">
          <p className="font-serif text-sm font-medium text-[#c5a059] sm:text-base">
            ✨ One special gift. A lifetime of surprises waiting inside.
          </p>
        </div>
      </section>

      {/* Hero Visual / Product Demo Section */}
      <section className="relative z-10 border-t border-[#c5a059]/15 bg-white/[0.02] px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c5a059]">
            Product Experience
          </p>
          <h2 className="mt-3 font-serif text-3xl font-normal text-[#fdfbf7] sm:text-4xl">
            One scan closer.
          </h2>
          <p className="mt-3 text-sm text-[#fdfbf7]/70 sm:text-base">
            They hold a physical keepsake. They scan the QR code. They hear your voice.
          </p>

          {/* Interactive Phone & Keepsake Composition */}
          <div className="mt-10 mx-auto max-w-sm rounded-[2.5rem] border border-[#c5a059]/30 bg-[#0a0806] p-6 shadow-luxury backdrop-blur-xl text-left">
            <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c5a059]/20 text-lg">
                  💛
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#c5a059]">FROM SARAH</p>
                  <p className="font-serif text-sm font-medium text-[#fdfbf7]">Sarah Jenkins</p>
                </div>
              </div>
              <span className="rounded-full bg-[#c5a059]/20 px-2.5 py-1 text-[10px] font-bold text-[#c5a059]">
                SCAN CONNECTED
              </span>
            </div>

            <div className="mt-6 text-center">
              <h3 className="font-serif text-2xl font-normal text-[#fdfbf7]">
                What do you need right now?
              </h3>

              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-[#c5a059]/30 bg-white/[0.04] p-3 text-center">
                  <span className="text-xl">💖</span>
                  <p className="mt-1 font-serif text-xs font-medium text-[#fdfbf7]">I Miss You</p>
                </div>
                <div className="rounded-xl border border-[#c5a059]/30 bg-white/[0.04] p-3 text-center">
                  <span className="text-xl">☀️</span>
                  <p className="mt-1 font-serif text-xs font-medium text-[#fdfbf7]">Bad Day</p>
                </div>
                <div className="rounded-xl border border-[#c5a059]/30 bg-white/[0.04] p-3 text-center">
                  <span className="text-xl">😄</span>
                  <p className="mt-1 font-serif text-xs font-medium text-[#fdfbf7]">Make Me Laugh</p>
                </div>
                <div className="rounded-xl border border-[#c5a059]/30 bg-white/[0.04] p-3 text-center">
                  <span className="text-xl">🧭</span>
                  <p className="mt-1 font-serif text-xs font-medium text-[#fdfbf7]">Advice</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growing Gift Section */}
      <section className="relative z-10 border-t border-[#c5a059]/15 px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c5a059]">
            The Growing Gift
          </p>
          <h2 className="mt-3 font-serif text-3xl font-normal text-[#fdfbf7] sm:text-5xl">
            Give it once. Keep adding to it forever.
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-[#fdfbf7]/75 sm:text-base">
            The QR code on their physical keepsake never changes. As your life and relationship grow, you can add new recordings, stories, and surprises anytime.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">Today</span>
              <h3 className="mt-2 font-serif text-lg font-medium text-[#fdfbf7]">Leave a message</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#fdfbf7]/65">
                Record a voice note or love note for them to open right away.
              </p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">Next Month</span>
              <h3 className="mt-2 font-serif text-lg font-medium text-[#fdfbf7]">Add for their birthday</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#fdfbf7]/65">
                Add a new surprise recording right from your phone.
              </p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">Next Year</span>
              <h3 className="mt-2 font-serif text-lg font-medium text-[#fdfbf7]">Add your anniversary</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#fdfbf7]/65">
                Add another chapter to the same physical keepsake.
              </p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">Years Later</span>
              <h3 className="mt-2 font-serif text-lg font-medium text-[#fdfbf7]">Add a life lesson</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#fdfbf7]/65">
                Pass along stories and wisdom as your journey continues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Time Capsule / Future Surprises Section */}
      <section className="relative z-10 border-t border-[#c5a059]/15 bg-white/[0.02] px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c5a059]">
            Future Surprises
          </p>
          <h2 className="mt-3 font-serif text-3xl font-normal text-[#fdfbf7] sm:text-4xl">
            Messages waiting inside for later.
          </h2>
          <p className="mt-3 text-sm text-[#fdfbf7]/70">
            Schedule future recordings to unlock on milestones, birthdays, or special dates.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <div className="rounded-2xl border border-[#c5a059]/25 bg-black/40 p-5 shadow-luxury">
              <span className="text-2xl">🎂</span>
              <h3 className="mt-3 font-serif text-base font-medium text-[#fdfbf7]">&ldquo;Open on your birthday&rdquo;</h3>
              <p className="mt-1 text-xs text-[#c5a059]">Unlocks Oct 14</p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/25 bg-black/40 p-5 shadow-luxury">
              <span className="text-2xl">💍</span>
              <h3 className="mt-3 font-serif text-base font-medium text-[#fdfbf7]">&ldquo;Our 5-Year Anniversary&rdquo;</h3>
              <p className="mt-1 text-xs text-[#c5a059]">Unlocks June 20</p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/25 bg-black/40 p-5 shadow-luxury">
              <span className="text-2xl">🎓</span>
              <h3 className="mt-3 font-serif text-base font-medium text-[#fdfbf7]">&ldquo;When you graduate&rdquo;</h3>
              <p className="mt-1 text-xs text-[#c5a059]">Unlocks Graduation Day</p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/25 bg-black/40 p-5 shadow-luxury">
              <span className="text-2xl">☀️</span>
              <h3 className="mt-3 font-serif text-base font-medium text-[#fdfbf7]">&ldquo;Open on a hard day&rdquo;</h3>
              <p className="mt-1 text-xs text-[#c5a059]">Available anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="relative z-10 border-t border-[#c5a059]/15 px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c5a059]">
            Who Is This For?
          </p>
          <h2 className="mt-3 font-serif text-3xl font-normal text-[#fdfbf7] sm:text-4xl">
            A connection for every relationship.
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 text-left">
            <div className="rounded-3xl border border-[#c5a059]/20 bg-white/[0.03] p-6">
              <span className="text-3xl">💍</span>
              <h3 className="mt-3 font-serif text-xl font-medium text-[#fdfbf7]">For your partner</h3>
              <p className="mt-2 text-sm text-[#fdfbf7]/70">
                Messages for love, bad days, anniversaries, and everything between.
              </p>
            </div>
            <div className="rounded-3xl border border-[#c5a059]/20 bg-white/[0.03] p-6">
              <span className="text-3xl">👶</span>
              <h3 className="mt-3 font-serif text-xl font-medium text-[#fdfbf7]">For your child</h3>
              <p className="mt-2 text-sm text-[#fdfbf7]/70">
                Advice, encouragement, home, and messages for the road ahead.
              </p>
            </div>
            <div className="rounded-3xl border border-[#c5a059]/20 bg-white/[0.03] p-6">
              <span className="text-3xl">✈️</span>
              <h3 className="mt-3 font-serif text-xl font-medium text-[#fdfbf7]">For someone far away</h3>
              <p className="mt-2 text-sm text-[#fdfbf7]/70">
                A piece of you they can reach whenever they miss home.
              </p>
            </div>
            <div className="rounded-3xl border border-[#c5a059]/20 bg-white/[0.03] p-6">
              <span className="text-3xl">🌿</span>
              <h3 className="mt-3 font-serif text-xl font-medium text-[#fdfbf7]">For family &amp; friends</h3>
              <p className="mt-2 text-sm text-[#fdfbf7]/70">
                Stories, voices, jokes, and moments worth keeping forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 border-t border-[#c5a059]/15 bg-white/[0.02] px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c5a059]">
            How It Works
          </p>
          <h2 className="mt-3 font-serif text-3xl font-normal text-[#fdfbf7] sm:text-4xl">
            Four simple steps.
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <div className="rounded-2xl border border-[#c5a059]/20 bg-black/40 p-5">
              <span className="text-xs font-bold text-[#c5a059]">01</span>
              <h3 className="mt-2 font-serif text-lg font-medium text-[#fdfbf7]">1. MAKE IT</h3>
              <p className="mt-1 text-xs text-[#fdfbf7]/65">
                Record voice notes, videos, stories, advice, and messages.
              </p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-black/40 p-5">
              <span className="text-xs font-bold text-[#c5a059]">02</span>
              <h3 className="mt-2 font-serif text-lg font-medium text-[#fdfbf7]">2. CONNECT IT</h3>
              <p className="mt-1 text-xs text-[#fdfbf7]/65">
                Pair your messages with a physical keepsake.
              </p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-black/40 p-5">
              <span className="text-xs font-bold text-[#c5a059]">03</span>
              <h3 className="mt-2 font-serif text-lg font-medium text-[#fdfbf7]">3. KEEP ADDING</h3>
              <p className="mt-1 text-xs text-[#fdfbf7]/65">
                Add new recordings and milestones whenever you want.
              </p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-black/40 p-5">
              <span className="text-xs font-bold text-[#c5a059]">04</span>
              <h3 className="mt-2 font-serif text-lg font-medium text-[#fdfbf7]">4. THEY SCAN</h3>
              <p className="mt-1 text-xs text-[#fdfbf7]/65">
                Everything you left for them is one scan away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Keepsakes Section */}
      <section className="relative z-10 border-t border-[#c5a059]/15 px-4 py-16 sm:px-6 lg:py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c5a059]">
            Physical Keepsakes
          </p>
          <h2 className="mt-3 font-serif text-3xl font-normal text-[#fdfbf7] sm:text-4xl">
            The keepsake is the key.<br />
            Everything you leave for them lives behind it.
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-5">
              <span className="text-3xl">📿</span>
              <h3 className="mt-2 font-serif text-base font-medium">Necklace</h3>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-5">
              <span className="text-3xl">🏷️</span>
              <h3 className="mt-2 font-serif text-base font-medium">Dog Tag</h3>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-5">
              <span className="text-3xl">🔑</span>
              <h3 className="mt-2 font-serif text-base font-medium">Keychain</h3>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-5">
              <span className="text-3xl">💳</span>
              <h3 className="mt-2 font-serif text-base font-medium">Wallet Card</h3>
            </div>
          </div>

          <Link
            href="/keepsakes"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-[#c5a059]/40 bg-white/[0.04] px-6 text-sm font-semibold text-[#fdfbf7] shadow-luxury transition hover:bg-[#c5a059] hover:text-[#0a0806]"
          >
            Explore Keepsakes &rarr;
          </Link>
        </div>
      </section>

      {/* Remembrance / Memorial Section */}
      <section className="relative z-10 border-t border-[#c5a059]/15 bg-white/[0.015] px-4 py-12 text-center sm:px-6">
        <div className="mx-auto max-w-2xl">
          <span className="text-2xl">🕊️</span>
          <p className="mt-3 font-serif text-lg italic text-[#fdfbf7]/80">
            &ldquo;And when someone can no longer add to it, what they already left becomes priceless.&rdquo;
          </p>
          <Link
            href="/after-a-loss"
            className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-[#c5a059] hover:underline"
          >
            Support After a Loss &rarr;
          </Link>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 border-t border-[#c5a059]/15 bg-[#c5a059]/10 px-4 py-16 text-center sm:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl font-normal text-[#fdfbf7] sm:text-5xl">
            Start something that lasts.
          </h2>
          <p className="mt-3 text-sm text-[#fdfbf7]/75 sm:text-base">
            Make your first voice note or message in less than two minutes.
          </p>
          <TrackedLink
            href="/create/gift"
            eventName="primary_cta_clicked"
            eventProperties={{ cta_location: "bottom_banner", destination: "/create/gift" }}
            className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-[#c5a059] px-8 text-base font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37]"
          >
            Make Something for Someone &rarr;
          </TrackedLink>
        </div>
      </section>

      {/* Site Footer */}
      <SiteFooter signedIn={isSignedIn} />
    </main>
  );
}
