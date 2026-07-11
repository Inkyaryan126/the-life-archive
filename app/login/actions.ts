"use server";

import { createClient } from "@/lib/supabase/server";
import { getSafeInternalPath } from "@/lib/safe-path";
import { redirect } from "next/navigation";

function getSafeNextPath(value: FormDataEntryValue | null, fallback: string) {
  return getSafeInternalPath(typeof value === "string" ? value : null, fallback);
}

function getLoginErrorPath(message: string, nextPath: string) {
  return `/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(nextPath)}`;
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

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
