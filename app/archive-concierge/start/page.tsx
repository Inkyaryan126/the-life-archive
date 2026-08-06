import Link from "next/link";
import { redirect } from "next/navigation";
import { DesignBackdrop } from "@/components/SiteDesign";
import { SiteFooter } from "@/components/SiteFooter";
import { StandalonePageHeader } from "@/components/archive-building/StandalonePageHeader";
import { FormButton } from "@/components/auth/FormButton";
import { getAccountContext } from "@/lib/account";
import {
  archiveConciergeServiceMethods,
  getArchiveConciergePackage,
  getArchiveConciergePackageList
} from "@/lib/archive-concierge-config";
import { createArchiveConciergeOrderAction } from "./actions";

export const dynamic = "force-dynamic";

const serviceMethodLabels: Record<string, string> = {
  secure_upload: "Secure online upload",
  cloud_link: "Google Drive or Dropbox link",
  usb_dropoff: "USB drive",
  hard_drive_dropoff: "External hard drive",
  phone_transfer: "Phone transfer during an appointment",
  physical_materials: "Physical photographs and documents",
  local_pickup: "Local pickup or drop-off where available",
  mixed: "Mixed materials"
};

export default async function ArchiveConciergeStartPage({
  searchParams
}: {
  searchParams?: Promise<{ package?: string; error?: string }>;
}) {
  const account = await getAccountContext();
  const params = await searchParams;

  if (!account.user) {
    redirect("/login?next=%2Farchive-concierge%2Fstart");
  }

  const packages = getArchiveConciergePackageList();
  const requestedPackage = params?.package
    ? getArchiveConciergePackage(params.package)
    : null;
  const defaultPackage = requestedPackage?.key ?? "legacy";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory">
      <DesignBackdrop />
      <StandalonePageHeader
        title="Start Archive Concierge"
        backHref="/archive-concierge"
        backLabel="Archive Concierge"
        signedIn={true}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
            Intake
          </p>
          <h1 className="mt-3 font-serif text-4xl text-archive-ivory sm:text-5xl">
            Tell us what you have. It does not need to be organized first.
          </h1>
          <p className="mt-4 text-base leading-8 text-archive-ivory/70">
            This first step creates your Archive Concierge order. Upload, drop-off,
            pickup, and payment instructions will appear after the project is reviewed
            or purchased.
          </p>
        </header>

        {params?.error ? (
          <p className="mt-6 rounded-2xl border border-red-300/25 bg-red-400/10 p-4 text-sm text-red-100">
            {params.error}
          </p>
        ) : null}

        <form
          action={createArchiveConciergeOrderAction}
          className="mt-8 grid gap-6 rounded-[1.5rem] border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury sm:p-8"
        >
          <section className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Customer name
              </span>
              <input
                name="customerName"
                defaultValue={account.user.displayName}
                required
                maxLength={160}
                className="rounded-xl border border-archive-gold/20 bg-black/35 px-4 py-3 text-archive-ivory outline-none focus:border-archive-gold"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Customer email
              </span>
              <input
                name="customerEmail"
                type="email"
                defaultValue={account.user.email}
                required
                maxLength={320}
                className="rounded-xl border border-archive-gold/20 bg-black/35 px-4 py-3 text-archive-ivory outline-none focus:border-archive-gold"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Customer phone, optional
              </span>
              <input
                name="customerPhone"
                maxLength={40}
                className="rounded-xl border border-archive-gold/20 bg-black/35 px-4 py-3 text-archive-ivory outline-none focus:border-archive-gold"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Archive subject&apos;s name
              </span>
              <input
                name="archiveSubjectName"
                required
                maxLength={160}
                placeholder="The person this archive is about"
                className="rounded-xl border border-archive-gold/20 bg-black/35 px-4 py-3 text-archive-ivory outline-none focus:border-archive-gold"
              />
            </label>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Living or memorial archive
              </span>
              <select
                name="archiveType"
                defaultValue="living"
                required
                className="rounded-xl border border-archive-gold/20 bg-black/35 px-4 py-3 text-archive-ivory outline-none focus:border-archive-gold"
              >
                <option className="bg-archive-obsidian" value="living">
                  Living archive
                </option>
                <option className="bg-archive-obsidian" value="memorial">
                  Memorial archive
                </option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Selected package
              </span>
              <select
                name="packageKey"
                defaultValue={defaultPackage}
                required
                className="rounded-xl border border-archive-gold/20 bg-black/35 px-4 py-3 text-archive-ivory outline-none focus:border-archive-gold"
              >
                {packages.map((pkg) => (
                  <option key={pkg.key} className="bg-archive-obsidian" value={pkg.key}>
                    {pkg.displayName} - {pkg.startingPriceText}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Preferred material-delivery method
              </span>
              <select
                name="serviceMethod"
                defaultValue="mixed"
                className="rounded-xl border border-archive-gold/20 bg-black/35 px-4 py-3 text-archive-ivory outline-none focus:border-archive-gold"
              >
                {archiveConciergeServiceMethods.map((method) => (
                  <option key={method} className="bg-archive-obsidian" value={method}>
                    {serviceMethodLabels[method]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Approximate item count
              </span>
              <input
                name="requestedItemCount"
                type="number"
                min={0}
                max={100000}
                placeholder="Example: 120"
                className="rounded-xl border border-archive-gold/20 bg-black/35 px-4 py-3 text-archive-ivory outline-none focus:border-archive-gold"
              />
            </label>
          </section>

          <section className="grid gap-4 rounded-2xl border border-archive-gold/12 bg-black/20 p-4 sm:grid-cols-2">
            <label className="flex items-start gap-3 sm:col-span-2">
              <input
                name="hasMemorialDeadline"
                type="checkbox"
                className="mt-1 h-4 w-4 accent-archive-gold"
              />
              <span className="text-sm leading-6 text-archive-ivory/78">
                There is a funeral, celebration of life, memorial, or event deadline.
              </span>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Deadline date, when applicable
              </span>
              <input
                name="memorialDeadline"
                type="date"
                className="rounded-xl border border-archive-gold/20 bg-black/35 px-4 py-3 text-archive-ivory outline-none focus:border-archive-gold"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Event type, optional
              </span>
              <input
                name="eventType"
                maxLength={120}
                placeholder="Funeral, memorial, birthday, reunion..."
                className="rounded-xl border border-archive-gold/20 bg-black/35 px-4 py-3 text-archive-ivory outline-none focus:border-archive-gold"
              />
            </label>
          </section>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-archive-ivory">
              General notes
            </span>
            <textarea
              name="customerNotes"
              rows={6}
              maxLength={4000}
              placeholder="Tell us what you have, where it is, what matters most, and whether anything is fragile, urgent, or emotionally sensitive."
              className="resize-y rounded-xl border border-archive-gold/20 bg-black/35 px-4 py-3 text-archive-ivory outline-none focus:border-archive-gold"
            />
          </label>

          <section className="grid gap-3 rounded-2xl border border-archive-gold/12 bg-black/20 p-4">
            {[
              ["hasAuthority", "I have authority or permission to submit these materials."],
              ["retainedOriginals", "I will retain original copies of digital files."],
              ["approvalAcknowledged", "I understand nothing will be published without customer approval."]
            ].map(([name, label]) => (
              <label key={name} className="flex items-start gap-3">
                <input
                  name={name}
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 accent-archive-gold"
                />
                <span className="text-sm leading-6 text-archive-ivory/78">{label}</span>
              </label>
            ))}
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <FormButton
              pendingText="Starting..."
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne disabled:cursor-not-allowed disabled:opacity-60"
            >
              Start My Archive
            </FormButton>
            <Link
              href="/archive-concierge"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-archive-gold/30 bg-white/[0.035] px-6 py-3 text-sm font-bold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.07]"
            >
              Review Packages
            </Link>
          </div>
        </form>
      </div>

      <SiteFooter signedIn={true} />
    </main>
  );
}
