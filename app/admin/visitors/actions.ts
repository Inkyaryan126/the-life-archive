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
