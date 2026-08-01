import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getNavGroupedItems } from "../components/archive-building/navigation";

async function runTests() {
  console.log("Starting Eternism test suite...");

  // 1. Navigation verification
  const navSections = getNavGroupedItems(null, false);
  const guidanceSection = navSections.find((s) => s.category === "GUIDANCE");
  assert.ok(guidanceSection, "GUIDANCE nav category must exist.");
  const eternismItem = guidanceSection.items.find((i) => i.href === "/eternism");
  assert.ok(eternismItem, "Eternism link must be present in GUIDANCE navigation.");

  // 2. Main landing page (/eternism)
  const mainPagePath = join(process.cwd(), "app", "eternism", "page.tsx");
  const mainPageContent = await readFile(mainPagePath, "utf8");

  assert.match(mainPageContent, /Death has ruled humanity long enough/);
  assert.match(mainPageContent, /Eternism is the belief that aging and involuntary death are problems to be solved/);
  assert.match(mainPageContent, /Enter the Observatory/);
  assert.match(mainPageContent, /Read the Manifesto/);
  assert.match(mainPageContent, /Preserve the life\. Extend the life\./);
  assert.match(mainPageContent, /What if death is not the meaning of life\?/);
  assert.match(mainPageContent, /The Life Archive preserves the person while humanity works to preserve the life\./);

  // Safety checks: no guaranteed immortality or claims of recreating deceased people
  assert.doesNotMatch(mainPageContent, /guarantees biological immortality/i);
  assert.doesNotMatch(mainPageContent, /recreates deceased people today/i);

  // 3. Observatory page (/eternism/observatory)
  const obsPagePath = join(process.cwd(), "app", "eternism", "observatory", "page.tsx");
  const obsPageContent = await readFile(obsPagePath, "utf8");

  assert.match(obsPageContent, /The Eternist Observatory/);
  assert.match(obsPageContent, /Established Science/);
  assert.match(obsPageContent, /Emerging Research/);
  assert.match(obsPageContent, /Experimental Concept/);
  assert.match(obsPageContent, /Philosophical Horizon/);
  assert.match(obsPageContent, /Scientific Reality/);

  // Safety checks
  assert.match(obsPageContent, /We do not offer medical advice/);

  // 4. Manifesto page (/eternism/manifesto)
  const manifestoPagePath = join(process.cwd(), "app", "eternism", "manifesto", "page.tsx");
  const manifestoPageContent = await readFile(manifestoPagePath, "utf8");

  assert.match(manifestoPageContent, /The Eternist Manifesto/);
  assert.match(manifestoPageContent, /1\. The Ancient Surrender/);
  assert.match(manifestoPageContent, /2\. Death Is Not Sacred/);
  assert.match(manifestoPageContent, /3\. Aging Is Machinery/);
  assert.match(manifestoPageContent, /4\. The Moral Duty to Resist/);
  assert.match(manifestoPageContent, /5\. The Unfinished Human/);
  assert.match(manifestoPageContent, /6\. Memory Is Continuity/);
  assert.match(manifestoPageContent, /7\. The Generation That Refuses/);
  assert.match(manifestoPageContent, /8\. The Self Worth Preserving/);
  assert.match(manifestoPageContent, /9\. Conscious Evolution/);
  assert.match(manifestoPageContent, /10\. Freedom, Dignity, and Choice/);
  assert.match(manifestoPageContent, /11\. A Future Worth Surviving For/);

  // Exact core lines assertions
  assert.match(manifestoPageContent, /Eternism is the practice of becoming harder to destroy\./);
  assert.match(manifestoPageContent, /Do not merely preserve yourself\. Create a self worth preserving\./);
  assert.match(manifestoPageContent, /We are not finished objects\. We are lives under construction\./);
  assert.match(manifestoPageContent, /You do not awaken the species by waiting for humanity to change\. You awaken the part of humanity that is you\./);
  assert.match(manifestoPageContent, /The future of the species is built one consciously created human at a time\./);
  assert.match(manifestoPageContent, /Longer life without greater awareness would only extend our existing mistakes/);
  assert.match(manifestoPageContent, /The goal is not compulsory immortality\. The goal is meaningful choice\./);
  assert.match(manifestoPageContent, /The Life Archive preserves the person while humanity works to preserve the life\./);
  assert.match(manifestoPageContent, /We do not seek more life merely to remain who we are\. We seek more life to become what humanity has never had enough time to become\./);

  // Short and Full Pledge assertions
  assert.match(manifestoPageContent, /shortPledge/);
  assert.match(manifestoPageContent, /fullPledge/);
  assert.match(manifestoPageContent, /We will preserve what we are\./);
  assert.match(manifestoPageContent, /We will extend what we can\./);
  assert.match(manifestoPageContent, /We will not call surrender wisdom\./);
  assert.match(manifestoPageContent, /We will build toward a future where life is protected by choice, knowledge, and courage\./);

  // Factual and rhetorical safety checks
  assert.doesNotMatch(manifestoPageContent, /killed half of every generation/i, "Overly broad casualty claim must be absent");
  assert.doesNotMatch(manifestoPageContent, /What can be repaired can be mastered/i, "Absolute repair claim must be absent");
  assert.doesNotMatch(manifestoPageContent, /guaranteed immortality|recreate deceased people|consciousness upload/i, "Unsubstantiated claims must be absent");

  // 5. FAQ page (/eternism/faq)
  const faqPagePath = join(process.cwd(), "app", "eternism", "faq", "page.tsx");
  const faqPageContent = await readFile(faqPagePath, "utf8");

  assert.match(faqPageContent, /Is Eternism a religion\?/);
  assert.match(faqPageContent, /Does Eternism promise biological immortality today\?/);
  assert.match(faqPageContent, /Is aging really a disease process\?/);
  assert.match(faqPageContent, /What about overpopulation/);
  assert.match(faqPageContent, /How does The Life Archive connect to Eternism\?/);

  // 6. SubNav & Shell variant configuration checks
  const subNavPath = join(process.cwd(), "components", "eternism", "EternismSubNav.tsx");
  const subNavContent = await readFile(subNavPath, "utf8");

  assert.match(subNavContent, /\/eternism\/observatory/);
  assert.match(subNavContent, /\/eternism\/manifesto/);
  assert.match(subNavContent, /\/eternism\/faq/);
  assert.match(subNavContent, /\/eternism\/trial/);

  // Shell variant configuration assertions
  const shellPath = join(process.cwd(), "components", "eternism", "EternismPageShell.tsx");
  const shellContent = await readFile(shellPath, "utf8");
  assert.match(shellContent, /variantConfigs/, "EternismPageShell must use variantConfigs map");
  assert.match(shellContent, /philosophy:/, "EternismPageShell must configure philosophy variant");
  assert.match(shellContent, /observatory:/, "EternismPageShell must configure observatory variant");
  assert.match(shellContent, /manifesto:/, "EternismPageShell must configure manifesto variant");
  assert.match(shellContent, /faq:/, "EternismPageShell must configure faq variant");
  assert.match(shellContent, /continuity:/, "EternismPageShell must configure continuity variant");
  assert.match(shellContent, /trial:/, "EternismPageShell must configure trial variant");

  console.log("Eternism test suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("Eternism tests failed:", err);
  process.exit(1);
});
