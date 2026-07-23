"use client";

import type { Memory } from "@/lib/types";
import { MobileDashboardHeader } from "@/components/dashboard/MobileDashboardHeader";
import {
  MobileActiveArchiveCard,
  type MobileDashboardArchive
} from "@/components/dashboard/MobileActiveArchiveCard";
import { MobileDashboardActions } from "@/components/dashboard/MobileDashboardActions";
import { MobileBottomNavigation } from "@/components/dashboard/MobileBottomNavigation";

type MobileDashboardProps = {
  displayName: string;
  activeArchive: MobileDashboardArchive;
  memories: Memory[];
  totalArchivesCount: number;
};

export function MobileDashboard({
  displayName,
  activeArchive,
  memories,
  totalArchivesCount
}: MobileDashboardProps) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black text-[#f7f1e5] lg:hidden box-border">
      {/* 1. Fixed Background Image */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-top bg-no-repeat lg:hidden"
        style={{
          backgroundImage: "url('/images/archive-building/mobile/dashboard-background.png')"
        }}
      >
        {/* Dark Black Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/92" />

        {/* Warm Gold Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(202,164,92,0.14),transparent_60%)]" />
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col px-4 pt-3 pb-36 space-y-6 box-border">
        {/* Mobile Header */}
        <MobileDashboardHeader
          active="dashboard"
          archiveSlug={activeArchive.slug}
          signedIn={true}
        />

        {/* Welcome Section */}
        <section className="flex flex-col items-center text-center pt-2 pb-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a45c]">
            Welcome back,
          </p>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-normal leading-tight text-[#f7f1e5]">
            {displayName}
          </h1>
          <p className="mt-1.5 text-xs tracking-wide text-[#c9a45c]/80">
            Your legacy. Your story. Forever preserved.
          </p>

          {/* Decorative Gold Divider Line with Diamond Flourish */}
          <div className="mt-4 flex items-center justify-center gap-3 w-full max-w-[200px]">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a45c]/50 to-[#c9a45c]" />
            <span className="text-[10px] text-[#c9a45c]">◇◆◇</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c9a45c]/50 to-[#c9a45c]" />
          </div>
        </section>

        {/* Active Archive Card */}
        <MobileActiveArchiveCard
          activeArchive={activeArchive}
          memories={memories}
        />

        {/* Grouped Dashboard Actions Card */}
        <MobileDashboardActions
          activeArchive={activeArchive}
          totalMemoriesCount={memories.length}
          totalArchivesCount={totalArchivesCount}
        />
      </div>

      {/* 3. Fixed Bottom Navigation */}
      <MobileBottomNavigation activeArchiveSlug={activeArchive.slug} />
    </div>
  );
}
