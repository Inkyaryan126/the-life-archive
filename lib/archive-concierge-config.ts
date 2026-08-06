export const archiveConciergeArchiveTypes = ["living", "memorial"] as const;
export const archiveConciergePackageKeys = [
  "essential",
  "legacy",
  "family_legacy",
  "custom"
] as const;
export const archiveConciergeStatuses = [
  "inquiry",
  "awaiting_payment",
  "paid",
  "intake_required",
  "awaiting_materials",
  "materials_received",
  "under_review",
  "in_production",
  "customer_review",
  "changes_requested",
  "approved",
  "keepsakes_in_production",
  "ready_for_pickup",
  "shipped",
  "completed",
  "on_hold",
  "canceled"
] as const;
export const archiveConciergeServiceMethods = [
  "secure_upload",
  "cloud_link",
  "usb_dropoff",
  "hard_drive_dropoff",
  "phone_transfer",
  "physical_materials",
  "local_pickup",
  "mixed"
] as const;
export const archiveConciergeMaterialTypes = [
  "photo",
  "video",
  "audio",
  "document",
  "written_story",
  "usb_drive",
  "hard_drive",
  "phone",
  "photo_album",
  "physical_document",
  "other"
] as const;
export const archiveConciergeRevisionStatuses = [
  "requested",
  "reviewing",
  "completed",
  "declined"
] as const;
export const archiveConciergeKeepsakeStatuses = [
  "planned",
  "awaiting_approval",
  "approved",
  "in_production",
  "ready",
  "shipped",
  "picked_up",
  "canceled"
] as const;
export const archiveConciergePaymentStatuses = [
  "not_started",
  "checkout_pending",
  "paid",
  "deposit_paid",
  "payment_failed",
  "refunded",
  "partially_refunded",
  "canceled"
] as const;
export const archiveConciergePaymentModels = ["full", "deposit"] as const;

export type ArchiveConciergeArchiveType =
  (typeof archiveConciergeArchiveTypes)[number];
export type ArchiveConciergePackageKey =
  (typeof archiveConciergePackageKeys)[number];
export type ArchiveConciergeStatus =
  (typeof archiveConciergeStatuses)[number];
export type ArchiveConciergeServiceMethod =
  (typeof archiveConciergeServiceMethods)[number];
export type ArchiveConciergeMaterialType =
  (typeof archiveConciergeMaterialTypes)[number];
export type ArchiveConciergeRevisionStatus =
  (typeof archiveConciergeRevisionStatuses)[number];
export type ArchiveConciergeKeepsakeStatus =
  (typeof archiveConciergeKeepsakeStatuses)[number];
export type ArchiveConciergePaymentStatus =
  (typeof archiveConciergePaymentStatuses)[number];
export type ArchiveConciergePaymentModel =
  (typeof archiveConciergePaymentModels)[number];

export type ArchiveConciergePackageConfig = {
  key: ArchiveConciergePackageKey;
  displayName: string;
  startingPriceText: string;
  displayPrice: string;
  includedItemCount: number | null;
  includedRevisionCount: number;
  includedKeepsakeCount: number | null;
  features: string[];
  recommended: boolean;
  stripePriceEnvName: string;
  stripePriceEnv: string;
  paymentModel: ArchiveConciergePaymentModel;
  checkoutEnabled: boolean;
  requiresQuote: boolean;
  active: boolean;
};

export type ArchiveConciergePaidAddonConfig = {
  key: "memorial_priority";
  displayName: string;
  description: string;
  stripePriceEnvName: string;
  stripePriceEnv: string;
  checkoutEnabled: boolean;
  active: boolean;
};

export const archiveConciergePackages: Record<
  ArchiveConciergePackageKey,
  ArchiveConciergePackageConfig
> = {
  essential: {
    key: "essential",
    displayName: "Essential Archive",
    startingPriceText: "Starting at $249",
    displayPrice: "Starting at $249",
    includedItemCount: 50,
    includedRevisionCount: 1,
    includedKeepsakeCount: 1,
    recommended: false,
    stripePriceEnvName: "STRIPE_ARCHIVE_CONCIERGE_ESSENTIAL_PRICE_ID",
    stripePriceEnv: "STRIPE_ARCHIVE_CONCIERGE_ESSENTIAL_PRICE_ID",
    paymentModel: "full",
    checkoutEnabled: true,
    requiresQuote: false,
    active: true,
    features: [
      "Up to 50 submitted items",
      "Archive setup",
      "Basic organization",
      "Biography or archive introduction from customer notes",
      "Custom archive URL",
      "QR code",
      "One physical keepsake",
      "One revision round",
      "Standard turnaround"
    ]
  },
  legacy: {
    key: "legacy",
    displayName: "Legacy Archive",
    startingPriceText: "Starting at $499",
    displayPrice: "Starting at $499",
    includedItemCount: 150,
    includedRevisionCount: 2,
    includedKeepsakeCount: 3,
    recommended: true,
    stripePriceEnvName: "STRIPE_ARCHIVE_CONCIERGE_LEGACY_PRICE_ID",
    stripePriceEnv: "STRIPE_ARCHIVE_CONCIERGE_LEGACY_PRICE_ID",
    paymentModel: "full",
    checkoutEnabled: true,
    requiresQuote: false,
    active: true,
    features: [
      "Up to 150 submitted items",
      "Detailed organization",
      "Photo captions and basic date labeling",
      "Up to three keepsakes",
      "Two revision rounds",
      "Priority turnaround",
      "Private approval before publication"
    ]
  },
  family_legacy: {
    key: "family_legacy",
    displayName: "Family Legacy Collection",
    startingPriceText: "Starting at $899",
    displayPrice: "Starting at $899",
    includedItemCount: 400,
    includedRevisionCount: 3,
    includedKeepsakeCount: 5,
    recommended: false,
    stripePriceEnvName: "STRIPE_ARCHIVE_CONCIERGE_FAMILY_LEGACY_PRICE_ID",
    stripePriceEnv: "STRIPE_ARCHIVE_CONCIERGE_FAMILY_LEGACY_PRICE_ID",
    paymentModel: "full",
    checkoutEnabled: true,
    requiresQuote: false,
    active: true,
    features: [
      "Up to 400 submitted items",
      "Detailed biography support",
      "Multiple contributors",
      "Five physical keepsakes",
      "Three revision rounds",
      "Priority support",
      "Private review",
      "Organized return folder or downloadable backup"
    ]
  },
  custom: {
    key: "custom",
    displayName: "Custom Project",
    startingPriceText: "Project deposit",
    displayPrice: "Project deposit",
    includedItemCount: null,
    includedRevisionCount: 0,
    includedKeepsakeCount: null,
    recommended: false,
    stripePriceEnvName: "STRIPE_ARCHIVE_CONCIERGE_CUSTOM_DEPOSIT_PRICE_ID",
    stripePriceEnv: "STRIPE_ARCHIVE_CONCIERGE_CUSTOM_DEPOSIT_PRICE_ID",
    paymentModel: "deposit",
    checkoutEnabled: true,
    requiresQuote: true,
    active: true,
    features: [
      "For very large collections, estates, old-media projects, or unusual requirements",
      "Intake-based quote",
      "Custom materials plan",
      "Custom keepsake plan",
      "Private review and approval"
    ]
  }
};

export const archiveConciergePaidAddons = {
  memorial_priority: {
    key: "memorial_priority",
    displayName: "Memorial Priority Service",
    description:
      "Requests expedited handling for eligible memorial projects. Availability depends on materials, deadline, project size, and scheduling capacity.",
    stripePriceEnvName: "STRIPE_ARCHIVE_CONCIERGE_MEMORIAL_PRIORITY_PRICE_ID",
    stripePriceEnv: "STRIPE_ARCHIVE_CONCIERGE_MEMORIAL_PRIORITY_PRICE_ID",
    checkoutEnabled: true,
    active: true
  }
} satisfies Record<"memorial_priority", ArchiveConciergePaidAddonConfig>;

export const archiveConciergeFutureStripeEnvNames = [
  "STRIPE_ARCHIVE_CONCIERGE_ESSENTIAL_PRICE_ID",
  "STRIPE_ARCHIVE_CONCIERGE_LEGACY_PRICE_ID",
  "STRIPE_ARCHIVE_CONCIERGE_FAMILY_LEGACY_PRICE_ID",
  "STRIPE_ARCHIVE_CONCIERGE_CUSTOM_DEPOSIT_PRICE_ID",
  "STRIPE_ARCHIVE_CONCIERGE_MEMORIAL_PRIORITY_PRICE_ID"
] as const;

export function isArchiveConciergeArchiveType(
  value: string
): value is ArchiveConciergeArchiveType {
  return archiveConciergeArchiveTypes.includes(
    value as ArchiveConciergeArchiveType
  );
}

export function isArchiveConciergePackageKey(
  value: string
): value is ArchiveConciergePackageKey {
  return archiveConciergePackageKeys.includes(
    value as ArchiveConciergePackageKey
  );
}

export function isArchiveConciergeStatus(
  value: string
): value is ArchiveConciergeStatus {
  return archiveConciergeStatuses.includes(value as ArchiveConciergeStatus);
}

export function isArchiveConciergeServiceMethod(
  value: string
): value is ArchiveConciergeServiceMethod {
  return archiveConciergeServiceMethods.includes(
    value as ArchiveConciergeServiceMethod
  );
}

export function isArchiveConciergeMaterialType(
  value: string
): value is ArchiveConciergeMaterialType {
  return archiveConciergeMaterialTypes.includes(
    value as ArchiveConciergeMaterialType
  );
}

export function isArchiveConciergeKeepsakeStatus(
  value: string
): value is ArchiveConciergeKeepsakeStatus {
  return archiveConciergeKeepsakeStatuses.includes(
    value as ArchiveConciergeKeepsakeStatus
  );
}

export function isArchiveConciergePaymentStatus(
  value: string
): value is ArchiveConciergePaymentStatus {
  return archiveConciergePaymentStatuses.includes(
    value as ArchiveConciergePaymentStatus
  );
}

export function isArchiveConciergePaymentModel(
  value: string
): value is ArchiveConciergePaymentModel {
  return archiveConciergePaymentModels.includes(
    value as ArchiveConciergePaymentModel
  );
}

export function getArchiveConciergePackage(key: string) {
  if (!isArchiveConciergePackageKey(key)) {
    return null;
  }

  const pkg = archiveConciergePackages[key];
  return pkg.active ? pkg : null;
}

export function getArchiveConciergePackageList() {
  return archiveConciergePackageKeys
    .map((key) => archiveConciergePackages[key])
    .filter((pkg) => pkg.active);
}
