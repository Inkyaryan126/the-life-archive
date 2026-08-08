import { createAdminClient } from "./supabase/admin";
import { generateSecureKeepsakeCode, isValidKeepsakeCode } from "./keepsake-codes";

export type PairKeepsakeInput = {
  keepsakeCode: string;
  connectionId: string;
  title?: string | null;
  stripeSessionId?: string | null;
  stripeItemIndex?: number;
};

export type PairKeepsakeResult =
  | { ok: true; mappingId: string; keepsakeCode: string; connectionId: string; status: "active" }
  | { ok: false; error: string };

const inMemoryActiveMappings = new Map<string, string>(); // keepsakeCode -> connectionId

export async function pairKeepsakeToConnection(
  input: PairKeepsakeInput
): Promise<PairKeepsakeResult> {
  const { keepsakeCode, connectionId, title, stripeSessionId, stripeItemIndex } = input;

  if (!isValidKeepsakeCode(keepsakeCode)) {
    return { ok: false, error: "Invalid keepsake code format." };
  }

  const supabase: any = (() => {
    try {
      return createAdminClient();
    } catch {
      return null;
    }
  })();

  if (!supabase) {
    if (inMemoryActiveMappings.has(keepsakeCode)) {
      return { ok: false, error: "This physical keepsake is already active and paired." };
    }
    inMemoryActiveMappings.set(keepsakeCode, connectionId);
    return {
      ok: true,
      mappingId: `map-${Date.now()}`,
      keepsakeCode,
      connectionId,
      status: "active"
    };
  }

  try {
    // 1. Verify target connection exists
    const { data: conn, error: connErr } = await supabase
      .from("people_connections")
      .select("id, archive_id")
      .eq("id", connectionId)
      .single();

    if (connErr || !conn) {
      return { ok: false, error: "Target relationship connection not found." };
    }

    let effectiveCode = keepsakeCode;

    // 2. Check if hardware keepsake code already has an active mapping
    const { data: existingActive } = await supabase
      .from("keepsake_mappings")
      .select("id, connection_id, keepsake_code")
      .eq("keepsake_code", keepsakeCode)
      .eq("status", "active")
      .maybeSingle();

    if (existingActive) {
      return { ok: false, error: "This physical keepsake is already active and paired." };
    }

    // 3. Create or resolve physical keepsake record
    let keepsakeId = `ks-obj-${keepsakeCode}`;
    const { data: ksRow } = await supabase
      .from("keepsakes")
      .select("id, keepsake_code")
      .eq("keepsake_code", keepsakeCode)
      .maybeSingle();

    if (ksRow) {
      keepsakeId = ksRow.id;
      effectiveCode = ksRow.keepsake_code;
    } else {
      const { data: newKs, error: insertKsErr } = await supabase
        .from("keepsakes")
        .insert({
          keepsake_code: keepsakeCode,
          stripe_session_id: stripeSessionId || null,
          stripe_item_index: stripeItemIndex ?? 0,
          product_slug: "necklace",
          status: "assigned"
        })
        .select("id, keepsake_code")
        .single();

      if (insertKsErr && insertKsErr.code === "23505" && stripeSessionId) {
        // Handle database unique-conflict race (Postgres 23505):
        // Fetch winning row, discard candidate keepsakeCode, and use the winning row's code!
        const { data: winningRow } = await supabase
          .from("keepsakes")
          .select("id, keepsake_code")
          .eq("stripe_session_id", stripeSessionId)
          .eq("stripe_item_index", stripeItemIndex ?? 0)
          .single();
        if (winningRow) {
          keepsakeId = winningRow.id;
          effectiveCode = winningRow.keepsake_code;
        }
      } else if (newKs) {
        keepsakeId = newKs.id;
        effectiveCode = newKs.keepsake_code;
      }
    }

    // 4. Create active keepsake mapping
    const { data: mappingData, error: mapErr } = await supabase
      .from("keepsake_mappings")
      .insert({
        keepsake_id: keepsakeId,
        keepsake_code: effectiveCode,
        connection_id: conn.id,
        archive_id: conn.archive_id,
        title: title || "Physical Keepsake",
        status: "active"
      })
      .select("id")
      .single();

    if (mapErr) {
      // If mapping already exists for this keepsake_code, return the existing mapping
      const { data: currentMap } = await supabase
        .from("keepsake_mappings")
        .select("id")
        .eq("keepsake_code", effectiveCode)
        .eq("status", "active")
        .maybeSingle();
      if (currentMap) {
        return {
          ok: true,
          mappingId: currentMap.id,
          keepsakeCode: effectiveCode,
          connectionId: conn.id,
          status: "active"
        };
      }
      return { ok: false, error: mapErr.message };
    }

    inMemoryActiveMappings.set(effectiveCode, connectionId);

    return {
      ok: true,
      mappingId: mappingData.id,
      keepsakeCode: effectiveCode,
      connectionId: conn.id,
      status: "active"
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to pair keepsake."
    };
  }
}

export async function revokeKeepsakeMapping(keepsakeCode: string): Promise<{ ok: boolean }> {
  inMemoryActiveMappings.delete(keepsakeCode);

  const supabase: any = (() => {
    try {
      return createAdminClient();
    } catch {
      return null;
    }
  })();

  if (!supabase) return { ok: true };

  try {
    await supabase
      .from("keepsake_mappings")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("keepsake_code", keepsakeCode)
      .eq("status", "active");

    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function replaceKeepsakeForConnection(
  oldKeepsakeCode: string,
  newKeepsakeCode: string,
  connectionId: string
): Promise<PairKeepsakeResult> {
  await revokeKeepsakeMapping(oldKeepsakeCode);
  return await pairKeepsakeToConnection({
    keepsakeCode: newKeepsakeCode,
    connectionId
  });
}
