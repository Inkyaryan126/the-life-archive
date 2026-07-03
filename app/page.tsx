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

function SectionDivider() {
  return (
    <div className="relative z-20 mx-auto w-full max-w-[1680px] px-6 py-8 lg:px-10 lg:py-10 xl:px-16">
      <Image
        src="/images/site-design/heartbeat-logo-divider.png"
        alt="The Life Archive heartbeat divider"
        width={1001}
        height={163}
        className="mx-auto h-16 w-full max-w-[1600px] object-contain opacity-95 sm:h-20 lg:h-24 xl:h-28"
        sizes="(min-width: 1280px) 92vw, 100vw"
      />
    </div>
  );
}

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
        <nav className="sticky top-0 z-50 w-full border-b border-archive-gold/10 bg-archive-obsidian/55 px-8 py-5 backdrop-blur-md xl:px-16">
          <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="inline-flex transition opacity-95 hover:opacity-100">
              <SiteLogo width={280} height={72} />
            </Link>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 lg:justify-end xl:gap-x-8">
              <Link
                href="/keepsakes"
                className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-ivory/82 transition hover:text-archive-gold sm:text-base"
              >
                Keepsake Store
              </Link>
              {isSignedIn && (
                <Link
                  href="/member-card"
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-ivory/82 transition hover:text-archive-gold sm:text-base"
                >
                  The Life Archive Memory Card
                </Link>
              )}
              <Link
                href={primaryHref}
                className="rounded-full border border-archive-gold/45 px-7 py-3.5 text-base font-semibold uppercase tracking-[0.16em] text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/5 sm:px-8 sm:py-4"
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative overflow-visible px-8 py-18 sm:py-22 lg:min-h-[740px] xl:px-16">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-[52%] bg-[linear-gradient(90deg,rgba(13,13,14,0.94)_0%,rgba(13,13,14,0.9)_54%,rgba(13,13,14,0.55)_78%,rgba(13,13,14,0)_100%)] lg:block" />
          <div className="mx-auto grid w-full max-w-[96rem] items-center gap-10 lg:min-h-[700px] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-12">
            <div className="relative z-20 max-w-[44rem]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold sm:text-base">
                What will they remember of you?
              </p>
              <h1 className="mt-5 bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold bg-clip-text font-serif text-5xl font-bold leading-[0.96] tracking-tight text-transparent sm:text-6xl xl:text-7xl">
                The Life Archive
              </h1>
              <p className="mt-6 max-w-[40rem] font-serif text-xl italic leading-8 text-archive-ivory/90 sm:text-2xl lg:text-[2rem] lg:leading-9">
                A quiet, permanent digital sanctuary for the things that cannot be replaced.
              </p>
              <p className="mt-6 max-w-[43rem] text-lg leading-8 text-archive-ivory/82 lg:text-lg xl:text-xl">
                The Life Archive is a physical-to-digital preservation platform. We help families record the spoken cadence, defining life lessons, and quiet memories of those they love—safeguarding their spirit and connecting physical keepsakes to a permanent home of heritage.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={primaryHref}
                  className="rounded-full bg-archive-gold px-8 py-4 text-base font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
                >
                  {primaryLabel}
                </Link>
                <Link
                  href="/archive/the-first-storykeeper"
                  className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-base font-semibold text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/[0.08]"
                >
                  Explore The Story That Started It All →
                </Link>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="relative z-10 hidden h-full min-h-[620px] overflow-visible lg:block"
            >
              <div className="absolute left-[-12%] top-[2%] w-[82vw] min-w-[880px] max-w-[1300px]">
                <Image
                  src="/images/site-design/tla-background.png"
                  alt=""
                  width={1536}
                  height={1024}
                  priority
                  sizes="(min-width: 1280px) 82vw, 100vw"
                  className="h-auto w-full object-contain opacity-100"
                />
              </div>
            </div>
          </div>
        </header>

        {/* The Keepsake Experience Section */}
        <section className="relative z-20 w-full px-8 pb-16 pt-10 lg:px-12 lg:pb-20 lg:pt-14 xl:px-16">
          <div className="mx-auto grid w-full max-w-[96rem] gap-10 lg:gap-12">
            <div className="max-w-[48rem]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold sm:text-base">
                THE KEEPSAKE EXPERIENCE
              </p>
              <h2 className="mt-5 font-serif text-4xl text-archive-ivory sm:text-5xl xl:text-6xl">
                Bridging the Physical and the Eternal
              </h2>
              <p className="mt-6 text-lg leading-8 text-archive-ivory/78 lg:text-lg xl:text-xl">
                A simple scan on a physical monument, urn, celebration program, or custom wallet card instantly unlocks their secure digital sanctuary.
              </p>
              <p className="mt-5 text-lg leading-8 text-archive-ivory/74 lg:text-lg xl:text-xl">
                Suddenly, static keepsakes are filled with life: hear your mother&apos;s comforting advice, listen to your grandfather&apos;s actual childhood stories, play their favorite cookout soundtrack, or read hand-written letters. You are not just reading dates carved in stone—you are stepping back into their warmth.
              </p>
            </div>
            <div className="relative max-w-[48rem] overflow-hidden rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury backdrop-blur-[2px] lg:ml-auto lg:p-10">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-archive-gold/5 blur-3xl" />
              <h3 className="mb-5 font-serif text-3xl text-archive-gold sm:text-4xl">
                Why Families Build Archives
              </h3>
              <ul className="grid gap-6 text-lg leading-8 text-archive-ivory/75">
                <li>
                  <strong className="mb-1 block text-archive-ivory">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    The Voice is Forgotten First
                  </strong>
                  Voice notes bring back presence and laughter more immediately than any silent photograph.
                </li>
                <li>
                  <strong className="mb-1 block text-archive-ivory">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    Intimacy Over Exposure
                  </strong>
                  A quiet space with private access. No ads, no likes, no public feeds. Just your legacy, safe.
                </li>
                <li>
                  <strong className="mb-1 block text-archive-ivory">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    Guide Future Generations
                  </strong>
                  Pass down a tangible keepsake card so descendants a century from now can hear your voice and know your values.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* How It Works Section */}
        <section className="w-full px-8 py-16 lg:px-12 lg:py-20 xl:px-16">
          <div className="mx-auto w-full max-w-[96rem]">
            <div className="mb-12 max-w-5xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold sm:text-base">
                THE PRESERVATION PROCESS
              </p>
              <h2 className="mt-5 font-serif text-4xl text-archive-ivory sm:text-5xl xl:text-6xl">
                The Journey of Legacy
              </h2>
              <p className="mt-5 max-w-4xl text-lg leading-8 text-archive-ivory/72 lg:text-lg xl:text-xl">
                Four simple, thoughtful steps to ensure your family&apos;s history is preserved forever.
              </p>
            </div>

            <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="group flex flex-col justify-between rounded-2xl border border-archive-gold/10 bg-white/[0.01] p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-archive-gold/30 hover:bg-white/[0.03] hover:shadow-lg hover:shadow-archive-gold/5 lg:p-10"
                >
                  <div>
                    <span className="mb-5 block font-serif text-5xl font-bold text-archive-gold/20 transition-colors duration-300 group-hover:text-archive-gold/40">
                      {step.num}
                    </span>
                    <h3 className="mb-4 font-serif text-2xl text-archive-champagne lg:text-3xl">
                      {step.title}
                    </h3>
                    <p className="text-lg leading-8 text-archive-ivory/72 lg:text-xl lg:leading-9">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Keepsakes Copy Block Section */}
        <section className="w-full px-8 py-16 lg:px-12 lg:py-20 xl:px-16">
          <div className="mx-auto grid w-full max-w-[96rem] items-start gap-10 lg:grid-cols-[minmax(0,0.54fr)_minmax(0,0.46fr)] lg:gap-12">
            <div className="max-w-[48rem]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold sm:text-base">
                PHYSICAL ARCHIVE KEEPSAKES
              </p>
              <h2 className="mt-5 font-serif text-4xl text-archive-ivory sm:text-5xl xl:text-6xl">
                Physical Keepsakes That Carry Their Story
              </h2>
              <p className="mt-6 text-lg leading-8 text-archive-ivory/78 lg:text-lg xl:text-xl">
                Every Life Archive includes a free QR code. Print it, share it, or keep it with your records. When you are ready, that same QR can be placed on premium keepsakes — wallet cards, dog tags, keychains, pendants, plaques, urn tags, and more.
              </p>
              <p className="mt-5 font-serif text-xl italic text-archive-gold lg:text-2xl">
                &ldquo;The archive is the digital home. The keepsake is the physical key.&rdquo;
              </p>
              <div className="mt-8">
                <Link
                  href="/keepsakes"
                  className="inline-flex rounded-full bg-archive-gold px-8 py-4 text-base font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
                >
                  Visit the Keepsake Store
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury backdrop-blur-[2px] lg:p-10">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-archive-gold/5 blur-3xl" />
              <h3 className="mb-5 font-serif text-3xl text-archive-gold sm:text-4xl">
                Premium Physical Artifacts
              </h3>
              <ul className="grid gap-6 text-lg leading-8 text-archive-ivory/75">
                <li>
                  <strong className="mb-1 block text-archive-ivory">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    Carry Close: Wallet Cards &amp; Keychains
                  </strong>
                  Keep their laughter, photos, and instructions in your pocket or alongside daily keys.
                </li>
                <li>
                  <strong className="mb-1 block text-archive-ivory">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    Wear Deep: Necklaces &amp; Dog Tags
                  </strong>
                  Elegant pendants and rugged stainless steel tags designed to carry memory with physical presence.
                </li>
                <li>
                  <strong className="mb-1 block text-archive-ivory">
                    <span className="text-archive-gold/90 mr-2 font-sans select-none">◆</span>
                    Anchor Permanently: Plaques &amp; Urns
                  </strong>
                  Beautiful weather-proof metal qr plates to mount on headstones, columbaria, or framed family frames.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Category Cards Section */}
        <section className="w-full px-8 py-16 lg:px-12 lg:py-20 xl:px-16">
          <div className="mx-auto w-full max-w-[96rem]">
            <div className="mb-12 max-w-5xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold sm:text-base">
                ORGANIZED HERITAGE
              </p>
              <h2 className="mt-5 font-serif text-4xl text-archive-ivory sm:text-5xl xl:text-6xl">
                Explore the Archive Vault
              </h2>
              <p className="mt-5 max-w-4xl text-lg leading-8 text-archive-ivory/72 lg:text-lg xl:text-xl">
                The components of an heirloom legacy, designed to store every facet of identity.
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
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
          </div>
        </section>

        <SectionDivider />

        {/* Editorial Legacy Footer */}
        <footer className="relative z-10 mt-auto bg-archive-obsidian/40 px-8 py-14 text-base text-archive-ivory/70 backdrop-blur-md xl:px-16">
          <div className="mx-auto grid w-full max-w-[96rem] gap-10 md:grid-cols-4">
            <div>
              <SiteLogo width={240} height={64} className="mb-6 opacity-100" />
              <p className="max-w-xl text-base leading-7">
                The Life Archive is a quiet, permanent digital sanctuary helping you intentionally decide what survives you. Preserve your voice, identity, and life lessons for generations to come.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">Legacy Hub</h4>
              <ul className="grid gap-3 text-base leading-7">
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
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">Partner Ecosystem</h4>
              <ul className="grid gap-3 text-base leading-7">
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
              <h4 className="mb-4 font-serif text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold italic">Every Legacy Begins...</h4>
              <p className="mb-4 max-w-xl text-base leading-7">
                &ldquo;What story deserves to be remembered? What mistake taught you the most? What do you hope they remember when you are gone?&rdquo;
              </p>
              <p className="text-sm text-archive-gold/60">
                © 2026 The Life Archive. All rights preserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
