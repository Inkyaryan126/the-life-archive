import type { TimeCapsuleStatus } from "@/lib/time-capsules";

const tokenPattern = /^[A-Za-z0-9_-]{32,128}$/;

export function isPlausibleTimeCapsuleDeliveryToken(rawToken: string) {
  return tokenPattern.test(rawToken.trim());
}

export function shouldExposeDeliveredMemory(input: {
  archiveId: string;
  canceledAt: string | null;
  deliveredAt: string | null;
  memoryArchiveId: string | null;
  memoryId: string | null;
  status: TimeCapsuleStatus;
  tokenHashMatches: boolean;
  tokenHashPresent: boolean;
}) {
  return Boolean(
    input.tokenHashPresent &&
      input.tokenHashMatches &&
      input.status === "delivered" &&
      input.deliveredAt &&
      !input.canceledAt &&
      input.memoryId &&
      (input.memoryArchiveId === null ||
        input.memoryArchiveId === input.archiveId)
  );
}
