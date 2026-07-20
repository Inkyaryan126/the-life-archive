import type { Metadata } from "next";
import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileArchiveHeader } from "@/components/archive-building/MobileArchiveHeader";
import { lastUpdatedDate, publicSupportEmail } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy | The Life Archive",
  description:
    "How The Life Archive handles archive content, account information, payment processing, and privacy choices."
};

const sections = [
  {
    title: "Information we collect",
    body:
      "The Life Archive collects the information needed to create and operate archives, including account and email information, archive names, profile details, written memories, photos, audio, messages, QR activity, and basic technical information such as browser or referral details."
  },
  {
    title: "Archive content",
    body:
      "User-created archive content can include photos, audio, written memories, songs, messages, Legacy Question submissions, and memorial notes. You are responsible for adding content you have the right to share."
  },
  {
    title: "Payments",
    body:
      "Keepsake payments are processed through Stripe. The Life Archive does not store full card numbers. Stripe may collect and process payment details, billing details, and fraud-prevention information according to its own policies."
  },
  {
    title: "Analytics and visit tracking",
    body:
      "The platform may record basic archive visits, QR scans, and technical events so the service can operate, detect issues, and understand which product flows are working."
  },
  {
    title: "How information is used",
    body:
      "Information is used to create archives, preserve memories, deliver claim links and account emails, connect keepsake orders to archives, provide support, protect the service, and improve the product."
  },
  {
    title: "Who can access an archive",
    body:
      "Private archives are intended for the archive owner and authorized members. Public archives can be viewed by anyone with the link or QR code. Archive owners are responsible for choosing the right visibility for sensitive content."
  },
  {
    title: "Ownership and control",
    body:
      "You retain ownership of the memories and content you upload. The Life Archive needs permission to host, display, store, back up, and transmit that content so the archive can work."
  },
  {
    title: "Deletion requests",
    body:
      `You can request deletion or support with archive content by emailing ${publicSupportEmail}. Some records may need to be retained for security, order history, legal compliance, or backup integrity.`
  },
  {
    title: "Retention",
    body:
      "Archive content is retained while an account or archive remains active, unless deletion is requested and the request can be honored. Operational logs, order records, and backups may remain for a limited period."
  },
  {
    title: "Service providers",
    body:
      "The Life Archive uses service providers such as Supabase for database, authentication, and storage; Stripe for payments; Resend for email; and Vercel for hosting and deployment."
  },
  {
    title: "Children's information",
    body:
      "The Life Archive is not intended for children to create accounts without appropriate permission. If you believe a child provided personal information without consent, contact support."
  },
  {
    title: "Security limitations",
    body:
      "The platform uses reasonable technical safeguards, but no online service can guarantee absolute security, permanent availability, or uninterrupted access."
  },
  {
    title: "Policy updates",
    body:
      "This policy may change as the product, providers, and legal requirements evolve. Updates will be posted on this page with a new last updated date."
  }
];

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
        <MobileArchiveHeader active="privacy" />
        <nav className="hidden items-center justify-between border-b border-archive-gold/14 pb-5 pt-4 lg:flex">
          <Link href="/">
            <SiteLogo width={220} height={54} />
          </Link>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-archive-ivory/72">
            <Link className="hover:text-archive-gold" href="/terms">
              Terms
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
            Privacy
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-archive-ivory/70 sm:text-lg">
            Last updated {lastUpdatedDate}. This page describes the general
            platform privacy practices for The Life Archive.
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
