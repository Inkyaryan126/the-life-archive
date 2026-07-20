import type { Metadata } from "next";
import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileArchiveHeader } from "@/components/archive-building/MobileArchiveHeader";
import { lastUpdatedDate, publicSupportEmail } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms | The Life Archive",
  description:
    "Terms for using The Life Archive, creating archives, uploading memories, and ordering personalized keepsakes."
};

const sections = [
  {
    title: "Eligibility and account responsibility",
    body:
      "You are responsible for the information you provide, the security of your account, and the activity that happens through your account. Use the platform only if you can follow these terms."
  },
  {
    title: "Your content",
    body:
      "You retain ownership of uploaded memories and archive content. By adding content, you give The Life Archive permission to host, store, display, transmit, and back up that content so the archive and related QR experiences can operate."
  },
  {
    title: "Rights and sensitive uploads",
    body:
      "Only upload content you have the right to share. If you create an archive for someone else, including someone who has died, you are responsible for respecting family rights, privacy, permissions, and applicable laws."
  },
  {
    title: "Prohibited content",
    body:
      "Do not upload illegal, abusive, exploitative, infringing, deceptive, or harmful content. The Life Archive may remove content or suspend access when needed to protect people, comply with law, or operate the service."
  },
  {
    title: "Public and private archives",
    body:
      "Private archives are intended for owners and authorized members. Public archives can be viewed by anyone with the link or QR code. You are responsible for choosing the appropriate visibility for the content you add."
  },
  {
    title: "Physical keepsake orders",
    body:
      "Physical keepsakes are optional purchases. Personalized goods may require archive confirmation, personalization review, proofing, customer approval, production, and shipping or pickup coordination."
  },
  {
    title: "Custom engraving and proofs",
    body:
      "For custom or personalized items, production may wait until names, dates, QR placement, material direction, and proof details are approved. Delays can occur when approval or missing details are needed."
  },
  {
    title: "Refunds and cancellations",
    body:
      "Because personalized goods can be prepared for a specific archive or person, refunds and cancellations may be limited once proofing, engraving, printing, or production begins."
  },
  {
    title: "Availability and preservation limits",
    body:
      "The Life Archive is built for long-term preservation, but no online service can guarantee permanent hosting, uninterrupted access, or error-free operation."
  },
  {
    title: "Liability limitations",
    body:
      "The platform is provided without a promise that it will meet every need or remain available at all times. To the extent permitted by law, The Life Archive is not responsible for indirect, incidental, or consequential damages."
  },
  {
    title: "Changes to these terms",
    body:
      "These terms may change as the product, providers, and requirements evolve. Updates will be posted on this page with a new last updated date."
  }
];

export default function TermsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
        <MobileArchiveHeader active="terms" />
        <nav className="hidden items-center justify-between border-b border-archive-gold/14 pb-5 pt-4 lg:flex">
          <Link href="/">
            <SiteLogo width={220} height={54} />
          </Link>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-archive-ivory/72">
            <Link className="hover:text-archive-gold" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-archive-gold" href="/faq">
              FAQ
            </Link>
            <Link className="hover:text-archive-gold" href="/create">
              Create Archive
            </Link>
          </div>
        </nav>

        <header className="py-14 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-archive-gold">
            Terms
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
            Terms of Use
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-archive-ivory/70 sm:text-lg">
            Last updated {lastUpdatedDate}. General platform terms for The Life Archive.
          </p>
        </header>

        <section className="mb-16 grid gap-4">
          {sections.map((section) => (
            <article
              className="rounded-2xl border border-archive-gold/16 bg-white/[0.035] p-6 shadow-luxury"
              key={section.title}
            >
              <h2 className="font-serif text-2xl text-archive-champagne">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-8 text-archive-ivory/72">
                {section.body}
              </p>
            </article>
          ))}
        </section>
      </div>

      <SiteFooter className="mt-10" />
    </main>
  );
}
