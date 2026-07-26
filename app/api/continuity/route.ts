import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveContinuityProfile } from "@/lib/continuity";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      archiveId,
      presentSelf,
      refusedSelf,
      futureSelf,
      consciousEvolution,
      continuityPractices,
      evidenceMemoryIds,
      currentStage,
      isCompleted
    } = body;

    if (!archiveId) {
      return NextResponse.json({ error: "Archive ID is required." }, { status: 400 });
    }

    // Verify ownership of the target archive
    const { data: archive } = await supabase
      .from("archives")
      .select("id, owner_id, relationship_to_owner, memorial_mode")
      .eq("id", archiveId)
      .maybeSingle();

    if (!archive || archive.owner_id !== user.id) {
      return NextResponse.json({ error: "Archive not found or access denied." }, { status: 403 });
    }

    // Safeguard: memorial archives are not self-development archives
    if (archive.memorial_mode || archive.relationship_to_owner !== "self") {
      return NextResponse.json(
        { error: "Continuity Capsule is only available for your living self-archive." },
        { status: 400 }
      );
    }

    const profile = await saveContinuityProfile({
      userId: user.id,
      archiveId: archive.id,
      presentSelf: presentSelf ?? {},
      refusedSelf: refusedSelf ?? {},
      futureSelf: futureSelf ?? {},
      consciousEvolution: consciousEvolution ?? {},
      continuityPractices: continuityPractices ?? {},
      evidenceMemoryIds: evidenceMemoryIds ?? [],
      currentStage: currentStage ?? "present_self",
      isCompleted: Boolean(isCompleted)
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
