import Link from "next/link";
import { loginAction, signupAction } from "./actions";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";

type LoginPageProps = {
  searchParams?: Promise<{
    confirmation?: string;
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const confirmationPending = resolvedSearchParams?.confirmation === "pending";

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
            <h1 className="font-serif text-2xl text-archive-ivory">
              {confirmationPending ? "Check your email" : "Continue your archive"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
              {confirmationPending
                ? "We sent a confirmation link. After confirming your account, sign in here to create your first archive."
                : "Sign in to return to your archives, or create an account to begin."}
            </p>
          </div>
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
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-archive-ivory">Password</span>
            <input
              name="password"
              type="password"
              required
              className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
            />
          </label>
          <div className="flex gap-3">
            <button
              formAction={loginAction}
              className="flex-1 rounded-full bg-archive-gold px-4 py-3 text-sm font-semibold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Sign In
            </button>
            <button
              formAction={signupAction}
              className="flex-1 rounded-full border border-archive-gold/28 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
