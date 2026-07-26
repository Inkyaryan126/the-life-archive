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
  assert.match(manifestoPageContent, /We will preserve what we are\./);
  assert.match(manifestoPageContent, /We will extend what we can\./);
  assert.match(manifestoPageContent, /We will not call surrender wisdom\./);
  assert.match(manifestoPageContent, /We will build toward a future where life is protected by choice, knowledge, and courage\./);

  // 5. FAQ page (/eternism/faq)
  const faqPagePath = join(process.cwd(), "app", "eternism", "faq", "page.tsx");
  const faqPageContent = await readFile(faqPagePath, "utf8");

  assert.match(faqPageContent, /Is Eternism a religion\?/);
  assert.match(faqPageContent, /Does Eternism promise biological immortality today\?/);
  assert.match(faqPageContent, /Is aging really a disease process\?/);
  assert.match(faqPageContent, /What about overpopulation/);
  assert.match(faqPageContent, /How does The Life Archive connect to Eternism\?/);

  // 6. SubNav component check
  const subNavPath = join(process.cwd(), "components", "eternism", "EternismSubNav.tsx");
  const subNavContent = await readFile(subNavPath, "utf8");

  assert.match(subNavContent, /\/eternism\/observatory/);
  assert.match(subNavContent, /\/eternism\/manifesto/);
  assert.match(subNavContent, /\/eternism\/faq/);

  console.log("Eternism test suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("Eternism tests failed:", err);
  process.exit(1);
});
