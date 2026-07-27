"use server";

import { revalidatePath } from "next/cache";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug } from "@/lib/archive-data";
import {
  sendContributorInvitation,
  resendContributorInvitation,
  revokeContributorAccess
} from "@/lib/archive-contributors";

export async function sendContributorInvitationAction(slug: string, formData: FormData) {
  const account = await getAccountContext();
  if (!account.user) {
    return { success: false, message: "Authentication required." };
  }

  const archive = await getArchiveBySlug(slug);
  if (!archive) {
    return { success: false, message: "Archive not found." };
  }

  const isOwner = account.archives.some((item) => item.slug === archive.slug);
  if (!isOwner) {
    return { success: false, message: "Unauthorized. Only the archive owner can invite contributors." };
  }

  const email = formData.get("email");
  if (typeof email !== "string" || !email.trim()) {
    return { success: false, message: "Email is required." };
  }

  const result = await sendContributorInvitation({
    archiveId: archive.id,
    email: email.trim(),
    inviterUserId: account.user.id,
    role: "contributor"
  });

  if (result.success) {
    revalidatePath(`/archive/${slug}/contributors`);
  }

  return result;
}

export async function resendContributorInvitationAction(slug: string, invitationId: string) {
  const account = await getAccountContext();
  if (!account.user) {
    return { success: false, message: "Authentication required." };
  }

  const archive = await getArchiveBySlug(slug);
  if (!archive) {
    return { success: false, message: "Archive not found." };
  }

  const isOwner = account.archives.some((item) => item.slug === archive.slug);
  if (!isOwner) {
    return { success: false, message: "Unauthorized. Only the archive owner can manage contributors." };
  }

  const result = await resendContributorInvitation({
    invitationId,
    inviterUserId: account.user.id
  });

  if (result.success) {
    revalidatePath(`/archive/${slug}/contributors`);
  }

  return result;
}

export async function revokeContributorAccessAction(slug: string, invitationId: string) {
  const account = await getAccountContext();
  if (!account.user) {
    return { success: false, message: "Authentication required." };
  }

  const archive = await getArchiveBySlug(slug);
  if (!archive) {
    return { success: false, message: "Archive not found." };
  }

  const isOwner = account.archives.some((item) => item.slug === archive.slug);
  if (!isOwner) {
    return { success: false, message: "Unauthorized. Only the archive owner can manage contributors." };
  }

  const result = await revokeContributorAccess({
    invitationId,
    ownerUserId: account.user.id
  });

  if (result.success) {
    revalidatePath(`/archive/${slug}/contributors`);
    revalidatePath(`/archive/${slug}`);
  }

  return result;
}
