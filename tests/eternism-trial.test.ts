import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  TRIAL_QUESTIONS,
  calculateAssessmentResult,
  getArchetype,
  DIMENSION_LABELS,
  EternismDimensionKey
} from "../lib/eternism-trial";

async function runEternismTrialTests() {
  console.log("Starting Eternism Trial verification test suite...");

  // 1. Verify /eternism/trial route & components exist
  const trialRoutePath = join(process.cwd(), "app", "eternism", "trial", "page.tsx");
  assert.ok(existsSync(trialRoutePath), "/eternism/trial route file must exist");

  const trialClientPath = join(process.cwd(), "components", "eternism", "EternismTrialClient.tsx");
  assert.ok(existsSync(trialClientPath), "EternismTrialClient component file must exist");

  const cardRoutePath = join(process.cwd(), "app", "api", "eternism", "trial", "card", "route.ts");
  assert.ok(existsSync(cardRoutePath), "Share card API route file must exist");

  const saveRoutePath = join(process.cwd(), "app", "api", "eternism", "trial", "save", "route.ts");
  assert.ok(existsSync(saveRoutePath), "Save API route file must exist");

  // 2. Verify Question Bank Structure
  assert.equal(TRIAL_QUESTIONS.length, 30, "Question bank must contain exactly 30 questions");

  const dimensionCounts: Record<EternismDimensionKey, number> = {
    physical: 0,
    mental: 0,
    moral: 0,
    creative: 0,
    spiritual: 0,
    conscious_evolution: 0
  };

  let reverseCount = 0;

  TRIAL_QUESTIONS.forEach((q) => {
    assert.ok(q.id, "Question must have an ID");
    assert.ok(q.prompt, "Question must have a prompt");
    assert.ok(DIMENSION_LABELS[q.dimension], `Question dimension ${q.dimension} must be valid`);
    dimensionCounts[q.dimension]++;

    if (q.reverse) {
      reverseCount++;
    }

    // Safety checks on question wording
    assert.doesNotMatch(q.prompt, /cancer|diabetes|dementia|depression|schizophrenia|bipolar|suicide|autism|diagnosis/i, "Questions must not inquire about clinical/medical diagnoses");
  });

  (Object.keys(dimensionCounts) as EternismDimensionKey[]).forEach((dim) => {
    assert.equal(dimensionCounts[dim], 5, `Dimension ${dim} must have exactly 5 questions`);
  });

  assert.ok(reverseCount >= 6, "Must contain at least 6 reverse-scored questions (1 per dimension)");

  // 3. Verify Deterministic Arithmetic Mean Scoring & Bounds
  // Case A: Lowest answers (all 1s)
  const lowestResponses: Record<string, number> = {};
  TRIAL_QUESTIONS.forEach((q) => {
    lowestResponses[q.id] = 1;
  });

  const lowestResult = calculateAssessmentResult(lowestResponses);
  assert.equal(typeof lowestResult.overallScore, "number", "Overall score must be a number");
  assert.ok(lowestResult.overallScore >= 0 && lowestResult.overallScore <= 100, "Lowest score must be bounded 0..100");

  // Case B: Highest answers (all 5s)
  const highestResponses: Record<string, number> = {};
  TRIAL_QUESTIONS.forEach((q) => {
    highestResponses[q.id] = 5;
  });

  const highestResult = calculateAssessmentResult(highestResponses);
  assert.ok(highestResult.overallScore >= 0 && highestResult.overallScore <= 100, "Highest score must be bounded 0..100");

  // Case C: Mixed answers
  const mixedResponses: Record<string, number> = {};
  TRIAL_QUESTIONS.forEach((q, idx) => {
    mixedResponses[q.id] = (idx % 5) + 1;
  });
  const mixedResult = calculateAssessmentResult(mixedResponses);
  assert.ok(mixedResult.overallScore >= 0 && mixedResult.overallScore <= 100, "Mixed score must be bounded 0..100");

  // Verify reverse scoring works correctly:
  // For a non-reverse question: 5 -> 5 points
  // For a reverse question: 1 -> 5 points
  // If user picks 1 for a reverse question and 5 for normal, physical score should be 100
  const idealPhysicalResponses: Record<string, number> = {
    p1: 5,
    p2: 5,
    p3: 5,
    p4: 5,
    p5: 1 // Reverse question
  };
  const physResult = calculateAssessmentResult(idealPhysicalResponses);
  assert.equal(physResult.dimensionScores.physical, 100, "Physical score must equal 100 when answers maximize points accounting for reverse items");

  // 4. Verify all 6 Archetype Result Bands are Reachable
  assert.equal(getArchetype(15), "The Unprotected Self", "0..29 band must map to The Unprotected Self");
  assert.equal(getArchetype(35), "The Sleeping Giant", "30..44 band must map to The Sleeping Giant");
  assert.equal(getArchetype(50), "The Unfinished Builder", "45..59 band must map to The Unfinished Builder");
  assert.equal(getArchetype(65), "The Conscious Rebel", "60..74 band must map to The Conscious Rebel");
  assert.equal(getArchetype(80), "The Future Architect", "75..89 band must map to The Future Architect");
  assert.equal(getArchetype(95), "The Formidable One", "90..100 band must map to The Formidable One");

  // 5. Verify Disclaimer & Non-Diagnostic Language in UI files
  const clientContent = readFileSync(trialClientPath, "utf8");
  assert.match(
    clientContent,
    /This score is a snapshot of your current habits and self-perception—not a measurement of your worth, destiny, health, or lifespan\./,
    "UI must present the mandatory reflective disclaimer statement"
  );

  // 6. Verify Results are Unlocked & Complete Before Signup
  assert.doesNotMatch(clientContent, /blur/i, "Results must not be blurred");
  assert.match(clientContent, /step === "results"/, "Full results view must be rendered upon completion");

  // 7. Verify Privacy & Security in Share Card API
  const cardContent = readFileSync(cardRoutePath, "utf8");
  assert.doesNotMatch(cardContent, /email|userId|rawAnswers/i, "Share card must not include user email, ID, or raw answers");
  assert.match(cardContent, /VALID_ARCHETYPES/, "Share card must use an allowlist for archetypes");
  assert.match(cardContent, /VALID_DIMENSIONS/, "Share card must use an allowlist for dimensions");
  assert.match(cardContent, /sanitizeDisplayName/, "Share card must sanitize user display names");

  // 8. Verify Server-Side Authorization in Save API
  const saveContent = readFileSync(saveRoutePath, "utf8");
  assert.match(saveContent, /relationship_to_owner.*self/, "Save API must verify relationship_to_owner = 'self'");
  assert.match(saveContent, /memorial_mode.*false/, "Save API must verify memorial_mode = false");
  assert.doesNotMatch(saveContent, /responses:/, "Save API must not persist raw question responses into DB payload");

  // 9. Verify Migration File & RLS Policies
  const migrationPath = join(process.cwd(), "supabase", "migrations", "20260726140000_create_eternism_assessments.sql");
  assert.ok(existsSync(migrationPath), "Migration file 20260726140000_create_eternism_assessments.sql must exist");
  const migrationContent = readFileSync(migrationPath, "utf8");
  assert.match(migrationContent, /gen_random_uuid\(\)/, "Migration must use gen_random_uuid()");
  assert.match(migrationContent, /ENABLE ROW LEVEL SECURITY/, "Migration must enable RLS");
  assert.match(migrationContent, /Users can select own eternism assessments/, "Migration must have SELECT RLS policy");
  assert.match(migrationContent, /Users can insert own eternism assessments/, "Migration must have INSERT RLS policy");

  // 10. Verify Grand Hall Directory integrity
  const pagePath = join(process.cwd(), "app", "page.tsx");
  const pageContent = readFileSync(pagePath, "utf8");
  assert.match(pageContent, /directoryRowGeometries/, "Grand Hall directory geometries must remain untouched");

  console.log("Eternism Trial verification tests passed cleanly!");
}

runEternismTrialTests().catch((err) => {
  console.error("Eternism Trial test suite failed:", err);
  process.exit(1);
});
