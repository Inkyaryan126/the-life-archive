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

const activeArchiveImageRegion = {
  left: 19.8697,
  top: 6.543,
  width: 15.5049,
  height: 28.0273
};

const activeArchiveInfoRegion = {
  left: 38.7622,
  top: 2.6367,
  width: 18.3062,
  height: 43.0664
};

const parchmentRegion = {
  left: 44.3,
  top: 44.43,
  width: 41.69,
  height: 52.73
};

export function FinalWishesClient({
  archives,
  activeArchive,
  archiveDetails,
  initialWishes,
  userDisplayName
}: FinalWishesClientProps) {
  // Only eligible living archives owned by user
  const eligibleArchives = archives.filter((a) => !a.memorialMode && !a.isShared);
  const otherEligibleArchives = activeArchive
    ? eligibleArchives.filter((a) => a.slug !== activeArchive.slug)
    : [];

  const photoUrl = archiveDetails?.profilePhotoUrl || null;

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
        {/* Active Archive Image */}
        {activeArchive ? (
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
        ) : null}

        {/* Active Archive Information & Archive Selector */}
        {activeArchive ? (
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
                {activeArchive.personName} · Living Archive
              </p>

              {otherEligibleArchives.length > 0 ? (
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
                    {otherEligibleArchives.map((a) => (
                      <option key={a.slug} value={a.slug}>
                        {a.archiveName} ({a.personName})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          </ArchiveOverlayRegion>
        ) : null}

        {/* Working Form overlay inside Parchment Area */}
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
              <span className="text-4xl text-[#9b7b38]">📜</span>
              <h3 className="mt-3 text-lg font-bold text-[#2c1a0e]">Final Wishes Unavailable</h3>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#5e472a]">
                Final Wishes can only be recorded for a Living archive owned by your account. Memorial archives and contributor access cannot create or edit Final Wishes.
              </p>
              <Link
                href="/create"
                className="mt-4 rounded-full bg-[#4a321a] px-5 py-2 text-xs font-serif font-bold uppercase tracking-wider text-[#f7f2e8] border border-[#9b7b38]/40 shadow-sm transition hover:bg-[#332110]"
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
                <span className="text-4xl text-[#9b7b38]">📜</span>
                <h3 className="mt-3 text-lg font-bold text-[#2c1a0e]">Final Wishes Unavailable</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#5e472a]">
                  Final Wishes can only be recorded for a Living archive owned by your account.
                </p>
                <Link
                  href="/create"
                  className="mt-4 rounded-full bg-[#4a321a] px-5 py-2 text-xs font-serif font-bold uppercase tracking-wider text-[#f7f2e8] shadow-sm"
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
