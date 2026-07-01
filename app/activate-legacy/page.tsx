import Link from "next/link";
import { submitLegacyActivationAction } from "@/app/activate-legacy/actions";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";

export const dynamic = "force-dynamic";

type ActivateLegacyPageProps = {
  searchParams?: Promise<{
    error?: string;
    submitted?: string;
  }>;
};

export default async function ActivateLegacyPage({
  searchParams
}: ActivateLegacyPageProps) {
  const params = await searchParams;
  const submitted = params?.submitted === "1";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto max-w-3xl">
        <nav className="flex items-center justify-between border-b border-archive-gold/18 pb-5">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
          >
            Sign In
          </Link>
        </nav>

        <section className="py-14 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            Legacy Activation
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-archive-ivory sm:text-6xl">
            Begin a memorial review.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-archive-ivory/68 sm:text-base sm:leading-8">
            Use this private code only if the archive owner can no longer
            update their archive. The request is reviewed before an archive is
            transitioned into memorial mode.
          </p>
        </section>

        {submitted ? (
          <section className="rounded-[2rem] border border-emerald-300/20 bg-emerald-400/10 p-8 shadow-luxury">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
              Request Received
            </p>
            <h2 className="mt-3 font-serif text-3xl text-archive-ivory">
              The archive is Pending Memorial Review.
            </h2>
            <p className="mt-4 text-sm leading-7 text-archive-ivory/68">
              The code has been marked as used. The archive owner or an admin
              can review the request before the memorial transition is
              completed.
            </p>
          </section>
        ) : (
          <form
            action={submitLegacyActivationAction}
            className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8"
          >
            {params?.error ? (
              <p className="mb-6 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {params.error}
              </p>
            ) : null}

            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-archive-gold">
                Legacy Activation Code
              </span>
              <input
                name="code"
                required
                placeholder="TLA-8M4Q-K2PX-91DF"
                className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 font-mono text-sm uppercase tracking-[0.16em] text-archive-ivory outline-none focus:border-archive-gold"
              />
            </label>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-archive-gold">
                  Your Name
                </span>
                <input
                  name="requesterName"
                  required
                  className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none focus:border-archive-gold"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-archive-gold">
                  Relationship
                </span>
                <input
                  name="relationshipToOwner"
                  required
                  placeholder="Daughter, spouse, executor"
                  className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none focus:border-archive-gold"
                />
              </label>
            </div>

            <label className="mt-5 grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-archive-gold">
                Optional Message
              </span>
              <textarea
                name="message"
                rows={5}
                placeholder="Share what happened and how you are connected to the archive owner."
                className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-sm leading-6 text-archive-ivory outline-none focus:border-archive-gold"
              />
            </label>

            <button
              type="submit"
              className="mt-7 rounded-full bg-archive-gold px-7 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Submit for Review
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
