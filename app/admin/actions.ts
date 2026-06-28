"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/admin";
import {
  isFulfillmentStatus,
  updateKeepsakeOrder
} from "@/lib/keepsake-orders";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string): never {
  redirect(`/admin?error=${encodeURIComponent(message)}`);
}

export async function updateOrderAction(formData: FormData) {
  const { isAdmin } = await getAdminAccess();

  if (!isAdmin) {
    redirectWithError("You do not have access to update orders.");
  }

  const orderId = readString(formData, "orderId");
  const fulfillmentStatus = readString(formData, "fulfillmentStatus");
  const notes = readString(formData, "notes");

  if (!orderId) {
    redirectWithError("Order ID is missing.");
  }

  if (!isFulfillmentStatus(fulfillmentStatus)) {
    redirectWithError("Choose a valid fulfillment status.");
  }

  try {
    await updateKeepsakeOrder({
      orderId,
      fulfillmentStatus,
      notes
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update order.";
    redirectWithError(message);
  }

  revalidatePath("/admin");
  redirect("/admin?success=updated");
}
