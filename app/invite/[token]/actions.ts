"use server";

import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import {
  acceptContributorInvitation,
  declineContributorInvitation
} from "@/lib/archive-contributors";

export async function acceptInviteAction(rawToken: string) {
  const account = await getAccountContext();
  if (!account.user) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${rawToken}`)}`);
  }

  const result = await acceptContributorInvitation({
    rawToken,
    authenticatedUserId: account.user.id,
    authenticatedUserEmail: account.user.email
  });

  if (!result.success) {
    redirect(`/invite/${rawToken}?error=${encodeURIComponent(result.message)}`);
  }

  const redirectPath = result.archiveSlug ? `/archive/${result.archiveSlug}?accepted=1` : "/dashboard";
  redirect(redirectPath);
}

export async function declineInviteAction(rawToken: string) {
  const account = await getAccountContext();

  const result = await declineContributorInvitation({
    rawToken,
    authenticatedUserId: account.user?.id,
    authenticatedUserEmail: account.user?.email
  });

  if (!result.success) {
    redirect(`/invite/${rawToken}?error=${encodeURIComponent(result.message)}`);
  }

  redirect("/dashboard?declined=1");
}
