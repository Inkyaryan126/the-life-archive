"use client";

import Link from "next/link";
import Image from "next/image";
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
  activeArchive: AccountArchive;
  archiveDetails: LifeArchive | null;
  initialWishes: FinalWishes | null;
  userDisplayName: string;
};

const dashboardSideNavRegion = {
  left: 2.21,
  top: 25.88,
  width: 13.09,
  height: 67.19
};

const activeArchiveImageRegion = {
  left: 20.13,
  top: 6.05,
  width: 15.18,
  height: 26.17
};

const activeArchiveInfoRegion = {
  left: 39.22,
  top: 3.32,
  width: 20.2,
  height: 36.72
};

const parchmentRegion = {
  left: 45.08,
  top: 44.82,
  width: 40.13,
  height: 53.52
};

export function FinalWishesClient({
  archives,
  activeArchive,
  archiveDetails,
  initialWishes,
  userDisplayName
}: FinalWishesClientProps) {
  const otherArchives = archives.filter((a) => a.slug !== activeArchive.slug);
  const photoUrl = archiveDetails?.profilePhotoUrl || null;

  return (
    <>
      {/* Desktop View */}
      <ArchiveBuildingShell
        image={{ ...archiveBuildingScenes.finalWishes, priority: true }}
        active="final-wishes"
        archiveSlug={activeArchive.slug}
        archiveName={activeArchive.archiveName}
        archivePersonName={activeArchive.personName}
        showArchiveActions={true}
        navRegion={dashboardSideNavRegion}
        sceneLabel="Final Wishes scene"
      >
        {/* Active Archive Image */}
        <ArchiveOverlayRegion
          region={activeArchiveImageRegion}
          ariaLabel="Active archive profile image"
        >
          <Link
            href={`/archive/${activeArchive.slug}`}
            className="group relative block h-full w-full overflow-hidden rounded-[0.2rem] focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
            aria-label={`Open ${activeArchive.archiveName}`}
          >
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={activeArchive.personName}
                fill
                priority
                className="object-cover object-[center_25%]"
                sizes="16vw"
              />
            ) : (
              <div className="grid h-full place-items-center bg-black/26 text-center">
                <p className="font-serif text-4xl text-archive-gold">TLA</p>
              </div>
            )}
          </Link>
        </ArchiveOverlayRegion>

        {/* Active Archive Information & Archive Selector */}
        <ArchiveOverlayRegion
          region={activeArchiveInfoRegion}
          className="p-[clamp(1rem,1.55vw,1.75rem)] text-archive-ivory"
          ariaLabel="Active archive information and selection"
        >
          <div className="flex h-full flex-col justify-center">
            <h1 className="line-clamp-2 font-serif text-[clamp(1.2rem,1.7vw,2.1rem)] leading-tight text-archive-ivory drop-shadow-[0_3px_14px_rgba(0,0,0,0.42)]">
              {activeArchive.archiveName}
            </h1>
            <p className="mt-1 truncate text-[clamp(0.64rem,0.78vw,0.88rem)] font-semibold uppercase tracking-[0.14em] text-archive-gold/82">
              {activeArchive.personName} · {activeArchive.memorialMode ? "Memorial" : "Living"}
            </p>

            {otherArchives.length > 0 ? (
              <div className="mt-3">
                <label className="block text-[0.62rem] uppercase tracking-wider text-archive-ivory/60">
                  Go to a Different Archive
                </label>
                <select
                  value={activeArchive.slug}
                  onChange={(e) => {
                    window.location.href = `/dashboard/final-wishes?archive=${encodeURIComponent(e.target.value)}`;
                  }}
                  className="mt-1 w-full rounded-md border border-archive-gold/30 bg-black/70 px-2 py-1 text-xs text-archive-champagne focus:outline-none focus:ring-1 focus:ring-archive-gold"
                >
                  <option value={activeArchive.slug}>{activeArchive.archiveName}</option>
                  {otherArchives.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.archiveName} ({a.personName})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </ArchiveOverlayRegion>

        {/* Working Form overlay inside Parchment Area */}
        <ArchiveOverlayRegion
          region={parchmentRegion}
          ariaLabel="Final Wishes parchment form content"
          className="overflow-hidden rounded-lg border border-[#a68d59]/40 bg-[#f4ece0]/95 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <FinalWishesForm
            archiveSlug={activeArchive.slug}
            archiveName={activeArchive.archiveName}
            initialWishes={initialWishes}
          />
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
          archiveSlug={activeArchive.slug}
          signedIn={true}
        />

        <div className="relative z-30 flex min-h-[calc(100vh-6.25rem)] items-end pb-1 pt-4">
          <div className="w-full max-h-[80vh] overflow-hidden rounded-[1.65rem] border border-archive-gold/24 bg-[#f4ece0] shadow-[0_26px_80px_rgba(0,0,0,0.66)]">
            <FinalWishesForm
              archiveSlug={activeArchive.slug}
              archiveName={activeArchive.archiveName}
              initialWishes={initialWishes}
            />
          </div>
        </div>

        <div className="hidden">
          <AppSidebar
            active="final-wishes"
            archiveSlug={activeArchive.slug}
            archiveName={activeArchive.archiveName}
            archivePersonName={activeArchive.personName}
          />
        </div>
      </ArchiveMobileScene>
    </>
  );
}
