import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "./actions";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { FormButton } from "@/components/auth/FormButton";
import { PasswordFields } from "@/components/auth/PasswordFields";
import { getAccountContext } from "@/lib/account";

type LoginPageProps = {
  searchParams?: Promise<{
    confirmation?: string;
    error?: string;
    link?: string;
    next?: string;
    success?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const account = await getAccountContext();

  if (account.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-12 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-sm">
        <Link href="/" className="mb-8 block text-center">
          <SiteLogo width={200} height={50} className="mx-auto" />
        </Link>
        <form className="grid gap-5 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury">
          {resolvedSearchParams?.next ? (
            <input type="hidden" name="next" value={resolvedSearchParams.next} />
          ) : null}
          <div>
            <h1 className="font-serif text-2xl text-archive-ivory">Sign in</h1>
            <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
              Use your email and password to return to your archives.
            </p>
          </div>
          {resolvedSearchParams?.success === "password-updated" ? (
            <p className="rounded-md border border-archive-gold/20 bg-archive-gold/10 px-4 py-3 text-sm font-semibold text-archive-gold">
              Your password was updated. Sign in with your new password.
            </p>
          ) : null}
          {resolvedSearchParams?.error ? (
            <p className="rounded-md border border-archive-gold/20 bg-archive-gold/10 px-4 py-3 text-sm font-semibold text-archive-gold">
              {resolvedSearchParams.error}
            </p>
          ) : null}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-archive-ivory">Email</span>
            <input
              name="email"
              type="email"
              required
              className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
            />
          </label>
          <PasswordFields
            passwordName="password"
            includeConfirmation={false}
            passwordLabel="Password"
            passwordPlaceholder="Your password"
            autoComplete="current-password"
            passwordHelp="Use the password you created when you claimed your archive."
            showRequirements={false}
          />
          <div className="flex gap-3">
            <FormButton
              formAction={loginAction}
              pendingText="Signing in..."
              className="flex-1 rounded-full bg-archive-gold px-4 py-3 text-sm font-semibold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sign In
            </FormButton>
          </div>
          <div className="grid gap-3 text-sm">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
            <Link
              href="/setup-password"
              className="font-semibold text-archive-champagne underline-offset-4 hover:underline"
            >
              Never created a password? Set one up.
            </Link>
            <Link
              href="/legacy-question"
              className="font-semibold text-archive-ivory/76 underline-offset-4 hover:underline"
            >
              New here? Start a Life Archive.
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
