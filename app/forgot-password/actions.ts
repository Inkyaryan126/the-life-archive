"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/qr";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getLoginPath(message: string) {
  return `/forgot-password?message=${encodeURIComponent(message)}`;
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = readString(formData, "email");
  const supabase = await createClient();

  if (!email || !email.includes("@")) {
    redirect(
      getLoginPath(
        "Enter a valid email address so we can send password reset instructions."
      )
    );
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`
    });

    if (error) {
      console.error("password_reset_request_failed", {
        errorMessage: error.message,
        errorCode: error.code,
        emailDomain: email.split("@")[1] ?? null
      });
    }
  } catch (error) {
    console.error("password_reset_request_failed", {
      errorMessage: error instanceof Error ? error.message : "Unknown error.",
      emailDomain: email.split("@")[1] ?? null
    });
  }

  redirect("/forgot-password?success=sent");
}
