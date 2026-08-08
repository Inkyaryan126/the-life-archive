import { createAdminClient } from "./supabase/admin";
import { getMemoriesByArchiveSlug, getArchiveBySlug } from "./archive-data";
import type { PersonRelationshipType, SubjectStatus } from "./types";

export type PersonCardSummary = {
  id: string;
  archiveId: string;
  archiveSlug: string;
  personName: string;
  relationshipType: PersonRelationshipType;
  subjectStatus: SubjectStatus;
  avatarUrl?: string | null;
  creationKey?: string | null;
  messageCount: number;
  futureSurprisesCount: number;
  keepsakeStatus: string;
  lastUpdated: string;
  isSelf: boolean;
  isMemorial: boolean;
};

export type PersonDetailView = {
  connection: PersonCardSummary;
  memories: Array<{
    id: string;
    title: string;
    type: string;
    content: string;
    mediaUrl?: string | null;
    date?: string | null;
    accessStatus: "released" | "restricted" | "archived";
    categories: string[];
  }>;
  timeCapsules: Array<{
    id: string;
    title: string;
    deliverAt: string;
    status: string;
  }>;
  keepsakes: Array<{
    id: string;
    keepsakeCode: string;
    title: string;
  }>;
};

export async function getPeopleSummaryForUser(userId: string): Promise<PersonCardSummary[]> {
  const supabase: any = (() => {
    try {
      return createAdminClient();
    } catch {
      return null;
    }
  })();

  if (!supabase || !userId) {
    return [];
  }

  try {
    const { data: connections, error } = await supabase
      .from("people_connections")
      .select("id, archive_id, person_name, relationship_type, subject_status, avatar_url, creation_key, created_at, updated_at")
      .eq("creator_user_id", userId)
      .order("updated_at", { ascending: false });

    if (error || !connections || connections.length === 0) {
      return [];
    }

    const summaries: PersonCardSummary[] = [];

    for (const conn of connections) {
      // 1. Fetch underlying archive slug
      const { data: archiveData } = await supabase
        .from("archives")
        .select("slug")
        .eq("id", conn.archive_id)
        .single();

      const archiveSlug = archiveData?.slug || "my-archive";

      // 2. Count connection memories for THIS connection
      const { count: memCount } = await supabase
        .from("connection_memories")
        .select("id", { count: "exact", head: true })
        .eq("connection_id", conn.id);

      // 3. Count active keepsake mappings for THIS connection
      const { count: keepsakeCount } = await supabase
        .from("keepsake_mappings")
        .select("id", { count: "exact", head: true })
        .eq("connection_id", conn.id)
        .eq("status", "active");

      // 4. Count future time capsule deliveries specifically for THIS connection's authorized memories
      const { data: connMems } = await supabase
        .from("connection_memories")
        .select("memory_id")
        .eq("connection_id", conn.id);

      const memoryIds = connMems ? connMems.map((cm: any) => cm.memory_id).filter(Boolean) : [];

      let tcCount = 0;
      if (memoryIds.length > 0) {
        const { count } = await supabase
          .from("scheduled_memory_deliveries")
          .select("id", { count: "exact", head: true })
          .in("memory_id", memoryIds)
          .eq("status", "scheduled");
        tcCount = count || 0;
      }

      const isSelf = conn.relationship_type === "self" || conn.person_name?.toLowerCase() === "me";
      const isMemorial = conn.subject_status === "memorial";

      summaries.push({
        id: conn.id,
        archiveId: conn.archive_id,
        archiveSlug,
        personName: conn.person_name,
        relationshipType: conn.relationship_type,
        subjectStatus: conn.subject_status,
        avatarUrl: conn.avatar_url,
        creationKey: conn.creation_key,
        messageCount: memCount || 0,
        futureSurprisesCount: tcCount,
        keepsakeStatus: keepsakeCount && keepsakeCount > 0 ? `${keepsakeCount} keepsake${keepsakeCount > 1 ? "s" : ""} connected` : "No keepsake connected yet",
        lastUpdated: conn.updated_at || conn.created_at || new Date().toISOString(),
        isSelf,
        isMemorial
      });
    }

    return summaries;
  } catch {
    return [];
  }
}

export async function getPersonDetailForUser(
  connectionId: string,
  userId: string
): Promise<{ ok: true; detail: PersonDetailView } | { ok: false; error: string }> {
  const supabase: any = (() => {
    try {
      return createAdminClient();
    } catch {
      return null;
    }
  })();

  if (!supabase || !connectionId || !userId) {
    return { ok: false, error: "Authentication or connection ID missing." };
  }

  try {
    // Server-side ownership verification
    const { data: conn, error: connErr } = await supabase
      .from("people_connections")
      .select("id, archive_id, person_name, relationship_type, subject_status, avatar_url, creation_key, created_at, updated_at, creator_user_id")
      .eq("id", connectionId)
      .single();

    if (connErr || !conn) {
      return { ok: false, error: "Connection not found." };
    }

    if (conn.creator_user_id !== userId) {
      return { ok: false, error: "Unauthorized access to this connection." };
    }

    // Resolve archive slug
    const { data: archiveData } = await supabase
      .from("archives")
      .select("slug")
      .eq("id", conn.archive_id)
      .single();

    const archiveSlug = archiveData?.slug || "my-archive";

    // Load connection memories strictly for THIS connection
    const { data: connMemories } = await supabase
      .from("connection_memories")
      .select("memory_id, access_status")
      .eq("connection_id", conn.id);

    const memoryMap = new Map<string, "released" | "restricted" | "archived">();
    if (connMemories) {
      connMemories.forEach((cm: any) => memoryMap.set(cm.memory_id, cm.access_status));
    }

    const memoryIds = Array.from(memoryMap.keys());
    const allMemories = await getMemoriesByArchiveSlug(archiveSlug);
    const connectionMemories = allMemories
      .filter((m) => memoryMap.has(m.id))
      .map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        content: m.content,
        mediaUrl: m.mediaUrl ?? null,
        date: m.date ?? null,
        accessStatus: memoryMap.get(m.id) || "restricted",
        categories: m.tags || ["love"]
      }));

    // Fetch active keepsakes mapped strictly to THIS connection
    const { data: keepsakeRows } = await supabase
      .from("keepsake_mappings")
      .select("id, keepsake_code, title")
      .eq("connection_id", conn.id)
      .eq("status", "active");

    const keepsakes = (keepsakeRows || []).map((k: any) => ({
      id: k.id,
      keepsakeCode: k.keepsake_code,
      title: k.title || "Physical Keepsake"
    }));

    // Fetch future time capsules strictly for memories authorized for THIS connection
    let timeCapsules: Array<{ id: string; title: string; deliverAt: string; status: string }> = [];
    if (memoryIds.length > 0) {
      const { data: tcRows } = await supabase
        .from("scheduled_memory_deliveries")
        .select("id, recipient_email, deliver_at, status")
        .in("memory_id", memoryIds)
        .eq("status", "scheduled");

      timeCapsules = (tcRows || []).map((tc: any) => ({
        id: tc.id,
        title: tc.recipient_email ? `Surprise for ${tc.recipient_email}` : "Future Surprise",
        deliverAt: tc.deliver_at,
        status: tc.status
      }));
    }

    const isSelf = conn.relationship_type === "self" || conn.person_name?.toLowerCase() === "me";
    const isMemorial = conn.subject_status === "memorial";

    return {
      ok: true,
      detail: {
        connection: {
          id: conn.id,
          archiveId: conn.archive_id,
          archiveSlug,
          personName: conn.person_name,
          relationshipType: conn.relationship_type,
          subjectStatus: conn.subject_status,
          avatarUrl: conn.avatar_url,
          creationKey: conn.creation_key,
          messageCount: connectionMemories.length,
          futureSurprisesCount: timeCapsules.length,
          keepsakeStatus: keepsakes.length > 0 ? `${keepsakes.length} keepsake${keepsakes.length > 1 ? "s" : ""} connected` : "No keepsake connected yet",
          lastUpdated: conn.updated_at || conn.created_at || new Date().toISOString(),
          isSelf,
          isMemorial
        },
        memories: connectionMemories,
        timeCapsules,
        keepsakes
      }
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to load connection detail."
    };
  }
}
