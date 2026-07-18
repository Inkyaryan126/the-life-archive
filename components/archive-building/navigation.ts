export type ArchiveBuildingNavActive =
  | "dashboard"
  | "settings"
  | "member-card"
  | "keepsakes"
  | "time-capsules"
  | "add-memory"
  | "voice-sound"
  | "photo-video"
  | "letter-journal"
  | "qr"
  | "legacy-question";

type ArchiveBuildingMenuLink = {
  active: ArchiveBuildingNavActive;
  href: string;
  indent?: boolean;
  kind: "link";
  label: string;
};

type ArchiveBuildingMenuDivider = {
  kind: "divider";
};

export type ArchiveBuildingMenuItem =
  | ArchiveBuildingMenuLink
  | ArchiveBuildingMenuDivider;

export function getArchiveBuildingMenuItems(
  archiveSlug?: string | null
): ArchiveBuildingMenuItem[] {
  const archiveHref = archiveSlug ? `/archive/${archiveSlug}` : "/create";
  const addMemoryHref = archiveSlug ? `${archiveHref}/add-memory` : null;
  const qrHref = archiveSlug ? `${archiveHref}/qr` : "/create";

  return [
    { kind: "link", href: "/dashboard", label: "My Archives", active: "dashboard" },
    {
      kind: "link",
      href: addMemoryHref ? `${addMemoryHref}?mode=voice-sound` : "/create",
      label: "Add Voice & Sound",
      active: "voice-sound",
      indent: true
    },
    {
      kind: "link",
      href: addMemoryHref ? `${addMemoryHref}?mode=photo-video` : "/create",
      label: "Add Photos & Video",
      active: "photo-video",
      indent: true
    },
    {
      kind: "link",
      href: addMemoryHref ? `${addMemoryHref}?mode=letter-journal` : "/create",
      label: "Write a Letter or Journal Entry",
      active: "letter-journal",
      indent: true
    },
    {
      kind: "link",
      href: "/dashboard/time-capsules",
      label: "Time Capsules",
      active: "time-capsules",
      indent: true
    },
    { kind: "divider" },
    { kind: "link", href: "/keepsakes", label: "Keepsake Store", active: "keepsakes" },
    { kind: "link", href: "/member-card", label: "Member Card", active: "member-card" },
    { kind: "link", href: qrHref, label: "QR Code", active: "qr" },
    { kind: "divider" },
    { kind: "link", href: "/dashboard/settings", label: "Settings", active: "settings" }
  ];
}
