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

export type EternismPageVariant =
  | "philosophy"
  | "observatory"
  | "manifesto"
  | "faq"
  | "continuity"
  | "trial";

export type EternismPageShellProps = {
  children: ReactNode;
  variant?: EternismPageVariant;
  desktopScene?: keyof typeof archiveBuildingScenes;
  mobileScene?: keyof typeof archiveBuildingMobileScenes;
  sceneLabel?: string;
  mobileTitle?: string;
  mobileSubtitle?: string;
  navRegion?: { left: number; top: number; width: number; height: number };
  contentRegion?: { left: number; top: number; width: number; height: number };
  contentClassName?: string;
  maxContentWidth?: string;
  showSubNav?: boolean;
};

const defaultNavRegion = {
  left: 0.78,
  top: 19.73,
  width: 14.27,
  height: 74.02
};

const defaultContentRegion = {
  left: 17.5,
  top: 19.73,
  width: 78.0,
  height: 74.02
};

const variantConfigs: Record<
  EternismPageVariant,
  {
    desktopScene: keyof typeof archiveBuildingScenes;
    mobileScene: keyof typeof archiveBuildingMobileScenes;
    sceneLabel: string;
    mobileTitle: string;
    mobileSubtitle: string;
    maxContentWidth: string;
  }
> = {
  philosophy: {
    desktopScene: "eternistObservatory",
    mobileScene: "library",
    sceneLabel: "Eternism Philosophy Chamber scene",
    mobileTitle: "ETERNISM PHILOSOPHY",
    mobileSubtitle: "Preserve the life. Extend the life.",
    maxContentWidth: "max-w-5xl"
  },
  observatory: {
    desktopScene: "eternistObservatory",
    mobileScene: "study",
    sceneLabel: "Eternist Observatory research console scene",
    mobileTitle: "ETERNIST OBSERVATORY",
    mobileSubtitle: "Memory, identity, and human continuity.",
    maxContentWidth: "max-w-4xl"
  },
  manifesto: {
    desktopScene: "addLetterJournal",
    mobileScene: "writing",
    sceneLabel: "Eternist Declaration Hall reading room",
    mobileTitle: "THE ETERNIST MANIFESTO",
    mobileSubtitle: "Philosophy, principles, and personal pledge.",
    maxContentWidth: "max-w-3xl"
  },
  faq: {
    desktopScene: "eternistObservatory",
    mobileScene: "library",
    sceneLabel: "Eternism Counsel Chamber scene",
    mobileTitle: "ETERNISM FAQ",
    mobileSubtitle: "Clear answers about mission, ethics, and continuity.",
    maxContentWidth: "max-w-4xl"
  },
  continuity: {
    desktopScene: "myArchives",
    mobileScene: "vault",
    sceneLabel: "Eternism Continuity Chamber blueprint room",
    mobileTitle: "THE CONTINUITY CAPSULE",
    mobileSubtitle: "Six dimensions of human preservation and self-creation.",
    maxContentWidth: "max-w-5xl"
  },
  trial: {
    desktopScene: "addPhotoVideo",
    mobileScene: "study",
    sceneLabel: "Eternism Examination Chamber scene",
    mobileTitle: "THE ETERNISM TRIAL",
    mobileSubtitle: "How hard are you to destroy?",
    maxContentWidth: "max-w-4xl"
  }
};

export async function EternismPageShell({
  children,
  variant = "observatory",
  desktopScene: customDesktopScene,
  mobileScene: customMobileScene,
  sceneLabel: customSceneLabel,
  mobileTitle: customMobileTitle,
  mobileSubtitle: customMobileSubtitle,
  navRegion = defaultNavRegion,
  contentRegion = defaultContentRegion,
  contentClassName = "",
  maxContentWidth: customMaxContentWidth,
  showSubNav = true
}: EternismPageShellProps) {
  const account = await getAccountContext();
  const config = variantConfigs[variant];

  const desktopSceneKey = customDesktopScene ?? config.desktopScene;
  const mobileSceneKey = customMobileScene ?? config.mobileScene;
  const sceneLabel = customSceneLabel ?? config.sceneLabel;
  const mobileTitle = customMobileTitle ?? config.mobileTitle;
  const mobileSubtitle = customMobileSubtitle ?? config.mobileSubtitle;
  const maxContentWidth = customMaxContentWidth ?? config.maxContentWidth;

  const desktopSceneObject = archiveBuildingScenes[desktopSceneKey];
  const mobileSceneObject = archiveBuildingMobileScenes[mobileSceneKey];

  return (
    <>
      <ArchiveBuildingShell
        image={{ ...desktopSceneObject, priority: true }}
        active="eternism"
        archiveSlug={account.defaultArchive?.slug ?? null}
        archiveName={account.defaultArchive?.archiveName ?? null}
        archivePersonName={account.defaultArchive?.personName ?? null}
        showArchiveActions={Boolean(account.defaultArchive?.slug)}
        navRegion={navRegion}
        sceneLabel={sceneLabel}
      >
        <ArchiveOverlayRegion
          region={contentRegion}
          className={`overflow-hidden p-6 text-archive-ivory ${contentClassName}`}
          ariaLabel={sceneLabel}
        >
          <div className="h-full overflow-y-auto pr-3 custom-scrollbar">
            {showSubNav ? <EternismSubNav /> : null}
            <div className={`mx-auto w-full ${maxContentWidth}`}>{children}</div>
          </div>
        </ArchiveOverlayRegion>
      </ArchiveBuildingShell>

      <ArchiveMobileScene
        image={{ ...mobileSceneObject, priority: true }}
        sceneLabel={sceneLabel}
        title={mobileTitle}
        subtitle={mobileSubtitle}
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
            <div className={`relative z-10 mx-auto w-full ${maxContentWidth}`}>
              {showSubNav ? <EternismSubNav /> : null}
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
