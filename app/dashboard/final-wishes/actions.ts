"use server";

import { revalidatePath } from "next/cache";
import { saveFinalWishes } from "@/lib/final-wishes-data";
import type { FinalWishes, FinalWishSong } from "@/lib/types";

export type SaveFinalWishesActionResult =
  | { success: true; wishes: FinalWishes }
  | { success: false; error: string };

export async function saveFinalWishesAction(
  archiveSlug: string,
  wishesData: Omit<Partial<FinalWishes>, "id" | "archiveId" | "userId" | "songs">,
  songsData: Array<Partial<FinalWishSong>>
): Promise<SaveFinalWishesActionResult> {
  try {
    if (!archiveSlug) {
      return { success: false, error: "Archive slug is required." };
    }

    const saved = await saveFinalWishes(archiveSlug, wishesData, songsData);
    revalidatePath("/dashboard/final-wishes");
    revalidatePath("/dashboard");

    return { success: true, wishes: saved };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to save Final Wishes."
    };
  }
}
