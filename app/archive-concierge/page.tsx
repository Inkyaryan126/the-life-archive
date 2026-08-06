import type { Metadata } from "next";
import Link from "next/link";
import { DesignBackdrop } from "@/components/SiteDesign";
import { SiteFooter } from "@/components/SiteFooter";
import { StandalonePageHeader } from "@/components/archive-building/StandalonePageHeader";
import { getAccountContext } from "@/lib/account";
import { getPackageCheckoutAvailability } from "@/lib/archive-concierge-payment-rules";
import { getArchiveConciergePackageList } from "@/lib/archive-concierge-config";

export const metadata: Metadata = {
  title: "Archive Concierge | Done-for-You Life & Memorial Archives",
  description:
    "Bring us the photos, videos, recordings, documents, and stories. The Life Archive organizes everything and builds a private, professionally prepared life or memorial archive for you."
};

const howItWorks = [
  "Choose a package",
  "Complete the intake",
  "Upload or drop off materials",
  "We organize and build",
  "Review privately",
  "Approve and receive the completed archive and keepsakes"
];

const materialMethods = [
  "Secure online upload",
  "Google Drive or Dropbox link",
  "USB drive",
  "External hard drive",
  "Phone transfer during an appointment",
  "Physical photographs and documents",
  "Local pickup or drop-off where available"
];

const faqs = [
  {
    q: "Do I need to organize everything first?",
    a: "No. Your memories do not need to arrive perfectly organized. Bring the boxes, phones, drives, photographs, recordings, documents, and stories, and we will help sort the collection into a usable archive plan."
  },
  {
    q: "Can you create an archive for someone who has died?",
    a: "Yes. Archive Concierge supports memorial archives for families who are grieving, overwhelmed, or working toward a funeral, celebration of life, or memorial deadline."
  },
  {
    q: "What counts as one submitted item?",
    a: "A single photo, document, audio file, video file, written story, or comparable memory usually counts as one item. Albums, long recordings, boxes, and old-media collections may need a custom quote."
  },
  {
    q: "Can I provide physical photos?",
    a: "Yes. Physical photographs, albums, letters, programs, documents, and other materials can be documented during intake and handled according to the project plan."
  },
  {
    q: "Can family members contribute?",
    a: "Yes. Family contribution planning is part of the larger packages and custom projects. We will identify authorized decision-makers before production begins."
  },
  {
    q: "Will the archive be public immediately?",
    a: "No. Submitted materials remain private during production. Nothing is publicly published before customer approval."
  },
  {
    q: "What happens if my collection is larger than the selected package?",
    a: "We will review the intake, explain the scope, and recommend either an adjusted package or a custom quote before moving forward."
  },
  {
    q: "Can you meet a funeral or memorial deadline?",
    a: "Families with an upcoming service may request memorial priority. Availability depends on the materials, deadline, project size, digitization needs, and keepsake selections."
  }
];

function ConciergeCta({
  href,
  children,
  secondary = false
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-archive-gold/35 ${
        secondary
          ? "border border-archive-gold/30 bg-white/[0.035] text-archive-ivory hover:border-archive-gold hover:bg-white/[0.07]"
          : "bg-archive-gold text-archive-obsidian shadow-luxury hover:bg-archive-champagne"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function ArchiveConciergePage() {
  const account = await getAccountContext();
  const startHref = account.user
    ? "/archive-concierge/start"
    : "/login?next=%2Farchive-concierge%2Fstart";
  const packages = getArchiveConciergePackageList();

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory">
      <DesignBackdrop />
      <StandalonePageHeader
        title="Archive Concierge"
        backHref="/"
        backLabel="Return to Grand Hall"
        signedIn={Boolean(account.user)}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 py-10 sm:px-8 lg:px-12">
        <section className="grid min-h-[68vh] content-center gap-10 border-b border-archive-gold/14 pb-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-archive-gold">
              Archive Concierge
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.02] text-archive-ivory sm:text-6xl lg:text-7xl">
              You bring us the memories. We build the Life Archive.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-archive-ivory/76">
              Your memories do not need to arrive perfectly organized. Bring the boxes,
              phones, drives, photographs, recordings, documents, and stories. The Life Archive
              will organize the materials, build the archive, prepare the keepsakes, and guide
              you through approval.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ConciergeCta href={startHref}>Start My Archive</ConciergeCta>
              <ConciergeCta href={`${startHref}?package=custom`} secondary>
                Request a Custom Quote
              </ConciergeCta>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
              Two service paths
            </p>
            <div className="mt-5 grid gap-4">
              {[
                {
                  title: "Build My Own Life Archive",
                  body: "A professionally organized living archive for your photos, voice, lessons, documents, stories, QR code, and keepsake connection."
                },
                {
                  title: "Create a Memorial Archive",
                  body: "A guided memorial archive for families carrying grief, scattered materials, and the pressure of doing right by someone they love."
                }
              ].map((path) => (
                <article
                  key={path.title}
                  className="rounded-2xl border border-archive-gold/14 bg-black/24 p-5"
                >
                  <h2 className="font-serif text-2xl text-archive-ivory">
                    {path.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-archive-ivory/68">
                    {path.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 border-b border-archive-gold/14 py-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
              How it works
            </p>
            <h2 className="mt-3 font-serif text-4xl text-archive-ivory">
              A guided production process.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {howItWorks.map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-archive-gold/14 bg-white/[0.03] p-5"
              >
                <span className="font-mono text-xs text-archive-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 font-serif text-xl text-archive-ivory">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-archive-gold/14 py-14">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
              Packages
            </p>
            <h2 className="mt-3 font-serif text-4xl text-archive-ivory">
              Start with the level of help your collection needs.
            </h2>
            <p className="mt-4 text-sm leading-7 text-archive-ivory/64">
              Pricing is shown as starting at guidance, not final legal pricing. Final scope may
              depend on collection size, media length, condition, scanning, digitization,
              turnaround, and physical keepsake selections.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-4">
            {packages.map((pkg) => {
              const checkout = getPackageCheckoutAvailability(pkg.key);
              return (
                <article
                  key={pkg.key}
                  className={`relative flex flex-col rounded-[1.25rem] border p-5 ${
                    pkg.recommended
                      ? "border-archive-gold bg-archive-gold/10 shadow-luxury"
                      : "border-archive-gold/16 bg-white/[0.03]"
                  }`}
                >
                  {pkg.recommended ? (
                    <span className="mb-4 w-fit rounded-full bg-archive-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-archive-obsidian">
                      Most Popular
                    </span>
                  ) : null}
                  <h3 className="font-serif text-2xl text-archive-ivory">
                    {pkg.displayName}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-archive-gold">
                    {pkg.startingPriceText}
                  </p>
                  {pkg.paymentModel === "deposit" ? (
                    <p className="mt-3 rounded-xl border border-archive-gold/16 bg-black/24 p-3 text-xs leading-6 text-archive-ivory/66">
                      Project deposit only. Final project total is determined after collection review.
                    </p>
                  ) : null}
                  <ul className="mt-5 grid gap-2 text-sm leading-6 text-archive-ivory/70">
                    {pkg.features.map((feature) => (
                      <li key={feature}>
                        <span aria-hidden="true">&bull;</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <ConciergeCta href={`${startHref}?package=${pkg.key}`} secondary>
                    {checkout.configured ? "Select Package" : "Request This Package"}
                  </ConciergeCta>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 border-b border-archive-gold/14 py-14 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-archive-gold/18 bg-white/[0.035] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
              Memorial Priority
            </p>
            <h2 className="mt-3 font-serif text-4xl text-archive-ivory">
              For families working toward a service date.
            </h2>
            <p className="mt-4 text-base leading-8 text-archive-ivory/70">
              Families with an upcoming funeral, celebration of life, or memorial deadline may
              request expedited service. Availability depends on the materials, deadline, project
              size, digitization needs, and keepsake selections.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-archive-gold/18 bg-white/[0.035] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
              Ways to provide materials
            </p>
            <div className="mt-5 grid gap-2 text-sm leading-6 text-archive-ivory/72 sm:grid-cols-2">
              {materialMethods.map((method) => (
                <p key={method} className="rounded-xl bg-black/24 px-4 py-3">
                  {method}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 border-b border-archive-gold/14 py-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
              Trust and privacy
            </p>
            <h2 className="mt-3 font-serif text-4xl text-archive-ivory">
              Private until you approve.
            </h2>
          </div>
          <div className="grid gap-3 text-sm leading-7 text-archive-ivory/72 sm:grid-cols-2">
            {[
              "The customer controls final approval.",
              "Submitted materials remain private during production.",
              "Nothing is publicly published before approval.",
              "Customers should retain their original files.",
              "Physical materials will be documented during intake.",
              "Archive ownership and authorized decision-makers must be identified."
            ].map((item) => (
              <p key={item} className="rounded-2xl border border-archive-gold/12 bg-white/[0.03] p-4">
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="border-b border-archive-gold/14 py-14">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
            Frequently asked questions
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="rounded-2xl border border-archive-gold/14 bg-white/[0.03] p-5"
              >
                <summary className="cursor-pointer font-serif text-xl text-archive-ivory">
                  {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-archive-ivory/68">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="py-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
            Archive Concierge
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl font-serif text-4xl text-archive-ivory sm:text-5xl">
            Bring what you have. We will help turn it into something your family can keep.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ConciergeCta href={startHref}>Start My Archive</ConciergeCta>
            <ConciergeCta href={`${startHref}?package=custom`} secondary>
              Request a Custom Quote
            </ConciergeCta>
          </div>
        </section>
      </div>

      <SiteFooter signedIn={Boolean(account.user)} />
    </main>
  );
}
