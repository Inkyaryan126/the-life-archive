"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/qr";
import {
  validatePasswordConfirmation,
  validatePassword
} from "@/lib/auth-passwords";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readPasswordString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getPagePath(message: string) {
  return `/setup-password?message=${encodeURIComponent(message)}`;
}

export async function requestSetupPasswordAction(formData: FormData) {
  const email = readString(formData, "email");
  const supabase = await createClient();

  if (!email || !email.includes("@")) {
    redirect(
      getPagePath(
        "Enter a valid email address and we will send setup instructions if an account exists."
      )
    );
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/setup-password`
    });

    if (error) {
      console.error("password_setup_request_failed", {
        errorMessage: error.message,
        errorCode: error.code,
        emailDomain: email.split("@")[1] ?? null
      });
    }
  } catch (error) {
    console.error("password_setup_request_failed", {
      errorMessage: error instanceof Error ? error.message : "Unknown error.",
      emailDomain: email.split("@")[1] ?? null
    });
  }

  redirect("/setup-password?success=sent");
}

function getErrorPath(message: string) {
  return `/setup-password?error=${encodeURIComponent(message)}`;
}

export async function createPasswordAction(formData: FormData) {
  const newPassword = readPasswordString(formData, "newPassword");
  const confirmPassword = readPasswordString(formData, "confirmPassword");
  const supabase = await createClient();
  const cookieStore = await cookies();
  const recoveryCookie = cookieStore.get("tla_recovery_session");

  if (!recoveryCookie) {
    redirect(
      getErrorPath(
        "This setup session is missing or expired. Request a fresh setup email."
      )
    );
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect(
      getErrorPath(
        "This setup session is missing or expired. Request a fresh setup email."
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
        ? "Please request a fresh setup email and try again."
        : "We could not create your password right now. Try again.";

    redirect(getErrorPath(message));
  }

  cookieStore.delete("tla_recovery_session");
  redirect("/dashboard");
}
