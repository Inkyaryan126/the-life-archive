import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { signOutAction } from "@/app/login/actions";
import {
  getArchiveBuildingMenuItems,
  type ArchiveBuildingNavActive
} from "@/components/archive-building/navigation";

export type { ArchiveBuildingNavActive } from "@/components/archive-building/navigation";

type SceneImage = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  priority?: boolean;
};

type Region = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type ArchiveSideNavigationProps = {
  active: ArchiveBuildingNavActive;
  archiveSlug?: string | null;
  archiveName?: string | null;
  archivePersonName?: string | null;
  showArchiveActions?: boolean;
  signedIn?: boolean;
};

type ArchiveBuildingShellProps = ArchiveSideNavigationProps & {
  image: SceneImage;
  children: ReactNode;
  sceneLabel: string;
  navRegion?: Region;
};

type ArchiveOverlayRegionProps = {
  region: Region;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

type ArchiveHotspotProps = {
  region: Region;
  href: string;
  label: string;
  className?: string;
};

const sideNavRegion: Region = {
  left: 2.02,
  top: 19.53,
  width: 11.27,
  height: 66.99
};

function regionStyle(region: Region): CSSProperties {
  return {
    left: `${region.left}%`,
    top: `${region.top}%`,
    width: `${region.width}%`,
    height: `${region.height}%`
  };
}

function ArchiveNavLink({
  href,
  indent = false,
  label,
  active
}: {
  href: string;
  indent?: boolean;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center justify-between gap-2 rounded-md py-1.5 text-[clamp(0.65rem,0.7vw,0.8rem)] font-semibold leading-tight transition focus:outline-none focus:ring-2 focus:ring-archive-gold/55 ${
        active
          ? "text-archive-gold drop-shadow-[0_0_10px_rgba(232,207,136,0.32)]"
          : "text-archive-ivory/74 hover:text-archive-gold"
      } ${indent ? "pl-4 pr-1.5 text-[clamp(0.58rem,0.64vw,0.74rem)]" : "px-1.5"}`}
    >
      <span className="min-w-0">{label}</span>
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-full transition ${
          active ? "bg-archive-gold" : "bg-archive-ivory/18 group-hover:bg-archive-gold/45"
        }`}
      />
    </Link>
  );
}

function ArchiveNavDivider() {
  return (
    <div
      aria-hidden="true"
      className="my-1 h-px w-[82%] justify-self-center bg-archive-gold/18"
    />
  );
}

export function ArchiveSideNavigation({
  active,
  archiveSlug,
  signedIn = true
}: ArchiveSideNavigationProps) {
  const menuItems = getArchiveBuildingMenuItems(archiveSlug);

  return (
    <nav
      aria-label="Archive building navigation"
      className="flex h-full flex-col justify-center overflow-hidden px-2 py-3 text-archive-ivory"
    >
      <div className="grid gap-1">
        {menuItems.map((item, index) =>
          item.kind === "divider" ? (
            <ArchiveNavDivider key={`divider-${index}`} />
          ) : (
            <ArchiveNavLink
              key={item.label}
              href={item.href}
              indent={item.indent}
              label={item.label}
              active={active === item.active || (active === "add-memory" && item.active === "letter-journal")}
            />
          )
        )}
        {signedIn ? (
          <form action={signOutAction}>
            <button
              type="submit"
              className="group flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-1.5 text-left text-[clamp(0.68rem,0.72vw,0.82rem)] font-semibold leading-tight text-archive-ivory/74 transition hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/55"
            >
              <span>Log Out</span>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-archive-ivory/18 transition group-hover:bg-archive-gold/45"
              />
            </button>
          </form>
        ) : null}
      </div>
    </nav>
  );
}

export function ArchiveScene({
  image,
  children,
  sceneLabel
}: {
  image: SceneImage;
  children: ReactNode;
  sceneLabel: string;
}) {
  const ratio = image.width / image.height;

  return (
    <section
      aria-label={sceneLabel}
      className="hidden min-h-screen overflow-auto bg-black text-archive-ivory lg:block"
    >
      <div className="flex min-h-screen items-start justify-center">
        <div
          className="relative isolate w-screen max-w-none overflow-hidden shadow-[0_38px_120px_rgba(0,0,0,0.58)]"
          style={
            {
              "--scene-ratio": ratio,
              aspectRatio: `${image.width} / ${image.height}`
            } as CSSProperties
          }
        >
          <Image
            src={image.src}
            alt={image.alt ?? ""}
            fill
            priority={image.priority}
            sizes="100vw"
            className="object-contain"
          />
          <div className="absolute inset-0">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function ArchiveOverlayRegion({
  region,
  children,
  className = "",
  ariaLabel
}: ArchiveOverlayRegionProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={`absolute min-w-0 ${className}`}
      style={regionStyle(region)}
    >
      {children}
    </section>
  );
}

export function ArchiveSoftHighlight({
  className = ""
}: {
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 blur-[4px] brightness-125 mix-blend-screen transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none ${className}`}
    />
  );
}

export function ArchiveHotspot({
  region,
  href,
  label,
  className = ""
}: ArchiveHotspotProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`group absolute rounded-[1.4rem] focus:outline-none focus:ring-2 focus:ring-archive-gold/70 ${className}`}
      style={regionStyle(region)}
    >
      <ArchiveSoftHighlight className="bg-[radial-gradient(circle_at_center,rgba(232,207,136,0.44),rgba(232,207,136,0.2)_42%,transparent_76%)]" />
    </Link>
  );
}

export function ArchiveBuildingShell({
  image,
  active,
  archiveSlug,
  archiveName,
  archivePersonName,
  showArchiveActions,
  signedIn,
  children,
  sceneLabel,
  navRegion
}: ArchiveBuildingShellProps) {
  return (
    <ArchiveScene image={image} sceneLabel={sceneLabel}>
      <ArchiveOverlayRegion region={navRegion ?? sideNavRegion} ariaLabel="Navigation">
        <ArchiveSideNavigation
          active={active}
          archiveSlug={archiveSlug}
          archiveName={archiveName}
          archivePersonName={archivePersonName}
          showArchiveActions={showArchiveActions}
          signedIn={signedIn}
        />
      </ArchiveOverlayRegion>
      {children}
    </ArchiveScene>
  );
}
