import Link from "next/link";
import { SiteLogo } from "@/components/SiteDesign";

export type AdminNavProps = {
  currentPath: string;
  todayVisitsCount?: number;
  pendingReviewsCount?: number;
  newOrdersCount?: number;
};

export function AdminNav({
  currentPath,
  todayVisitsCount,
  pendingReviewsCount,
  newOrdersCount
}: AdminNavProps) {
  const navItems = [
    {
      href: "/admin",
      label: "Overview",
      badge: newOrdersCount ? `${newOrdersCount} new` : undefined
    },
    {
      href: "/admin/visitors",
      label: "Visitors & Traffic",
      badge:
        todayVisitsCount !== undefined
          ? `${todayVisitsCount.toLocaleString("en-US")} today`
          : undefined
    },
    {
      href: "/admin/users",
      label: "Users & Archives"
    },
    {
      href: "/admin/member-cards",
      label: "Member Cards"
    },
    {
      href: "/admin/legacy-question",
      label: "Legacy Questions",
      badge: pendingReviewsCount ? `${pendingReviewsCount} pending` : undefined
    }
  ];

  return (
    <nav className="flex flex-col gap-4 border-b border-archive-gold/18 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Link href="/">
          <SiteLogo width={150} height={38} />
        </Link>
        <span className="rounded-full border border-archive-gold/30 bg-archive-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-archive-gold">
          Admin Console
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? currentPath === "/admin"
              : currentPath.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-archive-gold/15 text-archive-gold shadow-luxury"
                  : "text-archive-champagne/80 hover:bg-white/[0.04] hover:text-archive-ivory"
              }`}
            >
              <span>{item.label}</span>
              {item.badge ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                    isActive
                      ? "bg-archive-gold/25 text-archive-gold"
                      : "bg-white/[0.06] text-archive-ivory/60"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
