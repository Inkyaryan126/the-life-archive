import Link from "next/link";
import { redirect } from "next/navigation";
import { DesignBackdrop } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

export default async function ArchiveConciergeCheckoutCancelPage({
  searchParams
}: {
  searchParams?: Promise<{ order?: string }>;
}) {
  const account = await getAccountContext();
  if (!account.user) {
    redirect("/login?next=%2Farchive-concierge%2Fcheckout%2Fcancel");
  }

  const params = await searchParams;
  const orderId = params?.order?.trim() || null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-12 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <section className="relative z-10 mx-auto max-w-3xl rounded-2xl border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
          Archive Concierge
        </p>
        <h1 className="mt-4 font-serif text-4xl text-archive-ivory">
          Checkout was not completed.
        </h1>
        <p className="mt-4 text-sm leading-7 text-archive-ivory/70">
          No completed payment was recorded, and your Archive Concierge order remains
          available. You can return to the order page to review the package and resume
          checkout without creating a new order.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={orderId ? `/dashboard/concierge/${orderId}?checkout=canceled` : "/dashboard/concierge"}
            className="rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian"
          >
            Return to Order
          </Link>
          <Link
            href="/dashboard/concierge"
            className="rounded-full border border-archive-gold/30 px-5 py-3 text-sm font-bold text-archive-ivory"
          >
            Concierge Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
