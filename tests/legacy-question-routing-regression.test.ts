import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getTrackableLinkBySlug, ensureSeedData } from "../lib/advertising-campaigns";
import { buildShortTrackableUrl } from "../lib/qr-generator";

async function runRegressionTests() {
  console.log("Starting Legacy Question Routing & Intended Prologue Architecture Test Suite...");

  // 1. Verify app/legacy-question/page.tsx renders LegacyQuestionExperience wrapping LegacyQuestionScrollScene
  const legacyQuestionPagePath = path.join(process.cwd(), "app/legacy-question/page.tsx");
  assert.equal(fs.existsSync(legacyQuestionPagePath), true, "app/legacy-question/page.tsx must exist");

  const pageContent = fs.readFileSync(legacyQuestionPagePath, "utf8");
  assert.ok(
    pageContent.includes("LegacyQuestionExperience"),
    "app/legacy-question/page.tsx must import and render LegacyQuestionExperience"
  );
  assert.ok(
    pageContent.includes("LegacyQuestionScrollScene"),
    "app/legacy-question/page.tsx must import and render LegacyQuestionScrollScene inside LegacyQuestionExperience"
  );

  // 2. Verify LegacyQuestionExperience component file exists and renders LegacyProloguePlayer
  const experiencePath = path.join(process.cwd(), "app/legacy-question/LegacyQuestionExperience.tsx");
  assert.equal(
    fs.existsSync(experiencePath),
    true,
    "app/legacy-question/LegacyQuestionExperience.tsx must exist"
  );

  const experienceContent = fs.readFileSync(experiencePath, "utf8");
  assert.ok(
    experienceContent.includes("LegacyProloguePlayer"),
    "LegacyQuestionExperience must import and render LegacyProloguePlayer on initial mount"
  );
  assert.ok(
    experienceContent.includes("enterQuestion"),
    "LegacyQuestionExperience must contain transition handler to reveal LegacyQuestionScrollScene on skip or completion"
  );

  // 3. Verify LegacyProloguePlayer component file exists
  const playerPath = path.join(process.cwd(), "app/(prototype)/legacy-prologue/_components/LegacyProloguePlayer.tsx");
  assert.equal(
    fs.existsSync(playerPath),
    true,
    "app/(prototype)/legacy-prologue/_components/LegacyProloguePlayer.tsx must exist"
  );

  // 4. Verify app/(prototype)/legacy-prologue/page.tsx issues redirect to /legacy-question
  const prologuePagePath = path.join(process.cwd(), "app/(prototype)/legacy-prologue/page.tsx");
  assert.equal(fs.existsSync(prologuePagePath), true, "app/(prototype)/legacy-prologue/page.tsx must exist");

  const prologuePageContent = fs.readFileSync(prologuePagePath, "utf8");
  assert.ok(
    prologuePageContent.includes("redirect("),
    "app/(prototype)/legacy-prologue/page.tsx must issue a redirect"
  );
  assert.ok(
    prologuePageContent.includes("/legacy-question"),
    "app/(prototype)/legacy-prologue/page.tsx must redirect to /legacy-question"
  );

  // 5. Verify /go/business-card-test DB target destination resolves to /legacy-question
  await ensureSeedData();
  const link = await getTrackableLinkBySlug("business-card-test");
  assert.ok(link !== null, "Business Card Test link must exist");
  assert.equal(
    link?.destinationPath,
    "/legacy-question",
    "/go/business-card-test MUST land on /legacy-question"
  );

  const shortUrl = buildShortTrackableUrl(link?.slug || "business-card-test", "https://www.thelifearchive.vip");
  assert.equal(shortUrl, "https://www.thelifearchive.vip/go/business-card-test");

  console.log("Legacy Question Routing & Intended Prologue Architecture Test Suite passed cleanly!");
}

runRegressionTests().catch((err) => {
  console.error("Legacy Question routing regression test failed:", err);
  process.exit(1);
});
