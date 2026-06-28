import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const resourceSections = [
  {
    idx: "1",
    title: "Immediate Guide: First 72 Hours",
    description: "An immediate, compassionate roadmap for the hours following loss. Navigate legal notifications, shelter arrangements, and initial notifications with absolute ease and quiet order.",
    details: "Includes: Pronouncement checklist, choosing a funeral director, and understanding immediate care decisions."
  },
  {
    idx: "2",
    title: "Tribute & Celebration Planning",
    description: "A thoughtful planning checklist to help you organize a genuine tribute. Coordinate service details, choose between burial or cremation, and design ceremonies that honor their specific character.",
    details: "Includes: Organizing musical soundtracks, selecting caretakers, arranging flowers, and drafting custom monograms."
  },
  {
    idx: "3",
    title: "Family Memory Gathering",
    description: "How to compile old photos, letters, and shared stories from friends and relatives scattered across the world without public exposure or social media noise.",
    details: "Includes: Creating private upload directories, arranging family story circles, and scanning hand-written letters."
  },
  {
    idx: "4",
    title: "Preserving Spoken Voice",
    description: "Practical steps to retrieve or record their authentic tone from cellular voicemail logs, old home video files, cassettes, or voice memos.",
    details: "Includes: Digitizing analogue media, downloading system voicemails, and isolating voice tracks from video archives."
  },
  {
    idx: "5",
    title: "Digital Legacy Administration",
    description: "Comforting guidelines to manage digital accounts, notify financial caretakers, transition assets, and handle online profiles with complete security.",
    details: "Includes: Transitioning legacy emails, closing social accounts, and securing digital credentials."
  },
  {
    idx: "6",
    title: "Community Meals & Memorial Funds",
    description: "Guidelines on gracefully coordinating community support, memorial funds, food trains, and scholarship endowments in honor of your loved one.",
    details: "Includes: Launching direct legacy funds, scheduling care schedules, and organizing honorary donations."
  }
];

const faqs = [
  {
    q: "How can we build an archive while actively grieving?",
    a: "We believe there should be absolutely no pressure. The Life Archive is built to be a silent sanctuary where families can move at their own pacing. Start with a single voice note, a favorite song, or a couple of photos, and expand the vault only when you feel ready."
  },
  {
    q: "Can we invite extended family members to help compile stories?",
    a: "Yes. You have granular control. From your dashboard, you can securely invite close relatives and friends to upload their own voice greetings, letters, and photographs directly to the archive without exposing files to public feeds."
  },
  {
    q: "How do we link the archive to a physical monument or card?",
    a: "Every Life Archive includes a free, unique QR code. Once you are ready, you can order a custom-milled weatherproof bronze plaque for headstones, columbaria, or keychains, linking touch and digital memory permanently."
  }
];

export default async function HelpForFamiliesPage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn ? "Enter My Archives" : "Begin Your Archive";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory flex flex-col justify-between">
      <DesignBackdrop />

      <div className="relative z-10 flex flex-col flex-grow">
        {/* Navigation Bar with Glass Blur */}
        <nav className="sticky top-0 z-50 mx-auto w-full border-b border-archive-gold/10 bg-archive-obsidian/45 backdrop-blur-md px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="transition opacity-90 hover:opacity-100">
              <SiteLogo width={420} height={120} />
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
                className="rounded-full border border-archive-gold/40 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/5"
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO: Warm, left-aligned, spacious text block */}
        <header className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32 grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-archive-gold/90">
              COMPASSIONATE AFTERCARE RESOURCES
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold/90">
              Help for Families
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-archive-ivory/60">
              When a loved one passes away, the details can feel overwhelming. We compiled these quiet, structured, and practical resources to guide your family through bereavement with care and order—ensuring that their physical legacy remains safe, and their story stays close.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={primaryHref}
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-archive-gold/10 bg-white/[0.01] p-8 text-center">
            <p className="font-serif text-xl italic text-archive-champagne">
              &ldquo;Our stories stay within reach, even when we must let go.&rdquo;
            </p>
          </div>
        </header>

        {/* Emotional Introduction Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 border-t border-archive-gold/15">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              THE QUIET RETREAT
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              Navigating Bereavement with Absolute Dignity
            </h2>
            <p className="mt-6 text-sm leading-7 text-archive-ivory/70">
              In the days following a loss, the world seems to spin rapidly around tasks, paperwork, and legal signatures. Amidst the logistics, we can lose the quiet space required to hold onto who they were—their advice, their voice, their signature values. We believe that organizing memories should be a comforting, therapeutic process of preservation.
            </p>
          </div>
        </section>

        {/* GUIDED CHECKLIST: Vertical thread checklist instead of boxes */}
        <section id="resources" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              RESOURCE CHANNELS
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              The Six Pillars of Family Care
            </h2>
            <p className="mt-3 text-sm text-archive-ivory/55">
              Practical guides compiled to help your family find direction, order, and comfort.
            </p>
          </div>

          <div className="relative border-l-2 border-archive-gold/20 max-w-4xl mx-auto pl-8 sm:pl-12 grid gap-12">
            {resourceSections.map((sec) => (
              <div
                key={sec.title}
                className="group relative transition-all duration-300"
              >
                {/* Number node with solid background thread */}
                <div className="absolute -left-[41px] sm:-left-[57px] top-0 w-8 h-8 rounded-full border-2 border-archive-gold/40 bg-archive-obsidian flex items-center justify-center font-mono text-[10px] font-bold text-archive-gold group-hover:bg-archive-gold group-hover:text-archive-obsidian transition-all duration-300">
                  {sec.idx}
                </div>
                
                <div className="rounded-2xl border border-archive-gold/10 bg-white/[0.01] p-6 hover:border-archive-gold/30 hover:bg-white/[0.02] transition-colors duration-200">
                  <h3 className="font-serif text-2xl text-archive-champagne mb-3 group-hover:text-archive-gold transition-colors duration-300">
                    {sec.title}
                  </h3>
                  <p className="text-sm leading-7 text-archive-ivory/70 mb-4">
                    {sec.description}
                  </p>
                  <p className="text-xs text-archive-gold/75 italic border-t border-white/5 pt-3 font-serif">
                    {sec.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Storykeeper Card Callout inside Help for Families */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="rounded-[2.5rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.02] to-transparent p-8 sm:p-12 shadow-luxury text-center max-w-3xl mx-auto relative overflow-hidden backdrop-blur-[2px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-archive-gold/5 blur-3xl rounded-full" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold mb-3">
              A PHYSICAL KEY FOR GUESTS
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-archive-ivory mb-4">
              Distribute Storykeeper Cards to Attendees
            </h2>
            <p className="text-sm leading-7 text-archive-ivory/68 max-w-xl mx-auto mb-6">
              Help those who gather at a celebration of life return to their stories. Placing physical <strong className="text-archive-gold">Storykeeper Cards</strong> at the registry table allows friends and family to instantly scan, listen to voice memories, or leave their own visitor letters whenever they need comfort.
            </p>
            <Link
              href="/keepsakes"
              className="inline-flex rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
            >
              Learn About Storykeeper Cards
            </Link>
          </div>
        </section>

        {/* Frequently Asked Questions Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                GRIEF SUPPORT
              </p>
              <h2 className="mt-4 font-serif text-3xl text-archive-ivory leading-tight">
                Frequently Asked Inquiries
              </h2>
              <p className="mt-4 text-xs text-archive-ivory/55 leading-relaxed">
                If you have further questions or need direct guidance, our support team is always available to assist.
              </p>
            </div>
            <div className="grid gap-8">
              {faqs.map((faq) => (
                <div key={faq.q} className="border-b border-archive-gold/10 pb-6">
                  <h3 className="font-serif text-lg text-archive-champagne mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-xs leading-6 text-archive-ivory/60">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Call to Action Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              Begin Organizing Their Living Heritage
            </h2>
            <p className="mt-4 text-sm leading-6 text-archive-ivory/55">
              You do not have to finish everything in one sitting. Start with a single photograph or voicemail greeting, and build their story over time.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={primaryHref}
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
              >
                {primaryLabel}
              </Link>
              <Link
                href="/build-your-legacy"
                className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/[0.08]"
              >
                Explore Legacy Pillars
              </Link>
            </div>
          </div>
        </section>

        {/* Editorial Legacy Footer */}
        <footer className="relative z-10 border-t border-archive-gold/20 bg-archive-obsidian/40 backdrop-blur-md mt-auto py-16 text-xs text-archive-ivory/60">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 grid gap-8 md:grid-cols-4">
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
