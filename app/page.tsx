import Image from "next/image";
import Link from "next/link";
import { DesignBackdrop, DesignImageButtonLink } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const chapters = [
  { label: "Photos", image: "/images/site-design/photos-button.jpg" },
  { label: "Videos", image: "/images/site-design/videos-button.jpg" },
  { label: "Voice Notes", image: "/images/site-design/voicenotes-button.jpg" },
  { label: "Journals", image: "/images/site-design/journals-button.jpg" },
  { label: "Life Lessons", image: "/images/site-design/lifelessons-button.jpg" },
  { label: "Songs", image: "/images/site-design/songs-button.jpg" }
];

const values = [
  { title: "Preserve", desc: "A secure digital vault for the stories, sounds, and images that define a life." },
  { title: "Share", desc: "Easily connect family and friends with meaningful access to cherished history." },
  { title: "Protect", desc: "Ensure that sensitive details and personal legacies are safe for future generations." },
  { title: "Honor", desc: "Create a dignified, lasting tribute that celebrates and remembers what mattered most." }
];

export default async function HomePage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn ? "Enter Dashboard" : "Begin an Archive";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory">
      <DesignBackdrop />
      
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <nav className="flex items-center justify-between border-b border-archive-gold/20 pb-5">
          <Link href="/" className="font-serif text-xl tracking-wide">
            The Life Archive
          </Link>
          <Link
            href={primaryHref}
            className="rounded-full border border-archive-gold/40 px-5 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/5"
          >
            {primaryLabel}
          </Link>
        </nav>

        <header className="py-20 text-center sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-archive-gold">
            Every Life Leaves a Story.
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-tight sm:text-7xl">
            The Life Archive
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-archive-ivory/70 sm:text-xl sm:leading-9">
            Preserve photos, journals, voice notes, lessons, songs, and memories for future generations.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
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
              View Example Archive
            </Link>
          </div>
        </header>

        <section className="mt-10 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-10">
          <h2 className="font-serif text-3xl sm:text-4xl">Memory Chapters</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {chapters.map((chapter) => (
              <DesignImageButtonLink
                key={chapter.label}
                href={primaryHref}
                label={`Explore ${chapter.label}`}
                className="mx-auto w-full max-w-[19rem]"
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

        <section className="mt-20 py-10">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-archive-gold/10 bg-white/[0.02] p-6">
                <h3 className="font-serif text-2xl text-archive-gold">{v.title}</h3>
                <p className="mt-3 text-sm leading-7 text-archive-ivory/60">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
