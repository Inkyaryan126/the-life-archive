import assert from "node:assert/strict";
import {
  getModeForType,
  isAddMemoryMode,
  memoryTypesByMode,
  resolveAddMemoryMode
} from "../app/archive/[slug]/add-memory/memory-mode";

assert.equal(isAddMemoryMode("voice-sound"), true);
assert.equal(isAddMemoryMode("photo-video"), true);
assert.equal(isAddMemoryMode("letter-journal"), true);
assert.equal(isAddMemoryMode("time-capsule"), false);

assert.equal(getModeForType("voice"), "voice-sound");
assert.equal(getModeForType("song"), "voice-sound");
assert.equal(getModeForType("photo"), "photo-video");
assert.equal(getModeForType("video"), "photo-video");
assert.equal(getModeForType("lesson"), "letter-journal");
assert.equal(getModeForType("journal"), "letter-journal");
assert.equal(getModeForType("unknown"), null);

assert.equal(resolveAddMemoryMode({ mode: "voice-sound" }), "voice-sound");
assert.equal(resolveAddMemoryMode({ mode: "not-real", type: "photo" }), "photo-video");
assert.equal(resolveAddMemoryMode({ type: "song" }), "voice-sound");
assert.equal(resolveAddMemoryMode({}), "letter-journal");
assert.deepEqual(memoryTypesByMode["letter-journal"], ["journal"]);

console.log("add-memory-mode tests passed");
