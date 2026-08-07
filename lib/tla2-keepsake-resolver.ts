import { createAdminClient } from "./supabase/admin";
import { isValidKeepsakeCode } from "./keepsake-codes";
import { isValidSharePassToken } from "./share-pass-tokens";
import { getGuestSharePassMemories } from "./share-passes";
import { getArchiveBySlug, getMemoriesByArchiveSlug } from "./archive-data";
import {
  type ResolvedKeepsakeExperienceResult
} from "./tla2-foundation";

const isProduction =
  process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

export async function resolveKeepsakeExperience(rawToken: string): Promise<ResolvedKeepsakeExperienceResult> {
  const token = rawToken.trim();

  if (!token) {
    return { ok: false, error: "INVALID_KEEPSAKE_CODE" };
  }

  // 1. Try DB-level resolution via Supabase RPC (Authoritative Production Path)
  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { data, error } = await (supabase.rpc as any)("resolve_keepsake_guest_experience", {
        p_keepsake_code: token
      });

      if (!error && data && typeof data === "object" && "ok" in data) {
        return data as ResolvedKeepsakeExperienceResult;
      }
    }
  } catch {
    // Suppress internal DB connection exceptions; fail safely
  }

  // 2. Legacy Token Resolution (Always Active for sp_... tokens)
  if (isValidSharePassToken(token)) {
    const legacyPass = await getGuestSharePassMemories(token);
    if (legacyPass) {
      return {
        ok: true,
        personName: legacyPass.personName,
        relationshipType: "other",
        subjectStatus: "living",
        experienceMode: "legacy_pass",
        memories: legacyPass.memories.map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          content: m.content,
          mediaUrl: m.mediaUrl,
          date: m.memoryDate,
          categories: ["love", "miss_you"]
        })),
        timeCapsules: []
      };
    }
  }

  // 3. FAIL-CLOSED IN PRODUCTION: Never fall back to mock JSON archives in production/Vercel
  if (isProduction) {
    return { ok: false, error: "KEEPSAKE_INACTIVE_OR_REVOKED" };
  }

  // 4. Local Dev/Test Only Fallback (Allows test suite / offline dev testing)
  const sampleArchive = await getArchiveBySlug(token.toLowerCase().replace("ks_", ""));
  if (sampleArchive) {
    const memories = await getMemoriesByArchiveSlug(sampleArchive.slug);
    return {
      ok: true,
      personName: sampleArchive.personName,
      relationshipType: sampleArchive.relationshipToOwner ?? "other",
      subjectStatus: sampleArchive.memorialMode ? "memorial" : "living",
      experienceMode: "interactive_hub",
      memories: memories.map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        content: m.content,
        mediaUrl: m.mediaUrl ?? null,
        date: m.date ?? null,
        categories: ["love", "miss_you"]
      })),
      timeCapsules: []
    };
  }

  return { ok: false, error: "KEEPSAKE_INACTIVE_OR_REVOKED" };
}
