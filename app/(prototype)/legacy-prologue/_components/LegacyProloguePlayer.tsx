"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LegacyPrologueImage, LegacyPrologueScene } from "../_data/types";
import styles from "./LegacyProloguePlayer.module.css";

type LoadState = "loading" | "ready";

type LegacyProloguePlayerProps = {
  scenes: LegacyPrologueScene[];
  finalPrimaryLabel?: string;
  finalSecondaryHref?: string;
  finalSecondaryLabel?: string;
  isExiting?: boolean;
  onFinalPrimaryAction?: () => void;
  onPrologueComplete?: () => void;
  onSkip?: () => void;
};

type TimelineFrame = LegacyPrologueImage & {
  chapterId: LegacyPrologueScene["id"];
  overlay: LegacyPrologueScene["overlay"];
};

const PHONE_REVEAL_STEM = "scene-02-bb-their-story-isnt-over";

type PhoneRevealGeometry = {
  viewBox: string;
  screen: string;
  logo: { x: number; y: number; width: number; height: number };
  message: { x: number; y: number; width: number; height: number };
};

const PHONE_REVEAL_DESKTOP: PhoneRevealGeometry = {
  viewBox: "0 0 1672 941",
  screen: "796,74 1134,54 1235,760 868,794",
  logo: { x: 903, y: 165, width: 196, height: 165 },
  message: { x: 838, y: 380, width: 402, height: 214 }
};

const PHONE_REVEAL_MOBILE: PhoneRevealGeometry = {
  viewBox: "0 0 1080 1920",
  screen: "514,704 733,691 798,1147 561,1169",
  logo: { x: 583, y: 763, width: 127, height: 107 },
  message: { x: 541, y: 902, width: 260, height: 139 }
};

const INTRO_BLACK_DURATION = 1850;
const SOUND_BED_SRC = "/audio/legacy-prologue-sound-bed.wav";
const SOUND_VOLUME = 0.86;
const shouldLogAudio = process.env.NODE_ENV !== "production";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function interpolate(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function logPrologueAudio(event: string, detail: Record<string, unknown> = {}) {
  if (!shouldLogAudio) {
    return;
  }

  console.info(`[legacy-prologue audio] ${event}`, detail);
}

function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => {
      if (typeof image.decode === "function") {
        image.decode().then(() => resolve()).catch(() => resolve());
        return;
      }

      resolve();
    };
    image.onerror = () => reject(new Error(`Unable to preload ${src}`));
    image.src = src;
  });
}

export function LegacyProloguePlayer({
  scenes,
  finalPrimaryLabel = "Answer the Legacy Question",
  finalSecondaryHref,
  finalSecondaryLabel = "I Already Have an Archive",
  isExiting = false,
  onFinalPrimaryAction,
  onPrologueComplete,
  onSkip
}: LegacyProloguePlayerProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isSoundAvailable, setIsSoundAvailable] = useState(true);
  const [wasAutoplayBlocked, setWasAutoplayBlocked] = useState<boolean | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const advancingRef = useRef(false);
  const completionNotifiedRef = useRef(false);
  const sceneProgressRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAttemptedAutoplayRef = useRef(false);
  const timeline = useMemo<TimelineFrame[]>(
    () =>
      scenes.flatMap((scene) =>
        scene.images.map((image) => ({
          ...image,
          chapterId: scene.id,
          overlay: scene.overlay
        }))
      ),
    [scenes]
  );
  const activeFrame = timeline[activeIndex] ?? timeline[0];
  const nextFrame = timeline[activeIndex + 1] ?? null;
  const totalDuration = useMemo(
    () => timeline.reduce((total, image) => total + image.duration, 0),
    [timeline]
  );
  const elapsedBeforeActive = useMemo(
    () => timeline.slice(0, activeIndex).reduce((total, image) => total + image.duration, 0),
    [activeIndex, timeline]
  );
  const overallProgress = totalDuration
    ? clamp((elapsedBeforeActive + sceneProgress * activeFrame.duration) / totalDuration, 0, 1)
    : 0;
  const timelineTimeSeconds = totalDuration
    ? (elapsedBeforeActive + sceneProgress * activeFrame.duration) / 1000
    : 0;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px), (orientation: portrait)");
    const updateViewport = () => setIsMobileViewport(media.matches);

    updateViewport();
    media.addEventListener("change", updateViewport);

    return () => media.removeEventListener("change", updateViewport);
  }, []);

  const getSceneImageSrc = useCallback(
    (image: LegacyPrologueImage) =>
      isMobileViewport ? image.mobileSrc : image.desktopSrc,
    [isMobileViewport]
  );

  useEffect(() => {
    let cancelled = false;
    const initialImages = timeline.slice(0, 3);

    Promise.allSettled(
      initialImages.map((image, index) =>
        preloadImage(getSceneImageSrc(image)).finally(() => {
          if (!cancelled) {
            setLoadProgress((index + 1) / initialImages.length);
          }
        })
      )
    ).then(() => {
      if (!cancelled) {
        setLoadState("ready");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [getSceneImageSrc, timeline]);

  useEffect(() => {
    for (const image of timeline.slice(activeIndex + 1, activeIndex + 3)) {
      preloadImage(getSceneImageSrc(image)).catch(() => {
        setFailedImages((current) => new Set(current).add(getSceneImageSrc(image)));
      });
    }
  }, [activeIndex, getSceneImageSrc, timeline]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = SOUND_VOLUME;
    audio.muted = false;

    const canPlayM4a = Boolean(audio.canPlayType("audio/mp4") || audio.canPlayType("audio/m4a"));
    const canPlayMp3 = Boolean(audio.canPlayType("audio/mpeg"));

    const selectedSrc = canPlayM4a
      ? "/audio/legacy-prologue-sound-bed.m4a"
      : canPlayMp3
        ? "/audio/legacy-prologue-sound-bed.mp3"
        : SOUND_BED_SRC;

    audio.src = selectedSrc;
    audioRef.current = audio;

    const log = (event: string, detail: Record<string, unknown> = {}) => {
      logPrologueAudio(event, {
        src: selectedSrc,
        currentTime: Number(audio.currentTime.toFixed(2)),
        duration: Number.isFinite(audio.duration) ? Number(audio.duration.toFixed(2)) : null,
        paused: audio.paused,
        muted: audio.muted,
        volume: audio.volume,
        ...detail
      });
    };

    const handleCanPlay = () => log("canplay");
    const handleLoadedMetadata = () => log("loadedmetadata");
    const handlePlay = () => log("play");
    const handlePause = () => log("pause");
    const handleError = () => {
      setIsSoundAvailable(false);
      log("error", { error: audio.error?.message ?? audio.error?.code ?? "unknown" });
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.load();
    log("load-requested");

    return () => {
      audio.pause();
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  const playSoundFromTimeline = useCallback(async (source: "autoplay" | "gesture" | "resume") => {
    const audio = audioRef.current;

    if (!audio) {
      setIsSoundAvailable(false);
      logPrologueAudio("unavailable", { source: SOUND_BED_SRC });
      return false;
    }

    audio.volume = SOUND_VOLUME;
    audio.muted = false;
    audio.currentTime = clamp(timelineTimeSeconds, 0, Math.max(audio.duration || totalDuration / 1000, 0));

    try {
      await audio.play();
      setIsSoundEnabled(true);
      setWasAutoplayBlocked(source === "autoplay" ? false : wasAutoplayBlocked);
      logPrologueAudio("play-promise-resolved", {
        source,
        src: SOUND_BED_SRC,
        timelineTimeSeconds: Number(timelineTimeSeconds.toFixed(2)),
        audioTimeSeconds: Number(audio.currentTime.toFixed(2)),
        muted: audio.muted,
        volume: audio.volume
      });
      return true;
    } catch (error) {
      if (source === "autoplay") {
        setWasAutoplayBlocked(true);
      }
      setIsSoundEnabled(false);
      logPrologueAudio("play-promise-rejected", {
        source,
        src: SOUND_BED_SRC,
        timelineTimeSeconds: Number(timelineTimeSeconds.toFixed(2)),
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }, [timelineTimeSeconds, totalDuration, wasAutoplayBlocked]);

  useEffect(() => {
    if (loadState !== "ready" || hasAttemptedAutoplayRef.current) {
      return;
    }

    hasAttemptedAutoplayRef.current = true;
    void playSoundFromTimeline("autoplay");
  }, [loadState, playSoundFromTimeline]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !isSoundEnabled) {
      return;
    }

    if (!isPlaying || isComplete) {
      if (!audio.paused) {
        audio.pause();
      }
      return;
    }

    const drift = Math.abs(audio.currentTime - timelineTimeSeconds);
    if (drift > 0.45) {
      audio.currentTime = timelineTimeSeconds;
      logPrologueAudio("sync-corrected", {
        src: SOUND_BED_SRC,
        timelineTimeSeconds: Number(timelineTimeSeconds.toFixed(2)),
        driftSeconds: Number(drift.toFixed(2))
      });
    }

    if (audio.paused) {
      void playSoundFromTimeline("resume");
    }
  }, [isComplete, isPlaying, isSoundEnabled, playSoundFromTimeline, timelineTimeSeconds]);

  const toggleSound = useCallback(async () => {
    const audio = audioRef.current;

    if (isSoundEnabled) {
      audio?.pause();
      setIsSoundEnabled(false);
      return;
    }

    await playSoundFromTimeline("gesture");
  }, [isSoundEnabled, playSoundFromTimeline]);

  const advanceFrame = useCallback(() => {
    if (advancingRef.current) {
      return;
    }

    advancingRef.current = true;
    startedAtRef.current = null;
    sceneProgressRef.current = 0;
    setSceneProgress(0);

    setActiveIndex((current) => {
      if (current >= timeline.length - 1) {
        setIsComplete(true);
        setIsPlaying(false);
        if (!completionNotifiedRef.current) {
          completionNotifiedRef.current = true;
          window.setTimeout(() => {
            onPrologueComplete?.();
          }, 240);
        }
        return current;
      }

      return current + 1;
    });
  }, [onPrologueComplete, timeline.length]);

  useEffect(() => {
    sceneProgressRef.current = sceneProgress;
  }, [sceneProgress]);

  useEffect(() => {
    advancingRef.current = false;
  }, [activeIndex]);

  useEffect(() => {
    if (loadState !== "ready" || !isPlaying || isComplete) {
      return;
    }

    const tick = (timestamp: number) => {
      if (startedAtRef.current === null) {
        startedAtRef.current = timestamp - sceneProgressRef.current * activeFrame.duration;
      }

      const elapsed = timestamp - startedAtRef.current;
      const progress = clamp(elapsed / activeFrame.duration, 0, 1);
      setSceneProgress(progress);

      if (progress >= 1) {
        advanceFrame();
        return;
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    activeFrame.duration,
    advanceFrame,
    isComplete,
    isPlaying,
    loadState
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pausedAtRef.current = performance.now();
        setIsPlaying(false);
        return;
      }

      if (pausedAtRef.current !== null && !isComplete) {
        const pausedDuration = performance.now() - pausedAtRef.current;
        if (startedAtRef.current !== null) {
          startedAtRef.current += pausedDuration;
        }
        pausedAtRef.current = null;
        setIsPlaying(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isComplete]);

  const replay = () => {
    const audio = audioRef.current;
    advancingRef.current = false;
    completionNotifiedRef.current = false;
    startedAtRef.current = null;
    pausedAtRef.current = null;
    sceneProgressRef.current = 0;
    setActiveIndex(0);
    setSceneProgress(0);
    setIsComplete(false);
    setIsPlaying(true);

    if (audio) {
      audio.currentTime = 0;
      if (isSoundEnabled) {
        void audio.play().catch((error) => {
          logPrologueAudio("replay-play-rejected", {
            src: SOUND_BED_SRC,
            error: error instanceof Error ? error.message : String(error)
          });
        });
      }
    }
  };

  const skip = () => {
    const audio = audioRef.current;
    advancingRef.current = false;
    completionNotifiedRef.current = true;
    startedAtRef.current = null;
    sceneProgressRef.current = 1;
    setActiveIndex(Math.max(timeline.length - 1, 0));
    setSceneProgress(1);
    setIsComplete(true);
    setIsPlaying(false);

    if (audio) {
      audio.currentTime = totalDuration / 1000;
      audio.pause();
    }

    onSkip?.();
  };

  const togglePlayback = () => {
    if (isComplete) {
      replay();
      return;
    }

    if (isPlaying) {
      pausedAtRef.current = performance.now();
      setIsPlaying(false);
      return;
    }

    if (pausedAtRef.current !== null && startedAtRef.current !== null) {
      startedAtRef.current += performance.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    } else {
      startedAtRef.current = null;
    }

    setIsPlaying(true);
  };

  const activeImageElapsed = sceneProgress * activeFrame.duration;
  const activeImageProgress = sceneProgress;
  const activeImage = activeFrame;
  const imageFadeDuration = Math.min(900, activeImage.duration * 0.32);
  const nextImage = sceneProgress > 0.82 ? nextFrame : null;
  const nextImageOpacity = nextImage
    ? clamp((activeImageElapsed - (activeImage.duration - imageFadeDuration)) / imageFadeDuration, 0, 1)
    : 0;

  const getImageStyle = (image: LegacyPrologueImage, isActive: boolean) => {
    const progress = isActive ? activeImageProgress : 0;
    const motion = image.motion ?? "push";
    const endScale = motion === "still" ? 1.028 : motion === "push" ? 1.055 : 1.045;
    const xRange = motion === "drift-left" ? [0.08, -0.08] : motion === "drift-right" ? [-0.08, 0.08] : [0, 0];
    const scale = prefersReducedMotion
      ? 1.025
      : interpolate(1.018, activeFrame.chapterId === "mansion" ? Math.min(endScale, 1.038) : endScale, progress);
    const x = prefersReducedMotion ? 0 : interpolate(xRange[0], xRange[1], progress);
    const y = prefersReducedMotion ? 0 : motion === "still" ? 0 : interpolate(0.02, -0.04, progress);

    return {
      objectPosition: image.focalPoint ?? "50% 50%",
      transform: `translate3d(${x}%, ${y}%, 0) scale(${scale})`
    };
  };

  const renderPhoneRevealOverlay = (
    image: LegacyPrologueImage,
    elapsed: number,
    isActive: boolean
  ) => {
    if (!image.desktopSrc.includes(PHONE_REVEAL_STEM) || prefersReducedMotion) {
      return null;
    }

    const logoOpacity = isActive ? clamp((elapsed - 120) / 700, 0, 1) : 0;
    const messageOpacity = isActive ? clamp((elapsed - 1120) / 1300, 0, 1) : 0;
    const instance = `${activeIndex}-${isActive ? "active" : "next"}`;

    const revealSvg = (
      geometry: PhoneRevealGeometry,
      source: string,
      variant: "desktop" | "mobile"
    ) => {
      const logoClip = `phone-logo-${variant}-${instance}`;
      const messageClip = `phone-message-${variant}-${instance}`;

      return (
        <svg
          aria-hidden="true"
          className={`${styles.phoneReveal} ${
            variant === "mobile" ? styles.phoneRevealMobile : styles.phoneRevealDesktop
          }`}
          preserveAspectRatio="xMidYMid slice"
          style={getImageStyle(image, isActive)}
          viewBox={geometry.viewBox}
        >
          <defs>
            <clipPath id={logoClip}>
              <rect
                x={geometry.logo.x}
                y={geometry.logo.y}
                width={geometry.logo.width}
                height={geometry.logo.height}
                rx="10"
              />
            </clipPath>
            <clipPath id={messageClip}>
              <rect
                x={geometry.message.x}
                y={geometry.message.y}
                width={geometry.message.width}
                height={geometry.message.height}
                rx="10"
              />
            </clipPath>
          </defs>
          <polygon points={geometry.screen} fill="#050504" opacity="0.96" />
          <image
            href={source}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            clipPath={`url(#${logoClip})`}
            opacity={logoOpacity}
          />
          <image
            href={source}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            clipPath={`url(#${messageClip})`}
            opacity={messageOpacity}
          />
        </svg>
      );
    };

    return (
      <>
        {revealSvg(PHONE_REVEAL_DESKTOP, image.desktopSrc, "desktop")}
        {revealSvg(PHONE_REVEAL_MOBILE, image.mobileSrc, "mobile")}
      </>
    );
  };

  const activeOpacity = 1;

  const introBlack = activeIndex === 0 && activeFrame.introCaption && !isComplete
    ? clamp((INTRO_BLACK_DURATION - activeImageElapsed) / 500, 0, 0.82)
    : 0;
  const chapterEndBlack = nextFrame && nextFrame.chapterId !== activeFrame.chapterId
    ? clamp((activeImageElapsed - (activeFrame.duration - 650)) / 650, 0, 0.62)
    : 0;
  const finalBlack = activeIndex === timeline.length - 1 && !isComplete
    ? clamp((activeImageElapsed - (activeFrame.duration - 450)) / 450, 0, 0.3)
    : 0;
  const blackOpacity = Math.max(introBlack, chapterEndBlack, finalBlack);
  const captionStart = activeFrame.introCaption
    ? INTRO_BLACK_DURATION + 180
    : activeFrame.chapterId === "mansion"
      ? 900
      : Math.min(600, activeImage.duration * 0.24);
  const captionEnd = activeFrame.introCaption
    ? activeImage.duration + 100
    : activeFrame.chapterId === "mansion"
      ? activeImage.duration + 100
      : activeImage.duration - 450;
  const introTextVisible =
    Boolean(activeFrame.introCaption) &&
    activeImageElapsed >= 240 &&
    activeImageElapsed <= INTRO_BLACK_DURATION - 120;
  const finalQuestionVisible = activeFrame.chapterId === "mansion" && (activeImageElapsed >= 3700 || isComplete);
  const finalPromptVisible = activeFrame.chapterId === "mansion" && (activeImageElapsed >= 4200 || isComplete);
  const finalCaptionVisible = activeFrame.chapterId !== "mansion" || isComplete
    ? true
    : (activeImageElapsed >= 900 && activeImageElapsed <= 3300) ||
      activeImageElapsed >= 3700;
  const textVisible =
    Boolean(activeImage.caption?.length) &&
    activeImageElapsed >= captionStart &&
    activeImageElapsed <= Math.min(captionEnd, activeImage.duration) &&
    finalCaptionVisible;
  const captionLines = activeImage.caption
    ? activeFrame.chapterId === "mansion"
      ? finalQuestionVisible
        ? activeImage.caption.slice(-1)
        : activeImage.caption.slice(0, 1)
      : activeImage.caption
    : [];
  const hasLongCopy = captionLines.some((line) => line.length > 62);
  const soundPromptVisible =
    isSoundAvailable &&
    !isSoundEnabled &&
    activeIndex === 0 &&
    activeImageElapsed < INTRO_BLACK_DURATION;

  if (loadState === "loading") {
    return (
      <main className={styles.loadingShell} aria-busy="true">
        <div className={styles.loadingMark}>The Life Archive</div>
        <div className={styles.loadingBar} aria-hidden="true">
          <span style={{ transform: `scaleX(${loadProgress})` }} />
        </div>
      </main>
    );
  }

  return (
    <main
      className={`${styles.shell} ${isExiting ? styles.shellExiting : ""}`}
      aria-label="Legacy Question cinematic prologue"
    >
      <section className={styles.stage}>
        {[
          { image: activeImage, opacity: activeOpacity, active: true },
          nextImage ? { image: nextImage, opacity: nextImageOpacity, active: false } : null
        ].filter(Boolean).map((frame) => {
          const typedFrame = frame as { image: LegacyPrologueImage; opacity: number; active: boolean };
          const src = getSceneImageSrc(typedFrame.image);
          const failed = failedImages.has(src);

          return (
            <div
              className={styles.scene}
              key={typedFrame.image.desktopSrc}
              style={{ opacity: typedFrame.opacity }}
              aria-hidden={!typedFrame.active}
            >
              {failed ? (
                <picture className={styles.scenePicture}>
                  <source
                    media="(max-width: 720px), (orientation: portrait)"
                    srcSet={typedFrame.image.fallbackSrc}
                  />
                  <img
                    alt=""
                    className={styles.sceneImage}
                    decoding="async"
                    src={typedFrame.image.fallbackSrc}
                  />
                </picture>
              ) : (
                <picture className={styles.scenePicture}>
                  <source
                    media="(max-width: 720px), (orientation: portrait)"
                    srcSet={typedFrame.image.mobileSrc}
                  />
                  <source
                    media="(min-width: 721px) and (orientation: landscape)"
                    srcSet={typedFrame.image.desktopSrc}
                  />
                  <img
                    alt={typedFrame.active ? typedFrame.image.alt : ""}
                    className={styles.sceneImage}
                    decoding={activeIndex < 3 ? "sync" : "async"}
                    fetchPriority={activeIndex < 3 ? "high" : "auto"}
                    loading={activeIndex < 3 ? "eager" : "lazy"}
                    src={typedFrame.image.desktopSrc}
                    style={getImageStyle(typedFrame.image, typedFrame.active)}
                    width={1672}
                    height={941}
                    onError={() =>
                      setFailedImages((current) => new Set(current).add(src))
                    }
                  />
                </picture>
              )}
              {renderPhoneRevealOverlay(
                typedFrame.image,
                typedFrame.active ? activeImageElapsed : 0,
                typedFrame.active
              )}
            </div>
          );
        })}

        <div className={`${styles.overlay} ${styles[`overlay-${activeFrame.overlay ?? "none"}`]}`} />
        <div className={styles.vignette} />
        <div className={styles.blackout} style={{ opacity: blackOpacity }} />

        <div
          className={`${styles.introCopy} ${
            introTextVisible ? styles.copyVisible : ""
          }`}
          aria-hidden={!introTextVisible}
        >
          <p>{activeFrame.introCaption}</p>
        </div>

        {soundPromptVisible ? (
          <button
            type="button"
            className={styles.soundPrompt}
            aria-label="Enable prologue sound"
            onClick={toggleSound}
          >
            Enable sound
          </button>
        ) : null}

        <div
          className={`${styles.copy} ${hasLongCopy ? styles.copyLong : ""} ${
            textVisible ? styles.copyVisible : ""
          }`}
          aria-live="polite"
        >
          {captionLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {finalPromptVisible ? (
            <div className={styles.finalActions} aria-label="Legacy Question actions">
              <button type="button" onClick={onFinalPrimaryAction}>
                {finalPrimaryLabel}
              </button>
              {finalSecondaryHref ? (
                <a href={finalSecondaryHref}>{finalSecondaryLabel}</a>
              ) : (
                <button type="button">{finalSecondaryLabel}</button>
              )}
            </div>
          ) : null}
        </div>

        {showProgress ? (
          <div className={styles.progress} aria-label="Prologue progress">
            <span style={{ transform: `scaleX(${overallProgress})` }} />
          </div>
        ) : null}
      </section>

      <div className={styles.controls}>
        <button type="button" aria-label="Skip the prologue" onClick={skip}>
          Skip
        </button>
        <button
          type="button"
          aria-label={isComplete ? "Replay the prologue" : isPlaying ? "Pause the prologue" : "Continue the prologue"}
          onClick={togglePlayback}
        >
          {isComplete ? "Replay" : isPlaying ? "Pause" : "Continue"}
        </button>
        <a
          href="/login"
          aria-label="Log in to an existing Life Archive account"
        >
          Log In
        </a>
        {isSoundAvailable ? (
          <button
            type="button"
            aria-label={isSoundEnabled ? "Mute prologue sound" : "Enable prologue sound"}
            aria-pressed={isSoundEnabled}
            onClick={toggleSound}
          >
            {isSoundEnabled ? "Mute" : "Enable sound"}
          </button>
        ) : null}
      </div>

    </main>
  );
}
