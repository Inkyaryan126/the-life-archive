import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug, getLegacyInstructionByArchiveSlug } from "@/lib/archive-data";
import {
  legacyInstructionAccessLevelLabels,
  legacyInstructionAccessLevels
} from "@/lib/legacy-instructions";
import { saveLegacyInstructionsAction } from "./actions";

export const dynamic = "force-dynamic";

type LegacyInstructionsPageProps = {
  params: {
    slug: string;
  };
  searchParams?: {
    error?: string;
  };
};

function LegacyInstructionsEditor({
  slug,
  archiveName,
  personName,
  body,
  accessLevel,
  error
}: {
  slug: string;
  archiveName: string;
  personName: string;
  body?: string;
  accessLevel?: "owner_only" | "released";
  error?: string;
}) {
  return (
    <form
      action={saveLegacyInstructionsAction.bind(null, slug)}
      className="rounded-2xl border border-archive-gold/20 bg-white/[0.04] p-6 shadow-luxury sm:p-8"
    >
      {error ? (
        <p className="mb-5 rounded-xl border border-archive-gold/25 bg-archive-gold/10 px-4 py-3 text-sm leading-6 text-archive-champagne">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
            Legacy Instructions
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            {archiveName}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.14em] text-archive-ivory/60">
            For {personName}
          </p>
        </div>
        <Link
          href={`/archive/${slug}`}
          className="rounded-full border border-archive-gold/35 px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/5"
        >
          Back to Archive
        </Link>
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-7 text-archive-ivory/68 sm:text-base">
        This is a separate document from memories. Keep it for directions,
        wishes, and other notes that should stay private until you choose to
        release them.
      </p>

      <div className="mt-8 grid gap-6">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-archive-ivory">
            Access level
          </span>
          <select
            name="accessLevel"
            defaultValue={accessLevel ?? "owner_only"}
            className="rounded-xl border border-archive-gold/20 bg-archive-ivory px-4 py-3 text-archive-obsidian outline-none ring-archive-gold/30 transition focus:ring-4"
          >
            {legacyInstructionAccessLevels.map((value) => (
              <option key={value} value={value}>
                {legacyInstructionAccessLevelLabels[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-archive-ivory">
            Legacy instructions
          </span>
          <textarea
            name="body"
            required
            rows={14}
            defaultValue={body ?? ""}
            placeholder="Write the directions, notes, and messages that should be kept separate from memories."
            className="min-h-[22rem] resize-y rounded-xl border border-archive-gold/20 bg-archive-ivory px-4 py-3 text-archive-obsidian outline-none ring-archive-gold/30 transition placeholder:text-archive-obsidian/38 focus:ring-4"
          />
        </label>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
        >
          Save Instructions
        </button>
        <p className="text-sm leading-6 text-archive-ivory/58">
          Released instructions become publicly readable.
        </p>
      </div>
    </form>
  );
}

function LegacyInstructionsReadOnly({
  archiveSlug,
  archiveName,
  personName,
  body,
  releasedAt,
  backHref
}: {
  archiveSlug: string;
  archiveName: string;
  personName: string;
  body: string;
  releasedAt: string | null;
  backHref: string;
}) {
  return (
    <section className="rounded-2xl border border-archive-gold/20 bg-white/[0.04] p-6 shadow-luxury sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
            Released Legacy Instructions
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            {archiveName}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.14em] text-archive-ivory/60">
            For {personName}
          </p>
        </div>
        <span className="rounded-full border border-archive-gold/25 bg-archive-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-archive-champagne">
          Released
        </span>
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-7 text-archive-ivory/68 sm:text-base">
        This document was explicitly released by the archive owner.
      </p>

      <article className="mt-8 whitespace-pre-wrap rounded-2xl border border-archive-gold/15 bg-archive-ivory px-5 py-5 text-archive-obsidian shadow-inner">
        {body}
      </article>

      {releasedAt ? (
        <p className="mt-4 text-sm leading-6 text-archive-ivory/55">
          Released on {new Date(releasedAt).toLocaleDateString()}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href={backHref}
          className="rounded-full border border-archive-gold/35 px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/5"
        >
          {backHref === `/archive/${archiveSlug}` ? "Back to Archive" : "Home"}
        </Link>
      </div>
    </section>
  );
}

export default async function LegacyInstructionsPage({
  params,
  searchParams
}: LegacyInstructionsPageProps) {
  const account = await getAccountContext();
  const isOwner = account.archives.some((archive) => archive.slug === params.slug);
  const [archive, legacyInstruction] = await Promise.all([
    getArchiveBySlug(params.slug),
    getLegacyInstructionByArchiveSlug(params.slug, isOwner)
  ]);

  if (!isOwner && !legacyInstruction) {
    notFound();
  }

  const ownedArchive = account.archives.find((item) => item.slug === params.slug);
  const displayArchiveName =
    archive?.archiveName ?? legacyInstruction?.archiveName ?? ownedArchive?.archiveName;
  const displayPersonName =
    archive?.personName ?? legacyInstruction?.personName ?? ownedArchive?.personName;
  const backHref = archive ? `/archive/${params.slug}` : "/";

  if (!displayArchiveName || !displayPersonName) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,161,91,0.14),transparent_30rem),radial-gradient(circle_at_bottom_right,rgba(198,161,91,0.06),transparent_36rem)]" />

      <div className="relative mx-auto max-w-5xl">
        <nav className="flex items-center justify-between border-b border-archive-gold/20 pb-5">
          <Link href="/" className="font-serif text-lg tracking-wide">
            The Life Archive
          </Link>
          <Link
            href={isOwner ? "/dashboard" : "/"}
            className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
          >
            {isOwner ? "Dashboard" : "Home"}
          </Link>
        </nav>

        <section className="py-12">
          {isOwner ? (
            <LegacyInstructionsEditor
              slug={params.slug}
              archiveName={displayArchiveName}
              personName={displayPersonName}
              body={legacyInstruction?.body}
              accessLevel={legacyInstruction?.accessLevel}
              error={searchParams?.error}
            />
          ) : legacyInstruction ? (
            <LegacyInstructionsReadOnly
              archiveSlug={params.slug}
              archiveName={displayArchiveName}
              personName={displayPersonName}
              body={legacyInstruction.body}
              releasedAt={legacyInstruction.releasedAt}
              backHref={backHref}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
