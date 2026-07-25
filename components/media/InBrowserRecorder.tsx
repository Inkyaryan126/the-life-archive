"use client";

import { useEffect, useRef } from "react";
import { useMediaRecorder, type MediaRecorderMode } from "@/lib/hooks/useMediaRecorder";

type InBrowserRecorderProps = {
  mode: MediaRecorderMode;
  maxDurationSeconds?: number;
  onCaptured: (file: File | null) => void;
  onFallbackToManualUpload?: () => void;
  className?: string;
  darkTheme?: boolean;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function InBrowserRecorder({
  mode,
  maxDurationSeconds = 60,
  onCaptured,
  onFallbackToManualUpload,
  className = "",
  darkTheme = false
}: InBrowserRecorderProps) {
  const {
    state,
    elapsedSeconds,
    mediaUrl,
    recordedFile,
    error,
    canRecord,
    startRecording,
    stopRecording,
    resetRecording
  } = useMediaRecorder({
    mode,
    maxRecordingSeconds: maxDurationSeconds
  });

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    onCaptured(recordedFile);
  }, [recordedFile, onCaptured]);

  useEffect(() => {
    if (state === "recorded" && mode === "video" && mediaUrl && videoPreviewRef.current) {
      videoPreviewRef.current.src = mediaUrl;
    }
  }, [state, mode, mediaUrl]);

  function handleRetake() {
    resetRecording();
    onCaptured(null);
  }

  const bgContainerClass = darkTheme
    ? "w-full max-w-full min-w-0 box-border overflow-hidden rounded-xl border border-archive-gold/25 bg-black/40 p-4 text-archive-ivory"
    : "w-full max-w-full min-w-0 box-border overflow-hidden rounded-xl border border-[#8a6427]/35 bg-[#f4dfb7]/30 p-4 text-[#24190d]";

  return (
    <div className={`${bgContainerClass} ${className}`}>
      {error ? (
        <div className="grid gap-3">
          <p className="text-xs font-semibold leading-relaxed text-red-300">
            {error}
          </p>
          {onFallbackToManualUpload ? (
            <button
              type="button"
              onClick={onFallbackToManualUpload}
              className="w-fit rounded-lg bg-archive-gold/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-archive-gold transition hover:bg-archive-gold/30"
            >
              Upload a File Instead
            </button>
          ) : null}
        </div>
      ) : state === "idle" ? (
        <div className="flex flex-col items-center justify-center gap-3 py-2 text-center">
          <p className="text-xs font-medium opacity-80">
            {mode === "video"
              ? "Record up to 60s of video directly in your browser."
              : "Record up to 60s of voice audio directly in your browser."}
          </p>
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex items-center gap-2 rounded-full bg-archive-gold px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
            Start {mode === "video" ? "Video" : "Voice"} Recording
          </button>
        </div>
      ) : state === "requesting" ? (
        <div className="flex items-center justify-center gap-2 py-4 text-xs font-semibold uppercase tracking-widest text-archive-gold">
          <span className="h-2 w-2 rounded-full bg-archive-gold animate-ping" />
          Requesting {mode === "video" ? "Camera" : "Microphone"} Access...
        </div>
      ) : state === "recording" ? (
        <div className="flex flex-col items-center justify-center gap-3 py-3">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-red-600 animate-ping" />
            <span className="font-mono text-lg font-bold text-archive-gold">
              {formatTime(elapsedSeconds)} / {formatTime(maxDurationSeconds)}
            </span>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="rounded-full border border-red-500/50 bg-red-600/20 px-6 py-2 text-xs font-bold uppercase tracking-widest text-red-200 transition hover:bg-red-600/40"
          >
            Stop Recording
          </button>
        </div>
      ) : state === "recorded" ? (
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-archive-gold">
              {mode === "video" ? "Video Preview" : "Voice Preview"} ({formatTime(elapsedSeconds)})
            </span>
            <button
              type="button"
              onClick={handleRetake}
              className="text-xs font-semibold text-archive-gold/80 underline underline-offset-4 hover:text-archive-champagne"
            >
              Retake
            </button>
          </div>

          {mode === "video" && mediaUrl ? (
            <video
              ref={videoPreviewRef}
              src={mediaUrl}
              controls
              playsInline
              className="aspect-video w-full rounded-lg bg-black"
            />
          ) : mode === "voice" && mediaUrl ? (
            <audio
              src={mediaUrl}
              controls
              className="w-full accent-archive-gold"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
