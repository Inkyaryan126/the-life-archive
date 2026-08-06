"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ArchiveConciergeError,
  createArchiveConciergeOrder
} from "@/lib/archive-concierge";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function readOptionalNumber(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function redirectWithError(message: string): never {
  redirect(`/archive-concierge/start?error=${encodeURIComponent(message)}`);
}

export async function createArchiveConciergeOrderAction(formData: FormData) {
  let orderId: string | null = null;

  try {
    const order = await createArchiveConciergeOrder({
      customerName: readString(formData, "customerName"),
      customerEmail: readString(formData, "customerEmail"),
      customerPhone: readString(formData, "customerPhone"),
      archiveSubjectName: readString(formData, "archiveSubjectName"),
      archiveType: readString(formData, "archiveType"),
      packageKey: readString(formData, "packageKey"),
      serviceMethod: readString(formData, "serviceMethod"),
      requestedItemCount: readOptionalNumber(formData, "requestedItemCount"),
      hasMemorialDeadline: readBoolean(formData, "hasMemorialDeadline"),
      memorialDeadline: readString(formData, "memorialDeadline"),
      eventType: readString(formData, "eventType"),
      customerNotes: readString(formData, "customerNotes"),
      hasAuthority: readBoolean(formData, "hasAuthority"),
      retainedOriginals: readBoolean(formData, "retainedOriginals"),
      approvalAcknowledged: readBoolean(formData, "approvalAcknowledged")
    });
    orderId = order.id;
  } catch (error) {
    if (
      error instanceof ArchiveConciergeError &&
      error.code === "authentication_required"
    ) {
      redirect("/login?next=%2Farchive-concierge%2Fstart");
    }

    redirectWithError(
      error instanceof Error
        ? error.message
        : "We could not start your Archive Concierge order."
    );
  }

  if (!orderId) {
    redirectWithError("We could not start your Archive Concierge order.");
  }

  revalidatePath("/dashboard/concierge");
  redirect(`/dashboard/concierge/${orderId}?success=created`);
}
