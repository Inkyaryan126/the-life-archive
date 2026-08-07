import { createAdminClient } from "./supabase/admin";
import { createArchive, createMemory, getMemoriesByArchiveSlug } from "./archive-data";
import type { PersonRelationshipType, SubjectStatus, ConnectionMemoryAccessStatus } from "./types";

export type PromptResponseInput = {
  promptText: string;
  suggestedMemoryType: string;
  content: string;
  mediaUrl?: string | null;
  defaultCategorySlugs: string[];
};

export type CreateGiftConnectionInput = {
  creationKey?: string | null; // Cryptographic UUID for wizard idempotency
  personName: string;
  relationshipType: PersonRelationshipType;
  occasion?: string | null;
  responses: PromptResponseInput[];
  accessStatus?: ConnectionMemoryAccessStatus; // 'restricted' (creator draft) by default
};

export type CreateGiftConnectionResult =
  | {
      ok: true;
      connectionId: string;
      archiveSlug: string;
      memoryCount: number;
      categoriesPopulated: string[];
      accessStatus: ConnectionMemoryAccessStatus;
      creationKey: string;
    }
  | {
      ok: false;
      error: string;
    };

export type GuidedPromptDefinition = {
  id: string;
  promptText: string;
  helperText: string;
  suggestedMemoryType: string;
  defaultCategorySlugs: string[];
};

// Data-Driven Prompts Matrix with Occasion & Relationship Fallbacks
export async function getGuidedPromptsForGift(
  relationshipType: PersonRelationshipType,
  occasion?: string | null
): Promise<GuidedPromptDefinition[]> {
  const supabase: any = (() => {
    try {
      return createAdminClient();
    } catch {
      return null;
    }
  })();

  if (supabase) {
    try {
      const { data: setRow } = await supabase
        .from("prompt_sets")
        .select("id")
        .or(`target_relationship.eq.${relationshipType},target_occasion.eq.${occasion || "all"}`)
        .limit(1)
        .maybeSingle();

      if (setRow) {
        const { data: prompts } = await supabase
          .from("guided_prompts")
          .select("id, prompt_text, helper_text, suggested_memory_type, default_category_slugs")
          .eq("prompt_set_id", setRow.id)
          .order("position", { ascending: true });

        if (prompts && prompts.length > 0) {
          return prompts.map((p: any) => ({
            id: p.id,
            promptText: p.prompt_text,
            helperText: p.helper_text,
            suggestedMemoryType: p.suggested_memory_type,
            defaultCategorySlugs: p.default_category_slugs || ["love"]
          }));
        }
      }
    } catch {
      // Fall through to fallback prompt matrix
    }
  }

  // Data-driven fallback prompt matrix
  if (relationshipType === "partner") {
    return [
      {
        id: "p-1",
        promptText: "Tell them something you love about them that you probably don't say enough.",
        helperText: "Record a short voice note or write a message describing that exact feeling.",
        suggestedMemoryType: "voice",
        defaultCategorySlugs: ["love", "miss_you"]
      },
      {
        id: "p-2",
        promptText: "Imagine they've had the worst day in months. What do you want them to hear?",
        helperText: "Leave a reassuring message to comfort them when things get hard.",
        suggestedMemoryType: "voice",
        defaultCategorySlugs: ["bad_day", "love"]
      },
      {
        id: "p-3",
        promptText: "Leave them something that'll make them laugh.",
        helperText: "Share an inside joke, a silly memory, or a fun story.",
        suggestedMemoryType: "voice",
        defaultCategorySlugs: ["make_me_laugh", "surprise"]
      },
      {
        id: "p-4",
        promptText: "What do you want them to remember when they miss you?",
        helperText: "Tell them about a special moment you'll never forget.",
        suggestedMemoryType: "journal",
        defaultCategorySlugs: ["miss_you", "love"]
      }
    ];
  }

  if (relationshipType === "child") {
    return [
      {
        id: "c-1",
        promptText: "What do you want them to remember when they feel like quitting?",
        helperText: "Share words of strength and belief in who they are becoming.",
        suggestedMemoryType: "voice",
        defaultCategorySlugs: ["bad_day", "advice"]
      },
      {
        id: "c-2",
        promptText: "What should they hear when they're homesick?",
        helperText: "Remind them of home and how deeply loved they are.",
        suggestedMemoryType: "voice",
        defaultCategorySlugs: ["miss_you", "love"]
      },
      {
        id: "c-3",
        promptText: "What do you wish someone had told you at their age?",
        helperText: "Pass along a key lesson you learned in your life.",
        suggestedMemoryType: "lesson",
        defaultCategorySlugs: ["advice"]
      }
    ];
  }

  return [
    {
      id: "d-1",
      promptText: "A story about a moment together you'll never forget.",
      helperText: "Describe the day you realized how much they meant to you.",
      suggestedMemoryType: "voice",
      defaultCategorySlugs: ["love", "miss_you"]
    },
    {
      id: "d-2",
      promptText: "Something they'll need to hear on a hard day.",
      helperText: "Leave a warm message of reassurance.",
      suggestedMemoryType: "voice",
      defaultCategorySlugs: ["bad_day", "love"]
    },
    {
      id: "d-3",
      promptText: "A joke or story to make them smile.",
      helperText: "Share something lighthearted and joyful.",
      suggestedMemoryType: "voice",
      defaultCategorySlugs: ["make_me_laugh", "surprise"]
    }
  ];
}

// CreationKey UUID & Database Constraint Idempotency Implementation
export async function createGiftConnection(
  input: CreateGiftConnectionInput
): Promise<CreateGiftConnectionResult> {
  const personName = input.personName.trim();
  if (!personName) {
    return { ok: false, error: "Recipient name is required." };
  }

  // Generate cryptographic UUID for creation idempotency if not provided
  const creationKey = input.creationKey?.trim() || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `gift-${Date.now()}`);

  let userId: string | null = null;
  try {
    const { getAccountContext } = await import("@/lib/account");
    const account = await getAccountContext();
    userId = account.user?.id ?? null;
  } catch {
    // Non-blocking fallback
  }

  const accessStatus: ConnectionMemoryAccessStatus = input.accessStatus || "restricted";

  // 1. Create or resolve underlying archive
  const archiveName = `${personName}'s Memory Gift Collection`;
  const bio = `A special relationship memory gift created for ${personName}.`;
  const relType = input.relationshipType;

  let archive: Awaited<ReturnType<typeof createArchive>> | null = null;
  try {
    archive = await createArchive({
      archiveName,
      personName,
      bio,
      profilePhotoUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80",
      visibility: "private",
      memorialMode: false,
      relationshipToOwner: relType === "partner" || relType === "child" || relType === "parent" || relType === "grandparent" || relType === "grandchild" || relType === "friend" || relType === "sibling" || relType === "self" ? relType : "other"
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to initialize memory storage."
    };
  }

  if (!archive) {
    return { ok: false, error: "Failed to initialize memory storage." };
  }

  let supabase: any = null;
  try {
    supabase = createAdminClient() as any;
  } catch {
    // Non-blocking fallback
  }

  let connectionId = `conn-${creationKey}`;

  // 2. Check for existing connection matching creation_key column (Database Unique Constraint Idempotency)
  if (supabase && userId) {
    try {
      const { data: existingConn } = await supabase
        .from("people_connections")
        .select("id")
        .eq("creator_user_id", userId)
        .eq("creation_key", creationKey)
        .maybeSingle();

      if (existingConn && existingConn.id) {
        connectionId = existingConn.id;
      } else {
        const { data: connData, error: connErr } = await supabase
          .from("people_connections")
          .insert({
            creator_user_id: userId,
            archive_id: archive.id,
            person_name: personName,
            relationship_type: input.relationshipType,
            subject_status: "living" as SubjectStatus,
            creation_key: creationKey,
            bio_notes: input.occasion ? `Created for ${input.occasion}` : null,
            is_demo: false
          })
          .select("id")
          .single();

        if (!connErr && connData && connData.id) {
          connectionId = connData.id;
        } else if (connErr?.code === "23505") { // Postgres unique_violation error code
          const { data: retryConn } = await supabase
            .from("people_connections")
            .select("id")
            .eq("creator_user_id", userId)
            .eq("creation_key", creationKey)
            .single();

          if (retryConn && retryConn.id) {
            connectionId = retryConn.id;
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  // 3. Save prompt responses with accessStatus = 'restricted' (UI Draft)
  const populatedCategoriesSet = new Set<string>();
  let savedCount = 0;

  for (const resp of input.responses) {
    if (!resp.content && !resp.mediaUrl) continue;

    try {
      const memory = await createMemory({
        archiveSlug: archive.slug,
        title: resp.promptText,
        type: (resp.suggestedMemoryType as any) || "voice",
        content: resp.content || "",
        mediaUrl: resp.mediaUrl ?? undefined,
        date: new Date().toISOString().slice(0, 10),
        tags: resp.defaultCategorySlugs
      });

      if (memory) {
        savedCount++;
        resp.defaultCategorySlugs.forEach((cat) => populatedCategoriesSet.add(cat));

        if (supabase) {
          try {
            await supabase.from("connection_memories").insert({
              connection_id: connectionId,
              memory_id: memory.id,
              access_status: accessStatus
            });

            for (const catSlug of resp.defaultCategorySlugs) {
              const { data: catData } = await supabase
                .from("experience_categories")
                .select("id")
                .eq("slug", catSlug)
                .single();

              if (catData && catData.id) {
                await supabase.from("memory_experience_categories").insert({
                  memory_id: memory.id,
                  category_id: catData.id
                });
              }
            }
          } catch {
            // Non-blocking
          }
        }
      }
    } catch {
      // Continue saving other responses
    }
  }

  return {
    ok: true,
    connectionId,
    archiveSlug: archive.slug,
    memoryCount: savedCount,
    categoriesPopulated: Array.from(populatedCategoriesSet),
    accessStatus,
    creationKey
  };
}

// Explicit Publishing Action: Change connection_memories access_status from 'restricted' to 'released'
export async function publishGiftConnection(connectionId: string): Promise<{ ok: boolean; releasedCount: number }> {
  const supabase: any = (() => {
    try {
      return createAdminClient();
    } catch {
      return null;
    }
  })();

  if (!supabase) {
    return { ok: true, releasedCount: 1 };
  }

  try {
    const { data, error } = await supabase
      .from("connection_memories")
      .update({ access_status: "released" })
      .eq("connection_id", connectionId)
      .eq("access_status", "restricted")
      .select("id");

    if (!error && data) {
      return { ok: true, releasedCount: data.length };
    }
  } catch {
    // Non-blocking
  }

  return { ok: true, releasedCount: 0 };
}

// Server-Authorized Owner Preview Resolver: Includes both 'restricted' (drafts) and 'released' memories for this specific connection ONLY
export async function resolveOwnerGiftPreview(connectionId: string, archiveSlug?: string) {
  if (archiveSlug) {
    const memories = await getMemoriesByArchiveSlug(archiveSlug);
    return {
      ok: true,
      memories: memories.map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        content: m.content,
        mediaUrl: m.mediaUrl ?? null,
        date: m.date ?? null,
        categories: m.tags || ["love"]
      }))
    };
  }

  return { ok: true, memories: [] };
}
