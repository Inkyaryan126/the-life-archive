"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  cancelScheduledMemoryDelivery,
  createScheduledMemoryDelivery,
  requestManualScheduledMemoryDeliveryRetry,
  TimeCapsuleDomainError,
  updatePendingScheduledMemoryDelivery
} from "@/lib/time-capsules";
import {
  type TimeCapsuleActionState,
  type TimeCapsuleFieldName
} from "./state";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getLoginRedirectPath(path: string) {
  return `/login?next=${encodeURIComponent(path)}`;
}

function mapDomainErrorToState(
  error: unknown,
  fallbackFormError = "We couldn’t schedule this delivery. Nothing was sent. Check the details and try again."
): TimeCapsuleActionState {
  if (!(error instanceof TimeCapsuleDomainError)) {
    return {
      fieldErrors: {},
      formError: fallbackFormError
    };
  }

  const fieldErrors: Partial<Record<TimeCapsuleFieldName, string>> = {};
  let formError = fallbackFormError;

  switch (error.code) {
    case "archive_not_found":
      fieldErrors.archiveId = "Choose a valid archive.";
      break;
    case "memory_not_found":
      fieldErrors.memoryId = "Choose a memory from the selected archive.";
      break;
    case "invalid_recipient_name":
      fieldErrors.recipientName = error.message;
      break;
    case "invalid_recipient_email":
      fieldErrors.recipientEmail = error.message;
      break;
    case "invalid_personal_note":
      fieldErrors.personalNote = error.message;
      break;
    case "invalid_timezone":
      fieldErrors.timezone = error.message;
      break;
    case "invalid_delivery_date":
      fieldErrors.localDate = error.message;
      break;
    case "delivery_date_not_future":
      fieldErrors.localDate = error.message;
      break;
    case "invalid_delivery_time":
      fieldErrors.localTime = error.message;
      break;
    case "invalid_local_delivery_time":
      formError =
        "Choose a valid delivery date, time, and timezone.";
      break;
    case "delivery_not_editable":
      formError = "This Time Capsule can no longer be edited.";
      break;
    case "delivery_not_retryable":
      formError = "This Time Capsule can no longer be retried.";
      break;
    case "delivery_not_cancelable":
      formError = "This Time Capsule can no longer be canceled.";
      break;
    default:
      if (error.message) {
        formError = error.message;
      }
      break;
  }

  return {
    fieldErrors,
    formError
  };
}

function redirectWithSafeError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createTimeCapsuleAction(
  _state: TimeCapsuleActionState,
  formData: FormData
) {
  const archiveId = readString(formData, "archiveId");
  const memoryId = readString(formData, "memoryId");
  const recipientName = readString(formData, "recipientName");
  const recipientEmail = readString(formData, "recipientEmail");
  const personalNote = readString(formData, "personalNote");
  const timezone = readString(formData, "timezone");
  const localDate = readString(formData, "localDate");
  const localTime = readString(formData, "localTime");

  let deliveryId: string | null = null;

  try {
    const delivery = await createScheduledMemoryDelivery({
      archiveId,
      memoryId,
      recipientName,
      recipientEmail,
      personalNote,
      timezone,
      localDate,
      localTime
    });
    deliveryId = delivery.id;
  } catch (error) {
    if (error instanceof TimeCapsuleDomainError && error.code === "authentication_required") {
      redirect(getLoginRedirectPath("/dashboard/time-capsules/new"));
    }

    return mapDomainErrorToState(error);
  }

  if (!deliveryId) {
    return mapDomainErrorToState(
      new Error("We couldn’t schedule this delivery. Nothing was sent. Check the details and try again.")
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/time-capsules");
  revalidatePath("/dashboard/time-capsules/new");
  redirect(`/dashboard/time-capsules/${deliveryId}?success=created`);
}

export async function updateTimeCapsuleAction(
  _state: TimeCapsuleActionState,
  formData: FormData
) {
  const deliveryId = readString(formData, "deliveryId");
  const recipientName = readString(formData, "recipientName");
  const recipientEmail = readString(formData, "recipientEmail");
  const personalNote = readString(formData, "personalNote");
  const timezone = readString(formData, "timezone");
  const localDate = readString(formData, "localDate");
  const localTime = readString(formData, "localTime");

  if (!deliveryId) {
    return {
      fieldErrors: {},
      formError: "We couldn’t update this Time Capsule. Nothing was sent."
    };
  }

  let updatedDeliveryId: string | null = null;

  try {
    const delivery = await updatePendingScheduledMemoryDelivery({
      deliveryId,
      recipientName,
      recipientEmail,
      personalNote,
      timezone,
      localDate,
      localTime
    });
    updatedDeliveryId = delivery.id;
  } catch (error) {
    if (error instanceof TimeCapsuleDomainError && error.code === "authentication_required") {
      redirect(getLoginRedirectPath(`/dashboard/time-capsules/${deliveryId}/edit`));
    }

    return mapDomainErrorToState(
      error,
      "We couldn’t update this Time Capsule. Nothing was sent."
    );
  }

  if (!updatedDeliveryId) {
    return {
      fieldErrors: {},
      formError: "We couldn’t update this Time Capsule. Nothing was sent."
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/time-capsules");
  revalidatePath(`/dashboard/time-capsules/${updatedDeliveryId}`);
  revalidatePath(`/dashboard/time-capsules/${updatedDeliveryId}/edit`);
  redirect(`/dashboard/time-capsules/${updatedDeliveryId}?success=updated`);
}

export async function cancelTimeCapsuleAction(formData: FormData) {
  const deliveryId = readString(formData, "deliveryId");

  if (!deliveryId) {
    redirect("/dashboard/time-capsules");
  }

  try {
    await cancelScheduledMemoryDelivery(deliveryId);
  } catch (error) {
    if (error instanceof TimeCapsuleDomainError && error.code === "authentication_required") {
      redirect(getLoginRedirectPath(`/dashboard/time-capsules/${deliveryId}`));
    }

    redirectWithSafeError(
      `/dashboard/time-capsules/${deliveryId}`,
      "We couldn’t cancel this Time Capsule. Nothing else was changed."
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/time-capsules");
  revalidatePath(`/dashboard/time-capsules/${deliveryId}`);
  redirect(`/dashboard/time-capsules/${deliveryId}?success=canceled`);
}

export async function retryTimeCapsuleAction(formData: FormData) {
  const deliveryId = readString(formData, "deliveryId");

  if (!deliveryId) {
    redirect("/dashboard/time-capsules");
  }

  try {
    await requestManualScheduledMemoryDeliveryRetry(deliveryId);
  } catch (error) {
    if (error instanceof TimeCapsuleDomainError && error.code === "authentication_required") {
      redirect(getLoginRedirectPath(`/dashboard/time-capsules/${deliveryId}`));
    }

    redirectWithSafeError(
      `/dashboard/time-capsules/${deliveryId}`,
      "We couldn’t schedule another attempt. Check the delivery details and try again."
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/time-capsules");
  revalidatePath(`/dashboard/time-capsules/${deliveryId}`);
  redirect(`/dashboard/time-capsules/${deliveryId}?success=retried`);
}
