"use client";

import { useEffect, useRef, useState } from "react";

export function PrologueVideoPlayerOverlay({
  videoSrc,
  title,
  subtitle,
  skipLabel = "Skip",
  onComplete
}: {
  videoSrc: string;
  title: string;
  subtitle?: string;
  skipLabel?: string;
  onComplete: (result: { status: "completed" | "skipped" }) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [needsPlayGesture, setNeedsPlayGesture] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let mounted = true;

    async function attemptAutoplay() {
      if (!video) return;
      try {
        video.muted = isMuted;
        await video.play();
        if (mounted) {
          setIsPlaying(true);
          setNeedsPlayGesture(false);
          setIsLoading(false);
        }
      } catch {
        // Autoplay with sound blocked: retry muted if needed or prompt user
        try {
          video.muted = true;
          await video.play();
          if (mounted) {
            setIsMuted(true);
            setIsPlaying(true);
            setNeedsPlayGesture(false);
            setIsLoading(false);
          }
        } catch {
          if (mounted) {
            setNeedsPlayGesture(true);
            setIsLoading(false);
          }
        }
      }
    }

    attemptAutoplay();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleComplete(status: "completed" | "skipped") {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    if (videoRef.current) {
      videoRef.current.pause();
    }

    onComplete({ status });
  }

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      try {
        await video.play();
        setIsPlaying(true);
        setNeedsPlayGesture(false);
      } catch {
        setHasError(true);
      }
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex h-full h-[100dvh] w-full max-w-full flex-col items-center justify-center overflow-hidden bg-[#090807] text-[#f8f1e7] box-border"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)"
      }}
    >
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex w-full max-w-full items-center justify-between gap-3 p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent box-border overflow-hidden">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a45c] sm:text-xs">
            The Life Archive
          </p>
          <h2 className="truncate text-xs font-semibold text-[#efe3d1]/90 sm:text-sm">{title}</h2>
        </div>

        <button
          type="button"
          onClick={() => handleComplete("skipped")}
          className="shrink-0 rounded-full border border-[#c9a45c]/40 bg-black/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f8f1e7] shadow-lg backdrop-blur transition hover:border-[#c9a45c] hover:bg-[#c9a45c]/20 focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30 sm:px-5 sm:py-2 sm:text-xs sm:tracking-[0.14em]"
          aria-label={skipLabel}
        >
          {skipLabel}
        </button>
      </div>

      {/* Main Video Area */}
      <div className="relative flex h-full max-h-full w-full max-w-full flex-1 items-center justify-center overflow-hidden box-border">
        {isLoading && !hasError ? (
          <div className="absolute z-20 flex flex-col items-center gap-3 px-4 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9a45c] border-t-transparent" />
            <p className="text-xs uppercase tracking-[0.16em] text-[#efe3d1]/70">
              Loading cinematic scene...
            </p>
          </div>
        ) : null}

        {needsPlayGesture ? (
          <div className="absolute z-30 mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-[#c9a45c]/30 bg-black/80 p-6 text-center backdrop-blur box-border">
            <p className="font-serif text-base text-[#f8f1e7] sm:text-lg">
              {subtitle || "Press play to begin the cinematic sequence."}
            </p>
            <button
              type="button"
              onClick={togglePlay}
              className="rounded-full bg-[#c9a45c] px-6 py-3 text-sm font-bold text-[#11100e] shadow-lg transition hover:bg-[#d8b66f]"
            >
              Begin Playback
            </button>
          </div>
        ) : null}

        {hasError ? (
          <div className="absolute z-30 mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-black/90 p-6 text-center box-border">
            <p className="font-serif text-base text-red-200 sm:text-lg">
              Video playback is unavailable right now.
            </p>
            <button
              type="button"
              onClick={() => handleComplete("skipped")}
              className="rounded-full bg-[#c9a45c] px-6 py-3 text-sm font-bold text-[#11100e]"
            >
              Continue
            </button>
          </div>
        ) : null}

        <video
          ref={videoRef}
          src={videoSrc}
          playsInline
          className="block h-full max-h-full w-full max-w-full object-contain object-center"
          onEnded={() => handleComplete("completed")}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          onCanPlay={() => setIsLoading(false)}
        />
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex w-full max-w-full items-center justify-between gap-3 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent box-border overflow-hidden">
        <button
          type="button"
          onClick={toggleMute}
          className="shrink-0 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#efe3d1] transition hover:border-[#c9a45c] hover:text-[#f8f1e7]"
          aria-label={isMuted ? "Enable Sound" : "Mute Sound"}
        >
          {isMuted ? "Unmute Sound" : "Sound On"}
        </button>

        {subtitle ? (
          <p className="hidden min-w-0 truncate text-xs text-[#efe3d1]/60 sm:block">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
