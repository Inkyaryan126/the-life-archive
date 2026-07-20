import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { GuestPassMemory } from "@/lib/types";

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

type RpcInvoker = (
  fn: string,
  args: Record<string, unknown>
) => Promise<{ data: unknown; error: { message: string } | null }>;

const ALLOWED_EXTERNAL_MEDIA_HOSTS = new Set([
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

function parseAndValidateExternalMediaUrl(rawUrl: string | null): string | null {
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
