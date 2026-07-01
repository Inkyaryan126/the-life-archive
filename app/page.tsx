import Image from "next/image";
import Link from "next/link";
import { DesignImageButtonLink, SiteLogo } from "@/components/SiteDesign";
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
    desc: "Connect the archive to The Life Archive Memory Card, memorial program, plaque, or keyring."
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
  const primaryLabel = isSignedIn ? "Enter My Archives" : "Begin Your Archive";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory flex flex-col justify-between">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,161,91,0.2),transparent_40rem),radial-gradient(circle_at_bottom_right,rgba(198,161,91,0.08),transparent_40rem),linear-gradient(180deg,rgba(7,7,8,0.1),rgba(7,7,8,0.7))]" />
      </div>
      
      <div className="relative z-10 flex flex-col flex-grow">
        {/* Navigation Bar with Glass Blur */}
        <nav className="sticky top-0 z-50 mx-auto w-full border-b border-archive-gold/10 bg-archive-obsidian/45 px-5 py-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-[92rem] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="transition opacity-90 hover:opacity-100">
              <SiteLogo width={220} height={60} />
            </Link>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/keepsakes"
                className="text-xs font-semibold uppercase tracking-wider text-archive-ivory/80 transition hover:text-archive-gold"
              >
                Keepsake Store
              </Link>
              {isSignedIn && (
                <Link
                  href="/member-card"
                  className="text-xs font-semibold uppercase tracking-wider text-archive-ivory/80 transition hover:text-archive-gold"
                >
                  The Life Archive Memory Card
                </Link>
              )}
              <Link
                href={primaryHref}
                className="rounded-full border border-archive-gold/40 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/5"
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative overflow-visible px-5 py-20 sm:px-8 sm:py-28 lg:min-h-[760px] lg:px-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-[60%] bg-[linear-gradient(90deg,rgba(13,13,14,0.92)_0%,rgba(13,13,14,0.86)_54%,rgba(13,13,14,0.48)_78%,rgba(13,13,14,0)_100%)] lg:block" />
          <div className="relative z-10 mx-auto grid w-full max-w-[92rem] items-center gap-10 lg:min-h-[760px] lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)]">
            <div className="relative z-30 max-w-[42rem]">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-archive-gold">
                What will they remember of you?
              </p>
              <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold">
                The Life Archive
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-archive-ivory/90 font-serif italic">
                A quiet, permanent digital sanctuary for the things that cannot be replaced.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-archive-ivory/80">
                The Life Archive is a physical-to-digital preservation platform. We help families record the spoken cadence, defining life lessons, and quiet memories of those they love—safeguarding their spirit and connecting physical keepsakes to a permanent home of heritage.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={primaryHref}
                  className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
                >
                  {primaryLabel}
                </Link>
                <Link
                  href="/archive/the-first-storykeeper"
                  className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/[0.08]"
                >
                  Explore The Story That Started It All →
                </Link>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="relative z-10 hidden h-full min-h-[560px] overflow-visible lg:block"
            >
              <div className="absolute right-[-1%] top-[6%] w-[58vw] min-w-[760px] max-w-[1100px]">
                <Image
                  src="/images/site-design/tla-background.png"
                  alt=""
                  width={1536}
                  height={1024}
                  priority
                  sizes="(min-width: 1920px) 1100px, 58vw"
                  className="h-auto w-full object-contain opacity-100"
                />
              </div>
            </div>
          </div>
        </header>

        {/* The Keepsake Experience Section */}
        <section className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 lg:px-10 border-t border-archive-gold/15">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
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
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury relative overflow-hidden backdrop-blur-[2px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-archive-gold/5 blur-3xl rounded-full" />
              <h3 className="font-serif text-xl text-archive-gold mb-4">Why Families Build Archives</h3>
              <ul className="grid gap-4 text-xs text-archive-ivory/70 leading-relaxed">
                <li>
                  <strong className="text-archive-ivory block mb-1">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    The Voice is Forgotten First
                  </strong>
                  Voice notes bring back presence and laughter more immediately than any silent photograph.
                </li>
                <li>
                  <strong className="text-archive-ivory block mb-1">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    Intimacy Over Exposure
                  </strong>
                  A quiet space with private access. No ads, no likes, no public feeds. Just your legacy, safe.
                </li>
                <li>
                  <strong className="text-archive-ivory block mb-1">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    Guide Future Generations
                  </strong>
                  Pass down a tangible keepsake card so descendants a century from now can hear your voice and know your values.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mx-auto w-full max-w-[92rem] px-5 py-20 sm:px-8 lg:px-10 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
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
                className="group rounded-2xl border border-archive-gold/10 bg-white/[0.01] p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-archive-gold/30 hover:bg-white/[0.03] hover:shadow-lg hover:shadow-archive-gold/5 flex flex-col justify-between"
              >
                <div>
                  <span className="font-serif text-3xl text-archive-gold/20 font-bold block mb-4 transition-colors duration-300 group-hover:text-archive-gold/40">
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
        <section className="mx-auto w-full max-w-[92rem] px-5 py-20 sm:px-8 lg:px-10 border-t border-archive-gold/15">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                PHYSICAL ARCHIVE KEEPSAKES
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
                  className="rounded-full bg-archive-gold px-6 py-3 text-xs font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10 inline-flex"
                >
                  Visit the Keepsake Store
                </Link>
              </div>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury relative overflow-hidden backdrop-blur-[2px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-archive-gold/5 blur-3xl rounded-full" />
              <h3 className="font-serif text-xl text-archive-gold mb-4">Premium Physical Artifacts</h3>
              <ul className="grid gap-4 text-xs text-archive-ivory/70 leading-relaxed">
                <li>
                  <strong className="text-archive-ivory block mb-1">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    Carry Close: Wallet Cards &amp; Keychains
                  </strong>
                  Keep their laughter, photos, and instructions in your pocket or alongside daily keys.
                </li>
                <li>
                  <strong className="text-archive-ivory block mb-1">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    Wear Deep: Necklaces &amp; Dog Tags
                  </strong>
                  Elegant pendants and rugged stainless steel tags designed to carry memory with physical presence.
                </li>
                <li>
                  <strong className="text-archive-ivory block mb-1">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    Anchor Permanently: Plaques &amp; Urns
                  </strong>
                  Beautiful weather-proof metal qr plates to mount on headstones, columbaria, or framed family frames.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Category Cards Section */}
        <section className="mx-auto w-full max-w-[92rem] px-5 py-20 sm:px-8 lg:px-10 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
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
          <div className="mx-auto max-w-[92rem] px-5 sm:px-8 lg:px-10 grid gap-8 md:grid-cols-4">
            <div>
              <SiteLogo width={360} height={110} className="mb-8 opacity-100" />
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
                  <Link href="/keepsakes" className="hover:text-archive-champagne hover:underline transition">
                    Keepsake Store
                  </Link>
                </li>
                <li>
                  <Link href="/keepsakes" className="hover:text-archive-champagne hover:underline transition">
                    Keepsake Store
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
