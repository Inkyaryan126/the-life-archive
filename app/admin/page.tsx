import Link from "next/link";
import { redirect } from "next/navigation";
import { updateOrderAction } from "@/app/admin/actions";
import { getAdminAccess } from "@/lib/admin";
import {
  fulfillmentStatuses,
  listKeepsakeOrders,
  type KeepsakeOrder
} from "@/lib/keepsake-orders";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";

export const dynamic = "force-dynamic";

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amount / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function getStatusClass(status: KeepsakeOrder["fulfillmentStatus"]) {
  if (status === "Completed") {
    return "border-emerald-300/35 text-emerald-200";
  }

  if (status === "Shipped") {
    return "border-sky-300/35 text-sky-200";
  }

  if (status === "In Production") {
    return "border-archive-gold/45 text-archive-gold";
  }

  return "border-archive-gold/25 text-archive-champagne";
}

function OrderCard({ order }: { order: KeepsakeOrder }) {
  return (
    <article className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 shadow-luxury">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${getStatusClass(
                order.fulfillmentStatus
              )}`}
            >
              {order.fulfillmentStatus}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-ivory/45">
              {order.paymentStatus}
            </span>
          </div>
          <h2 className="mt-4 font-serif text-2xl leading-tight text-archive-ivory">
            {order.productName}
          </h2>
          <p className="mt-2 text-sm text-archive-ivory/68">
            {order.customerEmail || "No customer email"}
          </p>
          <p className="mt-1 text-xs text-archive-ivory/48">
            {formatDate(order.createdAt)} · {order.stripeSessionId}
          </p>
        </div>
        <div className="text-left lg:text-right">
          <p className="font-serif text-3xl text-archive-gold">
            {formatAmount(order.amountPaid, order.currency)}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 lg:justify-end">
            {order.stripeSessionUrl ? (
              <a
                href={order.stripeSessionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-archive-champagne underline-offset-4 hover:underline"
              >
                Open in Stripe
              </a>
            ) : null}
            {order.archiveSlug ? (
              <Link
                href={`/archive/${order.archiveSlug}`}
                className="text-xs font-semibold text-archive-champagne underline-offset-4 hover:underline"
              >
                Open archive
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <form action={updateOrderAction} className="mt-6 grid gap-4 lg:grid-cols-[16rem_1fr_auto] lg:items-end">
        <input type="hidden" name="orderId" value={order.id} />
        <label className="grid gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
            Fulfillment
          </span>
          <select
            name="fulfillmentStatus"
            defaultValue={order.fulfillmentStatus}
            className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none focus:border-archive-gold"
          >
            {fulfillmentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
            Notes
          </span>
          <textarea
            name="notes"
            defaultValue={order.notes}
            rows={2}
            className="min-h-12 rounded-xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none focus:border-archive-gold"
            placeholder="Personalization, production, shipping, or follow-up notes"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-archive-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
        >
          Update
        </button>
      </form>
    </article>
  );
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();

  if (!account.user) {
    redirect("/login?next=%2Fadmin");
  }

  const params = await searchParams;

  if (!adminEmailsConfigured || !isAdmin) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
        <DesignBackdrop />
        <div className="relative z-10 mx-auto max-w-3xl">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <section className="mt-16 rounded-2xl border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              Admin
            </p>
            <h1 className="mt-4 font-serif text-4xl text-archive-ivory">
              Access not available.
            </h1>
            <p className="mt-4 text-sm leading-7 text-archive-ivory/68">
              This page is limited to emails listed in ADMIN_EMAILS.
            </p>
          </section>
        </div>
      </main>
    );
  }

  let orders: KeepsakeOrder[] = [];
  let loadError: string | null = null;

  try {
    orders = await listKeepsakeOrders();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load orders.";
  }

  const newOrders = orders.filter((order) => order.fulfillmentStatus === "New");

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl">
        <nav className="flex flex-col gap-4 border-b border-archive-gold/18 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-archive-champagne">
            <Link href="/dashboard" className="underline-offset-4 hover:underline">
              Dashboard
            </Link>
            <Link href="/keepsakes" className="underline-offset-4 hover:underline">
              Keepsake Store
            </Link>
          </div>
        </nav>

        <header className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            Keepsake Fulfillment
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
            Orders
          </h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-archive-ivory/48">
                New orders
              </p>
              <p className="mt-3 font-serif text-4xl text-archive-gold">
                {newOrders.length}
              </p>
            </div>
            <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-archive-ivory/48">
                Total orders
              </p>
              <p className="mt-3 font-serif text-4xl text-archive-gold">
                {orders.length}
              </p>
            </div>
            <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-archive-ivory/48">
                Signed in as
              </p>
              <p className="mt-3 text-sm text-archive-ivory/72">
                {account.user.email}
              </p>
            </div>
          </div>
        </header>

        {params?.success ? (
          <p className="mb-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Order updated.
          </p>
        ) : null}

        {params?.error ? (
          <p className="mb-6 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
            {params.error}
          </p>
        ) : null}

        {loadError ? (
          <section className="rounded-2xl border border-red-300/20 bg-red-400/10 p-6 text-sm text-red-100">
            {loadError}
          </section>
        ) : null}

        {!loadError && orders.length === 0 ? (
          <section className="rounded-2xl border border-archive-gold/18 bg-white/[0.025] p-8 text-center shadow-luxury">
            <h2 className="font-serif text-3xl text-archive-ivory">
              No keepsake orders yet.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-archive-ivory/64">
              Successful Stripe Checkout sessions will appear here after the webhook records them.
            </p>
          </section>
        ) : null}

        {newOrders.length > 0 ? (
          <section className="mb-10">
            <h2 className="font-serif text-3xl text-archive-ivory">New orders</h2>
            <div className="mt-5 grid gap-5">
              {newOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        ) : null}

        {orders.length > newOrders.length ? (
          <section className="mb-16">
            <h2 className="font-serif text-3xl text-archive-ivory">All other orders</h2>
            <div className="mt-5 grid gap-5">
              {orders
                .filter((order) => order.fulfillmentStatus !== "New")
                .map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
