import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "./actions";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { FormButton } from "@/components/auth/FormButton";
import {
  ArchiveOverlayRegion,
  ArchiveScene
} from "@/components/archive-building/ArchiveBuildingShell";
import { getAccountContext } from "@/lib/account";
import { archiveBuildingScenes } from "@/lib/archive-building-scenes";

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

  const renderLoginForm = (className: string) => (
    <form className={className}>
      {resolvedSearchParams?.next ? (
        <input type="hidden" name="next" value={resolvedSearchParams.next} />
      ) : null}
      <div>
        <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-archive-gold">
          Welcome
        </p>
        <h1 className="mt-2 whitespace-nowrap font-serif text-[clamp(1.35rem,1.65vw,1.95rem)] leading-none text-archive-ivory">
          Enter The Life Archive
        </h1>
        <p className="mx-auto mt-2 w-fit text-center text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-archive-ivory/62">
          Your Legacy Starts Here
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
      <label className="relative block">
        <span className="sr-only">Email</span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-archive-ivory"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-2xl border border-archive-gold/20 bg-archive-obsidian py-3 pl-11 pr-4 text-base text-archive-ivory outline-none transition placeholder:text-archive-ivory/46 focus:border-archive-gold"
        />
      </label>
      <div className="grid gap-2">
        <label className="relative block">
          <span className="sr-only">Password</span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-archive-ivory"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            minLength={10}
            maxLength={128}
            className="w-full rounded-2xl border border-archive-gold/20 bg-archive-obsidian py-3 pl-11 pr-4 text-base text-archive-ivory outline-none transition placeholder:text-archive-ivory/46 focus:border-archive-gold"
          />
        </label>
        <Link
          href="/forgot-password"
          className="justify-self-end text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
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
        <div className="flex items-center gap-3 text-archive-ivory/42">
          <span className="h-px flex-1 bg-archive-gold/14" />
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em]">
            ---OR---
          </span>
          <span className="h-px flex-1 bg-archive-gold/14" />
        </div>
        <Link
          href="/legacy-question"
          className="rounded-full bg-black/70 px-4 py-3 text-center text-sm font-semibold text-archive-ivory transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
        >
          Create Your Archive
        </Link>
      </div>
    </form>
  );

  const desktopLoginForm = renderLoginForm(
    "grid h-full w-full content-center gap-4 overflow-hidden rounded-[1.6rem] bg-black/28 p-6 text-archive-ivory shadow-[inset_0_0_56px_rgba(0,0,0,0.34)] backdrop-blur-md"
  );
  const mobileLoginForm = renderLoginForm(
    "grid gap-5 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury"
  );

  return (
    <>
      <ArchiveScene
        image={{ ...archiveBuildingScenes.login, priority: true }}
        sceneLabel="The Life Archive sign in scene"
      >
        <ArchiveOverlayRegion
          region={{ left: 38.87, top: 29, width: 22.2, height: 61.5 }}
          ariaLabel="Sign in form"
        >
          {desktopLoginForm}
        </ArchiveOverlayRegion>
      </ArchiveScene>

      <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-12 text-archive-ivory sm:px-8 lg:hidden">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-sm">
        <Link href="/" className="mb-8 block text-center">
          <SiteLogo width={200} height={50} className="mx-auto" />
        </Link>
        {mobileLoginForm}
      </div>
      </main>
    </>
  );
}
