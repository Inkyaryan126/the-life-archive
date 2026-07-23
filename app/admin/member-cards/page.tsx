import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAdminAccess } from "@/lib/admin";
import { listKeepsakeOrders } from "@/lib/keepsake-orders";
import { listLegacyActivationRequests } from "@/lib/legacy-activation";
import {
  buildMemberCardEngravingDataUri,
  getMemberCardEngravingFilename,
  listMemberCardEngravingCandidates,
  type MemberCardEngravingCandidate
} from "@/lib/member-card-engraving";
import { getSiteVisitStats } from "@/lib/site-visits";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

async function CandidatePreviewFrame({
  candidate,
  side
}: {
  candidate: MemberCardEngravingCandidate;
  side: "front" | "back";
}) {
  const label = side === "front" ? "FRONT" : "BACK";
  const dimensions = "85.73 mm × 53.98 mm";
  let src: string | null = null;
  let previewError: string | null = null;

  try {
    src = await buildMemberCardEngravingDataUri(candidate, side);
  } catch (error) {
    previewError =
      error instanceof Error ? error.message : "Unable to render preview.";
  }

  return (
    <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
            {label}
          </p>
          <p className="mt-1 text-xs text-archive-ivory/55">{dimensions}</p>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
          Ready
        </p>
      </div>

      {src ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-archive-gold/12 bg-white p-2">
          <Image
            alt={`${candidate.archiveName || candidate.archiveSlug || candidate.archiveId} ${label.toLowerCase()} engraving preview`}
            className="block h-auto w-full"
            loading="lazy"
            unoptimized
            width={2026}
            height={1276}
            src={src}
          />
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-archive-gold/20 bg-white/[0.02] p-4 text-sm leading-6 text-archive-ivory/68">
          <p className="font-semibold text-archive-champagne">
            Preview unavailable
          </p>
          <p className="mt-2">{previewError || "Unable to render preview."}</p>
        </div>
      )}
    </div>
  );
}

function CandidateCard({
  candidate
}: {
  candidate: MemberCardEngravingCandidate;
}) {
  const isReady = candidate.ready;
  const frontFilename = getMemberCardEngravingFilename(candidate, "front");
  const backFilename = getMemberCardEngravingFilename(candidate, "back");

  return (
    <article className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 shadow-luxury transition hover:border-archive-gold/25">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                isReady
                  ? "border-emerald-300/35 text-emerald-200 bg-emerald-500/10"
                  : "border-amber-300/35 text-amber-100 bg-amber-500/10"
              }`}
            >
              {isReady ? "Ready" : "Incomplete"}
            </span>
            <span className="rounded-full border border-archive-gold/18 bg-white/[0.02] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-archive-ivory/65">
              {candidate.archiveType}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-ivory/45">
              {formatDate(candidate.createdAt)}
            </span>
          </div>

          <h2 className="mt-4 break-words font-serif text-2xl leading-tight text-archive-ivory">
            {candidate.profileDisplayName || "Missing display name"}
          </h2>
          <p className="mt-2 text-sm text-archive-ivory/68">
            Archive name: {candidate.archiveName || "Missing archive name"}
          </p>
          <p className="mt-1 break-all font-mono text-xs text-archive-ivory/58">
            Archive slug: {candidate.archiveSlug || "Missing archive slug"}
          </p>
          <p className="mt-1 break-all text-sm text-archive-ivory/58">
            Account email: {candidate.ownerEmail || "Email unavailable"}
          </p>
          <p className="mt-1 font-mono text-xs text-archive-ivory/45">
            Member identifier: {candidate.ownerId}
          </p>

          {candidate.missingFields.length > 0 ? (
            <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/8 p-4 text-sm leading-6 text-amber-50">
              <p className="font-semibold text-amber-100">Incomplete</p>
              <p className="mt-2">
                Missing data: {candidate.missingFields.join(", ")}
              </p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            {isReady ? (
              <>
                <a
                  href={`/admin/member-cards/${candidate.archiveId}/front`}
                  className="rounded-full bg-archive-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
                  download={frontFilename}
                >
                  Download Front PNG
                </a>
                <a
                  href={`/admin/member-cards/${candidate.archiveId}/back`}
                  className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-champagne transition hover:border-archive-gold hover:bg-white/[0.08]"
                  download={backFilename}
                >
                  Download Back PNG
                </a>
              </>
            ) : (
              <>
                <span className="cursor-not-allowed rounded-full bg-archive-gold/30 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian/45">
                  Download Front PNG
                </span>
                <span className="cursor-not-allowed rounded-full border border-archive-gold/18 bg-white/[0.02] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-ivory/35">
                  Download Back PNG
                </span>
              </>
            )}
          </div>
        </div>

        <div className="w-full max-w-xl xl:w-[28rem]">
          <details className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/55 p-4">
            <summary className="cursor-pointer select-none text-sm font-semibold uppercase tracking-[0.18em] text-archive-champagne">
              Preview Card
            </summary>

            <div className="mt-4 grid gap-4">
              <p className="text-xs leading-6 text-archive-ivory/55">
                Exact dimensions: 85.73 mm × 53.98 mm
              </p>
              {isReady ? (
                <div className="grid gap-4">
                  <CandidatePreviewFrame candidate={candidate} side="front" />
                  <CandidatePreviewFrame candidate={candidate} side="back" />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-archive-gold/20 bg-white/[0.02] p-4 text-sm leading-6 text-archive-ivory/68">
                  This card is incomplete. Fix the missing fields above before
                  exporting a production PNG.
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}

export default async function MemberCardEngravingPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();

  if (!account.user) {
    redirect("/login?next=%2Fadmin%2Fmember-cards");
  }

  const params = await searchParams;

  if (!adminEmailsConfigured || !isAdmin) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
        <DesignBackdrop />
        <div className="relative z-10 mx-auto max-w-3xl">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <section className="mt-16 rounded-2xl border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              Admin
            </p>
            <h1 className="mt-4 font-serif text-4xl text-archive-ivory">
              Access not available.
            </h1>
            <p className="mt-4 text-sm leading-7 text-archive-ivory/68">
              This page is limited to emails listed in ADMIN_EMAILS.
            </p>
          </section>
        </div>
      </main>
    );
  }

  let candidates: MemberCardEngravingCandidate[] = [];
  let loadError: string | null = null;
  let siteVisitStats = { uniqueVisitorsToday: 0 };
  let newOrdersCount = 0;
  let pendingReviewsCount = 0;

  try {
    const [candData, stats, orders, legacyRequests] = await Promise.all([
      listMemberCardEngravingCandidates(params?.q),
      getSiteVisitStats(),
      listKeepsakeOrders(),
      listLegacyActivationRequests()
    ]);
    candidates = candData;
    siteVisitStats = stats;
    newOrdersCount = orders.filter((o) => o.fulfillmentStatus === "New").length;
    pendingReviewsCount = legacyRequests.filter(
      (r) => r.status === "pending_memorial_review"
    ).length;
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load member card engraving records.";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl">
        <AdminNav
          currentPath="/admin/member-cards"
          todayVisitsCount={siteVisitStats.uniqueVisitorsToday}
          newOrdersCount={newOrdersCount}
          pendingReviewsCount={pendingReviewsCount}
        />

        <header className="py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            Admin Production Export
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
            Member Card Engraving
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-archive-ivory/68">
            Export engraving-ready high-resolution PNG files for LightBurn laser equipment.
          </p>
          <p className="mt-2 max-w-4xl text-xs leading-6 text-archive-ivory/60">
            For black-coated metal cards, engrave only the artwork areas so the coating is removed where the design should appear.
          </p>

          <form method="get" className="mt-6 flex max-w-2xl gap-3">
            <input
              name="q"
              defaultValue={params?.q ?? ""}
              placeholder="Search display name, archive name, archive slug, or email..."
              className="min-w-0 flex-1 rounded-full border border-archive-gold/18 bg-white/[0.03] px-5 py-3 text-sm text-archive-ivory outline-none placeholder:text-archive-ivory/35 focus:border-archive-gold"
            />
            <button
              type="submit"
              className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Search
            </button>
          </form>
        </header>

        {loadError ? (
          <p className="mb-6 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
            {loadError}
          </p>
        ) : null}

        <section className="mb-6 rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 shadow-luxury">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
            Production Export Specs
          </p>
          <ul className="mt-3 grid gap-2 text-xs leading-6 text-archive-ivory/68 sm:grid-cols-3">
            <li>• Front and back PNGs are physical-size accurate (85.73mm × 53.98mm).</li>
            <li>• Downloads disabled until all required fields are validated.</li>
            <li>• QR destinations derived strictly from verified database records.</li>
          </ul>
        </section>

        {candidates.length > 0 ? (
          <div className="grid gap-5">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.archiveId} candidate={candidate} />
            ))}
          </div>
        ) : (
          <section className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-8 text-center shadow-luxury">
            <h2 className="font-serif text-3xl text-archive-ivory">
              No eligible living archives found.
            </h2>
          </section>
        )}
      </div>
    </main>
  );
}
