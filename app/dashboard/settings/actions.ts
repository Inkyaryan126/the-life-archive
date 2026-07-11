"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  validatePasswordConfirmation,
  validatePassword
} from "@/lib/auth-passwords";
import {
  validateProfileBio,
  validateProfileDisplayName
} from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";
import { getSafeInternalPath } from "@/lib/safe-path";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readPasswordString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getSafeNextPath(value: FormDataEntryValue | null, fallback: string) {
  return getSafeInternalPath(typeof value === "string" ? value : null, fallback);
}

function appendQuery(path: string, key: string, value: string) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set(key, value);
  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export async function saveProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const nextPath = getSafeNextPath(
    formData.get("next"),
    "/dashboard/settings"
  );

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const displayNameInput = readString(formData, "displayName");
  const bioInput = readString(formData, "bio");
  const displayNameValidation = validateProfileDisplayName(displayNameInput);

  if (!displayNameValidation.ok) {
    redirect(
      appendQuery(
        nextPath,
        "error",
        displayNameValidation.message
      )
    );
  }

  const bioValidation = validateProfileBio(bioInput);

  if (!bioValidation.ok) {
    redirect(appendQuery(nextPath, "error", bioValidation.message));
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayNameValidation.value,
      bio: bioValidation.value
    },
    {
      onConflict: "id"
    }
  );

  if (error) {
    redirect(
      appendQuery(
        nextPath,
        "error",
        "We could not save your profile right now. Please try again."
      )
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/admin");
  revalidatePath("/admin/legacy-question");

  redirect(appendQuery(nextPath, "success", "saved"));
}

export async function changePasswordAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const nextPath = getSafeNextPath(
    formData.get("next"),
    "/dashboard/settings"
  );

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const newPassword = readPasswordString(formData, "newPassword");
  const confirmPassword = readPasswordString(formData, "confirmPassword");
  const confirmation = validatePasswordConfirmation(newPassword, confirmPassword);

  if (!confirmation.ok) {
    redirect(appendQuery(nextPath, "error", confirmation.message));
  }

  const passwordValidation = validatePassword(newPassword);

  if (!passwordValidation.ok) {
    redirect(appendQuery(nextPath, "error", passwordValidation.message));
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordValidation.value
  });

  if (error) {
    const lowerMessage = error.message.toLowerCase();
    const message =
      lowerMessage.includes("recent") || lowerMessage.includes("reauth")
        ? "Please sign in again, then retry the password change."
        : "We could not change your password right now. Please try again.";

    redirect(appendQuery(nextPath, "error", message));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  redirect(appendQuery(nextPath, "success", "password-updated"));
}
