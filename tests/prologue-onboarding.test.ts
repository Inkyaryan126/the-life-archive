import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// 1. Verify Public Optimized Video Files Exist
const part2PublicPath = path.join(process.cwd(), "public/videos/legacy-question/prologue-part2.mp4");
const part3PublicPath = path.join(process.cwd(), "public/videos/legacy-question/prologue-part3.mp4");

assert.equal(fs.existsSync(part2PublicPath), true, "prologue-part2.mp4 must exist in public/videos/legacy-question/");
assert.equal(fs.existsSync(part3PublicPath), true, "prologue-part3.mp4 must exist in public/videos/legacy-question/");

const part2Size = fs.statSync(part2PublicPath).size;
const part3Size = fs.statSync(part3PublicPath).size;
assert.ok(part2Size > 1000000, "Part 2 video must be valid size");
assert.ok(part3Size > 10000000, "Part 3 video must be valid size");

// 2. Test Part 2 Trigger Logic (Simulation)
function computePart2Trigger(input: {
  saveSuccess: boolean;
  emailSent: boolean;
  alreadySeen: boolean;
}) {
  if (!input.saveSuccess || !input.emailSent || input.alreadySeen) {
    return false;
  }
  return true;
}

assert.equal(computePart2Trigger({ saveSuccess: true, emailSent: true, alreadySeen: false }), true);
assert.equal(computePart2Trigger({ saveSuccess: false, emailSent: true, alreadySeen: false }), false);
assert.equal(computePart2Trigger({ saveSuccess: true, emailSent: false, alreadySeen: false }), false);
assert.equal(computePart2Trigger({ saveSuccess: true, emailSent: true, alreadySeen: true }), false);

// 3. Test Part 3 Eligibility Logic (Simulation)
function computePart3Eligibility(input: {
  legacyQuestionEligible: boolean;
  prologuePart3SeenAt: string | null;
}) {
  return Boolean(input.legacyQuestionEligible && !input.prologuePart3SeenAt);
}

// Eligible newly confirmed user
assert.equal(
  computePart3Eligibility({ legacyQuestionEligible: true, prologuePart3SeenAt: null }),
  true
);

// Existing user (legacyQuestionEligible is false)
assert.equal(
  computePart3Eligibility({ legacyQuestionEligible: false, prologuePart3SeenAt: null }),
  false
);

// User who already completed or skipped Part 3
assert.equal(
  computePart3Eligibility({ legacyQuestionEligible: true, prologuePart3SeenAt: "2026-07-22T20:00:00Z" }),
  false
);

// 4. Test Idempotent Status Updates
function applyStatusUpdate(
  current: { seenAt: string | null; status: string | null },
  update: { status: "completed" | "skipped"; now: string }
) {
  return {
    seenAt: current.seenAt ?? update.now,
    status: current.status ?? update.status
  };
}

const initial = { seenAt: null, status: null };
const afterFirst = applyStatusUpdate(initial, { status: "completed", now: "2026-07-22T20:10:00Z" });
assert.equal(afterFirst.status, "completed");
assert.equal(afterFirst.seenAt, "2026-07-22T20:10:00Z");

// Second call should be idempotent
const afterSecond = applyStatusUpdate(afterFirst, { status: "skipped", now: "2026-07-22T20:15:00Z" });
assert.equal(afterSecond.status, "completed");
assert.equal(afterSecond.seenAt, "2026-07-22T20:10:00Z");

console.log("prologue-onboarding tests passed");
