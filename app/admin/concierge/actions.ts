"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addAdminConciergeKeepsake,
  addAdminConciergeMaterial,
  ArchiveConciergeError,
  updateAdminConciergeOrderDetails,
  updateAdminConciergeOrderStatus
} from "@/lib/archive-concierge";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function readNumber(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function redirectWithError(orderId: string | null, message: string): never {
  const target = orderId
    ? `/admin/concierge/${encodeURIComponent(orderId)}`
    : "/admin/concierge";
  redirect(`${target}?error=${encodeURIComponent(message)}`);
}

function redirectWithSuccess(orderId: string, success: string): never {
  redirect(
    `/admin/concierge/${encodeURIComponent(orderId)}?success=${encodeURIComponent(success)}`
  );
}

function getOrderId(formData: FormData) {
  return readString(formData, "orderId");
}

export async function updateConciergeStatusAction(formData: FormData) {
  const orderId = getOrderId(formData);
  if (!orderId) redirectWithError(null, "Order ID is missing.");

  try {
    await updateAdminConciergeOrderStatus({
      orderId,
      status: readString(formData, "status"),
      note: readString(formData, "note"),
      customerVisible: readBoolean(formData, "customerVisible")
    });
  } catch (error) {
    redirectWithError(
      orderId,
      error instanceof Error ? error.message : "Unable to update status."
    );
  }

  revalidatePath("/admin/concierge");
  revalidatePath(`/admin/concierge/${orderId}`);
  redirectWithSuccess(orderId, "status-updated");
}

export async function updateConciergeDetailsAction(formData: FormData) {
  const orderId = getOrderId(formData);
  if (!orderId) redirectWithError(null, "Order ID is missing.");

  try {
    await updateAdminConciergeOrderDetails({
      orderId,
      assignedAdminId: readString(formData, "assignedAdminId"),
      internalNotes: readString(formData, "internalNotes"),
      receivedItemCount: readNumber(formData, "receivedItemCount"),
      customerApproved: readBoolean(formData, "customerApproved")
    });
  } catch (error) {
    redirectWithError(
      orderId,
      error instanceof Error ? error.message : "Unable to update order details."
    );
  }

  revalidatePath("/admin/concierge");
  revalidatePath(`/admin/concierge/${orderId}`);
  redirectWithSuccess(orderId, "details-updated");
}

export async function addConciergeMaterialAction(formData: FormData) {
  const orderId = getOrderId(formData);
  if (!orderId) redirectWithError(null, "Order ID is missing.");

  try {
    await addAdminConciergeMaterial({
      orderId,
      materialType: readString(formData, "materialType"),
      originalName: readString(formData, "originalName"),
      quantity: readNumber(formData, "quantity"),
      customerDescription: readString(formData, "customerDescription"),
      internalNotes: readString(formData, "internalNotes"),
      received: readBoolean(formData, "received")
    });
  } catch (error) {
    redirectWithError(
      orderId,
      error instanceof ArchiveConciergeError
        ? error.message
        : "Unable to add material entry."
    );
  }

  revalidatePath(`/admin/concierge/${orderId}`);
  redirectWithSuccess(orderId, "material-added");
}

export async function addConciergeKeepsakeAction(formData: FormData) {
  const orderId = getOrderId(formData);
  if (!orderId) redirectWithError(null, "Order ID is missing.");

  try {
    await addAdminConciergeKeepsake({
      orderId,
      keepsakeType: readString(formData, "keepsakeType"),
      quantity: readNumber(formData, "quantity"),
      engravingText: readString(formData, "engravingText"),
      productionStatus: readString(formData, "productionStatus"),
      internalNotes: readString(formData, "internalNotes")
    });
  } catch (error) {
    redirectWithError(
      orderId,
      error instanceof ArchiveConciergeError
        ? error.message
        : "Unable to add keepsake."
    );
  }

  revalidatePath(`/admin/concierge/${orderId}`);
  redirectWithSuccess(orderId, "keepsake-added");
}
