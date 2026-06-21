import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import { signOutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

type DashboardActionProps = {
  description: string;
  href: string;
  label: string;
  primary?: boolean;
};

function DashboardAction({
  description,
  href,
  label,
  primary = false
}: DashboardActionProps) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-5 transition sm:p-6 ${
        primary
          ? "border-archive-gold/60 bg-archive-gold text-archive-obsidian shadow-luxury hover:bg-archive-champagne"
          : "border-archive-gold/25 bg-white/[0.045] text-archive-ivory hover:border-archive-gold/60 hover:bg-white/[0.075]"
      }`}
    >
      <span className="font-serif text-2xl">{label}</span>
      <span
        className={`mt-2 block text-sm leading-6 ${
          primary ? "text-archive-obsidian/70" : "text-archive-ivory/58"
        }`}
      >
        {description}
      </span>
      <span
        aria-hidden="true"
        className="mt-5 block text-sm font-semibold transition-transform group-hover:translate-x-1"
      >
        Continue →
      </span>
    </Link>
  );
}

export default async function DashboardPage() {
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login");
  }

  const { archive, user } = account;
  const memberSince = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(new Date(user.createdAt));

  return (
    <main className="min-h-screen bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,161,91,0.16),transparent_30rem),radial-gradient(circle_at_bottom_right,rgba(198,161,91,0.07),transparent_36rem)]" />

      <nav className="relative mx-auto flex max-w-6xl items-center justify-between border-b border-archive-gold/20 pb-5">
        <Link href="/" className="font-serif text-lg tracking-wide">
          The Life Archive
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/member-card"
            className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
          >
            Member Card
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-archive-gold/35 px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/5"
            >
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <div className="relative mx-auto max-w-6xl pb-20 pt-12 sm:pt-16">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            Your archive home
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">
            Welcome back.
          </h1>
          <p className="mt-4 text-base leading-7 text-archive-ivory/62 sm:text-lg">
            Keep the stories that matter close, and make sure the people you
            love can find them when they need them.
          </p>
        </header>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1fr_0.62fr]">
          <div className="rounded-2xl border border-archive-gold/25 bg-white/[0.045] p-6 shadow-luxury sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                  Archive status
                </p>
                <h2 className="mt-3 font-serif text-3xl">
                  {archive ? archive.archiveName : "Ready to begin"}
                </h2>
              </div>
              <span className="rounded-full border border-archive-gold/30 bg-archive-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-archive-champagne">
                {archive ? "Active" : "Not created"}
              </span>
            </div>

            {account.archiveLookupFailed ? (
              <p className="mt-5 rounded-xl border border-archive-gold/25 bg-archive-gold/10 px-4 py-3 text-sm leading-6 text-archive-champagne">
                Archive status could not be loaded. Refresh before creating a
                new archive.
              </p>
            ) : archive ? (
              <dl className="mt-7 grid gap-5 border-t border-archive-gold/15 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-archive-ivory/42">
                    Person
                  </dt>
                  <dd className="mt-2 text-sm font-semibold">
                    {archive.personName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-archive-ivory/42">
                    Visibility
                  </dt>
                  <dd className="mt-2 text-sm font-semibold capitalize">
                    {archive.visibility}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-5 max-w-2xl text-sm leading-7 text-archive-ivory/58">
                Create your first archive to unlock memory entry and printable
                archive QR tools.
              </p>
            )}
          </div>

          <aside className="rounded-2xl border border-archive-gold/20 bg-archive-ivory p-6 text-archive-obsidian sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
              Account status
            </p>
            <p className="mt-4 break-all text-sm font-semibold">{user.email}</p>
            <dl className="mt-6 grid gap-5 border-t border-archive-gold/30 pt-5">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-archive-obsidian/60">Email</dt>
                <dd className="text-sm font-semibold">
                  {user.emailConfirmed ? "Confirmed" : "Pending"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-archive-obsidian/60">
                  Member since
                </dt>
                <dd className="text-sm font-semibold">{memberSince}</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
                Quick actions
              </p>
              <h2 className="mt-2 font-serif text-3xl">What would you like to do?</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {archive ? (
              <>
                <DashboardAction
                  href={`/archive/${archive.slug}`}
                  label="My Archive"
                  description="Open your archive and browse what you have preserved."
                  primary
                />
                <DashboardAction
                  href={`/archive/${archive.slug}/add-memory`}
                  label="Add Memory"
                  description="Preserve a story, lesson, song, photo, or voice note."
                />
                <DashboardAction
                  href="/member-card"
                  label="Member Card"
                  description="Return to your wallet card and print another copy."
                />
                <DashboardAction
                  href={`/archive/${archive.slug}/qr`}
                  label="Print QR Card"
                  description="Print the QR card that opens your archive experience."
                />
              </>
            ) : account.archiveLookupFailed ? (
              <DashboardAction
                href="/member-card"
                label="Member Card"
                description="View or print your official Life Archive member card."
                primary
              />
            ) : (
              <>
                <DashboardAction
                  href="/create"
                  label="Create My Archive"
                  description="Create your archive before adding memories or printing its QR card."
                  primary
                />
                <DashboardAction
                  href="/member-card"
                  label="Member Card"
                  description="View or print your official Life Archive member card."
                />
              </>
            )}
          </div>

          {!archive && !account.archiveLookupFailed ? (
            <p className="mt-5 text-sm leading-6 text-archive-ivory/48">
              Add Memory and Print QR Card will appear here after your archive
              is created.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
