"use client";

import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import {
  ArchiveBuildingShell,
  ArchiveMobileScene,
  ArchiveOverlayRegion
} from "@/components/archive-building/ArchiveBuildingShell";
import { MobileArchiveHeader } from "@/components/archive-building/MobileArchiveHeader";
import { archiveBuildingScenes, archiveBuildingMobileScenes } from "@/lib/archive-building-scenes";
import { FinalWishesForm } from "./FinalWishesForm";
import type { AccountArchive } from "@/lib/account";
import type { FinalWishes, LifeArchive } from "@/lib/types";

type FinalWishesClientProps = {
  archives: AccountArchive[];
  activeArchive: AccountArchive | null;
  archiveDetails: LifeArchive | null;
  initialWishes: FinalWishes | null;
  userDisplayName: string;
};

const dashboardSideNavRegion = {
  left: 1.6287,
  top: 21.6797,
  width: 13.8762,
  height: 71.4844
};

// 1. Upper-Left Identity Region measured directly from final-wishes-guide.png (x: 301, y: 37, w: 212, h: 70)
const upperLeftIdentityRegion = {
  left: 19.6091,
  top: 3.6133,
  width: 13.8111,
  height: 6.8359
};

// 2. Upper-Right Navigation Region measured directly from final-wishes-guide.png (x: 1283, y: 28, w: 214, h: 71)
const upperRightNavRegion = {
  left: 83.5831,
  top: 2.7344,
  width: 13.9414,
  height: 6.9336
};

// 3. Large Parchment Form Region measured directly from final-wishes-guide.png (x: 574, y: 454, w: 762, h: 494)
const parchmentRegion = {
  left: 37.3941,
  top: 44.3359,
  width: 49.6417,
  height: 48.2422
};

export function FinalWishesClient({
  archives,
  activeArchive,
  archiveDetails,
  initialWishes,
  userDisplayName
}: FinalWishesClientProps) {
  return (
    <>
      {/* Desktop View */}
      <ArchiveBuildingShell
        image={{ ...archiveBuildingScenes.finalWishes, priority: true }}
        active="final-wishes"
        archiveSlug={activeArchive?.slug || "none"}
        archiveName={activeArchive?.archiveName || "My Archives"}
        archivePersonName={activeArchive?.personName || "Archive Owner"}
        showArchiveActions={true}
        navRegion={dashboardSideNavRegion}
        sceneLabel="Final Wishes scene"
      >
        {/* 1. Upper-Left Identity Region: Archive Name Only (No portrait, no avatar, no status subtitle) */}
        {activeArchive ? (
          <ArchiveOverlayRegion
            region={upperLeftIdentityRegion}
            className="flex flex-col justify-center items-center px-2 py-1 text-archive-ivory text-center"
            ariaLabel="Active archive identity"
          >
            <h1 className="line-clamp-2 font-serif text-xs font-bold tracking-wide text-archive-ivory drop-shadow-sm text-center">
              {activeArchive.archiveName}
            </h1>
          </ArchiveOverlayRegion>
        ) : null}

        {/* 2. Upper-Right Navigation Region: Return to My Archives Hotspot */}
        <ArchiveOverlayRegion
          region={upperRightNavRegion}
          ariaLabel="Return to My Archives"
        >
          <Link
            href="/dashboard"
            aria-label="Return to My Archives"
            className="flex h-full w-full items-center justify-center rounded-sm text-xs font-serif font-bold uppercase tracking-wider text-archive-gold/90 transition hover:text-archive-champagne focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
          >
            <span className="sr-only">Return to My Archives</span>
          </Link>
        </ArchiveOverlayRegion>

        {/* 3. Large Parchment Region: Final Wishes Form or Empty State */}
        <ArchiveOverlayRegion
          region={parchmentRegion}
          ariaLabel="Final Wishes parchment form content"
          className="overflow-hidden bg-transparent border-0 shadow-none"
        >
          {activeArchive ? (
            <FinalWishesForm
              archiveSlug={activeArchive.slug}
              archiveName={activeArchive.archiveName}
              initialWishes={initialWishes}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center font-serif text-[#2c1a0e]">
              <span className="text-4xl text-[#8b6b2e]">📜</span>
              <h3 className="mt-3 text-base font-bold text-[#2c1a0e]">Final Wishes Unavailable</h3>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#5e472a]">
                Final Wishes can only be recorded for a Living archive owned by your account. Memorial archives and contributor access cannot create or edit Final Wishes.
              </p>
              <Link
                href="/create"
                className="mt-4 rounded-full bg-[#4a321a] px-4 py-1.5 text-xs font-serif font-bold uppercase tracking-wider text-[#f7f2e8] border border-[#9b7b38]/40 shadow-sm transition hover:bg-[#332110]"
              >
                Create a Living Archive
              </Link>
            </div>
          )}
        </ArchiveOverlayRegion>
      </ArchiveBuildingShell>

      {/* Mobile View */}
      <ArchiveMobileScene
        image={{ ...archiveBuildingMobileScenes.myArchives, priority: true }}
        sceneLabel="Final Wishes mobile scene"
        title="FINAL WISHES"
        subtitle="Preserve personal posthumous desires & playlist preferences."
        className="px-4 pb-5 pt-5 sm:px-6 sm:pb-7 sm:pt-7"
      >
        <MobileArchiveHeader
          active="dashboard"
          archiveSlug={activeArchive?.slug || "none"}
          signedIn={true}
        />

        <div className="relative z-30 flex min-h-[calc(100vh-6.25rem)] items-end pb-1 pt-4">
          <div className="w-full max-h-[80vh] overflow-hidden rounded-[1.65rem] border border-[#7a5b28]/30 bg-[#ded0b6] shadow-[0_26px_80px_rgba(0,0,0,0.66)]">
            {activeArchive ? (
              <FinalWishesForm
                archiveSlug={activeArchive.slug}
                archiveName={activeArchive.archiveName}
                initialWishes={initialWishes}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center font-serif text-[#2c1a0e]">
                <span className="text-4xl text-[#8b6b2e]">📜</span>
                <h3 className="mt-3 text-base font-bold text-[#2c1a0e]">Final Wishes Unavailable</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#5e472a]">
                  Final Wishes can only be recorded for a Living archive owned by your account.
                </p>
                <Link
                  href="/create"
                  className="mt-4 rounded-full bg-[#4a321a] px-4 py-1.5 text-xs font-serif font-bold uppercase tracking-wider text-[#f7f2e8] shadow-sm"
                >
                  Create a Living Archive
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="hidden">
          <AppSidebar
            active="final-wishes"
            archiveSlug={activeArchive?.slug || "none"}
            archiveName={activeArchive?.archiveName || "My Archives"}
            archivePersonName={activeArchive?.personName || "Archive Owner"}
          />
        </div>
      </ArchiveMobileScene>
    </>
  );
}
