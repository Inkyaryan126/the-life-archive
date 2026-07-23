"use client";

import { useState } from "react";
import { PrologueVideoPlayerOverlay } from "@/components/legacy-question/PrologueVideoPlayerOverlay";
import { markProloguePart3CompleteAction } from "@/app/dashboard/actions";

export function DashboardProloguePart3Container({
  eligible
}: {
  eligible: boolean;
}) {
  const [isVisible, setIsVisible] = useState(eligible);

  if (!isVisible) {
    return null;
  }

  return (
    <PrologueVideoPlayerOverlay
      videoSrc="/videos/legacy-question/prologue-part3.mp4"
      title="Welcome to Your Life Archive — Prologue Part III"
      subtitle="Your starter archive is created. Welcome to the Grand Hall."
      skipLabel="Enter Dashboard"
      onComplete={async ({ status }) => {
        setIsVisible(false);
        await markProloguePart3CompleteAction({ status });
      }}
    />
  );
}
