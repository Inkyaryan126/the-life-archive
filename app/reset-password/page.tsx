import Link from "next/link";
import { setNewPasswordAction } from "./actions";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { FormButton } from "@/components/auth/FormButton";
import { PasswordFields } from "@/components/auth/PasswordFields";
import { getAccountContext } from "@/lib/account";
import { cookies } from "next/headers";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const account = await getAccountContext();
  const cookieStore = await cookies();
  const recoveryCookie = cookieStore.get("tla_recovery_session");

  if (!account.user || !recoveryCookie) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-12 text-archive-ivory sm:px-8">
        <DesignBackdrop />
        <div className="relative z-10 mx-auto max-w-sm">
          <Link href="/" className="mb-8 block text-center">
            <SiteLogo width={200} height={50} className="mx-auto" />
          </Link>
          <section className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury">
            <h1 className="font-serif text-2xl text-archive-ivory">
              This recovery session is missing or expired
            </h1>
            <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
              Request a fresh password reset email and use the newest link.
            </p>
            {params?.error ? (
              <p className="mt-4 rounded-md border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100">
                {params.error}
              </p>
            ) : null}
            <div className="mt-6 flex gap-3">
              <Link
                href="/forgot-password"
                className="rounded-full bg-archive-gold px-4 py-3 text-sm font-semibold text-archive-obsidian transition hover:bg-archive-champagne"
              >
                Request new reset email
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
              >
                Back to login
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-12 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-sm">
        <Link href="/" className="mb-8 block text-center">
          <SiteLogo width={200} height={50} className="mx-auto" />
        </Link>
        <form
          action={setNewPasswordAction}
          className="grid gap-5 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury"
        >
          <div>
            <h1 className="font-serif text-2xl text-archive-ivory">
              Set a new password
            </h1>
            <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
              Use this page only after opening your password reset email.
            </p>
          </div>
          {params?.error ? (
            <p className="rounded-md border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100">
              {params.error}
            </p>
          ) : null}
          {params?.success === "password-updated" ? (
            <p className="rounded-md border border-archive-gold/20 bg-archive-gold/10 px-4 py-3 text-sm font-semibold text-archive-gold">
              Your password was updated.
            </p>
          ) : null}
          <PasswordFields
            passwordName="newPassword"
            confirmName="confirmPassword"
            passwordLabel="New password"
            confirmLabel="Confirm new password"
            passwordPlaceholder="Create a new password"
            confirmPlaceholder="Confirm your new password"
            autoComplete="new-password"
            confirmAutoComplete="new-password"
          />
          <FormButton
            pendingText="Updating password..."
            className="rounded-full bg-archive-gold px-4 py-3 text-sm font-semibold text-archive-obsidian transition hover:bg-archive-champagne disabled:cursor-not-allowed disabled:opacity-60"
          >
            Set New Password
          </FormButton>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
          >
            Request a fresh password reset email
          </Link>
        </form>
      </div>
    </main>
  );
}
