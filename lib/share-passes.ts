import type { GuestPassMemory } from "@/lib/types";
import {
  deriveSharePassPublicToken,
  hashSharePassToken,
  isValidSharePassToken
} from "./share-pass-tokens";

type DbGuestMemoryRow = {
  id: string;
  title: string;
  type: string;
  content: string | null;
  media_url: string | null;
  storage_media_path: string | null;
  memory_date: string | null;
  tags: string[] | null;
};

type SharePassDbRow = {
  archive_name: string;
  person_name: string;
  memory_id: string;
  title: string;
  type: string;
  content: string;
  media_url: string | null;
  storage_media_path: string | null;
  memory_date: string | null;
};

type RpcInvoker = (
  fn: string,
  args: Record<string, unknown>
) => Promise<{ data: unknown; error: { message: string } | null }>;

export const ALLOWED_EXTERNAL_MEDIA_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "player.vimeo.com",
  "spotify.com",
  "open.spotify.com",
  "soundcloud.com",
  "w.soundcloud.com",
  "images.unsplash.com"
]);

function isIpAddress(hostname: string): boolean {
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return true;
  if (hostname.startsWith("[") && hostname.endsWith("]")) return true;
  return false;
}

export function parseAndValidateExternalMediaUrl(rawUrl: string | null): string | null {
  if (!rawUrl || rawUrl.trim() === "") return null;

  try {
    const parsed = new URL(rawUrl.trim());

    if (parsed.protocol !== "https:") return null;
    if (parsed.username !== "" || parsed.password !== "") return null;

    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      isIpAddress(hostname)
    ) {
      return null;
    }

    if (
      hostname.includes("supabase.co") ||
      hostname.includes("supabase.in") ||
      parsed.pathname.includes("/storage/v1/object/") ||
      parsed.searchParams.has("token")
    ) {
      return null;
    }

    if (!ALLOWED_EXTERNAL_MEDIA_HOSTS.has(hostname)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export async function getKeepsakePassMemories(
  keepsakeCode: string,
  isPrefetch = false
): Promise<GuestPassMemory[]> {
  const normalizedCode = keepsakeCode.trim().toUpperCase();
  if (!normalizedCode || !/^[A-Z0-9_-]{4,32}$/.test(normalizedCode)) {
    return [];
  }

  const { createAdminClient } = require("./supabase/admin");
  const adminClient = createAdminClient();
  const invoker = adminClient.rpc.bind(adminClient) as unknown as RpcInvoker;

  const { data, error } = await invoker("get_keepsake_pass_memories", {
    p_keepsake_code: normalizedCode,
    p_is_prefetch: isPrefetch
  });

  if (error || !Array.isArray(data) || data.length === 0) {
    if (error) {
      console.error("[getKeepsakePassMemories] Database RPC execution failed.");
    }
    return [];
  }

  const rows = data as DbGuestMemoryRow[];
  const result: GuestPassMemory[] = [];

  for (const row of rows) {
    let signedMediaUrl: string | null = null;
    let mediaUrl: string | null = null;

    if (row.storage_media_path && row.storage_media_path.trim() !== "") {
      try {
        const { data: signedData, error: signError } = await adminClient.storage
          .from("archive-media")
          .createSignedUrl(row.storage_media_path, 3600);

        if (signError) {
          console.error("[getKeepsakePassMemories] Storage media signing failed.");
        } else if (signedData?.signedUrl) {
          signedMediaUrl = signedData.signedUrl;
        }
      } catch {
        console.error("[getKeepsakePassMemories] Storage signing error encountered.");
      }
      // Never fall back to media_url when storage_media_path is present
      mediaUrl = null;
    } else {
      mediaUrl = parseAndValidateExternalMediaUrl(row.media_url);
    }

    result.push({
      id: row.id,
      title: row.title,
      type: row.type as GuestPassMemory["type"],
      content: row.content,
      mediaUrl,
      signedMediaUrl,
      memoryDate: row.memory_date,
      tags: row.tags || []
    });
  }

  return result;
}

export type GuestSharePassMemory = {
  id: string;
  title: string;
  type: string;
  content: string;
  mediaUrl: string | null;
  memoryDate: string | null;
};

export type GuestSharePassResult = {
  archiveName: string;
  personName: string;
  memories: GuestSharePassMemory[];
};

export function getPublicPassUrl(passId: string, tokenVersion: number, origin: string): string {
  const publicToken = deriveSharePassPublicToken(passId, tokenVersion);
  return `${origin.replace(/\/$/, "")}/k/${publicToken}`;
}

export async function getGuestSharePassMemories(
  publicToken: string
): Promise<GuestSharePassResult | null> {
  if (!isValidSharePassToken(publicToken)) {
    console.warn({
      event: "keepsake_pass_access_denied",
      reasonCategory: "malformed",
      timestamp: new Date().toISOString()
    });
    return null;
  }

  const tokenHash = hashSharePassToken(publicToken);

  try {
    const { createAdminClient } = require("./supabase/admin");
    const supabase = createAdminClient();
    const rpcFn = supabase.rpc.bind(supabase) as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{ data: SharePassDbRow[] | null; error: { message: string } | null }>;

    const { data, error } = await rpcFn("get_share_pass_memories_by_token_hash", {
      p_token_hash: tokenHash
    });

    if (error || !data || data.length === 0) {
      console.warn({
        event: "keepsake_pass_access_denied",
        reasonCategory: "unavailable",
        timestamp: new Date().toISOString()
      });
      return null;
    }

    const firstRow = data[0];
    const archiveName = firstRow.archive_name;
    const personName = firstRow.person_name;

    const memories: GuestSharePassMemory[] = await Promise.all(
      data.map(async (row) => {
        let finalMediaUrl: string | null = null;

        if (row.storage_media_path) {
          try {
            // Non-blocking scan/signing: if signing fails, guest memory still loads cleanly
            const { data: signedData } = await supabase.storage
              .from("archive-media")
              .createSignedUrl(row.storage_media_path, 900); // 15 minutes

            finalMediaUrl = signedData?.signedUrl ?? null;
          } catch {
            finalMediaUrl = null;
          }
        } else if (row.media_url) {
          finalMediaUrl = parseAndValidateExternalMediaUrl(row.media_url);
        }

        return {
          id: row.memory_id,
          title: row.title,
          type: row.type,
          content: row.content || "",
          mediaUrl: finalMediaUrl,
          memoryDate: row.memory_date
        };
      })
    );

    console.info({
      event: "keepsake_pass_access_granted",
      mediaCount: memories.length,
      timestamp: new Date().toISOString()
    });

    return {
      archiveName,
      personName,
      memories
    };
  } catch (err) {
    console.warn({
      event: "keepsake_pass_access_denied",
      reasonCategory: "unavailable",
      timestamp: new Date().toISOString()
    });
    return null;
  }
}
