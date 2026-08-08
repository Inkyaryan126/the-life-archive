import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import { getPersonDetailForUser } from "@/lib/tla2-people-dashboard";
import { SiteLogo, DesignBackdrop } from "@/components/SiteDesign";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthenticatedMobileBottomNavigation } from "@/components/navigation/AuthenticatedMobileBottomNavigation";
import { PersonDetailClientView } from "./PersonDetailClientView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Person Control Center — The Life Archive",
  description: "Manage recordings, messages, future surprises, and physical keepsakes for a specific person."
};

export default async function PersonDetailPage({
  params
}: {
  params: Promise<{ connectionId: string }>;
}) {
  const account = await getAccountContext();
  if (!account.user) {
    redirect("/login");
  }

  const { connectionId } = await params;
  const result = await getPersonDetailForUser(connectionId, account.user.id);

  if (!result.ok) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#0a0806] px-4 py-16 text-center text-[#fdfbf7]">
        <DesignBackdrop />
        <div className="relative z-10 mx-auto max-w-md">
          <span className="text-4xl">⚠️</span>
          <h1 className="mt-4 font-serif text-2xl font-normal">Connection Not Found</h1>
          <p className="mt-2 text-sm text-[#fdfbf7]/70">{result.error}</p>
          <Link
            href="/people"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#c5a059] px-6 text-xs font-bold text-[#0a0806]"
          >
            Back to Your People
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0806] text-[#fdfbf7]">
      <DesignBackdrop />

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-[#c5a059]/15 bg-[#0a0806]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/people" className="inline-flex items-center gap-3">
            <SiteLogo width={180} height={42} />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-[#fdfbf7]/80 md:flex">
            <Link href="/people" className="transition hover:text-[#c5a059]">
              &larr; Back to Your People
            </Link>
            <Link href="/keepsakes" className="transition hover:text-[#c5a059]">
              Keepsakes
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href={`/keepsakes?connectionId=${result.detail.connection.id}&name=${encodeURIComponent(result.detail.connection.personName)}`}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#c5a059] px-5 text-xs font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37]"
            >
              Choose Keepsake &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Person Control Center Client View */}
      <PersonDetailClientView detail={result.detail} />

      <SiteFooter signedIn={true} />
      <AuthenticatedMobileBottomNavigation />
    </main>
  );
}
