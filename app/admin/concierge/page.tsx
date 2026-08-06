import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAdminAccess } from "@/lib/admin";
import { listAdminConciergeOrders } from "@/lib/archive-concierge";
import {
  archiveConciergePackages,
  archiveConciergePaymentStatuses,
  archiveConciergeStatuses
} from "@/lib/archive-concierge-config";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

function formatDate(value: string | null) {
  if (!value) return "None";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
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

export default async function AdminConciergePage({
  searchParams
}: {
  searchParams?: Promise<{
    status?: string;
    package?: string;
    archiveType?: string;
    rush?: string;
    upcomingDeadlines?: string;
    waitingOnCustomer?: string;
    waitingForApproval?: string;
    paymentStatus?: string;
    memorialPriority?: string;
  }>;
}) {
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();

  if (!account.user) {
    redirect("/login?next=%2Fadmin%2Fconcierge");
  }

  if (!adminEmailsConfigured || !isAdmin) {
    return <AdminDenied />;
  }

  const params = await searchParams;
  const orders = await listAdminConciergeOrders({
    status: params?.status ?? null,
    packageKey: params?.package ?? null,
    archiveType: params?.archiveType ?? null,
    rush: params?.rush === "1",
    upcomingDeadlines: params?.upcomingDeadlines === "1",
    waitingOnCustomer: params?.waitingOnCustomer === "1",
    waitingForApproval: params?.waitingForApproval === "1",
    paymentStatus: params?.paymentStatus ?? null,
    memorialPriority: params?.memorialPriority === "1"
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl">
        <AdminNav currentPath="/admin/concierge" />

        <header className="py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            Archive Concierge
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
            Concierge Orders
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-archive-ivory/66">
            Manage done-for-you archive intake, materials, production status, approvals,
            and keepsakes.
          </p>
        </header>

        <form className="grid gap-3 rounded-2xl border border-archive-gold/14 bg-white/[0.035] p-4 md:grid-cols-4">
          <select
            name="status"
            defaultValue={params?.status ?? ""}
            className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-3 py-2 text-sm text-archive-ivory"
          >
            <option value="">All statuses</option>
            {archiveConciergeStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
          <select
            name="package"
            defaultValue={params?.package ?? ""}
            className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-3 py-2 text-sm text-archive-ivory"
          >
            <option value="">All packages</option>
            {Object.values(archiveConciergePackages).map((pkg) => (
              <option key={pkg.key} value={pkg.key}>
                {pkg.displayName}
              </option>
            ))}
          </select>
          <select
            name="archiveType"
            defaultValue={params?.archiveType ?? ""}
            className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-3 py-2 text-sm text-archive-ivory"
          >
            <option value="">Living or memorial</option>
            <option value="living">Living</option>
            <option value="memorial">Memorial</option>
          </select>
          <button className="rounded-xl bg-archive-gold px-4 py-2 text-sm font-bold text-archive-obsidian">
            Apply Filters
          </button>
          <select
            name="paymentStatus"
            defaultValue={params?.paymentStatus ?? ""}
            className="rounded-xl border border-archive-gold/20 bg-archive-obsidian px-3 py-2 text-sm text-archive-ivory"
          >
            <option value="">All payment states</option>
            {archiveConciergePaymentStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-archive-ivory/72">
            <input name="rush" value="1" type="checkbox" defaultChecked={params?.rush === "1"} />
            Rush orders
          </label>
          <label className="flex items-center gap-2 text-sm text-archive-ivory/72">
            <input name="upcomingDeadlines" value="1" type="checkbox" defaultChecked={params?.upcomingDeadlines === "1"} />
            Upcoming deadlines
          </label>
          <label className="flex items-center gap-2 text-sm text-archive-ivory/72">
            <input name="waitingOnCustomer" value="1" type="checkbox" defaultChecked={params?.waitingOnCustomer === "1"} />
            Waiting on customer
          </label>
          <label className="flex items-center gap-2 text-sm text-archive-ivory/72">
            <input name="waitingForApproval" value="1" type="checkbox" defaultChecked={params?.waitingForApproval === "1"} />
            Waiting for approval
          </label>
          <label className="flex items-center gap-2 text-sm text-archive-ivory/72">
            <input name="memorialPriority" value="1" type="checkbox" defaultChecked={params?.memorialPriority === "1"} />
            Memorial Priority purchased
          </label>
        </form>

        <section className="mt-6 overflow-hidden rounded-2xl border border-archive-gold/14 bg-white/[0.025] shadow-luxury">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-archive-gold/12 text-left text-sm">
              <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.16em] text-archive-gold">
                <tr>
                  {[
                    "Order",
                    "Customer",
                    "Subject",
                    "Type",
                    "Package",
                    "Status",
                    "Payment",
                    "Priority",
                    "Rush",
                    "Deadline",
                    "Assigned",
                    "Created"
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-bold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-archive-gold/10">
                {orders.map((order) => (
                  <tr key={order.id} className="align-top hover:bg-white/[0.035]">
                    <td className="px-4 py-4 font-mono text-xs text-archive-gold">
                      <Link href={`/admin/concierge/${order.id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-archive-ivory">{order.customerName}</p>
                      <p className="break-all text-xs text-archive-ivory/50">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-4 text-archive-ivory/78">{order.archiveSubjectName}</td>
                    <td className="px-4 py-4 capitalize text-archive-ivory/70">{order.archiveType}</td>
                    <td className="px-4 py-4 text-archive-ivory/70">{archiveConciergePackages[order.packageKey].displayName}</td>
                    <td className="px-4 py-4 capitalize text-archive-ivory/70">{formatStatus(order.status)}</td>
                    <td className="px-4 py-4 capitalize text-archive-ivory/70">{formatStatus(order.paymentStatus)}</td>
                    <td className="px-4 py-4">{order.memorialPriorityPurchased ? "Yes" : "No"}</td>
                    <td className="px-4 py-4">{order.isRush ? "Yes" : "No"}</td>
                    <td className="px-4 py-4">{formatDate(order.memorialDeadline)}</td>
                    <td className="px-4 py-4 font-mono text-xs text-archive-ivory/50">{order.assignedAdminId ?? "Unassigned"}</td>
                    <td className="px-4 py-4">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-archive-ivory/60" colSpan={12}>
                      No Archive Concierge orders match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
