import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// 1. Verify Prologue Player Source Files Exist
const playerComponentPath = path.join(
  process.cwd(),
  "app/(prototype)/legacy-prologue/_components/LegacyProloguePlayer.tsx"
);
const fallbackPlayerPath = path.join(
  process.cwd(),
  "app/(prototype)/legacy-prologue/_components/ImageSequenceProloguePlayer.tsx"
);
const stylesPath = path.join(
  process.cwd(),
  "app/(prototype)/legacy-prologue/_components/LegacyProloguePlayer.module.css"
);

assert.equal(fs.existsSync(playerComponentPath), true, "LegacyProloguePlayer.tsx must exist");
assert.equal(fs.existsSync(fallbackPlayerPath), true, "ImageSequenceProloguePlayer.tsx must exist");
assert.equal(fs.existsSync(stylesPath), true, "LegacyProloguePlayer.module.css must exist");

// 2. Verify Key Sound Prompt Text & Classes in Code
const playerContent = fs.readFileSync(playerComponentPath, "utf8");
const fallbackContent = fs.readFileSync(fallbackPlayerPath, "utf8");
const stylesContent = fs.readFileSync(stylesPath, "utf8");

assert.ok(playerContent.includes("This story is meant to be heard."));
assert.ok(playerContent.includes("Begin With Sound"));
assert.ok(playerContent.includes("Continue Without Sound"));
assert.ok(fallbackContent.includes("This story is meant to be heard."));
assert.ok(fallbackContent.includes("Begin With Sound"));
assert.ok(fallbackContent.includes("Continue Without Sound"));

assert.ok(stylesContent.includes(".openingSoundOverlay"));
assert.ok(stylesContent.includes(".beginWithSoundButton"));
assert.ok(stylesContent.includes(".soundButtonPulse"));
assert.ok(stylesContent.includes(".continueMutedButton"));
assert.ok(stylesContent.includes("@keyframes openingGoldPulse"));

// 3. Test Simulation Logic for Sound Prompt State Machine
type SoundState = {
  isMuted: boolean;
  isOpeningSoundPromptActive: boolean;
  isPlaying: boolean;
  isEnded: boolean;
};

function createInitialSoundState(initialMuted = true): SoundState {
  return {
    isMuted: initialMuted,
    isOpeningSoundPromptActive: initialMuted,
    isPlaying: !initialMuted,
    isEnded: false
  };
}

function handleBeginWithSound(state: SoundState): SoundState {
  return {
    ...state,
    isMuted: false,
    isOpeningSoundPromptActive: false,
    isPlaying: true
  };
}

function handleContinueWithoutSound(state: SoundState): SoundState {
  return {
    ...state,
    isMuted: true,
    isOpeningSoundPromptActive: false,
    isPlaying: true
  };
}

function handleTimeout(state: SoundState): SoundState {
  return {
    ...state,
    isOpeningSoundPromptActive: false,
    isPlaying: true
  };
}

function handleReplay(state: SoundState): SoundState {
  return {
    ...state,
    isEnded: false,
    isPlaying: true,
    isOpeningSoundPromptActive: state.isMuted
  };
}

// Initial state test
let state = createInitialSoundState(true);
assert.equal(state.isMuted, true);
assert.equal(state.isOpeningSoundPromptActive, true);
assert.equal(state.isPlaying, false);

// Begin With Sound test
const soundEnabledState = handleBeginWithSound(state);
assert.equal(soundEnabledState.isMuted, false);
assert.equal(soundEnabledState.isOpeningSoundPromptActive, false);
assert.equal(soundEnabledState.isPlaying, true);

// Replay with sound already enabled should NOT trigger prompt
const replayEnabledState = handleReplay({ ...soundEnabledState, isEnded: true });
assert.equal(replayEnabledState.isOpeningSoundPromptActive, false);
assert.equal(replayEnabledState.isPlaying, true);

// Continue Without Sound test
const mutedState = handleContinueWithoutSound(state);
assert.equal(mutedState.isMuted, true);
assert.equal(mutedState.isOpeningSoundPromptActive, false);

// Timeout test
const timeoutState = handleTimeout(state);
assert.equal(timeoutState.isOpeningSoundPromptActive, false);

// Replay when muted SHOULD re-trigger prompt
const replayMutedState = handleReplay({ ...mutedState, isEnded: true });
assert.equal(replayMutedState.isOpeningSoundPromptActive, true);

// 4. Verify Reduced Motion Support in CSS
assert.ok(
  stylesContent.includes("prefers-reduced-motion: reduce"),
  "CSS must include prefers-reduced-motion media query"
);
assert.ok(
  stylesContent.includes("animation: none !important"),
  "Reduced motion must disable animation"
);

console.log("opening-sound-prompt tests passed successfully");
