import { generateSecureKeepsakeCode, isValidKeepsakeCode } from "./keepsake-codes";
import type { PreUnlockVisibility } from "./types";

export { generateSecureKeepsakeCode, isValidKeepsakeCode };

export type ResolvedGuestMemory = {
  id: string;
  title: string;
  type: string;
  content: string | null;
  mediaUrl: string | null;
  date: string | null;
  categories: string[];
};

export type ResolvedTimeCapsuleTeaser = {
  id: string;
  deliverAt: string;
  visibility: PreUnlockVisibility;
  title: string | null;
};

export type ResolvedKeepsakeExperienceResult =
  | {
      ok: true;
      personName: string;
      relationshipType: string;
      subjectStatus: string;
      experienceMode: string;
      memories: ResolvedGuestMemory[];
      timeCapsules: ResolvedTimeCapsuleTeaser[];
    }
  | {
      ok: false;
      error: string;
    };

/**
 * Pure evaluation logic for memory eligibility against Time Capsule delivery state.
 * Guaranteed safety rules:
 * - scheduled: locked (content/media excluded)
 * - processing: locked
 * - failed: locked (never exposes message content before actual delivery)
 * - canceled: locked
 * - delivered: eligible ONLY IF status === "delivered", deliveredAt is present, canceledAt is null, and deliverAt <= now.
 */
export function isMemoryEligibleForRecipientView(input: {
  memoryId: string;
  isAuthorizedInAllowlist: boolean;
  scheduledDelivery?: {
    status: string;
    deliverAt: string;
    deliveredAt: string | null;
    canceledAt: string | null;
  } | null;
  now?: Date;
}): boolean {
  if (!input.isAuthorizedInAllowlist) {
    return false;
  }

  const delivery = input.scheduledDelivery;
  if (!delivery) {
    // Regular memory with no scheduled delivery attached
    return true;
  }

  const currentTime = (input.now ?? new Date()).getTime();
  const deliveryTime = new Date(delivery.deliverAt).getTime();

  // Failed, processing, scheduled, canceled, or undelivered deliveries are STRICTLY LOCKED
  if (
    delivery.status !== "delivered" ||
    !delivery.deliveredAt ||
    delivery.canceledAt !== null ||
    deliveryTime > currentTime
  ) {
    return false;
  }

  return true;
}

/**
 * Pure evaluation logic for Time Capsule pre-unlock teaser metadata.
 * Safety rules:
 * - hidden: returns null (completely excluded)
 * - teaser: returns title, deliverAt, visibility (no body/media)
 * - countdown: returns title, deliverAt, visibility (no body/media)
 */
export function evaluateTimeCapsuleTeaser(input: {
  deliveryId: string;
  deliverAt: string;
  preUnlockVisibility: PreUnlockVisibility;
  title: string;
  status: string;
  canceledAt: string | null;
}): ResolvedTimeCapsuleTeaser | null {
  if (input.status !== "scheduled" && input.status !== "processing") {
    return null;
  }
  if (input.canceledAt !== null) {
    return null;
  }
  if (input.preUnlockVisibility === "hidden") {
    return null;
  }

  return {
    id: input.deliveryId,
    deliverAt: input.deliverAt,
    visibility: input.preUnlockVisibility,
    title: input.title
  };
}
