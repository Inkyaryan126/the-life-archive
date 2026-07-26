import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateAssessmentResult } from "@/lib/eternism-trial";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required to save trial results." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { responses, archiveId: rawArchiveId } = body;

    if (!responses || typeof responses !== "object") {
      return NextResponse.json(
        { error: "Invalid responses object." },
        { status: 400 }
      );
    }

    // Calculate deterministic assessment results on server side
    const result = calculateAssessmentResult(responses);

    // Independent Server-Side Archive Verification:
    // User must own the archive, relationship_to_owner = 'self', and memorial_mode = false.
    let archiveQuery = supabase
      .from("archives")
      .select("id, owner_id, relationship_to_owner, memorial_mode")
      .eq("owner_id", user.id)
      .eq("relationship_to_owner", "self")
      .eq("memorial_mode", false);

    if (rawArchiveId && typeof rawArchiveId === "string") {
      archiveQuery = archiveQuery.eq("id", rawArchiveId);
    }

    const { data: eligibleArchives, error: archiveError } = await archiveQuery;

    if (archiveError || !eligibleArchives || eligibleArchives.length === 0) {
      return NextResponse.json(
        { error: "No eligible active personal archive found. Results can only be saved to an active personal archive." },
        { status: 403 }
      );
    }

    const verifiedArchive = eligibleArchives[0];

    // Insert only safe summary fields - raw responses are NOT stored.
    const { data: savedRecord, error: insertError } = await supabase
      .from("eternism_assessments")
      .insert({
        user_id: user.id,
        archive_id: verifiedArchive.id,
        overall_score: result.overallScore,
        dimension_scores: result.dimensionScores,
        archetype: result.archetype,
        strongest_dimension: result.strongestDimension,
        growth_dimension: result.growthDimension,
        challenge: result.challenge
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("Error inserting eternism assessment:", insertError.message);
      return NextResponse.json(
        { error: "Unable to save assessment results to database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: savedRecord.id,
      createdAt: savedRecord.created_at
    });
  } catch (err: any) {
    console.error("Save assessment error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
