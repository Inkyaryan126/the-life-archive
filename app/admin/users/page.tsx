import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAdminAccess } from "@/lib/admin";
import {
  listAdminUsersAndArchives,
  type AdminUserArchiveSummary,
  type AdminUserDirectoryEntry
} from "@/lib/admin-users";
import { listKeepsakeOrders } from "@/lib/keepsake-orders";
import { listLegacyActivationRequests } from "@/lib/legacy-activation";
import { getSiteVisitStats } from "@/lib/site-visits";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

function formatDate(value: string | null) {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function statusClass(tone: "gold" | "green" | "amber" | "muted") {
  if (tone === "green") {
    return "border-emerald-300/35 text-emerald-200 bg-emerald-500/10";
  }

  if (tone === "amber") {
    return "border-amber-300/35 text-amber-200 bg-amber-500/10";
  }

  if (tone === "muted") {
    return "border-archive-ivory/14 text-archive-ivory/55 bg-white/[0.02]";
  }

  return "border-archive-gold/25 text-archive-champagne bg-archive-gold/10";
}

function Badge({
  children,
  tone = "gold"
}: {
  children: React.ReactNode;
  tone?: "gold" | "green" | "amber" | "muted";
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${statusClass(
        tone
      )}`}
    >
      {children}
    </span>
  );
}

function ArchiveRow({
  archive
}: {
  archive: AdminUserArchiveSummary;
}) {
  return (
    <div className="rounded-2xl border border-archive-gold/12 bg-archive-obsidian/45 p-4 transition hover:border-archive-gold/25">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge tone={archive.memorialMode ? "amber" : "green"}>
              {archive.memorialMode ? "Memorial" : "Living"}
            </Badge>
            <Badge tone={archive.visibility === "public" ? "green" : "muted"}>
              {archive.visibility === "public" ? "Public" : "Private"}
            </Badge>
            <Badge tone={archive.discoverable ? "green" : "muted"}>
              {archive.discoverable ? "Discoverable" : "Not Discoverable"}
            </Badge>
          </div>

          <h3 className="mt-3 break-words font-serif text-2xl text-archive-ivory">
            {archive.archiveName}
          </h3>
          <p className="mt-1 text-sm text-archive-ivory/66">
            Person: {archive.personName}
          </p>
          <p className="mt-1 break-all font-mono text-xs text-archive-ivory/48">
            Slug: {archive.slug || "Missing slug"}
          </p>
          <p className="mt-1 text-xs text-archive-ivory/48">
            Created {formatDate(archive.createdAt)} · {archive.memoryCount}{" "}
            memories · Relationship: {archive.relationshipToOwner}
          </p>
        </div>

        <Link
          href={`/admin/archives/${archive.id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-archive-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
        >
          View Archive
        </Link>
      </div>
    </div>
  );
}

function UserCard({ user }: { user: AdminUserDirectoryEntry }) {
  return (
    <article className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 shadow-luxury transition hover:border-archive-gold/25">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h2 className="break-words font-serif text-3xl leading-tight text-archive-ivory">
            {user.displayName}
          </h2>
          <p className="mt-2 break-all text-sm text-archive-ivory/70">
            {user.email || "Email unavailable"}
          </p>
          <p className="mt-1 break-all font-mono text-xs text-archive-ivory/42">
            User ID: {user.id}
          </p>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-3 xl:min-w-[32rem]">
          <div className="rounded-2xl border border-archive-gold/12 bg-white/[0.025] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
              Archives Owned
            </p>
            <p className="mt-2 font-serif text-3xl text-archive-ivory">
              {user.archiveCount}
            </p>
          </div>
          <div className="rounded-2xl border border-archive-gold/12 bg-white/[0.025] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
              Account Created
            </p>
            <p className="mt-2 text-sm text-archive-ivory/70">
              {formatDate(user.createdAt)}
            </p>
          </div>
          <div className="rounded-2xl border border-archive-gold/12 bg-white/[0.025] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-gold">
              Profile Created
            </p>
            <p className="mt-2 text-sm text-archive-ivory/70">
              {formatDate(user.profileCreatedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {user.archives.length > 0 ? (
          user.archives.map((archive) => (
            <ArchiveRow key={archive.id} archive={archive} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-archive-gold/18 bg-white/[0.015] p-5 text-sm leading-7 text-archive-ivory/62">
            This user does not own any archives yet.
          </div>
        )}
      </div>
    </article>
  );
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

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();

  if (!account.user) {
    redirect("/login?next=%2Fadmin%2Fusers");
  }

  if (!adminEmailsConfigured || !isAdmin) {
    return <AdminDenied />;
  }

  const params = await searchParams;
  let directory = {
    users: [] as AdminUserDirectoryEntry[],
    totalUsers: 0,
    totalArchives: 0
  };
  let loadError: string | null = null;
  let siteVisitStats = { uniqueVisitorsToday: 0 };
  let newOrdersCount = 0;
  let pendingReviewsCount = 0;

  try {
    const [dirData, stats, orders, legacyRequests] = await Promise.all([
      listAdminUsersAndArchives(params?.q),
      getSiteVisitStats(),
      listKeepsakeOrders(),
      listLegacyActivationRequests()
    ]);
    directory = dirData;
    siteVisitStats = stats;
    newOrdersCount = orders.filter((o) => o.fulfillmentStatus === "New").length;
    pendingReviewsCount = legacyRequests.filter(
      (r) => r.status === "pending_memorial_review"
    ).length;
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load users.";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl">
        <AdminNav
          currentPath="/admin/users"
          todayVisitsCount={siteVisitStats.uniqueVisitorsToday}
          newOrdersCount={newOrdersCount}
          pendingReviewsCount={pendingReviewsCount}
        />

        <header className="py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            User Directory
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
            Users & Archives
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-archive-ivory/68">
            Review registered account owners, inspect owned archives, and open administrative preview sessions without modifying public visibility controls.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 shadow-luxury">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
                Total Registered Users
              </p>
              <p className="mt-2 font-serif text-4xl text-archive-ivory">
                {directory.totalUsers.toLocaleString("en-US")}
              </p>
            </div>
            <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5 shadow-luxury">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
                Total Life Archives Created
              </p>
              <p className="mt-2 font-serif text-4xl text-archive-ivory">
                {directory.totalArchives.toLocaleString("en-US")}
              </p>
            </div>
          </div>

          <form method="get" className="mt-6 flex max-w-2xl gap-3">
            <input
              name="q"
              defaultValue={params?.q ?? ""}
              placeholder="Search by display name, email address, or archive title..."
              className="min-w-0 flex-1 rounded-full border border-archive-gold/18 bg-white/[0.03] px-5 py-3 text-sm text-archive-ivory outline-none placeholder:text-archive-ivory/35 focus:border-archive-gold"
            />
            <button
              type="submit"
              className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Search Directory
            </button>
          </form>
        </header>

        {loadError ? (
          <p className="mb-6 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
            {loadError}
          </p>
        ) : null}

        {!loadError && directory.users.length === 0 ? (
          <section className="rounded-2xl border border-archive-gold/18 bg-white/[0.025] p-8 text-center shadow-luxury">
            <h2 className="font-serif text-3xl text-archive-ivory">
              No users found matching query.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-archive-ivory/64">
              Try searching by a different display name, email, or archive title.
            </p>
          </section>
        ) : null}

        {!loadError && directory.users.length > 0 ? (
          <div className="grid gap-5">
            {directory.users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
