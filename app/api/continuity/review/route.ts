import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addAnnualReview } from "@/lib/continuity";

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
    const { archiveId, review } = body;

    if (!archiveId || !review) {
      return NextResponse.json({ error: "Archive ID and review details required." }, { status: 400 });
    }

    const { data: archive } = await supabase
      .from("archives")
      .select("id, owner_id")
      .eq("id", archiveId)
      .maybeSingle();

    if (!archive || archive.owner_id !== user.id) {
      return NextResponse.json({ error: "Archive not found or access denied." }, { status: 403 });
    }

    const profile = await addAnnualReview(archive.id, review);

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
