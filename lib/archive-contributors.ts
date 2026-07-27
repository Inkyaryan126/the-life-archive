import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { sendEmail } from "./resend-email";
import { getSiteUrl } from "./qr";
import { checkRateLimit } from "./rate-limit";

export type ContributorRole = "viewer" | "contributor" | "manager";
export type ContributorStatus = "pending" | "accepted" | "declined" | "revoked" | "expired";

export type ArchiveContributorRecord = {
  id: string;
  archiveId: string;
  email: string;
  userId: string | null;
  role: ContributorRole;
  status: ContributorStatus;
  invitedBy: string;
  expiresAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateRawInviteToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashInviteToken(rawToken: string): string {
  if (!rawToken || typeof rawToken !== "string" || rawToken.trim().length < 16) {
    throw new Error("Invalid token format.");
  }
  return createHash("sha256").update(rawToken.trim()).digest("hex");
}

export function getInvitationExpirationDate(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeSubjectName(value: string): string {
  return value.replace(/[\r\n]+/g, " ").slice(0, 120);
}

export function buildContributorInviteEmail(input: {
  inviterName: string;
  archiveTitle: string;
  inviteUrl: string;
  expiresAt: Date;
}) {
  const inviterName = input.inviterName.trim() || "An archive owner";
  const archiveTitle = input.archiveTitle.trim() || "Life Archive";
  const subject = `You're invited to contribute to ${safeSubjectName(archiveTitle)}`;
  const formattedExpiry = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(input.expiresAt);

  const escapedInviterName = escapeHtml(inviterName);
  const escapedArchiveTitle = escapeHtml(archiveTitle);
  const escapedInviteUrl = escapeHtml(input.inviteUrl);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#11100e;color:#eee5d2;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#11100e;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border:1px solid rgba(198,161,91,0.28);background:#171511;border-radius:18px;">
            <tr>
              <td style="padding:30px 28px;">
                <p style="margin:0 0 18px;color:#c6a15b;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">The Life Archive</p>
                <h1 style="margin:0;color:#f5eddc;font-family:Georgia,Times,serif;font-size:28px;line-height:1.2;font-weight:400;">Archive Contributor Invitation</h1>
                <p style="margin:18px 0 0;color:#cfc4ad;font-size:16px;line-height:1.7;">${escapedInviterName} invited you to contribute memories to &ldquo;<strong>${escapedArchiveTitle}</strong>&rdquo; on The Life Archive.</p>
                <p style="margin:12px 0 0;color:#a89f8c;font-size:14px;line-height:1.6;">Creating an account is free if you do not already have one.</p>

                <p style="margin:28px 0 0;">
                  <a href="${escapedInviteUrl}" style="display:inline-block;border-radius:999px;background:#c6a15b;color:#11100e;font-size:14px;font-weight:700;line-height:1;text-decoration:none;padding:14px 24px;">View Invitation</a>
                </p>
                <p style="margin:22px 0 0;color:#8a8170;font-size:12px;line-height:1.6;">This invitation will expire on ${formattedExpiry}.</p>
                <p style="margin:8px 0 0;color:#7f7668;font-size:12px;line-height:1.6;">If you do not recognize this invitation, you can safely ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textLines = [
    "The Life Archive",
    "",
    "Archive Contributor Invitation",
    "",
    `${inviterName} invited you to contribute memories to "${archiveTitle}" on The Life Archive.`,
    "Creating an account is free if you do not already have one.",
    "",
    `View Invitation: ${input.inviteUrl}`,
    "",
    `This invitation will expire on ${formattedExpiry}.`,
    "If you do not recognize this invitation, you can safely ignore this email."
  ];

  return {
    subject,
    html,
    text: textLines.join("\n")
  };
}

export async function sendContributorInvitation(input: {
  archiveId: string;
  email: string;
  inviterUserId: string;
  role?: ContributorRole;
}): Promise<{ success: boolean; message: string; invitationId?: string }> {
  const normalizedEmail = normalizeEmail(input.email);

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { success: false, message: "Please provide a valid email address." };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Verify inviter owns the archive
  const { data: archive } = await (supabase.from("archives" as any) as any)
    .select("id, archive_name, owner_id")
    .eq("id", input.archiveId)
    .maybeSingle();

  if (!archive || archive.owner_id !== input.inviterUserId) {
    return { success: false, message: "Unauthorized. You do not own this archive." };
  }

  // Prevent inviter from inviting their own email
  const { data: inviterUser } = await adminSupabase.auth.admin.getUserById(input.inviterUserId);
  if (inviterUser?.user?.email && normalizeEmail(inviterUser.user.email) === normalizedEmail) {
    return { success: false, message: "You cannot invite your own email address." };
  }

  // Rate limiting check per inviter / archive
  const rateLimitResult = await checkRateLimit({
    identifier: `invite:${input.inviterUserId}:${input.archiveId}`,
    limit: 10,
    windowSeconds: 3600
  });

  if (!rateLimitResult.allowed) {
    return { success: false, message: "Invitation limit reached. Please wait before sending more invitations." };
  }

  // Check for existing accepted or pending invitations
  const { data: existingInviteRaw } = await (adminSupabase.from("archive_contributors" as any) as any)
    .select("id, status, expires_at")
    .eq("archive_id", input.archiveId)
    .eq("email", normalizedEmail)
    .in("status", ["pending", "accepted"])
    .maybeSingle();

  const existingInvite = existingInviteRaw as { id: string; status: string; expires_at: string } | null;

  if (existingInvite) {
    if (existingInvite.status === "accepted") {
      return { success: false, message: "This person is already a contributor to this archive." };
    }
    const isExpired = new Date(existingInvite.expires_at) < new Date();
    if (!isExpired) {
      return { success: false, message: "An active invitation has already been sent to this email." };
    }
  }

  // Generate secure token and hash
  const rawToken = generateRawInviteToken();
  const tokenHash = hashInviteToken(rawToken);
  const expiresAt = getInvitationExpirationDate();
  const role: ContributorRole = input.role || "contributor";

  // Check if invited user already exists in auth
  let existingUserId: string | null = null;
  try {
    let page = 1;
    while (page <= 5) {
      const { data: listData } = await adminSupabase.auth.admin.listUsers({ page, perPage: 100 });
      const found = listData?.users?.find(u => u.email && normalizeEmail(u.email) === normalizedEmail);
      if (found) {
        existingUserId = found.id;
        break;
      }
      if (!listData?.users || listData.users.length < 100) break;
      page += 1;
    }
  } catch {
    // Ignore error in user search
  }

  // Insert or update invitation record
  const { data: insertedInviteRaw, error: insertError } = await (adminSupabase.from("archive_contributors" as any) as any)
    .upsert(
      {
        archive_id: input.archiveId,
        email: normalizedEmail,
        user_id: existingUserId,
        role,
        status: "pending",
        invited_by: input.inviterUserId,
        invite_token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        accepted_at: null,
        declined_at: null,
        revoked_at: null
      },
      { onConflict: "archive_id,email" }
    )
    .select("id")
    .single();

  const insertedInvite = insertedInviteRaw as { id: string } | null;

  if (insertError || !insertedInvite) {
    return { success: false, message: "Failed to create invitation. Please try again." };
  }

  // Fetch inviter display name
  const { data: inviterProfile } = await (adminSupabase.from("profiles" as any) as any)
    .select("display_name")
    .eq("id", input.inviterUserId)
    .maybeSingle();

  const inviterName = inviterProfile?.display_name || inviterUser?.user?.user_metadata?.display_name || "The Archive Owner";
  const siteUrl = getSiteUrl();
  const inviteUrl = `${siteUrl}/invite/${rawToken}`;

  const emailContent = buildContributorInviteEmail({
    inviterName,
    archiveTitle: archive.archive_name,
    inviteUrl,
    expiresAt
  });

  try {
    await sendEmail({
      to: normalizedEmail,
      ...emailContent
    });
  } catch (error) {
    console.error("Failed to send contributor invite email:", error);
    // Return generic success message so account existence is not leaked
  }

  return {
    success: true,
    message: "Invitation sent.",
    invitationId: insertedInvite.id
  };
}

export async function resendContributorInvitation(input: {
  invitationId: string;
  inviterUserId: string;
}): Promise<{ success: boolean; message: string }> {
  const adminSupabase = createAdminClient();

  const { data: inviteRaw } = await (adminSupabase.from("archive_contributors" as any) as any)
    .select("id, archive_id, email, role, status")
    .eq("id", input.invitationId)
    .maybeSingle();

  const invite = inviteRaw as { id: string; archive_id: string; email: string; role: ContributorRole; status: string } | null;

  if (!invite) {
    return { success: false, message: "Invitation not found." };
  }

  // Verify ownership
  const { data: archive } = await (adminSupabase.from("archives" as any) as any)
    .select("id, archive_name, owner_id")
    .eq("id", invite.archive_id)
    .maybeSingle();

  if (!archive || archive.owner_id !== input.inviterUserId) {
    return { success: false, message: "Unauthorized. You do not own this archive." };
  }

  if (invite.status === "accepted") {
    return { success: false, message: "This contributor has already accepted the invitation." };
  }

  const rawToken = generateRawInviteToken();
  const tokenHash = hashInviteToken(rawToken);
  const expiresAt = getInvitationExpirationDate();

  const { error: updateError } = await (adminSupabase.from("archive_contributors" as any) as any)
    .update({
      invite_token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      status: "pending",
      updated_at: new Date().toISOString()
    })
    .eq("id", invite.id);

  if (updateError) {
    return { success: false, message: "Failed to refresh invitation." };
  }

  const { data: inviterProfile } = await (adminSupabase.from("profiles" as any) as any)
    .select("display_name")
    .eq("id", input.inviterUserId)
    .maybeSingle();

  const inviterName = inviterProfile?.display_name || "The Archive Owner";
  const siteUrl = getSiteUrl();
  const inviteUrl = `${siteUrl}/invite/${rawToken}`;

  const emailContent = buildContributorInviteEmail({
    inviterName,
    archiveTitle: archive.archive_name,
    inviteUrl,
    expiresAt
  });

  try {
    await sendEmail({
      to: invite.email,
      ...emailContent
    });
  } catch (error) {
    console.error("Failed to resend contributor invite email:", error);
  }

  return { success: true, message: "Invitation resent." };
}

export async function getInvitationByRawToken(rawToken: string) {
  if (!rawToken || typeof rawToken !== "string" || rawToken.trim().length < 16) {
    return { ok: false as const, reason: "invalid" as const };
  }

  let tokenHash: string;
  try {
    tokenHash = hashInviteToken(rawToken);
  } catch {
    return { ok: false as const, reason: "invalid" as const };
  }

  const adminSupabase = createAdminClient();

  const { data: inviteRaw } = await (adminSupabase.from("archive_contributors" as any) as any)
    .select("id, archive_id, email, user_id, role, status, expires_at, invited_by")
    .eq("invite_token_hash", tokenHash)
    .maybeSingle();

  const invite = inviteRaw as { id: string; archive_id: string; email: string; user_id: string | null; role: ContributorRole; status: string; expires_at: string; invited_by: string } | null;

  if (!invite) {
    return { ok: false as const, reason: "invalid" as const };
  }

  if (invite.status !== "pending") {
    return { ok: false as const, reason: invite.status as "accepted" | "declined" | "revoked" | "expired" };
  }

  const now = new Date();
  if (new Date(invite.expires_at) < now) {
    await (adminSupabase.from("archive_contributors" as any) as any)
      .update({ status: "expired", updated_at: now.toISOString() })
      .eq("id", invite.id);

    return { ok: false as const, reason: "expired" as const };
  }

  const { data: archive } = await (adminSupabase.from("archives" as any) as any)
    .select("id, slug, archive_name, person_name")
    .eq("id", invite.archive_id)
    .maybeSingle();

  if (!archive) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const { data: inviterProfile } = await (adminSupabase.from("profiles" as any) as any)
    .select("display_name")
    .eq("id", invite.invited_by)
    .maybeSingle();

  return {
    ok: true as const,
    invitation: {
      id: invite.id,
      archiveId: archive.id,
      archiveSlug: archive.slug,
      archiveName: archive.archive_name,
      personName: archive.person_name,
      email: invite.email,
      role: invite.role as ContributorRole,
      inviterName: inviterProfile?.display_name || "The Archive Owner",
      expiresAt: invite.expires_at
    }
  };
}

export async function acceptContributorInvitation(input: {
  rawToken: string;
  authenticatedUserId: string;
  authenticatedUserEmail: string;
}): Promise<{ success: boolean; message: string; archiveSlug?: string }> {
  if (!input.rawToken || !input.authenticatedUserId || !input.authenticatedUserEmail) {
    return { success: false, message: "Invalid request parameters." };
  }

  const tokenHash = hashInviteToken(input.rawToken);
  const adminSupabase = createAdminClient();

  const { data: inviteRaw } = await (adminSupabase.from("archive_contributors" as any) as any)
    .select("id, archive_id, email, user_id, role, status, expires_at")
    .eq("invite_token_hash", tokenHash)
    .maybeSingle();

  const invite = inviteRaw as { id: string; archive_id: string; email: string; user_id: string | null; role: ContributorRole; status: string; expires_at: string } | null;

  if (!invite) {
    return { success: false, message: "Invitation not found or invalid." };
  }

  const { data: archive } = await (adminSupabase.from("archives" as any) as any)
    .select("slug")
    .eq("id", invite.archive_id)
    .maybeSingle();

  const archiveSlug = archive?.slug || "";

  // Idempotency: If already accepted by this user, return clean success
  if (invite.status === "accepted" && invite.user_id === input.authenticatedUserId) {
    return { success: true, message: "Invitation already accepted.", archiveSlug };
  }

  if (invite.status !== "pending") {
    return { success: false, message: `This invitation has already been ${invite.status}.` };
  }

  if (new Date(invite.expires_at) < new Date()) {
    await (adminSupabase.from("archive_contributors" as any) as any)
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", invite.id);

    return { success: false, message: "This invitation has expired. Ask the archive owner to send a new one." };
  }

  // Confirm email matches invited email
  const authEmailNormalized = normalizeEmail(input.authenticatedUserEmail);
  const inviteEmailNormalized = normalizeEmail(invite.email);

  if (authEmailNormalized !== inviteEmailNormalized) {
    return {
      success: false,
      message: "This invitation was sent to a different email address. Log in with the invited email to continue."
    };
  }

  const nowIso = new Date().toISOString();

  // Atomically update invitation status AND grant active access in archive_members
  const { error: inviteUpdateError } = await (adminSupabase.from("archive_contributors" as any) as any)
    .update({
      status: "accepted",
      user_id: input.authenticatedUserId,
      accepted_at: nowIso,
      updated_at: nowIso
    })
    .eq("id", invite.id)
    .eq("status", "pending");

  if (inviteUpdateError) {
    return { success: false, message: "Failed to accept invitation. Please try again." };
  }

  // Sync to canonical active access table: archive_members
  const canonicalRole = invite.role === "manager" ? "manager" : "editor";
  const { error: memberUpsertError } = await (adminSupabase.from("archive_members" as any) as any)
    .upsert(
      {
        archive_id: invite.archive_id,
        user_id: input.authenticatedUserId,
        role: canonicalRole
      },
      { onConflict: "archive_id,user_id" }
    );

  if (memberUpsertError) {
    console.error("Failed to sync archive_members on accept:", memberUpsertError);
  }

  return {
    success: true,
    message: "Invitation accepted! Welcome to the archive.",
    archiveSlug
  };
}

export async function declineContributorInvitation(input: {
  rawToken: string;
  authenticatedUserId?: string;
  authenticatedUserEmail?: string;
}): Promise<{ success: boolean; message: string }> {
  if (!input.rawToken) {
    return { success: false, message: "Invalid token." };
  }

  const tokenHash = hashInviteToken(input.rawToken);
  const adminSupabase = createAdminClient();

  const { data: inviteRaw } = await (adminSupabase.from("archive_contributors" as any) as any)
    .select("id, email, status")
    .eq("invite_token_hash", tokenHash)
    .maybeSingle();

  const invite = inviteRaw as { id: string; email: string; status: string } | null;

  if (!invite || invite.status !== "pending") {
    return { success: false, message: "Invitation not available to decline." };
  }

  if (input.authenticatedUserEmail) {
    if (normalizeEmail(input.authenticatedUserEmail) !== normalizeEmail(invite.email)) {
      return { success: false, message: "This invitation belongs to a different email address." };
    }
  }

  const nowIso = new Date().toISOString();
  await (adminSupabase.from("archive_contributors" as any) as any)
    .update({
      status: "declined",
      declined_at: nowIso,
      user_id: input.authenticatedUserId || null,
      updated_at: nowIso
    })
    .eq("id", invite.id);

  return { success: true, message: "Invitation declined." };
}

export async function revokeContributorAccess(input: {
  invitationId: string;
  ownerUserId: string;
}): Promise<{ success: boolean; message: string }> {
  const adminSupabase = createAdminClient();

  const { data: inviteRaw } = await (adminSupabase.from("archive_contributors" as any) as any)
    .select("id, archive_id, user_id, status")
    .eq("id", input.invitationId)
    .maybeSingle();

  const invite = inviteRaw as { id: string; archive_id: string; user_id: string | null; status: string } | null;

  if (!invite) {
    return { success: false, message: "Contributor record not found." };
  }

  // Verify ownership
  const { data: archive } = await (adminSupabase.from("archives" as any) as any)
    .select("id, owner_id")
    .eq("id", invite.archive_id)
    .maybeSingle();

  if (!archive || archive.owner_id !== input.ownerUserId) {
    return { success: false, message: "Unauthorized. You do not own this archive." };
  }

  const nowIso = new Date().toISOString();

  // Atomically revoke invitation status
  await (adminSupabase.from("archive_contributors" as any) as any)
    .update({
      status: "revoked",
      revoked_at: nowIso,
      updated_at: nowIso
    })
    .eq("id", invite.id);

  // Atomically remove canonical active access from archive_members
  if (invite.user_id) {
    await (adminSupabase.from("archive_members" as any) as any)
      .delete()
      .eq("archive_id", invite.archive_id)
      .eq("user_id", invite.user_id);
  }

  return { success: true, message: "Contributor access revoked." };
}

export async function getArchiveContributorsList(archiveId: string, ownerUserId: string) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Verify owner
  const { data: archive } = await (supabase.from("archives" as any) as any)
    .select("id, owner_id")
    .eq("id", archiveId)
    .maybeSingle();

  if (!archive || archive.owner_id !== ownerUserId) {
    throw new Error("Unauthorized access to archive contributors.");
  }

  const { data: listRaw } = await (adminSupabase.from("archive_contributors" as any) as any)
    .select("*")
    .eq("archive_id", archiveId)
    .order("created_at", { ascending: false });

  const rawRows = (listRaw || []) as Array<{
    id: string;
    archive_id: string;
    email: string;
    user_id: string | null;
    role: ContributorRole;
    status: ContributorStatus;
    created_at: string;
    expires_at: string;
    accepted_at: string | null;
    declined_at: string | null;
    revoked_at: string | null;
  }>;

  // Fetch profiles for users that have accepted or exist
  const userIds = rawRows.map(r => r.user_id).filter(Boolean) as string[];
  const profileMap = new Map<string, { displayName: string | null; email: string | null }>();

  if (userIds.length > 0) {
    const { data: profiles } = await (adminSupabase.from("profiles" as any) as any)
      .select("id, display_name")
      .in("id", userIds);

    (profiles || []).forEach((p: any) => {
      profileMap.set(p.id, { displayName: p.display_name, email: null });
    });
  }

  return rawRows.map(r => ({
    id: r.id,
    email: r.email,
    userId: r.user_id,
    role: r.role,
    status: r.status,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    acceptedAt: r.accepted_at,
    declinedAt: r.declined_at,
    revokedAt: r.revoked_at,
    displayName: r.user_id ? profileMap.get(r.user_id)?.displayName || null : null
  }));
}
