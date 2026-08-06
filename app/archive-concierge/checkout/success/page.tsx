import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DesignBackdrop } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";
import { ArchiveConciergeError } from "@/lib/archive-concierge";
import { verifyArchiveConciergeCheckoutSuccess } from "@/lib/archive-concierge-payments";

export const dynamic = "force-dynamic";

export default async function ArchiveConciergeCheckoutSuccessPage({
  searchParams
}: {
  searchParams?: Promise<{ session_id?: string }>;
}) {
  const account = await getAccountContext();
  if (!account.user) {
    redirect("/login?next=%2Farchive-concierge%2Fcheckout%2Fsuccess");
  }

  const params = await searchParams;
  const sessionId = params?.session_id?.trim();
  if (!sessionId) {
    notFound();
  }

  let result: Awaited<ReturnType<typeof verifyArchiveConciergeCheckoutSuccess>>;
  try {
    result = await verifyArchiveConciergeCheckoutSuccess({ sessionId });
  } catch (error) {
    if (error instanceof ArchiveConciergeError) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-12 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <section className="relative z-10 mx-auto max-w-3xl rounded-2xl border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
          Archive Concierge
        </p>
        <h1 className="mt-4 font-serif text-4xl text-archive-ivory">
          Checkout received.
        </h1>
        {result.processing ? (
          <p className="mt-4 text-sm leading-7 text-archive-ivory/70">
            Stripe shows the payment succeeded, and your order is waiting for the verified
            webhook to finish updating the dashboard. This page does not mark an order paid
            from the URL alone.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-7 text-archive-ivory/70">
            Your order is ready for the next step. Payment confirmation and material
            instructions appear on the order page as processing completes.
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/concierge/${result.orderId}`}
            className="rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian"
          >
            View Concierge Order
          </Link>
          <Link
            href="/dashboard/concierge"
            className="rounded-full border border-archive-gold/30 px-5 py-3 text-sm font-bold text-archive-ivory"
          >
            All Concierge Orders
          </Link>
        </div>
      </section>
    </main>
  );
}
