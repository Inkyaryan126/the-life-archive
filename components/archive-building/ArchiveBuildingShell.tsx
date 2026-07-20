import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { signOutAction } from "@/app/login/actions";
import { ArchiveRoomArrival } from "@/components/archive-building/ArchiveArrival";
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

const desktopArrivalCopy: Record<
  string,
  { title: string; subtitle: string }
> = {
  dashboard: {
    title: "My Archives",
    subtitle: "Every legacy begins with a single memory."
  },
  "time-capsules": {
    title: "Time Capsule Vault",
    subtitle: "Some words are meant for another day."
  },
  keepsakes: {
    title: "Keepsakes",
    subtitle: "Some memories deserve something you can hold."
  },
  "member-card": {
    title: "Member Card",
    subtitle: "Carry a doorway back to the stories that matter."
  },
  settings: {
    title: "Archive Settings",
    subtitle: "Every archive is as unique as the life it protects."
  },
  eternism: {
    title: "Eternist Observatory",
    subtitle: "Memory, identity, and the long horizon of human continuity."
  },
  "add-memory": {
    title: "Preserve a Memory",
    subtitle: "The smallest moment can become someone's greatest treasure."
  },
  "voice-sound": {
    title: "Recording Room",
    subtitle: "One voice can outlive a lifetime."
  },
  "photo-video": {
    title: "Photo & Video",
    subtitle: "A single image can hold an entire chapter."
  },
  "letter-journal": {
    title: "The Writing Room",
    subtitle: "Some words deserve to remain long after we are gone."
  },
  qr: {
    title: "Archive Access",
    subtitle: "One scan can open a lifetime of memories."
  },
  library: {
    title: "The Library",
    subtitle: "Every memory deserves a place on the shelf."
  },
  memorial: {
    title: "Memorial",
    subtitle: "Love leaves echoes. We help preserve them."
  }
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
  label,
  active
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group flex min-h-[clamp(1.2rem,1.5vw,1.75rem)] items-center justify-between gap-1.5 rounded px-[clamp(0.25rem,0.4vw,0.55rem)] py-[clamp(0.08rem,0.16vw,0.24rem)] text-[clamp(0.58rem,0.68vw,0.8rem)] font-semibold leading-tight transition focus:outline-none focus:ring-1 focus:ring-archive-gold/60 ${
        active
          ? "bg-archive-gold/15 text-archive-gold shadow-[inset_0_0_0_1px_rgba(202,164,92,0.22)] drop-shadow-[0_0_10px_rgba(232,207,136,0.3)]"
          : "text-archive-ivory/80 hover:bg-white/[0.04] hover:text-archive-gold"
      }`}
    >
      <span className="min-w-0 truncate">
        {label}
      </span>
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-full transition ${
          active ? "bg-archive-gold" : "bg-archive-ivory/20 group-hover:bg-archive-gold/50"
        }`}
      />
    </Link>
  );
}

function ArchiveNavHeader({ label }: { label: string }) {
  return (
    <p className="px-[clamp(0.25rem,0.4vw,0.55rem)] pt-[clamp(0.18rem,0.28vw,0.38rem)] pb-[clamp(0.02rem,0.06vw,0.1rem)] text-[clamp(0.48rem,0.54vw,0.62rem)] font-bold uppercase tracking-[0.2em] text-archive-gold/85">
      {label}
    </p>
  );
}

function ArchiveNavDivider() {
  return (
    <div
      aria-hidden="true"
      className="my-[clamp(0.22rem,0.35vw,0.48rem)] h-px w-[92%] justify-self-center bg-[linear-gradient(90deg,transparent,rgba(202,164,92,0.5),transparent)]"
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
      className="flex h-full flex-col justify-start overflow-y-auto px-[clamp(0.35rem,0.6vw,0.75rem)] py-[clamp(0.25rem,0.5vw,0.8rem)] text-archive-ivory custom-scrollbar"
    >
      <div className="grid gap-[clamp(0.02rem,0.06vw,0.1rem)]">
        {menuItems.map((item, index) =>
          item.kind === "divider" ? (
            <ArchiveNavDivider key={`divider-${index}`} />
          ) : item.kind === "header" ? (
            <ArchiveNavHeader key={`${item.label}-${index}`} label={item.label} />
          ) : (
            <ArchiveNavLink
              key={item.label}
              href={item.href}
              label={item.label}
              active={
                active === item.active ||
                (active === "add-memory" && item.active === "add-memory") ||
                (active === "voice-sound" && item.active === "add-memory") ||
                (active === "photo-video" && item.active === "add-memory") ||
                (active === "letter-journal" && item.active === "add-memory")
              }
            />
          )
        )}
        {signedIn ? (
          <form action={signOutAction}>
            <button
              type="submit"
              className="group flex min-h-[clamp(1.2rem,1.5vw,1.75rem)] w-full items-center justify-between gap-1.5 rounded px-[clamp(0.25rem,0.4vw,0.55rem)] py-[clamp(0.08rem,0.16vw,0.24rem)] text-left text-[clamp(0.58rem,0.68vw,0.8rem)] font-semibold leading-tight text-archive-ivory/80 transition hover:bg-white/[0.04] hover:text-archive-gold focus:outline-none focus:ring-1 focus:ring-archive-gold/60"
            >
              <span className="min-w-0 truncate">Log Out</span>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-archive-ivory/20 transition group-hover:bg-archive-gold/50"
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
  sceneLabel,
  arrivalTitle,
  arrivalSubtitle
}: {
  image: SceneImage;
  children: ReactNode;
  sceneLabel: string;
  arrivalTitle?: string;
  arrivalSubtitle?: string;
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

          {arrivalTitle ? (
            <ArchiveRoomArrival
              title={arrivalTitle}
              subtitle={arrivalSubtitle}
            >
              {children}
            </ArchiveRoomArrival>
          ) : (
            <div className="absolute inset-0">{children}</div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ArchiveMobileScene({
  image,
  children,
  sceneLabel,
  title,
  subtitle,
  className = "",
  backgroundOnly = false
}: {
  image: SceneImage;
  children?: ReactNode;
  sceneLabel: string;
  title?: string;
  subtitle?: string;
  className?: string;
  backgroundOnly?: boolean;
}) {
  if (backgroundOnly) {
    return (
      <div
        aria-label={sceneLabel}
        className="pointer-events-none fixed inset-0 z-0 lg:hidden"
      >
        <Image
          src={image.src}
          alt={image.alt ?? ""}
          fill
          priority={image.priority}
          sizes="100vw"
          className="object-cover object-top"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/28 to-black/78"
        />

        {title ? (
          <div
            aria-hidden="true"
            className="mobile-room-intro absolute inset-0 z-10 flex items-center justify-center px-8 text-center"
          >
            <div className="max-w-md">
              <h1 className="font-serif text-4xl leading-tight tracking-[0.08em] text-archive-ivory drop-shadow-[0_5px_24px_rgba(0,0,0,0.95)]">
                {title}
              </h1>

              {subtitle ? (
                <p className="mt-4 text-sm leading-6 tracking-[0.08em] text-archive-champagne drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section
      aria-label={sceneLabel}
      className={`relative min-h-screen overflow-x-hidden bg-black text-archive-ivory lg:hidden ${className}`}
    >
      <div className="fixed inset-0 lg:hidden">
        <Image
          src={image.src}
          alt={image.alt ?? ""}
          fill
          priority={image.priority}
          sizes="100vw"
          className="pointer-events-none object-cover object-top"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/8 via-black/18 to-black/62"
        />
      </div>

      {title ? (
        <div
          aria-hidden="true"
          className="mobile-room-intro pointer-events-none fixed inset-0 z-[100] grid place-items-center px-8 text-center"
        >
          <div className="mobile-room-intro-copy max-w-md">
            <h1 className="mobile-room-intro-title font-serif text-[clamp(2.35rem,11vw,4rem)] leading-[1.05] tracking-[0.12em] text-archive-ivory drop-shadow-[0_6px_30px_rgba(0,0,0,1)]">
              {title}
            </h1>

            {subtitle ? (
              <p className="mobile-room-intro-subtitle mx-auto mt-5 max-w-[22rem] text-[clamp(0.82rem,3.6vw,1rem)] leading-6 tracking-[0.08em] text-archive-champagne drop-shadow-[0_5px_24px_rgba(0,0,0,1)]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div
        className={
          title
            ? "mobile-room-interface relative z-10 min-h-screen"
            : "relative z-10 min-h-screen"
        }
      >
        {children}
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
  const arrival = desktopArrivalCopy[String(active)];

  return (
    <ArchiveScene
      image={image}
      sceneLabel={sceneLabel}
      arrivalTitle={arrival?.title}
      arrivalSubtitle={arrival?.subtitle}
    >
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
