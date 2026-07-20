"use server";

import { createClient } from "@/lib/supabase/server";
import { getAccountContext } from "@/lib/account";
import type { Keepsake, ArchiveSharePass } from "@/lib/types";

export type ActionResponse<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

type RpcInvoker = (
  fn: string,
  args: Record<string, unknown>
) => Promise<{ data: unknown; error: { message: string } | null }>;

async function callTypedRpc<T>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  functionName: string,
  args: Record<string, unknown>
): Promise<{ data: T | null; error: { message: string } | null }> {
  const invoker = supabase.rpc.bind(supabase) as unknown as RpcInvoker;
  const result = await invoker(functionName, args);
  return { data: result.data as T | null, error: result.error };
}

async function verifyArchiveOwner(archiveId: string): Promise<string> {
  const account = await getAccountContext();
  if (!account.user) {
    throw new Error("Authentication required.");
  }

  const supabase = await createClient();
  const { data: archive, error } = await supabase
    .from("archives")
    .select("id, owner_id")
    .eq("id", archiveId)
    .maybeSingle();

  if (error || !archive || archive.owner_id !== account.user.id) {
    throw new Error("You do not have permission to manage this archive.");
  }

  return account.user.id;
}

export async function createKeepsakeAction(
  archiveId: string,
  keepsakeCode: string,
  productType = "member_card"
): Promise<ActionResponse<Keepsake>> {
  try {
    await verifyArchiveOwner(archiveId);
    const normalizedCode = keepsakeCode.trim().toUpperCase();

    if (!/^[A-Z0-9_-]{4,32}$/.test(normalizedCode)) {
      return {
        success: false,
        error: "Keepsake code must be 4-32 uppercase alphanumeric characters, dashes, or underscores."
      };
    }

    const supabase = await createClient();
    const { data: inserted, error } = await supabase
      .from("keepsakes")
      .insert({
        archive_id: archiveId,
        keepsake_code: normalizedCode,
        product_type: productType
      })
      .select()
      .single();

    if (error || !inserted) {
      console.error("[createKeepsakeAction] Database insert error:", error);
      if (error?.code === "23505") {
        return { success: false, error: "Keepsake code is already registered." };
      }
      return { success: false, error: "Failed to create keepsake." };
    }

    return {
      success: true,
      data: {
        id: inserted.id,
        archiveId: inserted.archive_id,
        keepsakeCode: inserted.keepsake_code,
        productType: inserted.product_type,
        activeSharePassId: inserted.active_share_pass_id,
        createdAt: inserted.created_at,
        updatedAt: inserted.updated_at
      }
    };
  } catch (err) {
    console.error("[createKeepsakeAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred."
    };
  }
}

export async function createDisabledSharePassAction(
  keepsakeId: string,
  archiveId: string,
  passName = "Physical Keepsake Pass"
): Promise<ActionResponse<ArchiveSharePass>> {
  try {
    const userId = await verifyArchiveOwner(archiveId);
    const supabase = await createClient();

    const { data: passId, error } = await callTypedRpc<string>(
      supabase,
      "create_disabled_share_pass",
      {
        p_keepsake_id: keepsakeId,
        p_archive_id: archiveId,
        p_pass_name: passName
      }
    );

    if (error || !passId) {
      console.error("[createDisabledSharePassAction] RPC error:", error);
      return { success: false, error: "Failed to create share pass." };
    }

    const { data: inserted } = await supabase
      .from("archive_share_passes")
      .select()
      .eq("id", passId)
      .single();

    return {
      success: true,
      data: {
        id: inserted?.id || passId,
        keepsakeId: inserted?.keepsake_id || keepsakeId,
        archiveId: inserted?.archive_id || archiveId,
        createdBy: inserted?.created_by || userId,
        passName: inserted?.pass_name || passName,
        status: (inserted?.status as ArchiveSharePass["status"]) || "disabled",
        useCount: inserted?.use_count || 0,
        lastScannedAt: inserted?.last_scanned_at || null,
        createdAt: inserted?.created_at || new Date().toISOString(),
        updatedAt: inserted?.updated_at || new Date().toISOString(),
        selectedMemoryIds: []
      }
    };
  } catch (err) {
    console.error("[createDisabledSharePassAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred."
    };
  }
}

export async function replaceSelectedMemoriesAction(
  passId: string,
  memoryIds: string[]
): Promise<ActionResponse<{ selectedCount: number }>> {
  try {
    const supabase = await createClient();

    const { data, error } = await callTypedRpc<number>(
      supabase,
      "manage_share_pass_memories",
      {
        p_pass_id: passId,
        p_memory_ids: memoryIds
      }
    );

    if (error) {
      console.error("[replaceSelectedMemoriesAction] RPC error:", error);
      return {
        success: false,
        error: error.message || "Failed to replace share pass memories."
      };
    }

    return {
      success: true,
      data: { selectedCount: typeof data === "number" ? data : 0 }
    };
  } catch (err) {
    console.error("[replaceSelectedMemoriesAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred."
    };
  }
}

export async function activatePassAction(
  keepsakeId: string,
  passId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await callTypedRpc<void>(
      supabase,
      "activate_keepsake_share_pass",
      {
        p_keepsake_id: keepsakeId,
        p_pass_id: passId
      }
    );

    if (error) {
      console.error("[activatePassAction] RPC error:", error);
      return {
        success: false,
        error: error.message || "Failed to activate share pass."
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[activatePassAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred."
    };
  }
}

export async function disablePassAction(passId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await callTypedRpc<void>(
      supabase,
      "set_share_pass_status",
      {
        p_pass_id: passId,
        p_new_status: "disabled"
      }
    );

    if (error) {
      console.error("[disablePassAction] RPC error:", error);
      return {
        success: false,
        error: error.message || "Failed to disable share pass."
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[disablePassAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred."
    };
  }
}

export async function revokePassAction(passId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await callTypedRpc<void>(
      supabase,
      "set_share_pass_status",
      {
        p_pass_id: passId,
        p_new_status: "revoked"
      }
    );

    if (error) {
      console.error("[revokePassAction] RPC error:", error);
      return {
        success: false,
        error: error.message || "Failed to revoke share pass."
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[revokePassAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred."
    };
  }
}
