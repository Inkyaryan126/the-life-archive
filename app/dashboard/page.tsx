import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/login/actions";
import type { AccountArchive } from "@/lib/account";
import { getAccountContext } from "@/lib/account";
import { getArchiveRelationshipLabel } from "@/lib/archive-relationships";
import {
  getLegacyInstructionByArchiveSlug
} from "@/lib/archive-data";
import {
  legacyInstructionAccessLevelLabels
} from "@/lib/legacy-instructions";

export const dynamic = "force-dynamic";

type DashboardActionProps = {
  description: string;
  href: string;
  label: string;
  primary?: boolean;
};

function DashboardAction({
  description,
  href,
  label,
  primary = false
}: DashboardActionProps) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-5 transition sm:p-6 ${
        primary
          ? "border-archive-gold/60 bg-archive-gold text-archive-obsidian shadow-luxury hover:bg-archive-champagne"
          : "border-archive-gold/25 bg-white/[0.045] text-archive-ivory hover:border-archive-gold/60 hover:bg-white/[0.075]"
      }`}
    >
      <span className="font-serif text-2xl">{label}</span>
      <span
        className={`mt-2 block text-sm leading-6 ${
          primary ? "text-archive-obsidian/70" : "text-archive-ivory/58"
        }`}
      >
        {description}
      </span>
      <span
        aria-hidden="true"
        className="mt-5 block text-sm font-semibold transition-transform group-hover:translate-x-1"
      >
        Continue →
      </span>
    </Link>
  );
}

type ArchiveDashboardCardProps = {
  archive: AccountArchive;
  isDefault: boolean;
};

function ArchiveDashboardCard({
  archive,
  isDefault
}: ArchiveDashboardCardProps) {
  const relationshipLabel = getArchiveRelationshipLabel(
    archive.relationshipToOwner
  );

  return (
    <article className="rounded-2xl border border-archive-gold/25 bg-white/[0.045] p-5 shadow-luxury sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
            {archive.personName}
          </p>
          <h3 className="mt-3 font-serif text-2xl leading-tight sm:text-3xl">
            {archive.archiveName}
          </h3>
        </div>
        {isDefault ? (
          <span className="rounded-full border border-archive-gold/40 bg-archive-gold/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-archive-champagne">
            Default
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em]">
        <span className="rounded-full border border-archive-gold/20 px-3 py-1.5 text-archive-ivory/68">
          {archive.visibility === "public" ? "Public" : "Private"}
        </span>
        <span className="rounded-full border border-archive-gold/20 px-3 py-1.5 text-archive-ivory/68">
          {archive.memorialMode ? "Memorial" : "Living archive"}
        </span>
        {relationshipLabel ? (
          <span className="rounded-full border border-archive-gold/20 px-3 py-1.5 text-archive-ivory/68">
            {relationshipLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid gap-2 border-t border-archive-gold/15 pt-5 sm:grid-cols-3">
        <Link
          href={`/archive/${archive.slug}`}
          className="rounded-full bg-archive-gold px-4 py-2.5 text-center text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
        >
          Open Archive
        </Link>
        <Link
          href={`/archive/${archive.slug}/add-memory`}
          className="rounded-full border border-archive-gold/35 px-4 py-2.5 text-center text-sm font-semibold transition hover:border-archive-gold hover:bg-white/5"
        >
          Add Memory
        </Link>
        <Link
          href={`/archive/${archive.slug}/qr`}
          className="rounded-full border border-archive-gold/35 px-4 py-2.5 text-center text-sm font-semibold transition hover:border-archive-gold hover:bg-white/5"
        >
          Print QR Card
        </Link>
      </div>
    </article>
  );
}

type LegacyInstructionsCardProps = {
  archiveSlug: string;
  archiveName: string;
  personName: string;
  body?: string | null;
  accessLevel?: "owner_only" | "released" | null;
};

function LegacyInstructionsCard({
  archiveSlug,
  archiveName,
  personName,
  body,
  accessLevel
}: LegacyInstructionsCardProps) {
  const hasInstructions = Boolean(body);
  const label = hasInstructions
    ? accessLevel
      ? legacyInstructionAccessLevelLabels[accessLevel]
      : "Saved"
    : "Not started";
  const description = !hasInstructions
    ? "Write a private legacy instruction document for this archive."
    : accessLevel === "released"
      ? "Released publicly. Keep it current when your wishes change."
      : "Saved privately. Open it anytime to finish the draft.";
  const ctaLabel = hasInstructions
    ? "Open Legacy Instructions"
    : "Write Legacy Instructions";

  return (
    <section className="mt-10 rounded-2xl border border-archive-gold/20 bg-white/[0.035] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
            Legacy Instructions
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
            Prepare the instructions that should outlast the archive.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-archive-ivory/62 sm:text-base">
            Keep a private document for final wishes, practical notes, and
            anything the right person should know later.
          </p>
        </div>
        <span className="rounded-full border border-archive-gold/25 bg-archive-gold/10 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-archive-champagne">
          {label}
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="rounded-xl border border-archive-gold/15 bg-archive-ivory px-5 py-4 text-archive-obsidian">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
            {archiveName}
          </p>
          <p className="mt-2 text-lg font-semibold">{personName}</p>
          <p className="mt-3 text-sm leading-7 text-archive-obsidian/70">
            {description}
          </p>
          {body ? (
            <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-7 text-archive-obsidian/80">
              {body}
            </p>
          ) : null}
        </div>

        <Link
          href={`/archive/${archiveSlug}/legacy-instructions`}
          className="rounded-full bg-archive-gold px-5 py-3 text-center text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}

export default async function DashboardPage() {
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login");
  }

  const { archives, defaultArchive, user } = account;
  const legacyInstruction = defaultArchive
    ? await getLegacyInstructionByArchiveSlug(defaultArchive.slug, true)
    : null;
  const memberSince = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(new Date(user.createdAt));

  return (
    <main className="min-h-screen bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,161,91,0.16),transparent_30rem),radial-gradient(circle_at_bottom_right,rgba(198,161,91,0.07),transparent_36rem)]" />

      <nav className="relative mx-auto flex max-w-6xl items-center justify-between border-b border-archive-gold/20 pb-5">
        <Link href="/" className="font-serif text-lg tracking-wide">
          The Life Archive
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/member-card"
            className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
          >
            Member Card
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-archive-gold/35 px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/5"
            >
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <div className="relative mx-auto max-w-6xl pb-20 pt-12 sm:pt-16">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            Your archive home
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">
            Welcome back.
          </h1>
          <p className="mt-4 text-base leading-7 text-archive-ivory/62 sm:text-lg">
            Keep the stories that matter close, and make sure the people you
            love can find them when they need them.
          </p>
        </header>

        <section className="mt-10 rounded-2xl border border-archive-gold/20 bg-archive-ivory p-6 text-archive-obsidian sm:p-8">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                Account status
              </p>
              <p className="mt-3 break-all text-sm font-semibold">{user.email}</p>
            </div>
            <dl className="grid gap-3 text-sm sm:min-w-72">
              <div className="flex items-center justify-between gap-6">
                <dt className="text-archive-obsidian/60">Email</dt>
                <dd className="font-semibold">
                  {user.emailConfirmed ? "Confirmed" : "Pending"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-6">
                <dt className="text-archive-obsidian/60">Member since</dt>
                <dd className="font-semibold">{memberSince}</dd>
              </div>
              <div className="flex items-center justify-between gap-6">
                <dt className="text-archive-obsidian/60">Archives</dt>
                <dd className="font-semibold">{archives.length}</dd>
              </div>
            </dl>
          </div>
        </section>

        {defaultArchive ? (
          <LegacyInstructionsCard
            archiveSlug={defaultArchive.slug}
            archiveName={defaultArchive.archiveName}
            personName={defaultArchive.personName}
            body={legacyInstruction?.body}
            accessLevel={legacyInstruction?.accessLevel ?? null}
          />
        ) : null}

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                Your Archives
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                {archives.length > 0
                  ? `${archives.length} ${archives.length === 1 ? "archive" : "archives"}`
                  : "Your first archive starts here"}
              </h2>
            </div>
            {archives.length > 0 && !account.archiveLookupFailed ? (
              <Link
                href="/create"
                className="rounded-full border border-archive-gold/45 px-5 py-2.5 text-sm font-semibold text-archive-champagne transition hover:border-archive-gold hover:bg-white/5"
              >
                Create Another Archive
              </Link>
            ) : null}
          </div>

          {account.archiveLookupFailed ? (
            <p className="mt-6 rounded-xl border border-archive-gold/25 bg-archive-gold/10 px-4 py-3 text-sm leading-6 text-archive-champagne">
              Your archives could not be loaded. Refresh before creating a new
              archive.
            </p>
          ) : archives.length > 0 ? (
            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              {archives.map((archive) => (
                <ArchiveDashboardCard
                  key={archive.slug}
                  archive={archive}
                  isDefault={archive.slug === defaultArchive?.slug}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <DashboardAction
                href="/create"
                label="Create My Archive"
                description="Create your first archive before adding memories or printing its QR card."
                primary
              />
              <DashboardAction
                href="/member-card"
                label="Member Card"
                description="View or print your official Life Archive member card."
              />
            </div>
          )}
        </section>

        {archives.length > 0 ? (
          <section className="mt-12 rounded-2xl border border-archive-gold/20 bg-white/[0.035] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
              Membership
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-5">
              <div>
                <h2 className="font-serif text-2xl">Your Member Card</h2>
                <p className="mt-2 text-sm leading-6 text-archive-ivory/58">
                  The card currently connects to your default archive.
                </p>
              </div>
              <Link
                href="/member-card"
                className="rounded-full bg-archive-gold px-5 py-2.5 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
              >
                View Member Card
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
