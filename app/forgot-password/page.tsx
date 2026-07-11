import Link from "next/link";
import { requestPasswordResetAction } from "./actions";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { FormButton } from "@/components/auth/FormButton";
import { getAccountContext } from "@/lib/account";

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams?: Promise<{ message?: string; success?: string }>;
}) {
  const params = await searchParams;
  const account = await getAccountContext();

  if (account.user) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-12 text-archive-ivory sm:px-8">
        <DesignBackdrop />
        <div className="relative z-10 mx-auto max-w-sm">
          <Link href="/" className="mb-8 block text-center">
            <SiteLogo width={200} height={50} className="mx-auto" />
          </Link>
          <section className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury">
            <h1 className="font-serif text-2xl text-archive-ivory">
              You are already signed in
            </h1>
            <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
              Use Profile Settings to change your password while you are signed in.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/dashboard/settings"
                className="rounded-full bg-archive-gold px-4 py-3 text-sm font-semibold text-archive-obsidian transition hover:bg-archive-champagne"
              >
                Go to settings
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
          action={requestPasswordResetAction}
          className="grid gap-5 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury"
        >
          <div>
            <h1 className="font-serif text-2xl text-archive-ivory">
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
              Enter your email and we&apos;ll send password reset instructions if an account exists.
            </p>
          </div>
          {params?.message ? (
            <p className="rounded-md border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100">
              {params.message}
            </p>
          ) : null}
          {params?.success === "sent" ? (
            <p className="rounded-md border border-archive-gold/20 bg-archive-gold/10 px-4 py-3 text-sm font-semibold text-archive-gold">
              If an account exists for that email, we sent password reset instructions.
            </p>
          ) : null}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-archive-ivory">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-archive-ivory outline-none transition placeholder:text-archive-ivory/36 focus:border-archive-gold"
            />
          </label>
          <FormButton
            pendingText="Sending email..."
            className="rounded-full bg-archive-gold px-4 py-3 text-sm font-semibold text-archive-obsidian transition hover:bg-archive-champagne disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send Password Reset Email
          </FormButton>
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <Link href="/login" className="font-semibold text-archive-champagne underline-offset-4 hover:underline">
              Return to login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
