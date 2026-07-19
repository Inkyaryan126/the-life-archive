import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import grandHallDirectoryImage from "../site-design/archive-building-design/archive-map.png";
import { SiteLogo } from "@/components/SiteDesign";
import { GrandHallArrival } from "@/components/archive-building/ArchiveArrival";
import { getAccountContext } from "@/lib/account";
import { publicSupportEmail } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Life Archive - The Grand Hall",
  description:
    "Enter The Life Archive Grand Hall. Begin with the Legacy Question, create an archive, manage memories, explore keepsakes, and find support after a loss."
};

type DirectoryEntry = {
  title: string;
  label?: string;
  href: string;
  description: string;
  note?: string;
  ariaLabel: string;
  position: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  featured?: boolean;
};

type DesktopDirectoryEntry = {
  title: string;
  subtitle: string;
  href: string;
  ariaLabel: string;
  featured?: boolean;
};

const desktopDirectoryRegion = {
  left: 40.79,
  top: 30.39,
  width: 18.9,
  height: 55.37
};

function PrimaryCta({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
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
  return (
    <Link
      className="inline-flex min-h-12 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
      href={href}
    >
      {children}
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold sm:text-sm">
      {children}
    </p>
  );
}

export default async function HomePage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const myArchivesHref = isSignedIn ? "/dashboard" : "/login";
  const timeCapsulesHref = isSignedIn
    ? "/dashboard/time-capsules"
    : "/login?next=%2Fdashboard%2Ftime-capsules";

  const directoryEntries: DirectoryEntry[] = [
    {
      label: "Start here",
      title: "The Legacy Question",
      href: "/legacy-question",
      description:
        "Answer one meaningful question, preserve your words and memories, and leave something behind for someone you love.",
      note:
        "THE LIFE ARCHIVE IS FREE TO USE. The core archive experience is free. Physical keepsakes and other optional extras are available only if someone wants them. No purchase is required to preserve a story.",
      ariaLabel: "Start here with The Legacy Question. The Life Archive is free to use.",
      featured: true,
      position: { left: 41.1, top: 30.6, width: 18.4, height: 10.8 }
    },
    {
      title: "My Archives",
      href: myArchivesHref,
      description:
        "Manage your archives and access voice, photos, videos, journals, letters, songs, lessons, and memories.",
      ariaLabel: isSignedIn ? "Open My Archives" : "Sign in to open My Archives",
      position: { left: 41.1, top: 41.9, width: 18.4, height: 5.4 }
    },
    {
      title: "Create an Archive",
      href: "/create",
      description:
        "Create a private place for stories, memories, photographs, voice, video, letters, songs, lessons, and guidance.",
      ariaLabel: "Create an archive",
      position: { left: 41.1, top: 47.8, width: 18.4, height: 5.7 }
    },
    {
      title: "Time Capsules",
      href: timeCapsulesHref,
      description:
        "Write something today and schedule it to reach someone later.",
      ariaLabel: "Open Time Capsules",
      position: { left: 41.1, top: 53.9, width: 18.4, height: 5.8 }
    },
    {
      title: "Keepsakes",
      href: "/keepsakes",
      description:
        "Member Cards, Memorial Keychains, Memorial Cards, QR Plaques, and Storykeeper Cards can become a doorway back into an archive or memorial.",
      ariaLabel: "Visit Keepsakes",
      position: { left: 41.1, top: 60.1, width: 18.4, height: 5.9 }
    },
    {
      title: "Member Card",
      href: "/member-card",
      description:
        "A physical connection to your archive that can help loved ones find it later.",
      ariaLabel: "Open Member Card",
      position: { left: 41.1, top: 66.4, width: 18.4, height: 5.4 }
    },
    {
      title: "Support After A Loss",
      href: "/after-a-loss",
      description:
        "A calm guide for the first hours, the next necessary decisions, children, practical details, grief care, and crisis resources.",
      ariaLabel: "Get support after a loss",
      position: { left: 41.1, top: 72.1, width: 18.4, height: 5.3 }
    },
    {
      title: "How It Works",
      href: "#how-it-works",
      description:
        "Create an archive, preserve memories, connect a QR code if desired, and let loved ones return whenever they need it.",
      ariaLabel: "Read how The Life Archive works",
      position: { left: 41.1, top: 77.8, width: 8.9, height: 6.8 }
    },
    {
      title: "Help, Privacy, And Information",
      href: "#information",
      description:
        "Find help, privacy, terms, FAQ, contact, and the main public pages.",
      ariaLabel: "Open help privacy and information links",
      position: { left: 50.5, top: 77.8, width: 9.0, height: 6.8 }
    }
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#070605] text-archive-ivory">
      <GrandHallHero
        entries={directoryEntries}
        myArchivesHref={myArchivesHref}
        timeCapsulesHref={timeCapsulesHref}
      />
      <BelowDirectoryContent timeCapsulesHref={timeCapsulesHref} />
      <GrandHallFooter
        myArchivesHref={myArchivesHref}
        timeCapsulesHref={timeCapsulesHref}
      />
    </main>
  );
}

function GrandHallHero({
  entries,
  myArchivesHref,
  timeCapsulesHref
}: {
  entries: DirectoryEntry[];
  myArchivesHref: string;
  timeCapsulesHref: string;
}) {
  const desktopEntries: DesktopDirectoryEntry[] = [
    {
      title: "The Legacy Question",
      subtitle: "Leave words that matter.",
      href: "/legacy-question",
      ariaLabel: "Start with The Legacy Question. Leave words that matter.",
      featured: true
    },
    {
      title: "My Archives",
      subtitle: "Manage your archives.",
      href: myArchivesHref,
      ariaLabel: "Open My Archives. Manage your archives."
    },
    {
      title: "Create an Archive",
      subtitle: "Begin a new life story.",
      href: "/create",
      ariaLabel: "Create an Archive. Begin a new life story."
    },
    {
      title: "Time Capsules",
      subtitle: "Send memories into the future.",
      href: timeCapsulesHref,
      ariaLabel: "Open Time Capsules. Send memories into the future."
    },
    {
      title: "Keepsakes",
      subtitle: "Keep their story close.",
      href: "/keepsakes",
      ariaLabel: "Visit Keepsakes. Keep their story close."
    },
    {
      title: "Support After a Loss",
      subtitle: "Guidance when someone is gone.",
      href: "/after-a-loss",
      ariaLabel: "Open Support After a Loss. Guidance when someone is gone."
    },
    {
      title: "Help, Privacy & Information",
      subtitle: "Help, privacy and support.",
      href: "#information",
      ariaLabel: "Open Help, Privacy and Information. Help, privacy and support."
    }
  ];

  const mobileEntries: DesktopDirectoryEntry[] = [
    {
      title: "The Legacy Question",
      subtitle: "Leave words that matter.",
      href: "/legacy-question",
      ariaLabel: "Start with The Legacy Question.",
      featured: true
    },
    {
      title: "My Archives",
      subtitle: "Return to your stories.",
      href: myArchivesHref,
      ariaLabel: "Open My Archives."
    },
    {
      title: "Create an Archive",
      subtitle: "Begin a life story.",
      href: "/create",
      ariaLabel: "Create an Archive."
    },
    {
      title: "Time Capsules",
      subtitle: "Send words into the future.",
      href: timeCapsulesHref,
      ariaLabel: "Open Time Capsules."
    },
    {
      title: "Keepsakes",
      subtitle: "Keep their story close.",
      href: "/keepsakes",
      ariaLabel: "Visit Keepsakes."
    },
    {
      title: "Member Card",
      subtitle: "Carry your archive with you.",
      href: "/member-card",
      ariaLabel: "Open Member Card."
    },
    {
      title: "Support After a Loss",
      subtitle: "Guidance when someone is gone.",
      href: "/after-a-loss",
      ariaLabel: "Open Support After a Loss."
    },
    {
      title: "Help & Information",
      subtitle: "Privacy, answers and support.",
      href: "#information",
      ariaLabel: "Open Help and Information."
    }
  ];

  return (
    <header className="relative overflow-hidden bg-black px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.48),rgba(0,0,0,0.06)_34%,rgba(7,6,5,0.86)_94%)]"
      />

      <section className="relative z-10 mx-auto w-full max-w-[1280px]">
        <div className="hidden md:block">
          <div className="relative mx-auto aspect-[1672/941] w-full overflow-hidden shadow-[0_40px_140px_rgba(0,0,0,0.74)]">
            <GrandHallArrival
              title="The Life Archive"
              subtitle="Every life has a story worth preserving."
            />

            <Image
              src={grandHallDirectoryImage}
              alt="The Life Archive Grand Hall with a blank central directory board"
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(237,190,98,0.1),transparent_26%),linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.14))]"
            />
            <div
              className="absolute flex min-w-0 flex-col overflow-hidden px-[0.55%] py-[0.62%]"
              style={{
                left: `${desktopDirectoryRegion.left}%`,
                top: `${desktopDirectoryRegion.top}%`,
                width: `${desktopDirectoryRegion.width}%`,
                height: `${desktopDirectoryRegion.height}%`
              }}
            >
              {desktopEntries.map((entry, index) => (
                <DesktopDirectoryRow
                  entry={entry}
                  index={index}
                  isLast={index === desktopEntries.length - 1}
                  key={entry.title}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="mobile-home-directory relative mx-auto w-full max-w-[430px] overflow-hidden bg-black">
            <div className="mobile-directory-scene relative aspect-[858/1844] w-full">
              <Image
                src="/images/archive-building/mobile/mobile-directory.png"
                alt="The Life Archive Grand Hall directory"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),transparent_22%,transparent_82%,rgba(0,0,0,0.38))]"
              />

              <nav
                aria-label="The Life Archive directory"
                className="mobile-directory-interface absolute left-[20.1%] top-[26.3%] flex h-[53.1%] w-[57.8%] flex-col"
              >
                {mobileEntries.map((entry, index) => (
                  <Link
                    href={entry.href}
                    aria-label={entry.ariaLabel}
                    className={`mobile-directory-row group relative flex min-h-0 flex-1 flex-col justify-center px-[7%] text-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-archive-gold/80 ${
                      entry.featured
                        ? "bg-archive-gold/[0.055]"
                        : "hover:bg-archive-gold/[0.045]"
                    }`}
                    style={{ animationDelay: `${7600 + index * 700}ms` }}
                    key={entry.title}
                  >
                    {entry.featured ? (
                      <span className="mb-0.5 text-[0.48rem] font-bold uppercase tracking-[0.18em] text-archive-gold">
                        Start here
                      </span>
                    ) : null}

                    <span className="font-serif text-[clamp(0.68rem,3vw,0.9rem)] uppercase leading-tight tracking-[0.055em] text-archive-ivory drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      {entry.title}
                    </span>

                    <span className="mt-0.5 line-clamp-1 text-[clamp(0.42rem,1.85vw,0.56rem)] leading-tight text-archive-ivory/64">
                      {entry.subtitle}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="mobile-directory-intro pointer-events-none absolute inset-0 z-30 flex items-start justify-center bg-black pt-[12svh]">
                <div className="px-8 text-center">
                  <div className="mobile-directory-crest relative mx-auto mb-5 h-24 w-32">
                    <Image
                      src="/images/site-design/tree-logo-master.png"
                      alt="The Life Archive tree growing from an open book"
                      fill
                      priority
                      sizes="128px"
                      className="object-contain drop-shadow-[0_0_28px_rgba(202,164,92,0.28)]"
                    />
                  </div>

                  <h1 className="mobile-directory-title font-serif text-[clamp(1.9rem,9vw,3rem)] uppercase tracking-[0.09em] text-archive-ivory">
                    The Life Archive
                  </h1>

                  <p className="mobile-directory-subtitle mx-auto mt-5 max-w-[18rem] text-xs uppercase leading-6 tracking-[0.18em] text-archive-gold/90">
                    Every life has a story worth preserving
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}

function DesktopDirectoryRow({
  entry,
  index,
  isLast
}: {
  entry: DesktopDirectoryEntry;
  index: number;
  isLast: boolean;
}) {
  return (
    <div
      className="desktop-directory-row relative flex min-h-0 flex-1"
      style={{ animationDelay: `${4300 + index * 420}ms` }}
    >
      <Link
        href={entry.href}
        aria-label={entry.ariaLabel}
        className={`group flex min-h-0 w-full flex-col justify-center overflow-hidden px-[4.5%] py-[1.6%] text-center transition duration-300 focus:outline-none focus:ring-2 focus:ring-archive-gold/75 ${
          entry.featured
            ? "bg-archive-gold/[0.07] shadow-[0_0_28px_rgba(202,164,92,0.16)] hover:bg-archive-gold/[0.12]"
            : "hover:bg-archive-gold/[0.055]"
        }`}
      >
        {entry.featured ? (
          <span className="mb-[1.5%] text-[clamp(0.42rem,0.5vw,0.58rem)] font-bold uppercase tracking-[0.16em] text-archive-gold">
            Start here
          </span>
        ) : null}
        <span className="block truncate font-serif text-[clamp(0.56rem,0.78vw,0.94rem)] uppercase tracking-[0.08em] text-archive-ivory drop-shadow-[0_2px_8px_rgba(0,0,0,0.92)]">
          {entry.title}
        </span>
        <span className="mx-auto mt-[1.7%] line-clamp-2 max-w-full text-[clamp(0.42rem,0.52vw,0.62rem)] leading-snug text-archive-ivory/68">
          {entry.subtitle}
        </span>
      </Link>
      {!isLast ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[86%] -translate-x-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(202, 164, 92, 0.55), transparent)"
          }}
        />
      ) : null}
    </div>
  );
}

function MobileDirectoryLink({ entry }: { entry: DirectoryEntry }) {
  return (
    <Link
      href={entry.href}
      aria-label={entry.ariaLabel}
      className={`block border px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition focus:outline-none focus:ring-4 focus:ring-archive-gold/35 ${
        entry.featured
          ? "border-archive-gold/58 bg-archive-gold/[0.12]"
          : "border-archive-gold/18 bg-black/38 hover:border-archive-gold/45"
      }`}
    >
      {entry.label ? (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">
          {entry.label}
        </p>
      ) : null}
      <h2 className="mt-1 font-serif text-xl uppercase tracking-[0.08em] text-archive-ivory">
        {entry.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-archive-ivory/72">
        {entry.description}
      </p>
      {entry.note ? (
        <p className="mt-3 text-xs font-semibold leading-5 text-archive-champagne/82">
          {entry.note}
        </p>
      ) : null}
    </Link>
  );
}

function BelowDirectoryContent({ timeCapsulesHref }: { timeCapsulesHref: string }) {
  return (
    <>
      <section className="bg-[#0b0907] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1180px] gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <Eyebrow>What is The Life Archive?</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
              A private archive for the voice, memory, and guidance a person
              leaves behind.
            </h2>
          </div>
          <div className="grid gap-6 text-base leading-8 text-archive-ivory/72 sm:text-lg">
            <p>
              The Life Archive is a place to preserve stories, photos, videos,
              voice notes, journals, letters, songs, lessons, and memories. It
              can be built for yourself, for someone you love, or in honor of a
              life that has ended.
            </p>
            <p>
              The core archive experience is free to use. Optional physical
              keepsakes are available when someone wants a card, keychain,
              plaque, or other object that opens the archive by QR code.
            </p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="bg-[#120f0b] px-5 py-16 text-archive-ivory sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="max-w-3xl">
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              Four steps. No pressure.
            </h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden border border-archive-gold/16 bg-archive-gold/16 md:grid-cols-4">
            {[
              [
                "1",
                "Create an archive",
                "Start a private place for a life, a family, or a chapter worth preserving."
              ],
              [
                "2",
                "Preserve memories",
                "Add stories, photos, videos, voice, letters, songs, lessons, or guidance."
              ],
              [
                "3",
                "Connect a QR code",
                "Use the archive QR code on a keepsake, card, frame, marker, or plaque if desired."
              ],
              [
                "4",
                "Return when needed",
                "Let the people you love revisit the archive whenever they need to feel close."
              ]
            ].map(([number, title, copy]) => (
              <article key={title} className="bg-[#120f0b] p-6">
                <p className="font-mono text-xs font-bold text-archive-gold">
                  {number}
                </p>
                <h3 className="mt-4 font-serif text-2xl text-archive-champagne">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-archive-ivory/68">
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-archive-paper px-5 py-16 text-archive-ink sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 md:grid-cols-2">
          <InfoPanel
            title="What can be preserved"
            copy="Voice, photographs, videos, written memories, letters, journals, songs, lessons, favorite moments, practical guidance, and the small details that make someone feel present."
          />
          <InfoPanel
            title="Why the core experience is free"
            copy="Preserving a story should not require a purchase. Keepsakes are optional physical doorways into an archive, not a condition for saving memories."
          />
          <InfoPanel
            title="How QR access works"
            copy="Every archive can have a QR code. A scan can lead someone back to the archive, a memory, or a keepsake-connected experience controlled by the archive owner."
          />
          <InfoPanel
            title="Time Capsules"
            copy="Time Capsules let someone prepare a preserved message today and schedule it to reach another person later through the existing archive dashboard."
            href={timeCapsulesHref}
            linkText="Open Time Capsules"
          />
          <InfoPanel
            title="Optional keepsakes"
            copy="Member Cards, Memorial Keychains, Memorial Cards, QR Plaques, and Storykeeper Cards can make an archive easier to find in the physical world."
            href="/keepsakes"
            linkText="Visit the Keepsake Store"
          />
          <InfoPanel
            title="Privacy and trust"
            copy="Archives are built around consent, privacy choices, and family control. Nothing needs to be public unless the archive owner chooses to share it."
            href="/privacy"
            linkText="Read Privacy"
          />
        </div>
      </section>

      <section className="bg-[#0b0907] px-5 py-16 text-archive-ivory sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1180px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Eyebrow>Support After A Loss</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              Start with the next necessary thing.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-archive-ivory/72">
              Grief can make ordinary decisions feel impossible. The after-loss
              guide is there for the first hours, the first calls, children,
              practical documents, self-care, and knowing when professional help
              may be needed.
            </p>
            <div className="mt-6">
              <SecondaryCta href="/after-a-loss">I Need Help After A Loss</SecondaryCta>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#0b0907,#050403)] px-5 py-20 text-center text-archive-ivory sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
            Some stories deserve somewhere to go.
          </h2>
          <p className="mt-5 text-base leading-8 text-archive-ivory/68 sm:text-lg">
            Begin with a full archive, one question, or a guide for the moment
            you are in.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryCta href="/create">Create an Archive</PrimaryCta>
            <SecondaryCta href="/legacy-question">Answer the Legacy Question</SecondaryCta>
            <SecondaryCta href="/after-a-loss">I Need Help After A Loss</SecondaryCta>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoPanel({
  title,
  copy,
  href,
  linkText
}: {
  title: string;
  copy: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <article className="border-l border-archive-gold/34 bg-[#f4ead8]/55 p-6">
      <h3 className="font-serif text-3xl leading-tight text-archive-obsidian">
        {title}
      </h3>
      <p className="mt-4 text-base leading-8 text-archive-ink/74">
        {copy}
      </p>
      {href && linkText ? (
        <Link
          href={href}
          className="mt-5 inline-flex font-semibold text-archive-obsidian underline decoration-archive-gold/55 underline-offset-4 hover:text-[#7c5721] focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
        >
          {linkText}
        </Link>
      ) : null}
    </article>
  );
}

function GrandHallFooter({
  myArchivesHref,
  timeCapsulesHref
}: {
  myArchivesHref: string;
  timeCapsulesHref: string;
}) {
  const footerGroups = [
    {
      title: "Begin",
      links: [
        ["Legacy Question", "/legacy-question"],
        ["Create an Archive", "/create"],
        ["My Archives", myArchivesHref],
        ["Time Capsules", timeCapsulesHref]
      ]
    },
    {
      title: "Keepsakes",
      links: [
        ["Keepsake Store", "/keepsakes"],
        ["Member Card", "/member-card"],
        ["Storykeeper Products", "/storykeeper-products"]
      ]
    },
    {
      title: "Guides",
      links: [
        ["Support After A Loss", "/after-a-loss"],
        ["Help for Families", "/help-for-families"],
        ["Build Your Legacy", "/build-your-legacy"],
        ["Preserve Their Voice", "/preserve-their-voice"],
        ["How It Works", "#how-it-works"]
      ]
    },
    {
      title: "Partners",
      links: [
        ["Funeral Homes", "/partners/funeral-homes"],
        ["Cemeteries & Parks", "/partners/cemeteries"],
        ["Monument Builders", "/partners/monuments"],
        ["Hospice Care Providers", "/partners/hospice"],
        ["Estate Planners", "/partners/estate-planners"]
      ]
    },
    {
      title: "Information",
      links: [
        ["FAQ", "/faq"],
        ["Privacy", "/privacy"],
        ["Terms", "/terms"],
        ["Contact", `mailto:${publicSupportEmail}`]
      ]
    }
  ];

  return (
    <footer
      id="information"
      className="border-t border-archive-gold/14 bg-[#060504] px-5 py-12 text-archive-ivory sm:px-8 lg:px-10"
    >
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 lg:grid-cols-[1.1fr_2fr]">
        <div>
          <SiteLogo width={260} height={70} />
          <p className="mt-5 max-w-sm text-sm leading-7 text-archive-ivory/58">
            The Life Archive is a quiet place to preserve words, memories, and
            the physical doorways that help loved ones find them again.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-archive-gold">
                {group.title}
              </h2>
              <ul className="mt-4 grid gap-3 text-sm text-archive-ivory/64">
                {group.links.map(([label, href]) => (
                  <li key={`${group.title}-${label}`}>
                    <Link
                      className="hover:text-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
                      href={href}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-[1180px] flex-col gap-3 border-t border-archive-gold/12 pt-6 text-xs text-archive-ivory/46 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 The Life Archive. All rights reserved.</p>
        <p>Questions can be sent to {publicSupportEmail}.</p>
      </div>
    </footer>
  );
}
