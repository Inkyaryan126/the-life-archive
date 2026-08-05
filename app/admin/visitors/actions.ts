"use server";

import { getAdminAccess } from "@/lib/admin";
import { upsertVisitorNote as upsertNoteInDb } from "@/lib/advertising-campaigns";

export async function upsertVisitorNoteAction(input: {
  visitorId: string;
  note?: string | null;
  tags?: string[];
  manualClassification?: "human" | "bot" | "internal" | "ignored" | null;
  isIgnored?: boolean;
  isInternal?: boolean;
  isBlocked?: boolean;
}) {
  const { isAdmin } = await getAdminAccess();
  if (!isAdmin) {
    throw new Error("Unauthorized admin access required.");
  }

  return upsertNoteInDb(input);
}

export async function toggleLinkDisabledAction(linkId: string, isDisabled: boolean) {
  const { isAdmin } = await getAdminAccess();
  if (!isAdmin) {
    throw new Error("Unauthorized admin access required.");
  }

  const { toggleLinkDisabled } = await import("@/lib/advertising-campaigns");
  return toggleLinkDisabled(linkId, isDisabled);
}

export async function updateTrackableLinkAction(input: {
  id: string;
  linkName?: string;
  destinationPath?: string;
  campaignId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  tlaMaterial?: string | null;
}) {
  const { isAdmin } = await getAdminAccess();
  if (!isAdmin) {
    throw new Error("Unauthorized admin access required.");
  }

  const { updateTrackableLink } = await import("@/lib/advertising-campaigns");
  return updateTrackableLink(input);
}
