export type ArchiveBuildingNavActive =
  | "dashboard"
  | "grand-hall"
  | "eternism"
  | "add-memory"
  | "voice-sound"
  | "photo-video"
  | "letter-journal"
  | "time-capsules"
  | "keepsakes"
  | "member-card"
  | "storykeeper-products"
  | "qr"
  | "after-a-loss"
  | "help-for-families"
  | "build-your-legacy"
  | "preserve-their-voice"
  | "how-it-works"
  | "faq"
  | "settings"
  | "legacy-question";

type ArchiveBuildingMenuLink = {
  active: ArchiveBuildingNavActive;
  href: string;
  kind: "link";
  label: string;
};

type ArchiveBuildingMenuDivider = {
  kind: "divider";
};

type ArchiveBuildingMenuHeader = {
  kind: "header";
  label: string;
};

export type ArchiveBuildingMenuItem =
  | ArchiveBuildingMenuLink
  | ArchiveBuildingMenuDivider
  | ArchiveBuildingMenuHeader;

export function getArchiveBuildingMenuItems(
  archiveSlug?: string | null
): ArchiveBuildingMenuItem[] {
  const archiveHref = archiveSlug ? `/archive/${archiveSlug}` : "/create";
  const addMemoryHref = archiveSlug ? `${archiveHref}/add-memory` : "/create";

  return [
    { kind: "header", label: "ARCHIVE" },
    { kind: "link", href: "/dashboard", label: "My Archives", active: "dashboard" },
    { kind: "link", href: "/", label: "Grand Hall", active: "grand-hall" },
    { kind: "link", href: "/eternism", label: "Eternist Observatory", active: "eternism" },

    { kind: "divider" },
    { kind: "header", label: "PRESERVE" },
    { kind: "link", href: addMemoryHref, label: "Add a Memory", active: "add-memory" },
    { kind: "link", href: "/dashboard/time-capsules", label: "Time Capsules", active: "time-capsules" },
    { kind: "link", href: "/keepsakes", label: "Keepsake Store", active: "keepsakes" },
    { kind: "link", href: "/member-card", label: "Member Card", active: "member-card" },
    { kind: "link", href: "/storykeeper-products", label: "Storykeeper Products", active: "storykeeper-products" },

    { kind: "divider" },
    { kind: "header", label: "GUIDANCE" },
    { kind: "link", href: "/after-a-loss", label: "After a Loss", active: "after-a-loss" },
    { kind: "link", href: "/help-for-families", label: "Help for Families", active: "help-for-families" },
    { kind: "link", href: "/build-your-legacy", label: "Build Your Legacy", active: "build-your-legacy" },
    { kind: "link", href: "/preserve-their-voice", label: "Preserve Their Voice", active: "preserve-their-voice" },
    { kind: "link", href: "/#how-it-works", label: "How It Works", active: "how-it-works" },
    { kind: "link", href: "/faq", label: "FAQ", active: "faq" },

    { kind: "divider" },
    { kind: "header", label: "ACCOUNT" },
    { kind: "link", href: "/dashboard/settings", label: "Settings", active: "settings" }
  ];
}
