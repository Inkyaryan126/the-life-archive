"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  validatePasswordConfirmation,
  validatePassword
} from "@/lib/auth-passwords";

function readPasswordString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getErrorPath(message: string) {
  return `/reset-password?error=${encodeURIComponent(message)}`;
}

export async function setNewPasswordAction(formData: FormData) {
  const newPassword = readPasswordString(formData, "newPassword");
  const confirmPassword = readPasswordString(formData, "confirmPassword");
  const supabase = await createClient();
  const cookieStore = await cookies();
  const recoveryCookie = cookieStore.get("tla_recovery_session");

  if (!recoveryCookie) {
    redirect(
      getErrorPath(
        "This recovery session is missing or expired. Request a fresh password reset email."
      )
    );
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect(
      getErrorPath(
        "This recovery session is missing or expired. Request a fresh password reset email."
      )
    );
  }

  const confirmation = validatePasswordConfirmation(
    newPassword,
    confirmPassword
  );

  if (!confirmation.ok) {
    redirect(getErrorPath(confirmation.message));
  }

  const passwordValidation = validatePassword(newPassword);

  if (!passwordValidation.ok) {
    redirect(getErrorPath(passwordValidation.message));
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordValidation.value
  });

  if (error) {
    const lowerMessage = error.message.toLowerCase();
    const message =
      lowerMessage.includes("recent") || lowerMessage.includes("reauth")
        ? "Please request a fresh password reset email and try again."
        : "We could not update your password right now. Try again.";

    redirect(getErrorPath(message));
  }

  cookieStore.delete("tla_recovery_session");
  redirect("/dashboard?success=password-updated");
}
