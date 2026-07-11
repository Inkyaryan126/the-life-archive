import Link from "next/link";
import { createPasswordAction, requestSetupPasswordAction } from "./actions";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { FormButton } from "@/components/auth/FormButton";
import { PasswordFields } from "@/components/auth/PasswordFields";
import { getAccountContext } from "@/lib/account";
import { cookies } from "next/headers";

export default async function SetupPasswordPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; message?: string; success?: string }>;
}) {
  const params = await searchParams;
  const account = await getAccountContext();
  const cookieStore = await cookies();
  const recoveryCookie = cookieStore.get("tla_recovery_session");
  const hasRecoverySession = Boolean(account.user && recoveryCookie);

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-12 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-sm">
        <Link href="/" className="mb-8 block text-center">
          <SiteLogo width={200} height={50} className="mx-auto" />
        </Link>

        {hasRecoverySession ? (
          <form
            action={createPasswordAction}
            className="grid gap-5 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury"
          >
            <div>
              <h1 className="font-serif text-2xl text-archive-ivory">
                Create your password
              </h1>
              <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
                Use this password to sign in with your email from now on.
              </p>
            </div>
            {params?.error ? (
              <p className="rounded-md border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100">
                {params.error}
              </p>
            ) : null}
            <PasswordFields
              passwordName="newPassword"
              confirmName="confirmPassword"
              passwordLabel="New password"
              confirmLabel="Confirm new password"
              passwordPlaceholder="Create a password"
              confirmPlaceholder="Confirm your password"
              autoComplete="new-password"
              confirmAutoComplete="new-password"
              passwordHelp="You&apos;ll use your email and this password to sign in later."
            />
            <FormButton
              pendingText="Creating password..."
              className="rounded-full bg-archive-gold px-4 py-3 text-sm font-semibold text-archive-obsidian transition hover:bg-archive-champagne disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create Password
            </FormButton>
            <Link
              href="/login"
              className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
            >
              Back to login
            </Link>
          </form>
        ) : (
          <form
            action={requestSetupPasswordAction}
            className="grid gap-5 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury"
          >
            <div>
              <h1 className="font-serif text-2xl text-archive-ivory">
                Never created a password?
              </h1>
              <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
                Enter your email and we&apos;ll send a secure setup email if an account exists.
              </p>
            </div>
            {params?.message ? (
              <p className="rounded-md border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100">
                {params.message}
              </p>
            ) : null}
            {params?.success === "sent" ? (
              <p className="rounded-md border border-archive-gold/20 bg-archive-gold/10 px-4 py-3 text-sm font-semibold text-archive-gold">
                If an account exists for that email, we sent setup instructions.
              </p>
            ) : null}
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-archive-ivory outline-none transition placeholder:text-archive-ivory/36 focus:border-archive-gold"
              />
            </label>
            <FormButton
              pendingText="Sending setup email..."
              className="rounded-full bg-archive-gold px-4 py-3 text-sm font-semibold text-archive-obsidian transition hover:bg-archive-champagne disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send Setup Email
            </FormButton>
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <Link
                href="/login"
                className="font-semibold text-archive-champagne underline-offset-4 hover:underline"
              >
                Back to login
              </Link>
              <Link
                href="/forgot-password"
                className="font-semibold text-archive-ivory/68 underline-offset-4 hover:underline"
              >
                Already had a password? Reset it.
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
