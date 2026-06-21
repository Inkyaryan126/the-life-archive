"use server";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/qr";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent("We couldn't sign you in. Check your email and password, then try again.")}`
    );
  }

  redirect("/dashboard?welcome=back");
}

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();
  const memberCardPath = "/member-card";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(memberCardPath)}`
    }
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent("We couldn't create your account. Check your details and try again.")}`
    );
  }

  if (data.session) {
    redirect(`${memberCardPath}?welcome=new`);
  }

  redirect(`${memberCardPath}?confirmation=pending`);
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
