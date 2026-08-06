import {
  getArchiveConciergePackage,
  isArchiveConciergeArchiveType,
  isArchiveConciergeServiceMethod,
  type ArchiveConciergeArchiveType,
  type ArchiveConciergePackageKey,
  type ArchiveConciergeServiceMethod,
  type ArchiveConciergeStatus
} from "./archive-concierge-config";

export class ArchiveConciergeError extends Error {
  constructor(
    public code:
      | "authentication_required"
      | "admin_required"
      | "invalid_customer_name"
      | "invalid_customer_email"
      | "invalid_customer_phone"
      | "invalid_subject_name"
      | "invalid_archive_type"
      | "invalid_package"
      | "invalid_service_method"
      | "invalid_item_count"
      | "invalid_deadline"
      | "missing_authority"
      | "missing_originals_acknowledgement"
      | "missing_approval_acknowledgement"
      | "not_found"
      | "invalid_status"
      | "invalid_material_type"
      | "invalid_keepsake_status"
      | "database_error",
    message: string
  ) {
    super(message);
    this.name = "ArchiveConciergeError";
  }
}

export type ArchiveConciergeIntakeInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  archiveSubjectName: string;
  archiveType: string;
  packageKey: string;
  serviceMethod?: string | null;
  requestedItemCount?: number | null;
  hasMemorialDeadline: boolean;
  memorialDeadline?: string | null;
  eventType?: string | null;
  customerNotes?: string | null;
  hasAuthority: boolean;
  retainedOriginals: boolean;
  approvalAcknowledged: boolean;
};

export type ValidatedArchiveConciergeIntake = {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  archiveSubjectName: string;
  archiveType: ArchiveConciergeArchiveType;
  packageKey: ArchiveConciergePackageKey;
  status: ArchiveConciergeStatus;
  serviceMethod: ArchiveConciergeServiceMethod | null;
  requestedItemCount: number | null;
  memorialDeadline: string | null;
  eventType: string | null;
  customerNotes: string | null;
  includedRevisionCount: number;
  isRush: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function trimToNull(value: string | null | undefined, maxLength = 1000) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

export function requireText(
  value: string,
  code: ArchiveConciergeError["code"],
  label: string
) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ArchiveConciergeError(code, `${label} is required.`);
  }
  return trimmed.slice(0, 160);
}

function validateEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!emailPattern.test(email)) {
    throw new ArchiveConciergeError(
      "invalid_customer_email",
      "Enter a valid email address."
    );
  }
  return email.slice(0, 320);
}

export function normalizeItemCount(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  if (!Number.isFinite(value) || value < 0 || value > 100000) {
    throw new ArchiveConciergeError(
      "invalid_item_count",
      "Enter a reasonable approximate item count."
    );
  }

  return Math.round(value);
}

export function normalizeMemorialDeadline(input: {
  hasDeadline: boolean;
  value?: string | null;
}) {
  if (!input.hasDeadline) {
    return null;
  }

  const value = input.value?.trim();
  if (!value) {
    throw new ArchiveConciergeError(
      "invalid_deadline",
      "Enter the funeral, memorial, or event deadline."
    );
  }

  const date = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new ArchiveConciergeError(
      "invalid_deadline",
      "Enter a valid deadline date."
    );
  }

  return date.toISOString();
}

export function validateArchiveConciergeIntake(
  input: ArchiveConciergeIntakeInput
): ValidatedArchiveConciergeIntake {
  const customerName = requireText(
    input.customerName,
    "invalid_customer_name",
    "Customer name"
  );
  const customerEmail = validateEmail(input.customerEmail);
  const customerPhone = trimToNull(input.customerPhone, 40);
  const archiveSubjectName = requireText(
    input.archiveSubjectName,
    "invalid_subject_name",
    "Archive subject name"
  );

  if (!isArchiveConciergeArchiveType(input.archiveType)) {
    throw new ArchiveConciergeError(
      "invalid_archive_type",
      "Choose living or memorial archive."
    );
  }

  const pkg = getArchiveConciergePackage(input.packageKey);
  if (!pkg) {
    throw new ArchiveConciergeError("invalid_package", "Choose a valid package.");
  }

  const serviceMethodValue = trimToNull(input.serviceMethod, 80);
  if (
    serviceMethodValue &&
    !isArchiveConciergeServiceMethod(serviceMethodValue)
  ) {
    throw new ArchiveConciergeError(
      "invalid_service_method",
      "Choose a valid material-delivery method."
    );
  }

  if (!input.hasAuthority) {
    throw new ArchiveConciergeError(
      "missing_authority",
      "Confirm that you have authority or permission to submit these materials."
    );
  }

  if (!input.retainedOriginals) {
    throw new ArchiveConciergeError(
      "missing_originals_acknowledgement",
      "Confirm that you will retain original copies of digital files."
    );
  }

  if (!input.approvalAcknowledged) {
    throw new ArchiveConciergeError(
      "missing_approval_acknowledgement",
      "Confirm that nothing will be published without your approval."
    );
  }

  const memorialDeadline = normalizeMemorialDeadline({
    hasDeadline: input.hasMemorialDeadline,
    value: input.memorialDeadline
  });

  return {
    customerName,
    customerEmail,
    customerPhone,
    archiveSubjectName,
    archiveType: input.archiveType,
    packageKey: pkg.key,
    status: "inquiry",
    serviceMethod: serviceMethodValue as ArchiveConciergeServiceMethod | null,
    requestedItemCount: normalizeItemCount(input.requestedItemCount),
    memorialDeadline,
    eventType: trimToNull(input.eventType, 120),
    customerNotes: trimToNull(input.customerNotes, 4000),
    includedRevisionCount: pkg.includedRevisionCount,
    isRush: Boolean(memorialDeadline)
  };
}

export function assertNoInternalCustomerFields(order: Record<string, unknown>) {
  const serialized = JSON.stringify(order);
  return ![
    "internalNotes",
    "assignedAdminId",
    "archiveId",
    "stripeCheckoutSessionId",
    "stripePaymentIntentId",
    "stripeCustomerId",
    "lastPaymentEventId",
    "stripeCheckoutExpiresAt",
    "storagePath",
    "intakeCondition"
  ].some((key) => serialized.includes(key));
}
