"use server";

import { revalidatePath } from "next/cache";
import { createVisitorMessage, updateArchive, deleteVisitorMessage } from "@/lib/archive-data";
import { getAccountContext } from "@/lib/account";

export async function postVisitorMessageAction(slug: string, formData: FormData) {
  const name = formData.get("name") as string;
  const message = formData.get("message") as string;

  if (!name?.trim() || !message?.trim()) {
    return { error: "Name and message are required." };
  }

  try {
    await createVisitorMessage(slug, name, message);
    revalidatePath(`/archive/${slug}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to post message." };
  }
}

export async function deleteVisitorMessageAction(slug: string, messageId: string) {
  const account = await getAccountContext();
  if (!account.user) {
    return { error: "Unauthorized" };
  }

  try {
    await deleteVisitorMessage(messageId);
    revalidatePath(`/archive/${slug}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete message." };
  }
}

export async function updateArchiveDetailsAction(slug: string, formData: FormData) {
  const account = await getAccountContext();
  if (!account.user) {
    throw new Error("Unauthorized");
  }

  const personName = formData.get("personName") as string;
  const archiveName = formData.get("archiveName") as string;
  const bio = formData.get("bio") as string;
  const visibility = formData.get("visibility") as any;

  if (!personName?.trim() || !archiveName?.trim() || !bio?.trim()) {
    throw new Error("All fields are required.");
  }

  try {
    await updateArchive(slug, { personName, archiveName, bio, visibility });
    revalidatePath(`/archive/${slug}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to update archive.");
  }
}
