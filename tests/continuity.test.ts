import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { generateContinuityDeclaration } from "../lib/continuity";

async function runTests() {
  console.log("Starting Continuity Capsule test suite (Six Dimensions & Conscious Evolution)...");

  // 1. Declaration generator test with Conscious Evolution
  const declaration = generateContinuityDeclaration({
    presentSelf: { guidingValues: "truth, discipline, love" },
    refusedSelf: { habitsToQuit: "procrastination and self-doubt" },
    futureSelf: { whoIAmBecoming: "a resilient leader", nonNegotiableStandards: "daily focus and courage" },
    consciousEvolution: { humanityChangeToEmbodyFirst: "patience and listening" },
    continuityPractices: { movement: "daily workout" }
  });

  assert.match(declaration, /I am not a finished object\./);
  assert.match(declaration, /I am a life under construction\./);
  assert.match(declaration, /I will preserve the truth of who I have been without becoming imprisoned by it\./);
  assert.match(declaration, /I will strengthen my body, sharpen my mind, create my values/);
  assert.match(declaration, /procrastination and self-doubt/);
  assert.match(declaration, /a resilient leader/);
  assert.match(declaration, /I will not wait for humanity to become what I am unwilling to embody myself\./);
  assert.match(declaration, /I choose to first embody patience and listening\./);
  assert.match(declaration, /I will not worship suffering, aging, or death/);
  assert.match(declaration, /I will leave evidence that I lived deliberately\./);

  // 2. Inspect public educational route (/eternism/continuity/page.tsx)
  const publicRoutePath = join(process.cwd(), "app", "eternism", "continuity", "page.tsx");
  const publicRouteContent = await readFile(publicRoutePath, "utf8");

  assert.match(publicRouteContent, /Six Dimensions/i);
  assert.match(publicRouteContent, /Conscious Evolution/);
  assert.match(publicRouteContent, /You do not awaken the species by waiting for humanity to change/);
  assert.match(publicRouteContent, /The future of the species is built one consciously created human at a time/);
  assert.match(publicRouteContent, /Physical Dimension/);
  assert.match(publicRouteContent, /Mental Dimension/);
  assert.match(publicRouteContent, /Moral Dimension/);
  assert.match(publicRouteContent, /Creative Dimension/);
  assert.match(publicRouteContent, /Spiritual Without Required Religion/);

  // Safety & Ethical checks
  assert.match(publicRouteContent, /Educational .* Wellness Notice/i);
  assert.match(publicRouteContent, /not medical advice/i);
  assert.match(publicRouteContent, /rejects biological superiority/i);
  assert.match(publicRouteContent, /racial hierarchy/i);
  assert.match(publicRouteContent, /tolerating abuse/i);
  assert.match(publicRouteContent, /Compassion does not require surrendering discernment/);
  assert.doesNotMatch(publicRouteContent, /guarantees biological immortality/i);
  assert.doesNotMatch(publicRouteContent, /recreates deceased people/i);

  // 3. Inspect ContinuityCapsuleForm.tsx
  const formPath = join(process.cwd(), "components", "dashboard", "ContinuityCapsuleForm.tsx");
  const formContent = await readFile(formPath, "utf8");

  assert.match(formContent, /4\. Conscious Evolution/);
  assert.match(formContent, /What change in humanity are you willing to embody first\?/);
  assert.match(formContent, /Where are you still making decisions from fear\?/);

  // 4. Inspect lib/continuity.ts backward compatibility
  const libPath = join(process.cwd(), "lib", "continuity.ts");
  const libContent = await readFile(libPath, "utf8");

  assert.match(libContent, /consciousEvolution\?: ConsciousEvolution/);
  assert.match(libContent, /conscious_evolution: input\.consciousEvolution \?\? \{\}/);

  // 5. Inspect Migration (20260726130000_add_conscious_evolution_to_continuity_profiles.sql)
  const migrationPath = join(process.cwd(), "supabase", "migrations", "20260726130000_add_conscious_evolution_to_continuity_profiles.sql");
  const migrationContent = await readFile(migrationPath, "utf8");

  assert.match(migrationContent, /ADD COLUMN IF NOT EXISTS conscious_evolution JSONB/);

  console.log("Continuity Capsule (Six Dimensions & Conscious Evolution) test suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("Continuity Capsule test suite failed:", err);
  process.exit(1);
});
