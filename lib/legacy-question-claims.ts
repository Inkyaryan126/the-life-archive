import "server-only";

import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export const legacyQuestionClaimStatuses = [
  "not_created",
  "active",
  "claimed",
  "expired",
  "revoked"
] as const;

export type LegacyQuestionClaimStatus =
  (typeof legacyQuestionClaimStatuses)[number];

export type LegacyQuestionClaimRow = {
  id: string;
  created_at: string;
  submission_id: string;
  archive_id: string;
  user_id: string;
  email: string;
  token_hash: string;
  expires_at: string;
  claimed_at: string | null;
  revoked_at: string | null;
};

export type LegacyQuestionClaimOverview = {
  claimId: string | null;
  submissionId: string;
  archiveId: string | null;
  userId: string | null;
  email: string | null;
  expiresAt: string | null;
  claimedAt: string | null;
  revokedAt: string | null;
  createdAt: string | null;
  claimStatus: LegacyQuestionClaimStatus;
};

type AdminClient = SupabaseClient<any, "public", any>;

const claimTokenBytes = 32;
const claimTokenExpiryHours = 24;

function getAdminClient() {
  return createAdminClient() as AdminClient;
}

function mapRow(row: LegacyQuestionClaimRow): LegacyQuestionClaimRow {
  return row;
}

export function generateLegacyQuestionClaimTokenValue() {
  const rawToken = crypto.randomBytes(claimTokenBytes).toString("base64url");
  const tokenHash = hashLegacyQuestionClaimToken(rawToken);
  const expiresAt = new Date(Date.now() + claimTokenExpiryHours * 60 * 60 * 1000);

  return {
    rawToken,
    tokenHash,
    expiresAt
  };
}

export function hashLegacyQuestionClaimToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function safeTokenHashCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getClaimStatus(row: Pick<
  LegacyQuestionClaimRow,
  "claimed_at" | "expires_at" | "revoked_at"
>): LegacyQuestionClaimStatus {
  if (row.claimed_at) {
    return "claimed";
  }

  if (row.revoked_at) {
    return "revoked";
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return "expired";
  }

  return "active";
}

function mapOverview(row: LegacyQuestionClaimRow | null, submissionId: string): LegacyQuestionClaimOverview {
  if (!row) {
    return {
      claimId: null,
      submissionId,
      archiveId: null,
      userId: null,
      email: null,
      expiresAt: null,
      claimedAt: null,
      revokedAt: null,
      createdAt: null,
      claimStatus: "not_created"
    };
  }

  return {
    claimId: row.id,
    submissionId: row.submission_id,
    archiveId: row.archive_id,
    userId: row.user_id,
    email: row.email,
    expiresAt: row.expires_at,
    claimedAt: row.claimed_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    claimStatus: getClaimStatus(row)
  };
}

export async function listLegacyQuestionClaimOverviews(
  submissionIds: string[]
) {
  const filteredSubmissionIds = submissionIds.filter(Boolean);

  if (filteredSubmissionIds.length === 0) {
    return new Map<string, LegacyQuestionClaimOverview>();
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("legacy_question_claim_tokens")
    .select("*")
    .in("submission_id", filteredSubmissionIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const overviews = new Map<string, LegacyQuestionClaimOverview>();
  const rows = (data ?? []) as LegacyQuestionClaimRow[];

  for (const row of rows.map(mapRow)) {
    if (!overviews.has(row.submission_id)) {
      overviews.set(row.submission_id, mapOverview(row, row.submission_id));
    }
  }

  for (const submissionId of filteredSubmissionIds) {
    if (!overviews.has(submissionId)) {
      overviews.set(submissionId, mapOverview(null, submissionId));
    }
  }

  return overviews;
}

export async function getLegacyQuestionClaimOverviewByRawToken(rawToken: string) {
  const tokenHash = hashLegacyQuestionClaimToken(rawToken);
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("legacy_question_claim_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as LegacyQuestionClaimRow;

  if (!safeTokenHashCompare(row.token_hash, tokenHash)) {
    return null;
  }

  return {
    ...mapOverview(row, row.submission_id),
    row
  };
}

export async function issueLegacyQuestionClaimToken(input: {
  submissionId: string;
  archiveId: string;
  userId: string;
  email: string;
}) {
  const { rawToken, tokenHash, expiresAt } =
    generateLegacyQuestionClaimTokenValue();
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc(
    "issue_legacy_question_claim_token",
    {
      target_submission_id: input.submissionId,
      target_archive_id: input.archiveId,
      target_user_id: input.userId,
      target_email: input.email,
      target_token_hash: tokenHash,
      target_expires_at: expiresAt.toISOString()
    }
  );

  if (error || !data) {
    throw new Error(error?.message || "Unable to create claim token.");
  }

  return {
    rawToken,
    tokenHash,
    expiresAt: expiresAt.toISOString(),
    claim: data as LegacyQuestionClaimRow
  };
}

export async function markLegacyQuestionClaimTokenClaimed(claimTokenId: string) {
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc(
    "mark_legacy_question_claim_token_claimed",
    {
      target_claim_token_id: claimTokenId
    }
  );

  if (error || !data) {
    throw new Error(error?.message || "Unable to mark the claim as used.");
  }

  return data as LegacyQuestionClaimRow;
}

export async function revokeLegacyQuestionClaimTokensForSubmission(
  submissionId: string
) {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("legacy_question_claim_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("submission_id", submissionId)
    .is("claimed_at", null)
    .is("revoked_at", null);

  if (error) {
    throw new Error(error.message);
  }
}
