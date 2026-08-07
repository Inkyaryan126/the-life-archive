"use server";

import {
  createGiftConnection,
  publishGiftConnection,
  getGuidedPromptsForGift,
  type CreateGiftConnectionInput
} from "@/lib/tla2-gift-creation";
import type { PersonRelationshipType } from "@/lib/types";

export async function createGiftConnectionAction(input: CreateGiftConnectionInput) {
  if (!input.personName || input.personName.trim() === "") {
    return { ok: false, error: "Recipient name is required." };
  }

  return await createGiftConnection({
    creationKey: input.creationKey,
    personName: input.personName,
    relationshipType: input.relationshipType,
    occasion: input.occasion,
    responses: input.responses,
    accessStatus: input.accessStatus || "restricted" // Creator draft in DB
  });
}

export async function publishGiftConnectionAction(connectionId: string) {
  if (!connectionId) return { ok: false, releasedCount: 0 };
  return await publishGiftConnection(connectionId);
}

export async function getGuidedPromptsAction(
  relationshipType: PersonRelationshipType,
  occasion?: string | null
) {
  return await getGuidedPromptsForGift(relationshipType, occasion);
}
