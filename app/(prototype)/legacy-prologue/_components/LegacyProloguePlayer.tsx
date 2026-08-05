"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LegacyPrologueScene } from "../_data/types";
import { ImageSequenceProloguePlayer } from "./ImageSequenceProloguePlayer";
import styles from "./LegacyProloguePlayer.module.css";

type LegacyProloguePlayerProps = {
  scenes?: LegacyPrologueScene[];
  finalPrimaryLabel?: string;
  finalSecondaryHref?: string;
  finalSecondaryLabel?: string;
  isExiting?: boolean;
  onFinalPrimaryAction?: () => void;
  onPrologueComplete?: () => void;
  onSkip?: () => void;
  videoSrc?: string;
};

const VERIFIED_VIDEO_DURATION = 85.355; // verified via ffprobe

export function LegacyProloguePlayer({
  scenes = [],
  finalPrimaryLabel = "Answer the Legacy Question",
  finalSecondaryHref = "/login",
  finalSecondaryLabel = "I Already Have an Archive",
  isExiting = false,
  onFinalPrimaryAction,
  onPrologueComplete,
  onSkip,
  videoSrc = "/video/legacy-prologue-optimized.mp4"
}: LegacyProloguePlayerProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(VERIFIED_VIDEO_DURATION);
  const [isLoading, setIsLoading] = useState(true);
  const [showFinalCta, setShowFinalCta] = useState(false);
  const [isOpeningSoundPromptActive, setIsOpeningSoundPromptActive] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const completionNotifiedRef = useRef(false);
  const openingHoldTimerRef = useRef<number | null>(null);

  // Opening hold timer for initial sound attention (3.0 seconds)
  useEffect(() => {
    if (!isMuted || !isOpeningSoundPromptActive) {
      return;
    }

    openingHoldTimerRef.current = window.setTimeout(() => {
      setIsOpeningSoundPromptActive(false);
      const video = videoRef.current;
      if (video && video.paused && !isEnded) {
        video.play().catch(() => {});
      }
    }, 3000);

    return () => {
      if (openingHoldTimerRef.current !== null) {
        window.clearTimeout(openingHoldTimerRef.current);
      }
    };
  }, [isMuted, isOpeningSoundPromptActive, isEnded]);

  // Fallback check for saveData preference
  useEffect(() => {
    if (typeof window !== "undefined" && "navigator" in window) {
      const nav = window.navigator as { connection?: { saveData?: boolean } };
      if (nav.connection?.saveData) {
        setUseFallback(true);
      }
    }
  }, []);

  // Sync tab visibility with video playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video || useFallback) return;

      if (document.hidden) {
        if (!video.paused) {
          video.pause();
        }
      } else {
        if (isPlaying && !isEnded && video.paused && !isOpeningSoundPromptActive) {
          video.play().catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isPlaying, isEnded, useFallback, isOpeningSoundPromptActive]);

  const beginWithSound = useCallback(() => {
    if (openingHoldTimerRef.current !== null) {
      window.clearTimeout(openingHoldTimerRef.current);
    }
    setIsOpeningSoundPromptActive(false);
    setIsMuted(false);

    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 1;
      if (video.paused && !isEnded) {
        video.play().catch(() => {});
      }
    }
    setIsPlaying(true);
  }, [isEnded]);

  const continueWithoutSound = useCallback(() => {
    if (openingHoldTimerRef.current !== null) {
      window.clearTimeout(openingHoldTimerRef.current);
    }
    setIsOpeningSoundPromptActive(false);
    setIsMuted(true);

    const video = videoRef.current;
    if (video) {
      video.muted = true;
      if (video.paused && !isEnded) {
        video.play().catch(() => {});
      }
    }
    setIsPlaying(true);
  }, [isEnded]);

  const toggleSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      beginWithSound();
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, beginWithSound]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isEnded) {
      video.currentTime = 0;
      setIsEnded(false);
      setShowFinalCta(false);
      completionNotifiedRef.current = false;
      if (isMuted) {
        setIsOpeningSoundPromptActive(true);
      }
      video.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isEnded, isPlaying, isMuted]);

  const skip = useCallback(() => {
    if (openingHoldTimerRef.current !== null) {
      window.clearTimeout(openingHoldTimerRef.current);
    }
    setIsOpeningSoundPromptActive(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    setIsPlaying(false);
    setIsEnded(true);
    setShowFinalCta(true);
    onSkip?.();
  }, [onSkip]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const ct = video.currentTime;
    setCurrentTime(ct);

    const dur = video.duration || duration;
    // Show CTA ~4.2 seconds before video ends or when ended
    if (dur > 0 && ct >= dur - 4.2) {
      setShowFinalCta(true);
    }
  }, [duration]);

  const handleEnded = useCallback(() => {
    setIsEnded(true);
    setIsPlaying(false);
    setShowFinalCta(true);

    if (!completionNotifiedRef.current) {
      completionNotifiedRef.current = true;
      onPrologueComplete?.();
    }
  }, [onPrologueComplete]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Number.isFinite(video.duration) && video.duration > 0) {
      setDuration(video.duration);
    }
    setIsLoading(false);
  }, []);

  const handleVideoError = useCallback(() => {
    console.warn("[LegacyProloguePlayer] MP4 video failed to play, switching to image-sequence fallback.");
    setUseFallback(true);
  }, []);

  // If fallback is required (error, saveData preference, etc.), render ImageSequenceProloguePlayer
  if (useFallback) {
    return (
      <ImageSequenceProloguePlayer
        scenes={scenes}
        finalPrimaryLabel={finalPrimaryLabel}
        finalSecondaryHref={finalSecondaryHref}
        finalSecondaryLabel={finalSecondaryLabel}
        isExiting={isExiting}
        onFinalPrimaryAction={onFinalPrimaryAction}
        onPrologueComplete={onPrologueComplete}
        onSkip={onSkip}
      />
    );
  }

  const overallProgress = duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0;

  return (
    <main
      className={`${styles.shell} ${isExiting ? styles.shellExiting : ""}`}
      aria-label="Legacy Question cinematic prologue"
    >
      <section className={styles.stage}>
        {/* Cinematic MP4 Video */}
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          muted={isMuted}
          playsInline
          preload="auto"
          poster="/images/legacy-prologue/desktop/scene-01-a-funeral-empty-cemetery-void.webp"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          onError={handleVideoError}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Cinematic Vignette */}
        <div className={styles.vignette} />

        {/* Minimal loading state if needed */}
        {isLoading ? (
          <div className={styles.srOnly} role="status">
            Loading prologue video...
          </div>
        ) : null}

        {/* Accessible screen-reader text for prologue copy */}
        <div className={styles.srOnly} aria-live="polite">
          <p>No one plans to become a memory. No one wakes up knowing this is the day their voice becomes silence.</p>
          <p>The people you love will be left with questions you can no longer answer.</p>
          <p>Because death can take your presence. It does not have to take your words.</p>
          <p>The Life Archive begins with one question… What would you say?</p>
        </div>

        {/* Prominent Opening Sound Prompt Overlay */}
        {isOpeningSoundPromptActive && !isEnded ? (
          <div className={styles.openingSoundOverlay} role="dialog" aria-label="Prologue sound experience">
            <div className={styles.openingSoundCard}>
              <p className={styles.openingEyebrow}>The Life Archive</p>
              <h2 className={styles.openingTitle}>This story is meant to be heard.</h2>
              <p className={styles.openingSubtitle}>Enable sound for the full experience.</p>

              <button
                type="button"
                className={`${styles.beginWithSoundButton} ${styles.soundButtonPulse}`}
                onClick={beginWithSound}
                aria-label="Begin prologue with sound"
              >
                <SpeakerWaveIcon />
                <span>Begin With Sound</span>
              </button>

              <button
                type="button"
                className={styles.continueMutedButton}
                onClick={continueWithoutSound}
                aria-label="Continue prologue without sound"
              >
                Continue Without Sound
              </button>
            </div>
          </div>
        ) : null}

        {/* Final CTA Overlay when near end or ended */}
        {showFinalCta ? (
          <div className={`${styles.copy} ${styles.copyVisible}`} aria-live="polite">
            <div className={styles.finalActions} aria-label="Legacy Question actions">
              <button
                type="button"
                className="focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/50"
                onClick={onFinalPrimaryAction}
              >
                {finalPrimaryLabel}
              </button>
              {finalSecondaryHref ? (
                <a
                  href={finalSecondaryHref}
                  className="focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/50"
                >
                  {finalSecondaryLabel}
                </a>
              ) : (
                <button
                  type="button"
                  className="focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/50"
                >
                  {finalSecondaryLabel}
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* Progress Bar */}
        <div className={styles.progress} aria-label="Prologue progress">
          <span style={{ transform: `scaleX(${overallProgress})` }} />
        </div>
      </section>

      {/* Top Controls Overlay */}
      <div className={styles.controls}>
        <button
          type="button"
          aria-label="Skip the prologue"
          onClick={skip}
        >
          Skip
        </button>

        {!isOpeningSoundPromptActive ? (
          <>
            <button
              type="button"
              aria-label={
                isEnded
                  ? "Replay the prologue"
                  : isPlaying
                    ? "Pause the prologue"
                    : "Continue the prologue"
              }
              onClick={togglePlayback}
            >
              {isEnded ? "Replay" : isPlaying ? "Pause" : "Continue"}
            </button>

            <a
              href={finalSecondaryHref || "/login"}
              aria-label="Log in to an existing Life Archive account"
            >
              Log In
            </a>

            <button
              type="button"
              aria-label={isMuted ? "Enable prologue sound" : "Mute prologue sound"}
              aria-pressed={!isMuted}
              onClick={toggleSound}
            >
              {isMuted ? "Enable sound" : "Mute"}
            </button>
          </>
        ) : null}
      </div>
    </main>
  );
}

function SpeakerWaveIcon({ className = "h-5 w-5 shrink-0" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );
}
