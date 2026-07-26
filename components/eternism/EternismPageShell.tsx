import type { ReactNode } from "react";
import { DesignBackdrop } from "@/components/SiteDesign";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileArchiveHeader } from "@/components/archive-building/MobileArchiveHeader";
import {
  ArchiveBuildingShell,
  ArchiveOverlayRegion,
  ArchiveMobileScene
} from "@/components/archive-building/ArchiveBuildingShell";
import { getAccountContext } from "@/lib/account";
import {
  archiveBuildingMobileScenes,
  archiveBuildingScenes
} from "@/lib/archive-building-scenes";
import { EternismSubNav } from "@/components/eternism/EternismSubNav";

const observatoryNavRegion = {
  left: 0.78,
  top: 19.73,
  width: 14.27,
  height: 74.02
};

const observatoryContentRegion = {
  left: 17.5,
  top: 19.73,
  width: 78.0,
  height: 74.02
};

type EternismPageShellProps = {
  children: ReactNode;
};

export async function EternismPageShell({ children }: EternismPageShellProps) {
  const account = await getAccountContext();

  return (
    <>
      <ArchiveBuildingShell
        image={{ ...archiveBuildingScenes.eternistObservatory, priority: true }}
        active="eternism"
        archiveSlug={account.defaultArchive?.slug ?? null}
        archiveName={account.defaultArchive?.archiveName ?? null}
        archivePersonName={account.defaultArchive?.personName ?? null}
        showArchiveActions={Boolean(account.defaultArchive?.slug)}
        navRegion={observatoryNavRegion}
        sceneLabel="Eternist Observatory archive-building scene"
      >
        <ArchiveOverlayRegion
          region={observatoryContentRegion}
          className="overflow-hidden p-6 text-archive-ivory"
          ariaLabel="Eternist Observatory Content"
        >
          <div className="h-full overflow-y-auto pr-3 custom-scrollbar">
            <EternismSubNav />
            {children}
          </div>
        </ArchiveOverlayRegion>
      </ArchiveBuildingShell>

      <ArchiveMobileScene
        image={{ ...archiveBuildingMobileScenes.study, priority: true }}
        sceneLabel="Eternist Observatory mobile archive room"
        title="ETERNIST OBSERVATORY"
        subtitle="Memory, identity, and human continuity."
        className="px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))] sm:px-6"
      >
        <div className="relative z-10 mx-auto w-full max-w-5xl pt-3">
          <MobileArchiveHeader
            active="eternism"
            archiveSlug={account.defaultArchive?.slug ?? null}
            signedIn={Boolean(account.user)}
          />
          <main className="relative mt-6 min-h-screen overflow-hidden rounded-3xl border border-archive-gold/18 bg-archive-obsidian/90 px-4 py-8 text-archive-ivory sm:px-8">
            <DesignBackdrop />
            <div className="relative z-10 mx-auto w-full max-w-5xl">
              <EternismSubNav />
              {children}
            </div>
          </main>
          <SiteFooter
            archiveSlug={account.defaultArchive?.slug ?? null}
            signedIn={Boolean(account.user)}
            className="mt-8 rounded-3xl"
          />
        </div>
      </ArchiveMobileScene>
    </>
  );
}
