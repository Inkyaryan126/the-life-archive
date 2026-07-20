import type { Metadata } from "next";
import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileArchiveHeader } from "@/components/archive-building/MobileArchiveHeader";
import {
  exampleArchivePath,
  lastUpdatedDate,
  publicSupportEmail
} from "@/lib/site-config";

export const metadata: Metadata = {
  title: "FAQ | The Life Archive",
  description:
    "Answers about Life Archives, QR codes, privacy, Legacy Activation, keepsakes, pricing, and support."
};

const faqs = [
  {
    q: "What is a Life Archive?",
    a: "A Life Archive is a private digital home for a person's stories, photos, lessons, songs, voice notes, and memories. It can be connected to a QR code so family can return to the archive from a card, keychain, plaque, or other keepsake."
  },
  {
    q: "Is creating an archive free?",
    a: "Creating a Life Archive is currently free. Optional physical keepsakes are purchased separately."
  },
  {
    q: "Who can view an archive?",
    a: "Private archives are for the owner and authorized members. Public archives can be viewed by anyone with the link or QR code."
  },
  {
    q: "What is the difference between a living archive and a memorial archive?",
    a: "A living archive is built while life is still being lived and can continue growing. A Living Archive can also become your Continuity Archive—a record of who you were, who you are, and who you are becoming across decades. A memorial archive is preserved in remembrance after Legacy Activation."
  },
  {
    q: "What happens when the Legacy Activation Code is used?",
    a: "The activation flow verifies the code and relationship details, then transitions the archive into memorial mode when accepted. That protects the archive from being treated like an ordinary editable profile."
  },
  {
    q: "Does the same QR code continue working after memorial activation?",
    a: "Yes. The archive slug and QR path stay connected to the archive, so the same QR code can continue opening the memorial experience after activation."
  },
  {
    q: "Can family members contribute memories?",
    a: "Archive owners and authorized editors can add memories. Public visitors can view public archives, and memorial archives may allow tributes through the guestbook experience."
  },
  {
    q: "Can I add photos, writing, audio, and video?",
    a: "Archive chapters support writing, photos, songs, and uploaded voice files. The Legacy Question starter flow can save written answers and voice memories; video recording is not available for starter archives yet."
  },
  {
    q: "Can I edit or delete my archive?",
    a: "Archive owners can edit archive details and add memories from their signed-in archive pages. Deletion support can be requested through support while the self-service deletion experience is still being finished."
  },
  {
    q: "Can I export my memories?",
    a: "A built-in export tool is not currently available in the inspected production routes. Contact support if you need help retrieving archive content."
  },
  {
    q: "What happens if pricing changes?",
    a: "If archive pricing changes in the future, members will be notified clearly before any change affects them. You retain ownership of the memories and content you add."
  },
  {
    q: "How do physical keepsakes work?",
    a: "Choose a keepsake, connect it to an archive, complete secure Stripe Checkout, then confirm personalization details before production."
  },
  {
    q: "What happens before a custom item is engraved?",
    a: "The archive and personalization are confirmed, a proof is prepared when needed, and customer approval happens before production."
  },
  {
    q: "How do I contact support?",
    a: `Email ${publicSupportEmail}.`
  }
];

export default function FaqPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
        <MobileArchiveHeader active="faq" />
        <nav className="hidden items-center justify-between border-b border-archive-gold/14 pb-5 pt-4 lg:flex">
          <Link href="/">
            <SiteLogo width={220} height={54} />
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold text-archive-ivory/70">
            <Link className="hover:text-archive-gold" href="/">
              Grand Hall
            </Link>
            <Link className="hover:text-archive-gold" href="/create">
              Create Archive
            </Link>
          </div>
        </nav>

        <header className="py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
            Frequently Asked Questions
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
            Questions before you begin.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-archive-ivory/70 sm:text-lg">
            Last updated {lastUpdatedDate}. These answers reflect the current product behavior.
          </p>
        </header>

        <section className="mb-16 grid gap-4">
          {faqs.map((faq) => (
            <article
              className="rounded-2xl border border-archive-gold/16 bg-white/[0.035] p-6 shadow-luxury"
              key={faq.q}
            >
              <h2 className="font-serif text-2xl text-archive-champagne">
                {faq.q}
              </h2>
              <p className="mt-3 text-base leading-8 text-archive-ivory/72">
                {faq.a}
              </p>
            </article>
          ))}
        </section>
      </div>

      <SiteFooter className="mt-10" />
    </main>
  );
}
