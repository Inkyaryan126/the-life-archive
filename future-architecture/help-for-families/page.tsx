import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";

export const dynamic = "force-dynamic";

const resourceSections = [
  {
    title: "What To Do When Someone Passes Away",
    description: "An immediate, compassionate roadmap for the first 24 to 72 hours. Navigate legal requirements, notifications, and immediate care decisions with quiet confidence.",
    details: "Includes: Pronouncement of death, arranging shelter, contacting close relatives, and understanding initial legal responsibilities."
  },
  {
    title: "Funeral Planning Checklist",
    description: "A comprehensive checklist to organize a thoughtful tribute. Demystify the funeral home process, choices between burial or cremation, and coordinate logistics without stress.",
    details: "Includes: Choosing direct caretakers, organizing ceremonial components, arranging floral tributes, and managing catering."
  },
  {
    title: "Memory Collection Guide",
    description: "How to gather photos, written letters, shared memories, and stories from family members and friends to build a rich historical record.",
    details: "Includes: Outreaching to old friends, compiling scanning circles, establishing shared online folders, and setting up digital vaults."
  },
  {
    title: "Preserving a Loved One's Voice",
    description: "Practical steps to retrieve or record a loved one's spoken words from voicemail logs, old videos, cassette tapes, or conversational interviews.",
    details: "Includes: Converting analogue cassettes, backing up cellular voicemails, extraction of audio from home videos, and conversational prompts."
  },
  {
    title: "Fundraising & Community Support",
    description: "How to gracefully coordinate community-led support, direct contributions, meals, or legacy endowments in memory of your loved one.",
    details: "Includes: Creating memorial funds, food trains, cooperative scheduling, and coordinating honorary scholarship programs."
  },
  {
    title: "Legacy Administration",
    description: "Guidelines on managing digital accounts, notifying financial caretakers, shutting down old social channels, and transitioning estates safely.",
    details: "Includes: Closing social profiles, dealing with cellular contracts, alerting financial institutions, and archiving inbox records."
  }
];

export default function HelpForFamiliesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8">
      <DesignBackdrop />

      {/* Header */}
      <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between border-b border-archive-gold/20 pb-5">
        <Link href="/">
          <SiteLogo width={160} height={40} />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
          >
            Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-archive-gold/40 px-5 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/5"
          >
            Join Free
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl py-12 sm:py-16">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            PUBLIC SERVICE RESOURCE CENTER
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl text-archive-ivory">
            Help for Families
          </h1>
          <p className="mt-6 text-lg leading-8 text-archive-ivory/72 max-w-2xl mx-auto font-serif italic">
            Compassionate, practical resources to help you navigate loss, memorial planning, and the preservation of a lifetime.
          </p>
          <p className="mt-4 text-sm leading-7 text-archive-ivory/60 max-w-2xl mx-auto">
            When a loved one passes away, the details can feel overwhelming. We have compiled these quiet, structured, and practical resources to guide your family through this transition—ensuring that their physical legacy remains safe, and their story stays within reach.
          </p>
        </section>

        {/* Six Critical Resource Tracks */}
        <section className="mt-20">
          <div className="grid gap-6 md:grid-cols-2">
            {resourceSections.map((sec) => (
              <div
                key={sec.title}
                className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 sm:p-8 shadow-luxury flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-serif text-2xl text-archive-champagne mb-3">
                    {sec.title}
                  </h3>
                  <p className="text-sm leading-7 text-archive-ivory/70 mb-5">
                    {sec.description}
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4 bg-white/[0.01] -mx-6 -mb-6 p-6 sm:-mx-8 sm:-mb-8 sm:p-8 rounded-b-[2rem]">
                  <p className="text-xs leading-6 text-archive-gold font-medium italic">
                    {sec.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Storykeeper Card Callout inside Help for Families */}
        <section className="mt-24 rounded-[2rem] border border-archive-gold/22 bg-archive-obsidian p-8 sm:p-10 shadow-luxury text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold mb-3">
            A BEAUTIFUL MEMORIAL ASSET
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-archive-ivory mb-4">
            Distribute Storykeeper Cards to Attendees
          </h2>
          <p className="text-sm leading-7 text-archive-ivory/68 max-w-xl mx-auto mb-6">
            Help those who gather at a celebration of life or memorial service easily return to their stories. Print and place physical <strong className="text-archive-gold">Storykeeper Cards</strong> at the registry table, so family and friends can instantly scan, view memories, or listen to voice notes whenever they need to hear their presence.
          </p>
          <Link
            href="/storykeeper-products"
            className="inline-flex rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
          >
            Learn About Storykeeper Cards
          </Link>
        </section>
      </div>
    </main>
  );
}
