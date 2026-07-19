"use client";

import { useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "requesting" | "recording" | "recorded" | "error";
export type MediaRecorderMode = "voice" | "video";

export type UseMediaRecorderOptions = {
  mode: MediaRecorderMode;
  maxRecordingSeconds?: number;
};

const audioMimeCandidates = [
  "audio/mp4",
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg"
];

const videoMimeCandidates = [
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/quicktime"
];

export function getSupportedMimeType(mode: MediaRecorderMode): string | undefined {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  const candidates = mode === "video" ? videoMimeCandidates : audioMimeCandidates;
  return candidates.find((mime) => MediaRecorder.isTypeSupported(mime));
}

export function getMediaExtension(mimeType: string, mode: MediaRecorderMode): string {
  const normalized = mimeType.toLowerCase().split(";")[0].trim();

  if (mode === "voice") {
    if (normalized === "audio/mp4" || normalized === "audio/x-m4a") return "m4a";
    if (normalized === "audio/ogg") return "ogg";
    if (normalized === "audio/aac") return "aac";
    if (normalized === "audio/wav" || normalized === "audio/x-wav") return "wav";
    return "webm";
  } else {
    if (normalized === "video/mp4") return "mp4";
    if (normalized === "video/quicktime") return "mov";
    return "webm";
  }
}

export function useMediaRecorder({
  mode,
  maxRecordingSeconds = 60
}: UseMediaRecorderOptions) {
  const [state, setState] = useState<RecorderState>("idle");
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string>("");
  const [canRecord, setCanRecord] = useState<boolean | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);

  useEffect(() => {
    setCanRecord(
      Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== "undefined"
    );

    return () => {
      stopTimer();
      stopStream();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
    };
  }, [mediaUrl]);

  function stopTimer() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (autoStopRef.current) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  }

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function startRecording() {
    if (!canRecord) {
      setError(
        "This browser does not support direct recording. You can upload a file instead."
      );
      setState("error");
      return;
    }

    const constraints: MediaStreamConstraints =
      mode === "video"
        ? { audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } }
        : { audio: true };

    try {
      setError("");
      setState("requesting");

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const mimeType = getSupportedMimeType(mode);
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      setElapsedSeconds(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalMimeType =
          recorder.mimeType ||
          (mode === "video" ? "video/webm" : "audio/webm");
        const blob = new Blob(chunksRef.current, { type: finalMimeType });
        const url = URL.createObjectURL(blob);
        const ext = getMediaExtension(finalMimeType, mode);
        const file = new File(
          [blob],
          `recorded-${mode}-${Date.now()}.${ext}`,
          { type: finalMimeType }
        );

        const finalElapsed = Math.min(
          maxRecordingSeconds,
          Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
        );

        setElapsedSeconds(finalElapsed);

        if (mediaUrl) {
          URL.revokeObjectURL(mediaUrl);
        }

        setMediaBlob(blob);
        setMediaUrl(url);
        setRecordedFile(file);
        setState("recorded");

        stopTimer();
        stopStream();
      };

      recorder.start(250);
      setState("recording");

      intervalRef.current = window.setInterval(() => {
        const nextElapsed = Math.min(
          maxRecordingSeconds,
          Math.floor((Date.now() - startedAtRef.current) / 1000)
        );
        setElapsedSeconds(nextElapsed);
      }, 250);

      autoStopRef.current = window.setTimeout(() => {
        stopRecording();
      }, maxRecordingSeconds * 1000);
    } catch (err: unknown) {
      const isDenied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      const message = isDenied
        ? mode === "video"
          ? "Camera/Microphone permission was denied. Please allow device access or upload a file instead."
          : "Microphone permission was denied. Please allow microphone access or upload a file instead."
        : mode === "video"
        ? "Could not start camera recording. You can upload a file instead."
        : "Could not start audio recording. You can upload a file instead.";

      setError(message);
      setState("error");
      stopTimer();
      stopStream();
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      stopTimer();
      stopStream();
    }
  }

  function resetRecording() {
    stopTimer();
    stopStream();

    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
    }

    setMediaBlob(null);
    setMediaUrl("");
    setRecordedFile(null);
    setElapsedSeconds(0);
    setError("");
    setState("idle");
  }

  return {
    state,
    elapsedSeconds,
    mediaBlob,
    mediaUrl,
    recordedFile,
    error,
    canRecord,
    startRecording,
    stopRecording,
    resetRecording
  };
}
