import Link from "next/link";
import { loginAction, signupAction } from "./actions";

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="min-h-screen px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-sm">
        <Link href="/" className="mb-8 block text-center text-lg font-semibold text-archive-ink">
          The Life Archive
        </Link>
        <form className="rounded-lg border border-archive-ink/10 bg-white/82 p-6 shadow-soft grid gap-5">
          <div>
            <h1 className="font-serif text-2xl text-archive-ink">
              Continue your archive
            </h1>
            <p className="mt-2 text-sm leading-6 text-archive-ink/68">
              Sign in to return to your archives, or create an account to begin.
            </p>
          </div>
          {searchParams?.error ? (
            <p className="rounded-md border border-archive-clay/20 bg-archive-clay/10 px-4 py-3 text-sm font-semibold text-archive-clay">
              {searchParams.error}
            </p>
          ) : null}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-archive-ink">Email</span>
            <input
              name="email"
              type="email"
              required
              className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-archive-ink">Password</span>
            <input
              name="password"
              type="password"
              required
              className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
            />
          </label>
          <div className="flex gap-3">
            <button
              formAction={loginAction}
              className="flex-1 rounded-full bg-archive-clay px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-archive-ink"
            >
              Sign In
            </button>
            <button
              formAction={signupAction}
              className="flex-1 rounded-full border border-archive-ink/15 bg-white px-4 py-3 text-sm font-semibold text-archive-ink transition hover:bg-archive-linen"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
