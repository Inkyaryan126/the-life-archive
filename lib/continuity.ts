export type PresentSelf = {
  description?: string;
  strongestQualities?: string;
  currentWeaknesses?: string;
  guidingValues?: string;
  proudMoments?: string;
  avoidingThings?: string;
  repeatingPatterns?: string;
  energySources?: string;
  energyDrains?: string;
  whatMakesLifeWorthLiving?: string;
};

export type RefusedSelf = {
  fearsToRelease?: string;
  habitsToQuit?: string;
  resentmentsToDrop?: string;
  selfBetrayalsToStop?: string;
  toxicPatternsToBreak?: string;
  excusesToAbandon?: string;
};

export type FutureSelf = {
  whoIAmBecoming?: string;
  requiredQualities?: string;
  nonNegotiableStandards?: string;
  bodyTreatment?: string;
  pressureResponse?: string;
  creationsAndContributions?: string;
  whoIProtect?: string;
  beforeDeathBucketList?: string;
  meaningfulExtraYears?: string;
};

export type ConsciousEvolution = {
  trueSelfBeneathRoles?: string;
  fearBasedDecisions?: string;
  whatLoveWouldChoose?: string;
  beliefToReplace?: string;
  effectOnPeopleAround?: string;
  humanityChangeToEmbodyFirst?: string;
  interconnectednessAction?: string;
  dailyAwakeningBehavior?: string;
  whereContributingToProblem?: string;
  presenceToBring?: string;
};

export type ContinuityPractices = {
  sleep?: string;
  movement?: string;
  nutrition?: string;
  medicalCare?: string;
  emotionalRegulation?: string;
  learning?: string;
  relationships?: string;
  creativity?: string;
  financialStability?: string;
  purpose?: string;
  reflection?: string;
  archiveMaintenance?: string;
};

export type AnnualReview = {
  id: string;
  year: number;
  reviewedAt: string;
  whoIWas: string;
  whoIBecame: string;
  whatChanged: string;
  whatIAchieved: string;
  whatIAbandoned: string;
  whatStillRulesMe: string;
  nextVersionRequirements: string;
  effectOnPeopleAround?: string;
  embodiedChange?: string;
  unconsciousAreas?: string;
};

export type ContinuityProfile = {
  id: string;
  userId: string;
  archiveId: string;
  presentSelf: PresentSelf;
  refusedSelf: RefusedSelf;
  futureSelf: FutureSelf;
  consciousEvolution: ConsciousEvolution;
  continuityPractices: ContinuityPractices;
  evidenceMemoryIds: string[];
  continuityDeclaration: string | null;
  currentStage: "present_self" | "refused_self" | "future_self" | "conscious_evolution" | "practices" | "evidence" | "declaration";
  annualReviews: AnnualReview[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function getSupabaseServerClient() {
  const { createClient } = require("./supabase/server");
  return createClient();
}

export function generateContinuityDeclaration(input: {
  presentSelf: PresentSelf;
  refusedSelf: RefusedSelf;
  futureSelf: FutureSelf;
  consciousEvolution?: ConsciousEvolution;
  continuityPractices: ContinuityPractices;
}): string {
  const futureName = input.futureSelf.whoIAmBecoming?.trim() || "my highest potential self";
  const standards = input.futureSelf.nonNegotiableStandards?.trim() || "courage, clarity, and discipline";
  const refused = input.refusedSelf.habitsToQuit?.trim() || input.refusedSelf.fearsToRelease?.trim() || "fear, avoidance, and wasted potential";
  const values = input.presentSelf.guidingValues?.trim() || "truth, growth, and love";
  const embodiedChange = input.consciousEvolution?.humanityChangeToEmbodyFirst?.trim() || input.consciousEvolution?.presenceToBring?.trim();

  return `I am not a finished object.
I am a life under construction.

I will preserve the truth of who I have been without becoming imprisoned by it.

I will strengthen my body, sharpen my mind, create my values, and build toward the person I choose to become.

I leave behind ${refused}. I refuse to remain ruled by past patterns or temporary weakness.

I am becoming ${futureName}. I live by standards of ${standards}, grounded in ${values}.${
    embodiedChange
      ? `\n\nI will not wait for humanity to become what I am unwilling to embody myself. I choose to first embody ${embodiedChange}.`
      : "\n\nI will not wait for humanity to become what I am unwilling to embody myself."
  }

I will not worship suffering, aging, or death simply because humanity has not yet defeated them.

I will leave evidence that I lived deliberately.`;
}

export async function getContinuityProfileForArchive(archiveId: string): Promise<ContinuityProfile | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("continuity_profiles")
    .select("*")
    .eq("archive_id", archiveId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    archiveId: data.archive_id,
    presentSelf: data.present_self ?? {},
    refusedSelf: data.refused_self ?? {},
    futureSelf: data.future_self ?? {},
    consciousEvolution: data.conscious_evolution ?? {},
    continuityPractices: data.continuity_practices ?? {},
    evidenceMemoryIds: data.evidence_memory_ids ?? [],
    continuityDeclaration: data.continuity_declaration ?? null,
    currentStage: data.current_stage ?? "present_self",
    annualReviews: data.annual_reviews ?? [],
    completedAt: data.completed_at ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function saveContinuityProfile(input: {
  userId: string;
  archiveId: string;
  presentSelf: PresentSelf;
  refusedSelf: RefusedSelf;
  futureSelf: FutureSelf;
  consciousEvolution?: ConsciousEvolution;
  continuityPractices: ContinuityPractices;
  currentStage: ContinuityProfile["currentStage"];
  evidenceMemoryIds?: string[];
  isCompleted?: boolean;
}): Promise<ContinuityProfile> {
  const supabase = await getSupabaseServerClient();
  const declaration = generateContinuityDeclaration({
    presentSelf: input.presentSelf,
    refusedSelf: input.refusedSelf,
    futureSelf: input.futureSelf,
    consciousEvolution: input.consciousEvolution,
    continuityPractices: input.continuityPractices
  });

  const now = new Date().toISOString();
  const payload = {
    user_id: input.userId,
    archive_id: input.archiveId,
    present_self: input.presentSelf,
    refused_self: input.refusedSelf,
    future_self: input.futureSelf,
    conscious_evolution: input.consciousEvolution ?? {},
    continuity_practices: input.continuityPractices,
    evidence_memory_ids: input.evidenceMemoryIds ?? [],
    continuity_declaration: declaration,
    current_stage: input.currentStage,
    completed_at: input.isCompleted ? now : null,
    updated_at: now
  };

  const { data, error } = await supabase
    .from("continuity_profiles")
    .upsert(payload, { onConflict: "archive_id" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to save Continuity Profile.");
  }

  return {
    id: data.id,
    userId: data.user_id,
    archiveId: data.archive_id,
    presentSelf: data.present_self ?? {},
    refusedSelf: data.refused_self ?? {},
    futureSelf: data.future_self ?? {},
    consciousEvolution: data.conscious_evolution ?? {},
    continuityPractices: data.continuity_practices ?? {},
    evidenceMemoryIds: data.evidence_memory_ids ?? [],
    continuityDeclaration: data.continuity_declaration ?? null,
    currentStage: data.current_stage ?? "present_self",
    annualReviews: data.annual_reviews ?? [],
    completedAt: data.completed_at ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function addAnnualReview(
  archiveId: string,
  reviewInput: Omit<AnnualReview, "id" | "reviewedAt">
): Promise<ContinuityProfile> {
  const existing = await getContinuityProfileForArchive(archiveId);
  if (!existing) {
    throw new Error("Continuity Profile must be created before adding an Annual Review.");
  }

  const newReview: AnnualReview = {
    ...reviewInput,
    id: `rev_${Date.now()}`,
    reviewedAt: new Date().toISOString()
  };

  const updatedReviews = [newReview, ...existing.annualReviews];
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("continuity_profiles")
    .update({
      annual_reviews: updatedReviews,
      updated_at: new Date().toISOString()
    })
    .eq("archive_id", archiveId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to add annual review.");
  }

  return {
    id: data.id,
    userId: data.user_id,
    archiveId: data.archive_id,
    presentSelf: data.present_self ?? {},
    refusedSelf: data.refused_self ?? {},
    futureSelf: data.future_self ?? {},
    consciousEvolution: data.conscious_evolution ?? {},
    continuityPractices: data.continuity_practices ?? {},
    evidenceMemoryIds: data.evidence_memory_ids ?? [],
    continuityDeclaration: data.continuity_declaration ?? null,
    currentStage: data.current_stage ?? "present_self",
    annualReviews: data.annual_reviews ?? [],
    completedAt: data.completed_at ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}
