"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { LegacyProloguePlayer } from "@/app/(prototype)/legacy-prologue/_components/LegacyProloguePlayer";
import { legacyPrologueScenes } from "@/app/(prototype)/legacy-prologue/_data/legacyPrologueScenes";

export function LegacyQuestionExperience({ children }: { children: ReactNode }) {
  const [isPrologueActive, setIsPrologueActive] = useState(true);
  const [isPrologueExiting, setIsPrologueExiting] = useState(false);
  const [hasEnteredQuestion, setHasEnteredQuestion] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPrologueActive) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPrologueActive]);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current !== null) {
        window.clearTimeout(revealTimeoutRef.current);
      }
      document.body.style.overflow = "";
    };
  }, []);

  function enterQuestion(options: { immediate?: boolean } = {}) {
    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current);
    }

    setHasEnteredQuestion(true);

    if (options.immediate) {
      setIsPrologueActive(false);
      setIsPrologueExiting(false);
      return;
    }

    setIsPrologueExiting(true);

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const delay = media.matches ? 180 : 650;

    revealTimeoutRef.current = window.setTimeout(() => {
      setIsPrologueActive(false);
      setIsPrologueExiting(false);

      window.requestAnimationFrame(() => {
        contentRef.current?.scrollIntoView({
          behavior: media.matches ? "auto" : "smooth",
          block: "start"
        });
      });
    }, delay);
  }

  return (
    <>
      {!isPrologueActive ? (
        <div ref={contentRef}>
          {hasEnteredQuestion ? (
            <button
              type="button"
              className="fixed bottom-4 right-4 z-40 rounded-full border border-[#c9a45c]/30 bg-[#11100e]/72 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f8f1e7] shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur transition hover:border-[#c9a45c] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30"
              onClick={() => {
                setIsPrologueActive(true);
                setIsPrologueExiting(false);
              }}
            >
              Replay Prologue
            </button>
          ) : null}
          {children}
        </div>
      ) : null}

      {isPrologueActive ? (
        <LegacyProloguePlayer
          finalSecondaryHref="/login"
          isExiting={isPrologueExiting}
          onFinalPrimaryAction={() => enterQuestion()}
          onPrologueComplete={() => enterQuestion()}
          onSkip={() => enterQuestion({ immediate: true })}
          scenes={legacyPrologueScenes}
        />
      ) : null}
    </>
  );
}
