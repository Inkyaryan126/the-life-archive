import Link from "next/link";
import { DesignBackdrop, DesignImageButtonLink, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const chapters = [
  {
    label: "Visual Legacies",
    sublabel: "Photos that freeze a single moment in time.",
    image: "/images/site-design/photos-button.jpg",
    type: "photo"
  },
  {
    label: "Living Moments",
    sublabel: "Video memories of laughter and presence.",
    image: "/images/site-design/videos-button.jpg",
    type: "video"
  },
  {
    label: "Spoken Cadence",
    sublabel: "The actual sound and warmth of their voice.",
    image: "/images/site-design/voicenotes-button.jpg",
    type: "voice"
  },
  {
    label: "Personal Journals",
    sublabel: "Handwritten notes, letters, and reflections.",
    image: "/images/site-design/journals-button.jpg",
    type: "journal"
  },
  {
    label: "Hard-Won Wisdom",
    sublabel: "The core values and rules that navigated life.",
    image: "/images/site-design/lifelessons-button.jpg",
    type: "lesson"
  },
  {
    label: "Soundtrack of a Life",
    sublabel: "The melodies that filled Sunday mornings.",
    image: "/images/site-design/songs-button.jpg",
    type: "song"
  }
];

const steps = [
  {
    num: "01",
    title: "Establish the Sanctuary",
    desc: "Create a private, permanent digital vault for yourself or a loved one in under two minutes."
  },
  {
    num: "02",
    title: "Gather the Chapters",
    desc: "Record simple voice notes, upload photos, document lessons, and choose the music that shaped their days."
  },
  {
    num: "03",
    title: "Etch the Physical Key",
    desc: "Connect the archive to a premium, physical Storykeeper Card, memorial program, plaque, or keyring."
  },
  {
    num: "04",
    title: "Preserve Across Generations",
    desc: "Keep the card close or place it thoughtfully, ensuring children and future descendants can always find their way back."
  }
];

export default async function HomePage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn ? "Enter Dashboard" : "Begin Your Archive";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory flex flex-col justify-between">
      <DesignBackdrop />
      
      <div className="relative z-10 flex flex-col flex-grow">
        {/* Navigation Bar with Glass Blur */}
        <nav className="sticky top-0 z-50 mx-auto w-full border-b border-archive-gold/10 bg-archive-obsidian/45 backdrop-blur-md px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="transition opacity-90 hover:opacity-100">
              <SiteLogo width={320} height={90} />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/keepsakes"
                className="text-xs font-semibold uppercase tracking-wider text-archive-ivory/80 transition hover:text-archive-gold"
              >
                Keepsakes
              </Link>
              {isSignedIn && (
                <Link
                  href="/member-card"
                  className="text-xs font-semibold uppercase tracking-wider text-archive-ivory/80 transition hover:text-archive-gold"
                >
                  Storykeeper Card
                </Link>
              )}
              <Link
                href={primaryHref}
                className="rounded-full border border-archive-gold/40 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-archive-ivory transition hover:border-archive-gold hover:bg-white/5"
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="flex items-center px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
                What will they remember of you?
              </p>
              <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-7xl text-archive-ivory">
                The Life Archive
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-archive-ivory/74 font-serif italic">
                A quiet, permanent digital sanctuary for the things that cannot be replaced.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-archive-ivory/60">
                The Life Archive is a physical-to-digital preservation platform. We help families record the spoken cadence, defining life lessons, and quiet memories of those they love—safeguarding their spirit and connecting physical keepsakes to a permanent home of heritage.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={primaryHref}
                  className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
                >
                  {primaryLabel}
                </Link>
                <Link
                  href="/archive/sari-rae"
                  className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                >
                  Explore Sari Rae&apos;s Legacy →
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* The Keepsake Experience Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                THE KEEPSAKE EXPERIENCE
              </p>
              <h2 className="mt-3 font-serif text-3xl text-archive-ivory sm:text-4xl">
                Bridging the Physical and the Eternal
              </h2>
              <p className="mt-5 text-sm leading-7 text-archive-ivory/65">
                A simple scan on a physical monument, urn, celebration program, or custom wallet card instantly unlocks their secure digital sanctuary.
              </p>
              <p className="mt-4 text-sm leading-7 text-archive-ivory/65">
                Suddenly, static keepsakes are filled with life: hear your mother&apos;s comforting advice, listen to your grandfather&apos;s actual childhood stories, play their favorite cookout soundtrack, or read hand-written letters. You are not just reading dates carved in stone—you are stepping back into their warmth.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.02] p-8 shadow-luxury relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-archive-gold/5 blur-3xl rounded-full" />
              <h3 className="font-serif text-xl text-archive-gold mb-3">Why Families Build Archives</h3>
              <ul className="grid gap-3 text-xs text-archive-ivory/70 leading-relaxed">
                <li>
                  <strong className="text-archive-ivory block mb-1">• The Voice is Forgotten First</strong>
                  Voice notes bring back presence and laughter more immediately than any silent photograph.
                </li>
                <li>
                  <strong className="text-archive-ivory block mb-1">• Intimacy Over Exposure</strong>
                  A quiet space with absolute RLS-gated privacy. No ads, no likes, no public feeds. Just your legacy, safe.
                </li>
                <li>
                  <strong className="text-archive-ivory block mb-1">• Guide Future Generations</strong>
                  Pass down a tangible keepsake card so descendants a century from now can hear your voice and know your values.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
              THE PRESERVATION PROCESS
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              The Journey of Legacy
            </h2>
            <p className="mt-3 text-sm text-archive-ivory/55">
              Four simple, thoughtful steps to ensure your family&apos;s history is preserved forever.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-archive-gold/14 bg-white/[0.015] p-6 transition hover:border-archive-gold/30 hover:bg-white/[0.03] flex flex-col justify-between"
              >
                <div>
                  <span className="font-serif text-3xl text-archive-gold/30 font-bold block mb-4">
                    {step.num}
                  </span>
                  <h3 className="font-serif text-lg text-archive-champagne mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-6 text-archive-ivory/60">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Keepsakes Copy Block Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                PHYSICAL STORYKEEPER KEEPSAKES
              </p>
              <h2 className="mt-3 font-serif text-3xl text-archive-ivory sm:text-4xl">
                Physical Keepsakes That Carry Their Story
              </h2>
              <p className="mt-5 text-sm leading-7 text-archive-ivory/65">
                Every Life Archive includes a free QR code. Print it, share it, or keep it with your records. When you are ready, that same QR can be placed on premium keepsakes — wallet cards, dog tags, keychains, pendants, plaques, urn tags, and more.
              </p>
              <p className="mt-4 font-serif text-base text-archive-gold italic">
                &ldquo;The archive is the digital home. The keepsake is the physical key.&rdquo;
              </p>
              <div className="mt-6">
                <Link
                  href="/keepsakes"
                  className="rounded-full bg-archive-gold px-6 py-3 text-xs font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne inline-flex"
                >
                  View Keepsakes Collection
                </Link>
              </div>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.025] p-8 shadow-luxury">
              <h3 className="font-serif text-xl text-archive-gold mb-3">Premium Physical Artifacts</h3>
              <ul className="grid gap-4 text-xs text-archive-ivory/70 leading-relaxed">
                <li>
                  <strong className="text-archive-ivory block mb-1">• Carry Close: Wallet Cards &amp; Keychains</strong>
                  Keep their laughter, photos, and instructions in your pocket or alongside daily keys.
                </li>
                <li>
                  <strong className="text-archive-ivory block mb-1">• Wear Deep: Necklaces &amp; Dog Tags</strong>
                  Elegant pendants and rugged stainless steel tags designed to carry memory with physical presence.
                </li>
                <li>
                  <strong className="text-archive-ivory block mb-1">• Anchor Permanently: Plaques &amp; Urns</strong>
                  Beautiful weather-proof metal qr plates to mount on headstones, columbaria, or framed family frames.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Category Cards Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
              ORGANIZED HERITAGE
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              Explore the Archive Vault
            </h2>
            <p className="mt-3 text-sm text-archive-ivory/55">
              The components of an heirloom legacy, designed to store every facet of identity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {chapters.map((chapter) => (
              <DesignImageButtonLink
                key={chapter.label}
                href={primaryHref}
                label={chapter.label}
                className="w-full"
                images={[
                  {
                    src: chapter.image,
                    alt: `${chapter.label} chapter`,
                    width: 476,
                    height: 417,
                    className: "block"
                  }
                ]}
              />
            ))}
          </div>
        </section>

        {/* Editorial Legacy Footer */}
        <footer className="relative z-10 border-t border-archive-gold/20 bg-archive-obsidian/40 backdrop-blur-md mt-auto py-16 text-xs text-archive-ivory/60">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 grid gap-8 md:grid-cols-4">
            <div>
              <SiteLogo width={280} height={85} className="mb-6 opacity-95" />
              <p className="leading-6 max-w-xs text-[11px]">
                The Life Archive is a quiet, permanent digital sanctuary helping you intentionally decide what survives you. Preserve your voice, identity, and life lessons for generations to come.
              </p>
            </div>
            <div>
              <h4 className="text-archive-gold font-semibold uppercase tracking-wider mb-4">Legacy Hub</h4>
              <ul className="grid gap-3">
                <li>
                  <Link href="/build-your-legacy" className="hover:text-archive-champagne hover:underline transition">
                    Build Your Legacy
                  </Link>
                </li>
                <li>
                  <Link href="/preserve-their-voice" className="hover:text-archive-champagne hover:underline transition">
                    Preserve Their Voice
                  </Link>
                </li>
                <li>
                  <Link href="/storykeeper-products" className="hover:text-archive-champagne hover:underline transition">
                    Storykeeper Products
                  </Link>
                </li>
                <li>
                  <Link href="/help-for-families" className="hover:text-archive-champagne hover:underline transition">
                    Help for Families (After Loss)
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-archive-gold font-semibold uppercase tracking-wider mb-4">Partner Ecosystem</h4>
              <ul className="grid gap-3">
                <li>
                  <Link href="/partners/funeral-homes" className="hover:text-archive-champagne hover:underline transition">
                    Funeral Homes
                  </Link>
                </li>
                <li>
                  <Link href="/partners/cemeteries" className="hover:text-archive-champagne hover:underline transition">
                    Cemeteries &amp; Parks
                  </Link>
                </li>
                <li>
                  <Link href="/partners/monuments" className="hover:text-archive-champagne hover:underline transition">
                    Monument Builders
                  </Link>
                </li>
                <li>
                  <Link href="/partners/hospice" className="hover:text-archive-champagne hover:underline transition">
                    Hospice Care Providers
                  </Link>
                </li>
                <li>
                  <Link href="/partners/estate-planners" className="hover:text-archive-champagne hover:underline transition">
                    Estate Planners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-archive-gold font-semibold uppercase tracking-wider mb-4 font-serif italic">Every Legacy Begins...</h4>
              <p className="leading-5 max-w-xs text-[11px] mb-4">
                &ldquo;What story deserves to be remembered? What mistake taught you the most? What do you hope they remember when you are gone?&rdquo;
              </p>
              <p className="text-[10px] text-archive-gold/60">
                © 2026 The Life Archive. All rights preserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
