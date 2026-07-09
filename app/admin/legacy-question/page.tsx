import Link from "next/link";
import { redirect } from "next/navigation";
import { updateLegacyQuestionSubmissionAction } from "@/app/admin/legacy-question/actions";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAdminAccess } from "@/lib/admin";
import {
  legacyQuestionStatuses,
  listLegacyQuestionSubmissions,
  type LegacyQuestionSubmission
} from "@/lib/legacy-question-submissions";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function previewText(value: string | null) {
  if (!value) {
    return "No written memory";
  }

  if (value.length <= 180) {
    return value;
  }

  return `${value.slice(0, 180)}...`;
}

function statusClass(status: LegacyQuestionSubmission["submissionStatus"]) {
  if (status === "archived") {
    return "border-emerald-300/35 text-emerald-200";
  }

  if (status === "emailed") {
    return "border-sky-300/35 text-sky-200";
  }

  if (status === "failed") {
    return "border-red-300/35 text-red-100";
  }

  return "border-archive-gold/35 text-archive-champagne";
}

function SubmissionCard({
  submission
}: {
  submission: LegacyQuestionSubmission;
}) {
  return (
    <article className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 shadow-luxury">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${statusClass(
                submission.submissionStatus
              )}`}
            >
              {submission.submissionStatus}
            </span>
            <span className="rounded-full border border-archive-gold/16 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-archive-ivory/60">
              {submission.entryType}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-ivory/45">
              {formatDate(submission.createdAt)}
            </span>
          </div>

          <h2 className="mt-4 break-all font-serif text-2xl leading-tight text-archive-ivory">
            {submission.email}
          </h2>
          <p className="mt-2 text-sm text-archive-ivory/68">
            {submission.firstName || "No first name"} ·{" "}
            {submission.wantsReminders ? "Wants reminders" : "No reminders"}
          </p>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-archive-gold/10 bg-archive-obsidian/60 p-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
                Source
              </dt>
              <dd className="mt-1 break-all text-archive-ivory/75">
                {submission.source}
              </dd>
            </div>
            <div className="rounded-xl border border-archive-gold/10 bg-archive-obsidian/60 p-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
                Card batch
              </dt>
              <dd className="mt-1 text-archive-ivory/75">
                {submission.cardBatch || "None"}
              </dd>
            </div>
            <div className="rounded-xl border border-archive-gold/10 bg-archive-obsidian/60 p-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
                Duration
              </dt>
              <dd className="mt-1 text-archive-ivory/75">
                {submission.durationSeconds ?? "-"} seconds
              </dd>
            </div>
            <div className="rounded-xl border border-archive-gold/10 bg-archive-obsidian/60 p-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
                Media MIME
              </dt>
              <dd className="mt-1 break-all text-archive-ivory/75">
                {submission.mediaMimeType || "None"}
              </dd>
            </div>
          </dl>

          <div className="mt-5 rounded-xl border border-archive-gold/10 bg-archive-obsidian/60 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
              Text preview
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-archive-ivory/72">
              {previewText(submission.textContent)}
            </p>
          </div>
        </div>

        <form
          action={updateLegacyQuestionSubmissionAction}
          className="rounded-2xl border border-archive-gold/12 bg-archive-obsidian/70 p-4"
        >
          <input type="hidden" name="submissionId" value={submission.id} />
          <label className="grid gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
              Status
            </span>
            <select
              className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none focus:border-archive-gold"
              defaultValue={submission.submissionStatus}
              name="submissionStatus"
            >
              {legacyQuestionStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 grid gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
              Notes
            </span>
            <textarea
              className="min-h-28 rounded-xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none focus:border-archive-gold"
              defaultValue={submission.notes}
              name="notes"
              placeholder="Follow-up notes, signal quality, card batch observations"
              rows={4}
            />
          </label>
          <button
            className="mt-4 w-full rounded-full bg-archive-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            type="submit"
          >
            Update
          </button>
        </form>
      </div>
    </article>
  );
}

export default async function LegacyQuestionAdminPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();

  if (!account.user) {
    redirect("/login?next=%2Fadmin%2Flegacy-question");
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

  let submissions: LegacyQuestionSubmission[] = [];
  let loadError: string | null = null;

  try {
    submissions = await listLegacyQuestionSubmissions();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load submissions.";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl">
        <nav className="flex flex-col gap-4 border-b border-archive-gold/18 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-archive-champagne">
            <Link href="/admin" className="underline-offset-4 hover:underline">
              Admin dashboard
            </Link>
            <Link href="/legacy-question" className="underline-offset-4 hover:underline">
              Open page
            </Link>
          </div>
        </nav>

        <header className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            Field testing
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
            Legacy question submissions
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-archive-ivory/68">
            Review memories submitted from /legacy-question, including physical Talk Card source and batch tracking.
          </p>
        </header>

        {params?.success ? (
          <p className="mb-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Submission updated.
          </p>
        ) : null}

        {params?.error ? (
          <p className="mb-6 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
            {params.error}
          </p>
        ) : null}

        {loadError ? (
          <section className="rounded-2xl border border-red-300/20 bg-red-400/10 p-6 text-sm text-red-100">
            {loadError}
          </section>
        ) : null}

        {!loadError && submissions.length === 0 ? (
          <section className="rounded-2xl border border-archive-gold/18 bg-white/[0.025] p-8 text-center shadow-luxury">
            <h2 className="font-serif text-3xl text-archive-ivory">
              No legacy question submissions yet.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-archive-ivory/64">
              Submissions from physical Talk Cards and the public page will appear here after they are captured.
            </p>
          </section>
        ) : null}

        {!loadError && submissions.length > 0 ? (
          <section className="grid gap-5 pb-16">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
