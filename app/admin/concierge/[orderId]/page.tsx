import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { FormButton } from "@/components/auth/FormButton";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAdminAccess } from "@/lib/admin";
import { getAdminConciergeOrder } from "@/lib/archive-concierge";
import { getPackageCheckoutAvailability } from "@/lib/archive-concierge-payments";
import {
  archiveConciergeKeepsakeStatuses,
  archiveConciergeMaterialTypes,
  archiveConciergePackages,
  archiveConciergeStatuses
} from "@/lib/archive-concierge-config";
import {
  addConciergeKeepsakeAction,
  addConciergeMaterialAction,
  updateConciergeDetailsAction,
  updateConciergeStatusAction
} from "../actions";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "None";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}

function formatMoney(amount: number | null, currency: string | null) {
  if (amount === null) return "Not recorded";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase()
  }).format(amount / 100);
}

function AdminDenied() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-3xl">
        <Link href="/">
          <SiteLogo width={160} height={40} />
        </Link>
        <section className="mt-16 rounded-2xl border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury">
          <h1 className="font-serif text-4xl text-archive-ivory">
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

function Panel({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-archive-gold/14 bg-white/[0.035] p-5 shadow-luxury">
      <h2 className="font-serif text-2xl text-archive-ivory">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function AdminConciergeOrderPage({
  params,
  searchParams
}: {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();

  if (!account.user) {
    redirect("/login?next=%2Fadmin%2Fconcierge");
  }

  if (!adminEmailsConfigured || !isAdmin) {
    return <AdminDenied />;
  }

  const { orderId } = await params;
  const query = await searchParams;
  const order = await getAdminConciergeOrder(orderId);

  if (!order) {
    notFound();
  }

  const pkg = archiveConciergePackages[order.packageKey];
  const checkout = getPackageCheckoutAvailability(order.packageKey);

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl">
        <AdminNav currentPath="/admin/concierge" />

        <header className="py-8">
          <Link
            href="/admin/concierge"
            className="text-sm font-semibold text-archive-gold hover:text-archive-champagne"
          >
            Back to Concierge orders
          </Link>
          <p className="mt-6 font-mono text-xs text-archive-gold">
            {order.orderNumber}
          </p>
          <h1 className="mt-3 font-serif text-5xl text-archive-ivory">
            {order.archiveSubjectName}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-archive-ivory/66">
            {order.customerName} · {order.customerEmail} · {pkg.displayName} ·{" "}
            <span className="capitalize">{formatStatus(order.status)}</span>
          </p>
          {query?.error ? (
            <p className="mt-5 rounded-2xl border border-red-300/25 bg-red-400/10 p-4 text-sm text-red-100">
              {query.error}
            </p>
          ) : null}
          {query?.success ? (
            <p className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              Order updated.
            </p>
          ) : null}
        </header>

        <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-5">
            <Panel title="Customer Intake">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Customer", order.customerName],
                  ["Email", order.customerEmail],
                  ["Phone", order.customerPhone ?? "Not provided"],
                  ["Subject", order.archiveSubjectName],
                  ["Archive type", order.archiveType],
                  ["Package", pkg.displayName],
                  ["Service method", order.serviceMethod ? formatStatus(order.serviceMethod) : "Not set"],
                  ["Requested items", order.requestedItemCount?.toLocaleString("en-US") ?? "Not provided"],
                  ["Deadline", formatDate(order.memorialDeadline)],
                  ["Event type", order.eventType ?? "Not provided"],
                  ["Archive ID", order.archiveId ?? "Not linked"],
                  ["Customer ID", order.customerId ?? "No account link"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-black/24 p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words text-archive-ivory/76">{value}</dd>
                  </div>
                ))}
              </dl>
              {order.customerNotes ? (
                <p className="mt-4 rounded-xl bg-black/24 p-4 text-sm leading-7 text-archive-ivory/70">
                  {order.customerNotes}
                </p>
              ) : null}
            </Panel>

            <Panel title="Status History">
              <div className="grid gap-3">
                {order.statusHistory.map((item) => (
                  <div key={item.id} className="rounded-xl bg-black/24 p-4">
                    <p className="text-sm font-semibold capitalize text-archive-ivory">
                      {formatStatus(item.previousStatus ?? "new")} to {formatStatus(item.newStatus)}
                    </p>
                    <p className="mt-1 text-xs text-archive-ivory/50">
                      {formatDate(item.createdAt)}
                    </p>
                    {item.note ? (
                      <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
                        {item.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Materials">
              <div className="grid gap-3">
                {order.materials.map((material) => (
                  <div key={material.id} className="rounded-xl bg-black/24 p-4">
                    <p className="text-sm font-semibold capitalize text-archive-ivory">
                      {formatStatus(material.materialType)} · {material.quantity}
                    </p>
                    <p className="mt-1 text-xs text-archive-ivory/52">
                      {material.receivedAt ? `Received ${formatDate(material.receivedAt)}` : "Not received"}
                    </p>
                    {material.customerDescription ? (
                      <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
                        {material.customerDescription}
                      </p>
                    ) : null}
                  </div>
                ))}
                {order.materials.length === 0 ? (
                  <p className="text-sm text-archive-ivory/62">
                    No materials have been recorded yet.
                  </p>
                ) : null}
              </div>
            </Panel>
          </div>

          <div className="grid gap-5">
            <Panel title="Payment">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Payment status", formatStatus(order.paymentStatus)],
                  ["Payment model", order.paymentModel === "deposit" ? "Deposit" : "Full payment"],
                  ["Amount paid", formatMoney(order.amountPaid, order.currency)],
                  ["Currency", order.currency ?? order.paymentCurrency ?? "Not recorded"],
                  ["Paid at", formatDate(order.paidAt)],
                  ["Memorial Priority", order.memorialPriorityPurchased ? "Purchased" : "Not purchased"],
                  ["Memorial Priority amount", formatMoney(order.memorialPriorityAmount, order.currency)],
                  ["Checkout configured", checkout.configured ? "Yes" : checkout.message ?? "No"],
                  ["Checkout started", formatDate(order.checkoutStartedAt)],
                  ["Payment email sent", formatDate(order.paymentConfirmationSentAt)]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-black/24 p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words text-archive-ivory/76">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs leading-6 text-archive-ivory/52">
                Raw Stripe IDs are intentionally omitted from this view. Use server logs or
                Stripe Dashboard search when reconciliation is needed.
              </p>
            </Panel>

            <Panel title="Change Status">
              <form action={updateConciergeStatusAction} className="grid gap-3">
                <input type="hidden" name="orderId" value={order.id} />
                <select
                  name="status"
                  defaultValue={order.status}
                  className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-3 py-2 text-sm text-archive-ivory"
                >
                  {archiveConciergeStatuses.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
                <textarea
                  name="note"
                  rows={3}
                  placeholder="Customer-visible or internal status note"
                  className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-sm text-archive-ivory"
                />
                <label className="flex items-center gap-2 text-sm text-archive-ivory/70">
                  <input name="customerVisible" type="checkbox" defaultChecked />
                  Customer-visible note
                </label>
                <FormButton
                  pendingText="Updating..."
                  className="rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian"
                >
                  Update Status
                </FormButton>
              </form>
            </Panel>

            <Panel title="Admin Details">
              <form action={updateConciergeDetailsAction} className="grid gap-3">
                <input type="hidden" name="orderId" value={order.id} />
                <label className="grid gap-2 text-sm">
                  <span>Assigned admin user ID</span>
                  <input
                    name="assignedAdminId"
                    defaultValue={order.assignedAdminId ?? ""}
                    className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-archive-ivory"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>Received item count</span>
                  <input
                    name="receivedItemCount"
                    type="number"
                    min={0}
                    defaultValue={order.receivedItemCount}
                    className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-archive-ivory"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>Internal notes</span>
                  <textarea
                    name="internalNotes"
                    rows={5}
                    defaultValue={order.internalNotes ?? ""}
                    className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-archive-ivory"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-archive-ivory/70">
                  <input name="customerApproved" type="checkbox" />
                  Record customer approval
                </label>
                <FormButton
                  pendingText="Saving..."
                  className="rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian"
                >
                  Save Details
                </FormButton>
              </form>
            </Panel>

            <Panel title="Record Material">
              <form action={addConciergeMaterialAction} className="grid gap-3">
                <input type="hidden" name="orderId" value={order.id} />
                <select
                  name="materialType"
                  className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-3 py-2 text-sm text-archive-ivory"
                >
                  {archiveConciergeMaterialTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatStatus(type)}
                    </option>
                  ))}
                </select>
                <input
                  name="originalName"
                  placeholder="Original name or label"
                  className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-sm text-archive-ivory"
                />
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-sm text-archive-ivory"
                />
                <textarea
                  name="customerDescription"
                  rows={2}
                  placeholder="Customer-visible description"
                  className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-sm text-archive-ivory"
                />
                <textarea
                  name="internalNotes"
                  rows={2}
                  placeholder="Internal material notes"
                  className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-sm text-archive-ivory"
                />
                <label className="flex items-center gap-2 text-sm text-archive-ivory/70">
                  <input name="received" type="checkbox" />
                  Mark received now
                </label>
                <FormButton
                  pendingText="Adding..."
                  className="rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian"
                >
                  Add Material
                </FormButton>
              </form>
            </Panel>

            <Panel title="Plan Keepsake">
              <form action={addConciergeKeepsakeAction} className="grid gap-3">
                <input type="hidden" name="orderId" value={order.id} />
                <input
                  name="keepsakeType"
                  placeholder="Keepsake type"
                  className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-sm text-archive-ivory"
                />
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-sm text-archive-ivory"
                />
                <input
                  name="engravingText"
                  placeholder="Engraving text"
                  className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-sm text-archive-ivory"
                />
                <select
                  name="productionStatus"
                  defaultValue="planned"
                  className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-3 py-2 text-sm text-archive-ivory"
                >
                  {archiveConciergeKeepsakeStatuses.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
                <textarea
                  name="internalNotes"
                  rows={2}
                  placeholder="Internal keepsake notes"
                  className="rounded-xl border border-archive-gold/20 bg-black/35 px-3 py-2 text-sm text-archive-ivory"
                />
                <FormButton
                  pendingText="Adding..."
                  className="rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian"
                >
                  Add Keepsake
                </FormButton>
              </form>
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}
