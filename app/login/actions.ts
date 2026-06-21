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

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextPath = getSafeNextPath(formData.get("next"), "/dashboard?welcome=back");
  const supabase = createClient();

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
  const supabase = createClient();
  const memberCardPath = "/member-card";
  const nextPath = getSafeNextPath(formData.get("next"), memberCardPath);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`
    }
  });

  if (error) {
    redirect(
      getLoginErrorPath(
        "We couldn't create your account. Check your details and try again.",
        nextPath
      )
    );
  }

  if (data.session) {
    redirect(nextPath === memberCardPath ? `${memberCardPath}?welcome=new` : nextPath);
  }

  redirect(`${memberCardPath}?confirmation=pending`);
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
