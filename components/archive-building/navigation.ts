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

export type ArchiveBuildingMenuLink = {
  active: ArchiveBuildingNavActive;
  href: string;
  kind: "link";
  label: string;
  requiresAuth?: boolean;
};

export type ArchiveBuildingMenuDivider = {
  kind: "divider";
};

export type ArchiveBuildingMenuHeader = {
  kind: "header";
  label: string;
};

export type ArchiveBuildingMenuItem =
  | ArchiveBuildingMenuLink
  | ArchiveBuildingMenuDivider
  | ArchiveBuildingMenuHeader;

export type ArchiveNavSection = {
  category: "ARCHIVE" | "PRESERVE" | "GUIDANCE" | "ACCOUNT";
  items: ArchiveBuildingMenuLink[];
};

export function getNavGroupedItems(
  archiveSlug?: string | null,
  signedIn = true
): ArchiveNavSection[] {
  const archiveHref = archiveSlug ? `/archive/${archiveSlug}` : "/create";
  const addMemoryHref = archiveSlug ? `${archiveHref}/add-memory` : "/create";
  const dashboardHref = signedIn ? "/dashboard" : "/login?next=%2Fdashboard";
  const timeCapsulesHref = signedIn
    ? "/dashboard/time-capsules"
    : "/login?next=%2Fdashboard%2Ftime-capsules";
  const settingsHref = signedIn
    ? "/dashboard/settings"
    : "/login?next=%2Fdashboard%2Fsettings";

  return [
    {
      category: "ARCHIVE",
      items: [
        {
          kind: "link",
          href: dashboardHref,
          label: "My Archives",
          active: "dashboard",
          requiresAuth: true
        },
        { kind: "link", href: "/", label: "Grand Hall", active: "grand-hall" },
        {
          kind: "link",
          href: "/eternism",
          label: "Eternist Observatory",
          active: "eternism"
        }
      ]
    },
    {
      category: "PRESERVE",
      items: [
        {
          kind: "link",
          href: addMemoryHref,
          label: "Add a Memory",
          active: "add-memory",
          requiresAuth: true
        },
        {
          kind: "link",
          href: timeCapsulesHref,
          label: "Time Capsules",
          active: "time-capsules"
        },
        {
          kind: "link",
          href: "/keepsakes",
          label: "Keepsake Store",
          active: "keepsakes"
        },
        {
          kind: "link",
          href: "/member-card",
          label: "Member Card",
          active: "member-card"
        }
      ]
    },
    {
      category: "GUIDANCE",
      items: [
        {
          kind: "link",
          href: "/after-a-loss",
          label: "After a Loss",
          active: "after-a-loss"
        },
        {
          kind: "link",
          href: "/help-for-families",
          label: "Help for Families",
          active: "help-for-families"
        },
        {
          kind: "link",
          href: "/build-your-legacy",
          label: "Build Your Legacy",
          active: "build-your-legacy"
        },
        {
          kind: "link",
          href: "/preserve-their-voice",
          label: "Preserve Their Voice",
          active: "preserve-their-voice"
        },
        {
          kind: "link",
          href: "/#how-it-works",
          label: "How It Works",
          active: "how-it-works"
        },
        { kind: "link", href: "/faq", label: "FAQ", active: "faq" }
      ]
    },
    {
      category: "ACCOUNT",
      items: [
        {
          kind: "link",
          href: settingsHref,
          label: "Settings",
          active: "settings",
          requiresAuth: true
        }
      ]
    }
  ];
}

export function getArchiveBuildingMenuItems(
  archiveSlug?: string | null,
  signedIn = true
): ArchiveBuildingMenuItem[] {
  const sections = getNavGroupedItems(archiveSlug, signedIn);
  const items: ArchiveBuildingMenuItem[] = [];

  sections.forEach((section, index) => {
    if (index > 0) {
      items.push({ kind: "divider" });
    }
    items.push({ kind: "header", label: section.category });
    items.push(...section.items);
  });

  return items;
}
