import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { generateLegacyActivationCode } from "../lib/legacy-activation";

async function runTests() {
  console.log("Starting legacy-question-activation-code test suite...");

  // 1. Verify code format and allowed alphabet
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codePattern = /^(TLA|LAC)-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/;

  for (let i = 0; i < 20; i += 1) {
    const code = generateLegacyActivationCode();
    assert.match(code, codePattern, `Code ${code} should match expected format and alphabet.`);
  }

  // 2. Inspect lib/legacy-question-onboarding.ts implementation
  const onboardingPath = join(process.cwd(), "lib", "legacy-question-onboarding.ts");
  const onboardingContent = await readFile(onboardingPath, "utf8");

  assert.match(onboardingContent, /import \{.*generateUniqueLegacyActivationCode.*\} from "@\/lib\/legacy-activation";/);
  assert.match(onboardingContent, /legacy_activation_code:\s*legacyActivationCode/);
  assert.match(onboardingContent, /repairStarterArchiveActivationCode/);
  assert.match(onboardingContent, /eq\("memorial_mode",\s*false\)/);

  // 3. Inspect migration file 20260726000000_backfill_legacy_question_activation_codes.sql
  const migrationPath = join(process.cwd(), "supabase", "migrations", "20260726000000_backfill_legacy_question_activation_codes.sql");
  const migrationContent = await readFile(migrationPath, "utf8");

  assert.match(migrationContent, /WHERE legacy_question_submission_id IS NOT NULL/);
  assert.match(migrationContent, /AND memorial_mode = false/);
  assert.match(migrationContent, /AND \(legacy_activation_code IS NULL/);
  assert.match(migrationContent, /'TLA-' \|\| part1 \|\| '-' \|\| part2 \|\| '-' \|\| part3/);
  assert.match(migrationContent, /ABCDEFGHJKLMNPQRSTUVWXYZ23456789/);
  assert.doesNotMatch(migrationContent, /DELETE FROM/i); // No deletions

  console.log("legacy-question-activation-code test suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("legacy-question-activation-code test suite failed:", err);
  process.exit(1);
});
