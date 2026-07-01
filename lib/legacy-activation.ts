import "server-only";

import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const codePrefixes = ["TLA", "LAC"] as const;

export type LegacyActivationRequest = {
  id: string;
  archiveId: string;
  archiveSlug: string;
  archiveName: string;
  personName: string;
  ownerId: string | null;
  requesterName: string;
  relationshipToOwner: string;
  message: string | null;
  status: "pending_memorial_review" | "memorial_activated" | "review_closed";
  createdAt: string;
};

type LegacyActivationRequestRow = {
  id: string;
  archive_id: string;
  requester_name: string;
  relationship_to_owner: string;
  message: string | null;
  status: LegacyActivationRequest["status"];
  created_at: string;
  archives:
    | {
    slug: string;
    archive_name: string;
    person_name: string;
    owner_id: string | null;
  }
    | Array<{
        slug: string;
        archive_name: string;
        person_name: string;
        owner_id: string | null;
      }>
    | null;
};

function getAdminClient() {
  return createAdminClient() as SupabaseClient<any, "public", any>;
}

function randomCodePart() {
  const bytes = randomBytes(4);
  let part = "";

  for (const byte of bytes) {
    part += codeAlphabet[byte % codeAlphabet.length];
  }

  return part;
}

export function generateLegacyActivationCode() {
  const prefix = codePrefixes[randomBytes(1)[0] % codePrefixes.length];

  return `${prefix}-${randomCodePart()}-${randomCodePart()}-${randomCodePart()}`;
}

export function normalizeLegacyActivationCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export async function generateUniqueLegacyActivationCode(
  existingCodes?: Set<string>
) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateLegacyActivationCode();

    if (!existingCodes?.has(code)) {
      return code;
    }
  }

  throw new Error("Unable to generate a legacy activation code.");
}

export async function submitLegacyActivation(input: {
  code: string;
  requesterName: string;
  relationshipToOwner: string;
  message: string;
}) {
  const code = normalizeLegacyActivationCode(input.code);
  const requesterName = input.requesterName.trim();
  const relationshipToOwner = input.relationshipToOwner.trim();
  const message = input.message.trim();

  if (!code || !requesterName || !relationshipToOwner) {
    throw new Error("Code, name, and relationship are required.");
  }

  const supabase = getAdminClient();
  const { data: archive, error: archiveError } = await supabase
    .from("archives")
    .select("id, legacy_code_used_at, owner_id")
    .eq("legacy_activation_code", code)
    .maybeSingle();

  if (archiveError) {
    throw new Error(archiveError.message);
  }

  if (!archive) {
    throw new Error("That activation code was not found.");
  }

  if (archive.legacy_code_used_at) {
    throw new Error("That activation code has already been used.");
  }

  const now = new Date().toISOString();
  const { data: claimedArchive, error: updateError } = await supabase
    .from("archives")
    .update({
      legacy_code_used_at: now,
      legacy_activated_by: requesterName
    })
    .eq("id", archive.id)
    .is("legacy_code_used_at", null)
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (!claimedArchive) {
    throw new Error("That activation code has already been used.");
  }

  const { error: insertError } = await supabase
    .from("legacy_activation_requests")
    .insert({
      archive_id: archive.id,
      requester_name: requesterName,
      relationship_to_owner: relationshipToOwner,
      message: message || null,
      status: "pending_memorial_review"
    });

  if (insertError) {
    throw new Error(insertError.message);
  }
}

function mapActivationRequest(
  row: LegacyActivationRequestRow
): LegacyActivationRequest {
  const archive = Array.isArray(row.archives)
    ? row.archives[0] ?? null
    : row.archives;

  return {
    id: row.id,
    archiveId: row.archive_id,
    archiveSlug: archive?.slug ?? "",
    archiveName: archive?.archive_name ?? "Unknown archive",
    personName: archive?.person_name ?? "Unknown person",
    ownerId: archive?.owner_id ?? null,
    requesterName: row.requester_name,
    relationshipToOwner: row.relationship_to_owner,
    message: row.message,
    status: row.status,
    createdAt: row.created_at
  };
}

export async function listLegacyActivationRequests() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("legacy_activation_requests")
    .select(
      "id, archive_id, requester_name, relationship_to_owner, message, status, created_at, archives(slug, archive_name, person_name, owner_id)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as LegacyActivationRequestRow[]).map(
    mapActivationRequest
  );
}

export async function markLegacyActivationMemorialized(
  requestId: string,
  approvedBy: string
) {
  const supabase = getAdminClient();
  const { data: request, error: requestError } = await supabase
    .from("legacy_activation_requests")
    .select("archive_id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError) {
    throw new Error(requestError.message);
  }

  if (!request) {
    throw new Error("Activation request was not found.");
  }

  if (request.status !== "pending_memorial_review") {
    throw new Error("This activation request has already been reviewed.");
  }

  const now = new Date().toISOString();
  const { data: activatedArchive, error: archiveError } = await supabase
    .from("archives")
    .update({
      memorial_mode: true,
      legacy_activation_code: null,
      memorial_activated_at: now,
      memorial_activated_by: approvedBy
    })
    .eq("id", request.archive_id)
    .eq("memorial_mode", false)
    .is("memorial_activated_at", null)
    .select("id")
    .maybeSingle();

  if (archiveError) {
    throw new Error(archiveError.message);
  }

  if (!activatedArchive) {
    throw new Error("This archive has already been memorialized.");
  }

  const { data: reviewedRequest, error: activationError } = await supabase
    .from("legacy_activation_requests")
    .update({ status: "memorial_activated" })
    .eq("id", requestId)
    .eq("status", "pending_memorial_review")
    .select("id")
    .maybeSingle();

  if (activationError) {
    throw new Error(activationError.message);
  }

  if (!reviewedRequest) {
    throw new Error("This activation request has already been reviewed.");
  }
}
