"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseIcon,
  BookOpenIcon,
  PlusIcon,
  Clock3Icon,
  IdCardIcon
} from "@/components/dashboard/MobileDashboardIcons";

export function MobileBottomNavigation({
  activeArchiveSlug
}: {
  activeArchiveSlug?: string | null;
}) {
  const pathname = usePathname();

  const memoriesHref = activeArchiveSlug
    ? `/archive/${activeArchiveSlug}/memories`
    : "/dashboard";
  const addMemoryHref = activeArchiveSlug
    ? `/archive/${activeArchiveSlug}/add-memory`
    : "/dashboard";

  const navItems = [
    {
      label: "DASHBOARD",
      href: "/dashboard",
      icon: HouseIcon,
      isCenter: false,
      isActive: pathname === "/dashboard"
    },
    {
      label: "MEMORIES",
      href: memoriesHref,
      icon: BookOpenIcon,
      isCenter: false,
      isActive: pathname.startsWith("/archive/") && pathname.endsWith("/memories")
    },
    {
      label: "ADD MEMORY",
      href: addMemoryHref,
      icon: PlusIcon,
      isCenter: true,
      isActive: pathname.includes("/add-memory")
    },
    {
      label: "TIME CAPSULES",
      href: "/dashboard/time-capsules",
      icon: Clock3Icon,
      isCenter: false,
      isActive: pathname.startsWith("/dashboard/time-capsules")
    },
    {
      label: "MEMBER CARD",
      href: "/member-card",
      icon: IdCardIcon,
      isCenter: false,
      isActive: pathname === "/member-card"
    }
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-3 left-3 right-3 z-40 mx-auto max-w-lg lg:hidden"
    >
      <div className="flex items-center justify-around rounded-full border border-[#c9a45c]/35 bg-[#0a0908]/92 px-2 py-2 shadow-[0_16px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl box-border pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label="Add Memory"
                aria-current={item.isActive ? "page" : undefined}
                className="group relative -mt-6 flex flex-col items-center focus:outline-none"
              >
                <div className="flex h-13 w-13 items-center justify-center rounded-full border-2 border-[#0a0908] bg-gradient-to-b from-[#f3e3bc] via-[#c9a45c] to-[#9b7834] text-[#0a0908] shadow-[0_8px_24px_rgba(202,164,92,0.45)] transition transform active:scale-95 group-hover:brightness-110">
                  <Icon className="h-6 w-6 stroke-[2.5]" />
                </div>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#e8cf88]">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center py-1 text-center transition ${
                item.isActive
                  ? "text-[#e8cf88]"
                  : "text-[#c9a45c]/60 hover:text-[#e8cf88]"
              }`}
            >
              <div className="relative flex flex-col items-center">
                <Icon className="h-5 w-5 stroke-[1.75]" />
                {item.isActive ? (
                  <span className="mt-0.5 h-0.5 w-4 rounded-full bg-[#c9a45c] shadow-[0_0_8px_rgba(202,164,92,0.8)]" />
                ) : null}
              </div>
              <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
