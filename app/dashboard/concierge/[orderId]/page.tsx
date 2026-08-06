import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { FormButton } from "@/components/auth/FormButton";
import { AuthenticatedMobileBottomNavigation } from "@/components/navigation/AuthenticatedMobileBottomNavigation";
import { DesignBackdrop } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";
import { getCustomerConciergeOrder } from "@/lib/archive-concierge";
import {
  getMemorialPriorityAvailability,
  getPackageCheckoutAvailability,
  isMemorialPriorityEligible,
  isOrderPayable
} from "@/lib/archive-concierge-payment-rules";
import { archiveConciergePackages } from "@/lib/archive-concierge-config";

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

function formatMoney(amount: number | null, currency: string | null) {
  if (amount === null) return "Not recorded";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase()
  }).format(amount / 100);
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

export default async function ConciergeOrderDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ success?: string; checkout?: string; checkout_error?: string }>;
}) {
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login?next=%2Fdashboard%2Fconcierge");
  }

  const { orderId } = await params;
  const query = await searchParams;
  const order = await getCustomerConciergeOrder(orderId);

  if (!order) {
    notFound();
  }

  const pkg = archiveConciergePackages[order.packageKey];
  const packageCheckout = getPackageCheckoutAvailability(order.packageKey);
  const memorialPriorityEligible = isMemorialPriorityEligible(order);
  const memorialPriorityCheckout = getMemorialPriorityAvailability();
  const payable = isOrderPayable(order);

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
          <Link
            href="/dashboard/concierge"
            className="text-sm font-semibold text-archive-gold hover:text-archive-champagne"
          >
            Back to Concierge orders
          </Link>

          {query?.success === "created" ? (
            <p className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              Your Archive Concierge intake has been received.
            </p>
          ) : null}
          {query?.checkout === "canceled" ? (
            <p className="mt-5 rounded-2xl border border-archive-gold/25 bg-archive-gold/10 p-4 text-sm text-archive-ivory/78">
              Checkout was canceled. No completed payment was recorded, and you can resume below.
            </p>
          ) : null}
          {query?.checkout_error ? (
            <p className="mt-5 rounded-2xl border border-red-300/25 bg-red-400/10 p-4 text-sm text-red-100">
              {query.checkout_error}
            </p>
          ) : null}

          <header className="py-8">
            <p className="font-mono text-xs text-archive-gold">
              {order.orderNumber}
            </p>
            <h1 className="mt-3 font-serif text-4xl text-archive-ivory sm:text-5xl">
              {order.archiveSubjectName}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-8 text-archive-ivory/68">
              {pkg.displayName} · {order.archiveType === "memorial" ? "Memorial" : "Living"} archive ·{" "}
              <span className="capitalize">{formatStatus(order.status)}</span>
            </p>
          </header>

          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-5">
              <Panel title="Progress Timeline">
                <ol className="grid gap-3">
                  {order.statusHistory.length > 0 ? (
                    order.statusHistory.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-xl border border-archive-gold/12 bg-black/24 p-4"
                      >
                        <p className="text-sm font-semibold capitalize text-archive-ivory">
                          {formatStatus(item.newStatus)}
                        </p>
                        <p className="mt-1 text-xs text-archive-ivory/52">
                          {formatDate(item.createdAt)}
                        </p>
                        {item.note ? (
                          <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
                            {item.note}
                          </p>
                        ) : null}
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-archive-ivory/62">
                      Timeline entries will appear as your order moves through production.
                    </p>
                  )}
                </ol>
              </Panel>

              <Panel title="Revision Requests">
                {order.revisions.length > 0 ? (
                  <div className="grid gap-3">
                    {order.revisions.map((revision) => (
                      <div key={revision.id} className="rounded-xl bg-black/24 p-4">
                        <p className="text-sm leading-6 text-archive-ivory/74">
                          {revision.requestText}
                        </p>
                        <p className="mt-2 text-xs capitalize text-archive-gold">
                          {revision.status}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-archive-ivory/62">
                    Revision requests will appear here after your private review begins.
                  </p>
                )}
              </Panel>
            </div>

            <div className="grid gap-5">
              <Panel title="Payment">
                <div className="grid gap-4 text-sm leading-7 text-archive-ivory/72">
                  <div className="rounded-xl bg-black/24 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
                      Package
                    </p>
                    <p className="mt-1 font-semibold text-archive-ivory">
                      {pkg.displayName} · {pkg.displayPrice}
                    </p>
                    {pkg.paymentModel === "deposit" ? (
                      <p className="mt-2">
                        Project Deposit. The deposit begins project review and reserves
                        production capacity. It is applied according to the eventual project
                        quote and service terms, and it is not the final project total.
                        Additional payment may be required after materials are reviewed.
                      </p>
                    ) : (
                      <p className="mt-2">Full payment package.</p>
                    )}
                  </div>

                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-black/24 p-3">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
                        Payment status
                      </dt>
                      <dd className="mt-1 capitalize text-archive-ivory/76">
                        {formatStatus(order.paymentStatus)}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-black/24 p-3">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
                        Amount paid
                      </dt>
                      <dd className="mt-1 text-archive-ivory/76">
                        {formatMoney(order.amountPaid, order.currency)}
                      </dd>
                    </div>
                  </dl>

                  {order.paymentStatus === "checkout_pending" ? (
                    <p className="rounded-xl border border-archive-gold/18 bg-archive-gold/10 p-4">
                      Payment is processing or checkout is still open. If you already paid,
                      the verified Stripe webhook will update this order shortly.
                    </p>
                  ) : null}
                  {order.paymentStatus === "paid" ? (
                    <p className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-4 text-emerald-100">
                      Payment confirmed. Material submission instructions will appear here as
                      your order moves into intake.
                    </p>
                  ) : null}
                  {order.paymentStatus === "deposit_paid" ? (
                    <p className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-4 text-emerald-100">
                      Project deposit confirmed. The final project total will be determined
                      after collection review.
                    </p>
                  ) : null}

                  {memorialPriorityEligible && payable ? (
                    <div className="rounded-xl border border-archive-gold/18 bg-black/24 p-4">
                      <label className="flex items-start gap-3">
                        <input
                          form="archive-concierge-checkout-form"
                          name="memorialPriority"
                          type="checkbox"
                          disabled={!memorialPriorityCheckout.configured}
                          className="mt-1"
                        />
                        <span>
                          <strong className="block text-archive-ivory">
                            Memorial Priority Service
                          </strong>
                          <span>
                            Requests expedited handling. The deadline is reviewed after
                            payment and material intake. Purchasing it does not publish the
                            archive automatically and does not override missing materials or
                            family approval requirements.
                          </span>
                          {!memorialPriorityCheckout.configured ? (
                            <span className="mt-2 block text-archive-gold">
                              {memorialPriorityCheckout.message}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </div>
                  ) : null}

                  {!packageCheckout.configured ? (
                    <p className="rounded-xl border border-archive-gold/18 bg-archive-gold/10 p-4">
                      {packageCheckout.message} Your intake is still saved. We will contact you
                      with next steps, or you can request this package while checkout is being
                      configured.
                    </p>
                  ) : null}

                  {payable && packageCheckout.configured ? (
                    <form
                      id="archive-concierge-checkout-form"
                      action="/api/stripe/archive-concierge/checkout"
                      method="post"
                    >
                      <input type="hidden" name="orderId" value={order.id} />
                      <FormButton
                        pendingText="Opening checkout..."
                        className="w-full rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian"
                      >
                        Continue to Secure Checkout
                      </FormButton>
                    </form>
                  ) : null}
                  {!payable ? (
                    <p className="rounded-xl bg-black/24 p-4">
                      Checkout is closed for this order because payment is complete or the order
                      is no longer payable.
                    </p>
                  ) : null}
                </div>
              </Panel>

              <Panel title="Intake Summary">
                <dl className="grid gap-3 text-sm">
                  {[
                    ["Customer", order.customerName],
                    ["Email", order.customerEmail],
                    ["Phone", order.customerPhone ?? "Not provided"],
                    ["Package", pkg.displayName],
                    ["Material delivery", order.serviceMethod ? formatStatus(order.serviceMethod) : "Not set"],
                    ["Approximate item count", order.requestedItemCount?.toLocaleString("en-US") ?? "Not provided"],
                    ["Deadline", formatDate(order.memorialDeadline)],
                    ["Event type", order.eventType ?? "Not provided"]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-black/24 p-3">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
                        {label}
                      </dt>
                      <dd className="mt-1 text-archive-ivory/76">{value}</dd>
                    </div>
                  ))}
                </dl>
                {order.customerNotes ? (
                  <p className="mt-4 rounded-xl bg-black/24 p-4 text-sm leading-7 text-archive-ivory/70">
                    {order.customerNotes}
                  </p>
                ) : null}
              </Panel>

              <Panel title="Materials Summary">
                {order.materials.length > 0 ? (
                  <div className="grid gap-3">
                    {order.materials.map((material) => (
                      <div key={material.id} className="rounded-xl bg-black/24 p-4">
                        <p className="text-sm font-semibold capitalize text-archive-ivory">
                          {formatStatus(material.materialType)} · {material.quantity}
                        </p>
                        <p className="mt-1 text-xs text-archive-ivory/52">
                          {material.receivedAt ? `Received ${formatDate(material.receivedAt)}` : "Pending receipt"}
                        </p>
                        {material.customerDescription ? (
                          <p className="mt-2 text-sm leading-6 text-archive-ivory/68">
                            {material.customerDescription}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-archive-ivory/62">
                    Upload and drop-off instructions will appear after review or purchase.
                  </p>
                )}
              </Panel>

              <Panel title="Keepsake Summary">
                {order.keepsakes.length > 0 ? (
                  <div className="grid gap-3">
                    {order.keepsakes.map((keepsake) => (
                      <div key={keepsake.id} className="rounded-xl bg-black/24 p-4">
                        <p className="text-sm font-semibold text-archive-ivory">
                          {keepsake.keepsakeType} · {keepsake.quantity}
                        </p>
                        <p className="mt-1 text-xs capitalize text-archive-gold">
                          {formatStatus(keepsake.productionStatus)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-archive-ivory/62">
                    Keepsakes will be planned after your archive scope is confirmed.
                  </p>
                )}
              </Panel>

              <div className="rounded-2xl border border-archive-gold/18 bg-archive-gold/10 p-5 text-sm leading-7 text-archive-ivory/76">
                Submitted materials remain private during production. Private production work is
                not published without approval.
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthenticatedMobileBottomNavigation
        activeArchiveSlug={account.defaultArchive?.slug ?? null}
      />
    </main>
  );
}
