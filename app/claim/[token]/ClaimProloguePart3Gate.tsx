"use client";

import { useState, type ReactNode } from "react";
import { PrologueVideoPlayerOverlay } from "@/components/legacy-question/PrologueVideoPlayerOverlay";
import { markClaimProloguePart3CompleteAction } from "./actions";

export function ClaimProloguePart3Gate({
  token,
  shouldPlay,
  children
}: {
  token: string;
  shouldPlay: boolean;
  children: ReactNode;
}) {
  const [isPlaying, setIsPlaying] = useState(shouldPlay);

  return (
    <>
      {isPlaying ? (
        <PrologueVideoPlayerOverlay
          videoSrc="/videos/legacy-question/prologue-part3.mp4"
          title="Welcome to Your Life Archive - Prologue Part III"
          subtitle="Your starter archive is ready. The Grand Hall is opening."
          skipLabel="Continue to Claim"
          onComplete={async ({ status }) => {
            setIsPlaying(false);
            await markClaimProloguePart3CompleteAction({ token, status });
          }}
        />
      ) : null}
      {children}
    </>
  );
}
