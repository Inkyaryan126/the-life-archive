import Link from "next/link";
import { claimLegacyQuestionArchiveAction, requestFreshLegacyQuestionClaimEmailAction } from "./actions";
import {
  getLegacyQuestionClaimOverviewByRawToken,
  type LegacyQuestionClaimStatus
} from "@/lib/legacy-question-claims";
import { getLegacyQuestionSubmission } from "@/lib/legacy-question-submissions";
import { FormButton } from "@/components/auth/FormButton";
import { PasswordFields } from "@/components/auth/PasswordFields";
import { maskEmailAddress } from "@/lib/auth-passwords";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function getStatusCopy(status: LegacyQuestionClaimStatus) {
  if (status === "active") {
    return {
      heading: "Your starter archive is ready.",
      message: "Create your sign-in details, then claim your archive."
    };
  }

  return {
    heading: "This claim link has expired or already been used.",
    message:
      "Request a fresh claim email to receive a new local link for the same starter archive."
  };
}

export default async function ClaimPage({
  params,
  searchParams
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const account = await getAccountContext();
  const claim = await getLegacyQuestionClaimOverviewByRawToken(resolvedParams.token);
  const submission = claim ? await getLegacyQuestionSubmission(claim.submissionId) : null;
  const status = claim?.claimStatus ?? "not_created";
  const copy = getStatusCopy(status);
  const maskedEmail = claim?.email ? maskEmailAddress(claim.email) : null;
  const canContinueWithSession =
    Boolean(account.user && claim?.userId && account.user.id === claim.userId);

  return (
    <main className="min-h-screen bg-[#11100e] px-4 py-8 text-[#f8f1e7] sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link className="text-sm font-semibold text-[#d8b66f] underline-offset-4 hover:underline" href="/">
          The Life Archive
        </Link>

        <section className="rounded-3xl border border-[#c9a45c]/18 bg-white/[0.04] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.32)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c9a45c]">
            Secure claim
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            {copy.heading}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#efe3d1]/78">
            {copy.message}
          </p>
          {status === "active" ? (
            <p className="mt-3 text-sm leading-6 text-[#efe3d1]/68">
              You&apos;ll use {maskedEmail ?? "your email"} and the password you create here to sign in later.
            </p>
          ) : null}
          {canContinueWithSession ? (
            <p className="mt-2 text-sm leading-6 text-[#efe3d1]/68">
              You are already signed in to this account, so you can continue without changing your password.
            </p>
          ) : null}

          {resolvedSearchParams?.error ? (
            <p className="mt-5 rounded-2xl border border-red-300/25 bg-red-400/10 p-4 text-sm text-red-100">
              {resolvedSearchParams.error}
            </p>
          ) : null}

          {resolvedSearchParams?.success === "reissued" ? (
            <p className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              A fresh claim email has been sent.
            </p>
          ) : null}

          {submission ? (
            <p className="mt-5 text-sm leading-6 text-[#efe3d1]/66">
              {submission.firstName || submission.email} · Starter archive prepared from your first memory.
            </p>
          ) : null}

          {claim?.expiresAt ? (
            <p className="mt-3 text-sm leading-6 text-[#efe3d1]/66">
              {status === "active"
                ? `This claim expires on ${formatDate(claim.expiresAt)}.`
                : `The last claim expired on ${formatDate(claim.expiresAt)}.`}
            </p>
          ) : null}

          {status === "active" ? (
            <form className="mt-7 grid gap-5" action={claimLegacyQuestionArchiveAction}>
              <input name="claimToken" type="hidden" value={resolvedParams.token} />
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#efe3d1]">
                  What should we call you?
                </span>
                <input
                  name="displayName"
                  defaultValue={submission?.firstName ?? ""}
                  maxLength={60}
                  placeholder="Your display name"
                  className="rounded-2xl border border-[#c9a45c]/20 bg-[#171410] px-4 py-3 text-base text-[#f8f1e7] outline-none transition placeholder:text-[#efe3d1]/34 focus:border-[#c9a45c]"
                />
              </label>
              <PasswordFields
                passwordName="password"
                confirmName="confirmPassword"
                passwordLabel="Create a password"
                confirmLabel="Confirm password"
                passwordPlaceholder="Create a password"
                confirmPlaceholder="Confirm your password"
                passwordHelp="You&apos;ll use your email and this password to sign in later."
                required={!canContinueWithSession}
              />
              <div className="flex flex-wrap gap-3">
                <FormButton
                  name="claimIntent"
                  value="create"
                  pendingText="Creating account..."
                  className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#c9a45c] px-6 py-4 text-base font-bold text-[#11100e] transition hover:bg-[#e5cf9a] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/35 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Create My Account &amp; Claim Archive
                </FormButton>
                {canContinueWithSession ? (
                  <FormButton
                    name="claimIntent"
                    value="continue"
                    pendingText="Claiming archive..."
                    className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#c9a45c]/28 bg-white/[0.04] px-6 py-4 text-base font-semibold text-[#f8f1e7] transition hover:border-[#c9a45c] hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Continue with Existing Session
                  </FormButton>
                ) : null}
              </div>
            </form>
          ) : null}

          {claim && status !== "active" ? (
            <form className="mt-5" action={requestFreshLegacyQuestionClaimEmailAction}>
              <input name="claimToken" type="hidden" value={resolvedParams.token} />
              <button className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c9a45c]/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-[#f8f1e7] transition hover:border-[#c9a45c] hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30" type="submit">
                Request fresh claim email
              </button>
            </form>
          ) : (
            <div className="mt-5">
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c9a45c]/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-[#f8f1e7] transition hover:border-[#c9a45c] hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30" href="/login">
                Sign in for a fresh link
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
