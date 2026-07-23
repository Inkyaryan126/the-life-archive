"use client";

import Link from "next/link";
import {
  BookOpenIcon,
  HourglassIcon,
  CompassIcon,
  RefreshCwIcon,
  ChevronRightIcon
} from "@/components/dashboard/MobileDashboardIcons";
import type { MobileDashboardArchive } from "@/components/dashboard/MobileActiveArchiveCard";

type MobileDashboardActionsProps = {
  activeArchive: MobileDashboardArchive;
  totalMemoriesCount: number;
  totalArchivesCount: number;
};

export function MobileDashboardActions({
  activeArchive,
  totalMemoriesCount,
  totalArchivesCount
}: MobileDashboardActionsProps) {
  const preserveHref = `/archive/${activeArchive.slug}/add-memory`;
  const continuityHref = `/dashboard/time-capsules`;
  const recentMemoriesHref = `/archive/${activeArchive.slug}/memories`;
  const switchArchiveHref = `/create`; // Or archive management route

  const actions = [
    {
      id: "preserve",
      title: "PRESERVE SOMETHING",
      subtitle: "Add a memory, voice, or lesson",
      icon: BookOpenIcon,
      href: preserveHref,
      badge: null
    },
    {
      id: "continuity",
      title: "CONTINUITY & LEGACY",
      subtitle: "Time capsules, letters, and more",
      icon: HourglassIcon,
      href: continuityHref,
      badge: null
    },
    {
      id: "recent",
      title: "RECENT MEMORIES",
      subtitle: `Your latest ${Math.min(5, totalMemoriesCount)} memories`,
      icon: CompassIcon,
      href: recentMemoriesHref,
      badge: totalMemoriesCount
    },
    {
      id: "switch",
      title: "SWITCH ARCHIVE",
      subtitle: "Manage your archives",
      icon: RefreshCwIcon,
      href: switchArchiveHref,
      badge: totalArchivesCount
    }
  ];

  return (
    <section className="relative w-full max-w-full overflow-hidden rounded-3xl border border-[#c9a45c]/35 bg-[#0a0908]/85 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl box-border">
      <div className="flex flex-col divide-y divide-[#c9a45c]/20">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex min-h-[64px] items-center justify-between gap-3 px-4 py-4 transition hover:bg-white/[0.03] active:bg-white/[0.06]"
            >
              {/* Left Side: Circular Icon + Text */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Circular Gold Icon Badge */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c9a45c]/45 bg-gradient-to-b from-[#1e1913] via-[#120f0c] to-[#0a0908] text-[#e8cf88] shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition group-hover:border-[#c9a45c] group-hover:text-[#f7f1e5]">
                  <Icon className="h-5 w-5 stroke-[1.75]" />
                </div>

                {/* Text Labels */}
                <div className="flex flex-col min-w-0 flex-1 pr-1">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#e8cf88] group-hover:text-[#f7f1e5] truncate">
                    {action.title}
                  </span>
                  <span className="mt-0.5 text-xs text-[#c9a45c]/70 truncate">
                    {action.subtitle}
                  </span>
                </div>
              </div>

              {/* Right Side: Optional Badge + Chevron */}
              <div className="flex shrink-0 items-center gap-2.5">
                {action.badge !== null ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c9a45c]/40 bg-black/40 text-xs font-semibold text-[#e8cf88] shadow-sm">
                    {action.badge}
                  </div>
                ) : null}

                <ChevronRightIcon className="h-5 w-5 text-[#c9a45c]/60 transition group-hover:translate-x-0.5 group-hover:text-[#e8cf88]" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
