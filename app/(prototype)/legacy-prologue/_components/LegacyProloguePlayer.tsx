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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const completionNotifiedRef = useRef(false);

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
        if (isPlaying && !isEnded && video.paused) {
          video.play().catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isPlaying, isEnded, useFallback]);

  const toggleSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      if (video.paused && !isEnded) {
        video.play().catch(() => {});
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, isEnded]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isEnded) {
      video.currentTime = 0;
      setIsEnded(false);
      setShowFinalCta(false);
      completionNotifiedRef.current = false;
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
  }, [isEnded, isPlaying]);

  const skip = useCallback(() => {
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

        {/* Initial Muted Sound Prompt */}
        {isMuted && !isEnded ? (
          <button
            type="button"
            className={styles.soundPrompt}
            aria-label="Enable prologue sound"
            onClick={toggleSound}
          >
            Enable sound
          </button>
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
      </div>
    </main>
  );
}
