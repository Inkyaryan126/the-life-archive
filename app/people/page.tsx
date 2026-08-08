import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import { getPeopleSummaryForUser } from "@/lib/tla2-people-dashboard";
import { SiteLogo, DesignBackdrop } from "@/components/SiteDesign";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthenticatedMobileBottomNavigation } from "@/components/navigation/AuthenticatedMobileBottomNavigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your People — The Life Archive",
  description: "Manage memory gifts, recordings, advice, and physical keepsakes for the people who matter to you."
};

export default async function PeopleHubPage() {
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login?next=%2Fpeople");
  }

  const people = await getPeopleSummaryForUser(account.user.id);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0806] text-[#fdfbf7]">
      <DesignBackdrop />

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-[#c5a059]/15 bg-[#0a0806]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-3">
            <SiteLogo width={180} height={42} />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-[#fdfbf7]/80 md:flex">
            <Link href="/people" className="text-[#c5a059]">
              People
            </Link>

            <Link href="/keepsakes" className="transition hover:text-[#c5a059]">
              Keepsakes
            </Link>
            <Link href="/dashboard" className="transition hover:text-[#c5a059]">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/create/gift"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#c5a059] px-5 text-xs font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37]"
            >
              + Make Something
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-[#c5a059]/15 pb-8 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c5a059]">
              RELATIONSHIPS &amp; KEEPSAKES
            </span>
            <h1 className="mt-2 font-serif text-3xl font-normal text-[#fdfbf7] sm:text-5xl">
              Your People
            </h1>
            <p className="mt-2 text-sm text-[#fdfbf7]/70 sm:text-base">
              Everything you&apos;re building for the people who matter to you.
            </p>
          </div>

          <Link
            href="/create/gift"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#c5a059] px-6 text-sm font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37]"
          >
            + Make Something for Someone
          </Link>
        </div>

        {/* Empty State */}
        {people.length === 0 ? (
          <div className="my-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#c5a059]/15 text-3xl">
              💛
            </div>
            <h2 className="mt-6 font-serif text-2xl font-normal text-[#fdfbf7] sm:text-3xl">
              Who do you want to make something for?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#fdfbf7]/70">
              Record voice notes, stories, advice, and future messages connected to a physical keepsake.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/create/gift"
                className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#c5a059] px-8 text-base font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37] sm:w-auto"
              >
                Make Something for Someone &rarr;
              </Link>
              <Link
                href="/create"
                className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-[#c5a059]/40 bg-white/[0.04] px-8 text-base font-semibold text-[#fdfbf7] backdrop-blur-sm transition hover:border-[#c5a059] hover:bg-white/[0.08] sm:w-auto"
              >
                Build Something for Myself
              </Link>
            </div>
          </div>
        ) : (
          /* People Grid */
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <div
                key={person.id}
                className="flex flex-col justify-between rounded-3xl border border-[#c5a059]/25 bg-white/[0.035] p-6 shadow-luxury backdrop-blur-md transition hover:border-[#c5a059]/50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c5a059]/20 text-xl font-serif font-bold text-[#c5a059]">
                        {person.personName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-serif text-xl font-medium text-[#fdfbf7]">
                          {person.personName}
                        </h2>
                        <span className="text-xs uppercase tracking-wider text-[#c5a059]">
                          {person.relationshipType}
                          {person.isMemorial ? " • In Memory" : ""}
                        </span>
                      </div>
                    </div>

                    {person.isSelf ? (
                      <span className="rounded-full bg-[#c5a059]/20 px-2.5 py-1 text-[10px] font-bold text-[#c5a059]">
                        MYSELF
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 space-y-2.5 border-t border-[#c5a059]/15 pt-4 text-xs text-[#fdfbf7]/75">
                    <div className="flex items-center justify-between">
                      <span>Messages &amp; Memories</span>
                      <span className="font-semibold text-[#fdfbf7]">
                        {person.messageCount} message{person.messageCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Future Surprises</span>
                      <span className="font-semibold text-[#c5a059]">
                        {person.futureSurprisesCount} waiting
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Keepsake Status</span>
                      <span className="font-semibold text-[#fdfbf7]/90">
                        {person.keepsakeStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 pt-2">
                  <Link
                    href={`/people/${person.id}`}
                    className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full bg-[#c5a059] px-4 text-xs font-bold text-[#0a0806] transition hover:bg-[#d4af37]"
                  >
                    Open Control Center &rarr;
                  </Link>

                  <Link
                    href={`/keepsakes?connectionId=${person.id}&name=${encodeURIComponent(person.personName)}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#c5a059]/30 bg-white/[0.04] px-4 text-xs font-semibold text-[#fdfbf7] hover:bg-white/[0.08]"
                  >
                    Keepsake
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SiteFooter signedIn={true} />
      <AuthenticatedMobileBottomNavigation />
    </main>
  );
}
