"use server";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/qr";
import { redirect } from "next/navigation";

function getSafeNextPath(value: FormDataEntryValue | null, fallback: string) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : fallback;
}

function getLoginErrorPath(message: string, nextPath: string) {
  return `/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(nextPath)}`;
}

function getSignupErrorMessage(error: { message?: string } | null | undefined) {
  const message = (error?.message || "").toLowerCase();

  if (
    message.includes("already registered") ||
    message.includes("already been registered")
  ) {
    return "That email already has an account. Sign in instead, or use a different email to create a new archive.";
  }

  if (message.includes("rate limit exceeded") || message.includes("too many requests")) {
    return "That address was just used recently. Please wait a little while before trying again.";
  }

  if (message.includes("password")) {
    return "Your password needs to be at least 6 characters long.";
  }

  if (
    (message.includes("invalid") || message.includes("must be")) &&
    message.includes("email")
  ) {
    return "That email address looks incomplete. Check it and try again.";
  }

  return "We couldn't create your account. Check your details and try again.";
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextPath = getSafeNextPath(formData.get("next"), "/dashboard?welcome=back");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      getLoginErrorPath(
        "We couldn't sign you in. Check your email and password, then try again.",
        nextPath
      )
    );
  }

  redirect(nextPath);
}

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();
  const createArchivePath = "/create?relationshipToOwner=self";
  const nextPath = getSafeNextPath(formData.get("next"), createArchivePath);
  const confirmationPath = nextPath;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(confirmationPath)}`
    }
  });

  if (error) {
    redirect(
      getLoginErrorPath(
        getSignupErrorMessage(error),
        nextPath
      )
    );
  }

  if (data.session) {
    redirect(nextPath);
  }

  redirect(
    `/login?confirmation=pending&next=${encodeURIComponent(nextPath)}`
  );
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
