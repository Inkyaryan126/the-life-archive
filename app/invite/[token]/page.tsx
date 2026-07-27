import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import { getInvitationByRawToken } from "@/lib/archive-contributors";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { acceptInviteAction, declineInviteAction } from "./actions";
import { signOutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function InviteLandingPage({
  params,
  searchParams
}: InvitePageProps) {
  const { token } = await params;
  const resolvedSearchParams = await searchParams;
  const account = await getAccountContext();
  const result = await getInvitationByRawToken(token);

  if (!result.ok) {
    const isExpired = result.reason === "expired";
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-archive-obsidian px-6 py-12 text-archive-ivory">
        <DesignBackdrop />
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-archive-gold/24 bg-black/60 p-8 text-center backdrop-blur-md shadow-luxury">
          <SiteLogo width={180} height={45} className="mx-auto mb-6" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-archive-gold/14 border border-archive-gold/30 text-archive-gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="mt-4 font-serif text-2xl text-archive-ivory">
            {isExpired ? "Invitation Expired" : "Invalid Invitation"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-archive-ivory/70">
            {isExpired
              ? "This invitation has expired. Ask the archive owner to send a new one."
              : "This invitation is no longer valid or has already been used."}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/dashboard"
              className="rounded-full bg-archive-gold px-6 py-2.5 text-sm font-semibold text-archive-obsidian hover:bg-archive-champagne transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { invitation } = result;
  const inviterName = invitation.inviterName || "An archive owner";
  const archiveName = invitation.archiveName || "Life Archive";
  const invitedEmail = invitation.email;

  const returnUrl = `/invite/${token}`;
  const loginUrl = `/login?next=${encodeURIComponent(returnUrl)}`;

  const user = account.user;
  const userEmail = user?.email ? user.email.toLowerCase() : "";
  const isEmailMismatch = user && userEmail !== invitedEmail.toLowerCase();

  const bindAcceptAction = acceptInviteAction.bind(null, token);
  const bindDeclineAction = declineInviteAction.bind(null, token);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-archive-obsidian px-6 py-12 text-archive-ivory">
      <DesignBackdrop />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-archive-gold/24 bg-black/60 p-8 sm:p-10 backdrop-blur-md shadow-luxury">
        <Link href="/" className="block text-center mb-8">
          <SiteLogo width={200} height={50} className="mx-auto" />
        </Link>

        {resolvedSearchParams?.error ? (
          <div className="mb-6 rounded-xl border border-archive-gold/20 bg-archive-gold/10 p-4 text-sm font-semibold text-archive-gold">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-archive-gold">
            Contributor Invitation
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
            &ldquo;{archiveName}&rdquo;
          </h1>
          <p className="mt-3 text-base text-archive-ivory/80 leading-relaxed">
            <strong className="text-archive-champagne font-semibold">{inviterName}</strong> has invited you to contribute memories to this archive.
          </p>
        </div>

        <div className="my-6 rounded-xl border border-archive-gold/16 bg-white/[0.03] p-4 text-sm leading-6 text-archive-ivory/70">
          <p className="font-semibold text-archive-gold mb-1">What you can do as a contributor:</p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-archive-ivory/80">
            <li>View and explore the memories in this archive</li>
            <li>Add your own photos, voice notes, writing, and lessons</li>
            <li>Edit or manage memories you personally create</li>
          </ul>
        </div>

        {!user ? (
          <div className="grid gap-4 mt-8">
            <p className="text-center text-xs text-archive-ivory/60">
              Sign in with <strong className="text-archive-gold font-mono">{invitedEmail}</strong> to accept this invitation.
            </p>
            <Link
              href={loginUrl}
              className="flex h-12 w-full items-center justify-center rounded-full bg-archive-gold text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Sign In to Accept
            </Link>
            <Link
              href={loginUrl}
              className="flex h-12 w-full items-center justify-center rounded-full border border-archive-gold/30 bg-black/40 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold"
            >
              Create Free Account
            </Link>
          </div>
        ) : isEmailMismatch ? (
          <div className="grid gap-4 mt-8">
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
              <p className="font-semibold">Email Mismatch</p>
              <p className="mt-1 text-xs leading-relaxed text-red-200/90">
                This invitation was sent to a different email address (<strong className="font-mono">{invitedEmail}</strong>).
                Log in with the invited email to continue.
              </p>
              <p className="mt-2 text-xs text-archive-ivory/60">
                Currently signed in as: <strong className="font-mono">{userEmail}</strong>
              </p>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full h-12 rounded-full border border-archive-gold/38 bg-black/50 text-sm font-semibold text-archive-champagne hover:border-archive-gold transition"
              >
                Sign Out &amp; Switch Account
              </button>
            </form>
          </div>
        ) : (
          <div className="grid gap-4 mt-8">
            <form action={bindAcceptAction}>
              <button
                type="submit"
                className="h-12 w-full rounded-full bg-archive-gold text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
              >
                Accept Invitation
              </button>
            </form>

            <form action={bindDeclineAction}>
              <button
                type="submit"
                className="h-12 w-full rounded-full border border-archive-gold/24 bg-black/30 text-sm font-semibold text-archive-ivory/70 transition hover:border-archive-gold/50 hover:text-archive-ivory"
              >
                Decline
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
