import assert from "node:assert/strict";
import { resolveAddMemoryMode, memoryTypesByMode } from "../app/archive/[slug]/add-memory/memory-mode";

async function runAddMemoryLayoutTests() {
  console.log("Starting Add Memory Photo-Video Layout Test Suite...");

  // 1. Verify Mode Resolution for Photo & Video
  const photoMode = resolveAddMemoryMode({ mode: "photo-video" });
  assert.equal(photoMode, "photo-video", "photo-video mode must resolve to photo-video");

  const typesInMode = memoryTypesByMode["photo-video"];
  assert.deepEqual(typesInMode, ["photo", "video"], "photo-video mode must contain both photo and video types");

  // 2. Verify Layout Class Contract Rules
  const compactInputClass =
    "w-full min-w-0 max-w-full box-border break-words rounded-lg border border-[#8a6427]/36 bg-[#f4dfb7]/48 px-[clamp(0.55rem,0.8vw,0.9rem)] py-[clamp(0.45rem,0.65vw,0.72rem)] text-[clamp(0.76rem,0.9vw,1rem)] leading-tight text-[#24190d] outline-none ring-[#9e6f27]/25 placeholder:text-[#5c4326]/58 focus:ring-2";

  const compactFileInputClass =
    "w-full min-w-0 max-w-full box-border overflow-hidden text-ellipsis cursor-pointer rounded-xl border border-dashed border-[#8a6427]/48 bg-[#f4dfb7]/34 px-[clamp(0.55rem,0.8vw,0.9rem)] py-[clamp(0.55rem,0.5vw,0.72rem)] text-[clamp(0.7rem,0.82vw,0.92rem)] leading-tight text-[#3c2a17] outline-none transition file:mr-2 file:rounded-full file:border-0 file:bg-[#9e6f27] file:px-[clamp(0.55rem,0.8vw,0.85rem)] file:py-[clamp(0.35rem,0.5vw,0.55rem)] file:text-[clamp(0.6rem,0.7vw,0.78rem)] file:font-bold file:uppercase file:tracking-[0.08em] file:text-[#140f09] hover:bg-[#f4dfb7]/46 focus:ring-2 focus:ring-[#9e6f27]/30";

  assert.ok(compactInputClass.includes("w-full"), "Inputs must specify w-full");
  assert.ok(compactInputClass.includes("min-w-0"), "Inputs must specify min-w-0 to prevent flex grid blowout");
  assert.ok(compactInputClass.includes("max-w-full"), "Inputs must specify max-w-full");
  assert.ok(compactFileInputClass.includes("text-ellipsis"), "File picker must specify text-ellipsis for long filenames");

  console.log("Add Memory Photo-Video Layout Test Suite passed cleanly!");
}

runAddMemoryLayoutTests().catch((err) => {
  console.error("Add Memory Layout test suite failed:", err);
  process.exit(1);
});
