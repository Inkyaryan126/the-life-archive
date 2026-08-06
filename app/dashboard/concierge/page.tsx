import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthenticatedMobileBottomNavigation } from "@/components/navigation/AuthenticatedMobileBottomNavigation";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";
import { listCustomerConciergeOrders } from "@/lib/archive-concierge";
import { archiveConciergePackages } from "@/lib/archive-concierge-config";
import { signOutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}

export default async function ConciergeDashboardPage() {
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login?next=%2Fdashboard%2Fconcierge");
  }

  const orders = await listCustomerConciergeOrders();

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-[96rem] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <AppSidebar
          active="concierge"
          archiveSlug={account.defaultArchive?.slug ?? null}
          archiveName={account.defaultArchive?.archiveName ?? null}
          archivePersonName={account.defaultArchive?.personName ?? null}
          showArchiveActions={Boolean(account.defaultArchive?.slug)}
        />

        <div className="min-w-0 pb-24">
          <nav className="flex flex-col gap-4 border-b border-archive-gold/20 pb-5 sm:flex-row sm:items-center sm:justify-between lg:hidden">
            <Link href="/" className="block">
              <SiteLogo width={220} height={54} />
            </Link>
            <form action={signOutAction}>
              <button className="rounded-full border border-archive-gold/35 px-4 py-2 text-sm font-semibold text-archive-ivory">
                Sign Out
              </button>
            </form>
          </nav>

          <header className="py-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
              Archive Concierge
            </p>
            <h1 className="mt-3 font-serif text-4xl text-archive-ivory sm:text-5xl">
              Concierge Orders
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-archive-ivory/68">
              Track your done-for-you archive projects, material intake, review status,
              keepsakes, and approval progress.
            </p>
            <Link
              href="/archive-concierge/start"
              className="mt-6 inline-flex rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Start Another Archive
            </Link>
          </header>

          <section className="grid gap-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border border-archive-gold/14 bg-white/[0.035] p-5 shadow-luxury"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="font-mono text-xs text-archive-gold">
                        {order.orderNumber}
                      </p>
                      <h2 className="mt-2 font-serif text-3xl text-archive-ivory">
                        {order.archiveSubjectName}
                      </h2>
                      <p className="mt-2 text-sm capitalize text-archive-ivory/64">
                        {order.archiveType} archive ·{" "}
                        {archiveConciergePackages[order.packageKey].displayName}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/concierge/${order.id}`}
                      className="inline-flex shrink-0 rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne"
                    >
                      View Order
                    </Link>
                  </div>
                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-xl bg-black/24 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
                        Status
                      </p>
                      <p className="mt-1 capitalize text-archive-ivory/78">
                        {formatStatus(order.status)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/24 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
                        Deadline
                      </p>
                      <p className="mt-1 text-archive-ivory/78">
                        {formatDate(order.memorialDeadline)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/24 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
                        Created
                      </p>
                      <p className="mt-1 text-archive-ivory/78">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-archive-gold/22 bg-white/[0.025] p-8 text-center">
                <h2 className="font-serif text-3xl text-archive-ivory">
                  No Concierge orders yet.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-archive-ivory/64">
                  Start an Archive Concierge intake when you want help turning boxes,
                  drives, photos, recordings, and documents into a completed archive.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      <AuthenticatedMobileBottomNavigation
        activeArchiveSlug={account.defaultArchive?.slug ?? null}
      />
    </main>
  );
}
