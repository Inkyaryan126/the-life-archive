"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { submitLegacyQuestionEntry } from "@/app/legacy-question/actions";

type CaptureMode = "voice" | "text" | "video";
type RecorderState = "idle" | "requesting" | "recording" | "recorded" | "error";
type SubmissionStatus = "idle" | "saving" | "success";

const modes: Array<{
  id: CaptureMode;
  label: string;
  description: string;
}> = [
  {
    id: "voice",
    label: "Record Voice",
    description: "Tell a story, leave a lesson, or say something you hope someone hears someday."
  },
  {
    id: "text",
    label: "Write Story",
    description: "Write one memory you would never want erased."
  },
  {
    id: "video",
    label: "Record Video",
    description: "Speak like you are talking to someone you love."
  }
];

const maxRecordingSeconds = 60;
const textMinLength = 20;
const textMaxLength = 2000;

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function MemoryCaptureWidget({
  initialSource = "legacy_question_page",
  initialCardBatch = null
}: {
  initialSource?: string;
  initialCardBatch?: string | null;
}) {
  const [selectedMode, setSelectedMode] = useState<CaptureMode>("voice");
  const [audioState, setAudioState] = useState<RecorderState>("idle");
  const [videoState, setVideoState] = useState<RecorderState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [textMemory, setTextMemory] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [canRecord, setCanRecord] = useState<boolean | null>(null);
  const [recordingError, setRecordingError] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [wantsReminder, setWantsReminder] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [memoryError, setMemoryError] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");
  const [successMessage, setSuccessMessage] = useState("");
  const emailRef = useRef<HTMLInputElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);

  const textValidationMessage = useMemo(() => {
    const trimmed = textMemory.trim();

    if (!trimmed) {
      return "Write a memory first.";
    }

    if (trimmed.length < textMinLength) {
      return `Add at least ${textMinLength - trimmed.length} more characters.`;
    }

    if (trimmed.length > textMaxLength) {
      return `Remove ${trimmed.length - textMaxLength} characters.`;
    }

    return "";
  }, [textMemory]);

  const createdMemoryPreview =
    (selectedMode === "voice" && Boolean(audioBlob)) ||
    (selectedMode === "video" && Boolean(videoBlob)) ||
    (selectedMode === "text" && !textValidationMessage);

  useEffect(() => {
    setCanRecord(
      Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== "undefined"
    );

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }

      if (autoStopRef.current) {
        window.clearTimeout(autoStopRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

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
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function setMode(mode: CaptureMode) {
    setSelectedMode(mode);
    setMemoryError("");
    setRecordingError("");
    setSubmissionStatus("idle");
    console.info("capture_tab_selected", { mode });
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const currentIndex = modes.findIndex((mode) => mode.id === selectedMode);
    const lastIndex = modes.length - 1;
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === "ArrowLeft") {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    } else {
      return;
    }

    event.preventDefault();
    const nextMode = modes[nextIndex].id;
    setMode(nextMode);
    document.getElementById(`tab-${nextMode}`)?.focus();
  }

  async function startRecording(mode: "voice" | "video") {
    if (!canRecord) {
      setRecordingError("This browser does not support recording. You can still write your story instead.");
      mode === "video" ? setVideoState("error") : setAudioState("error");
      return;
    }

    const setState = mode === "video" ? setVideoState : setAudioState;
    const constraints: MediaStreamConstraints =
      mode === "video" ? { audio: true, video: true } : { audio: true };

    try {
      setRecordingError("");
      setMemoryError("");
      setState("requesting");

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const recorder = new MediaRecorder(stream);

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
        const mimeType = recorder.mimeType || (mode === "video" ? "video/webm" : "audio/webm");
        const recordedBlob = new Blob(chunksRef.current, { type: mimeType });
        const recordedUrl = URL.createObjectURL(recordedBlob);
        const finalElapsed = Math.min(
          maxRecordingSeconds,
          Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
        );

        setElapsedSeconds(finalElapsed);

        if (mode === "video") {
          if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
          }
          setVideoBlob(recordedBlob);
          setVideoUrl(recordedUrl);
          setVideoState("recorded");
          console.info("video_recorded", { durationSeconds: finalElapsed });
        } else {
          if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
          }
          setAudioBlob(recordedBlob);
          setAudioUrl(recordedUrl);
          setAudioState("recorded");
          console.info("recording_completed", { durationSeconds: finalElapsed });
        }

        stopTimer();
        stopStream();
      };

      recorder.start();
      setState("recording");
      console.info(mode === "video" ? "recording_started_video" : "recording_started", { mode });

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
    } catch {
      setRecordingError(
        mode === "video"
          ? "We could not access your camera. You can still record voice or write your story instead."
          : "We could not access your microphone. You can still write your story instead."
      );
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

  function resetMemory(mode: CaptureMode = selectedMode) {
    setMemoryError("");
    setSubmissionStatus("idle");
    setSuccessMessage("");

    if (mode === "voice") {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(null);
      setAudioUrl("");
      setAudioState("idle");
    }

    if (mode === "video") {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      setVideoBlob(null);
      setVideoUrl("");
      setVideoState("idle");
    }

    if (mode === "text") {
      setTextMemory("");
    }
  }

  function hasValidMemory() {
    if (selectedMode === "voice") {
      return Boolean(audioBlob);
    }

    if (selectedMode === "video") {
      return Boolean(videoBlob);
    }

    return !textValidationMessage;
  }

  function focusEmailForm() {
    if (!hasValidMemory()) {
      setMemoryError("Share a memory first, then we will send it to you.");
      return;
    }

    setMemoryError("");
    window.setTimeout(() => emailRef.current?.focus(), 50);
    document.getElementById("legacy-email-capture")?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError("");
    setMemoryError("");
    setSuccessMessage("");

    if (!hasValidMemory()) {
      setMemoryError("Share a memory first, then we will send it to you.");
      return;
    }

    if (!isEmail(email)) {
      setEmailError("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    setSubmissionStatus("saving");
    console.info("email_submitted", {
      source: initialSource,
      cardBatch: initialCardBatch
    });

    const result = await submitLegacyQuestionEntry({
      email,
      firstName,
      wantsReminders: wantsReminder,
      entryType: selectedMode,
      textContent: selectedMode === "text" ? textMemory.trim() : undefined,
      durationSeconds: selectedMode === "text" ? null : elapsedSeconds,
      source: initialSource,
      cardBatch: initialCardBatch,
      mediaMimeType:
        selectedMode === "voice"
          ? audioBlob?.type ?? null
          : selectedMode === "video"
            ? videoBlob?.type ?? null
            : null
    });

    if (!result.success) {
      setSubmissionStatus("idle");
      setMemoryError(result.message);
      return;
    }

    setSubmissionStatus("success");
    setSuccessMessage(
      "This is how a Life Archive begins - one real story at a time. We are saving early submissions while this feature is in beta."
    );
  }

  return (
    <section
      id="share-memory"
      aria-labelledby="capture-heading"
      className="relative z-20 mx-auto -mt-16 w-full max-w-6xl px-4 pb-16 sm:px-6 lg:-mt-24"
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-archive-gold/25 bg-[#f8f1e7] text-[#221b15] shadow-[0_32px_90px_rgba(0,0,0,0.36)]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
          <div className="p-5 sm:p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8e6b2f]">
              In 60 seconds
            </p>
            <h2 id="capture-heading" className="mt-3 font-serif text-4xl leading-tight text-[#18130f] sm:text-5xl">
              What&apos;s yours?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5f554a] sm:text-lg">
              Use your voice, your words, or your face. Keep it simple. One real memory is enough to begin.
            </p>

            <div
              aria-label="Choose how to leave your first memory"
              className="mt-7 grid gap-3 sm:grid-cols-3"
              role="tablist"
            >
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  aria-controls={`panel-${mode.id}`}
                  aria-selected={selectedMode === mode.id}
                  className={`rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/35 ${
                    selectedMode === mode.id
                      ? "border-[#9d7735] bg-[#211912] text-[#f8f1e7] shadow-lg"
                      : "border-[#d9c8ae] bg-white/60 text-[#352a21] hover:border-[#c9a45c]"
                  }`}
                  id={`tab-${mode.id}`}
                  role="tab"
                  type="button"
                  onKeyDown={handleTabKeyDown}
                  onClick={() => setMode(mode.id)}
                >
                  <span className="block text-sm font-bold">{mode.label}</span>
                  <span className={`mt-2 block text-xs leading-5 ${selectedMode === mode.id ? "text-[#efe3d1]" : "text-[#6f675d]"}`}>
                    {mode.description}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-7 rounded-[1.5rem] border border-[#d9c8ae] bg-white/75 p-4 shadow-sm sm:p-6">
              {selectedMode === "voice" && (
                <div
                  aria-labelledby="tab-voice"
                  id="panel-voice"
                  role="tabpanel"
                >
                  <RecorderControls
                    error={recordingError}
                    mediaSupported={canRecord}
                    mode="voice"
                    recorderState={audioState}
                    elapsedSeconds={elapsedSeconds}
                    previewUrl={audioUrl}
                    onStart={() => startRecording("voice")}
                    onStop={stopRecording}
                    onReset={() => resetMemory("voice")}
                  />
                </div>
              )}

              {selectedMode === "text" && (
                <div
                  aria-labelledby="tab-text"
                  id="panel-text"
                  role="tabpanel"
                >
                  <label className="block text-base font-semibold text-[#211912]" htmlFor="text-memory">
                    Write one memory you would never want erased.
                  </label>
                  <p className="mt-2 text-sm leading-6 text-[#6f675d]">
                    A detail, a sound, a lesson, a smell, a laugh. Start small and make it true.
                  </p>
                  <textarea
                    aria-describedby="text-memory-help text-memory-count"
                    className="mt-4 min-h-56 w-full resize-y rounded-2xl border border-[#d7c5aa] bg-[#fffaf2] px-4 py-4 text-base leading-7 text-[#211912] outline-none transition placeholder:text-[#8b8177] focus:border-[#9d7735] focus:ring-4 focus:ring-[#c9a45c]/25"
                    id="text-memory"
                    maxLength={textMaxLength}
                    placeholder="Example: My grandmother used to sing while making breakfast. I never realized how much I would miss that sound until it was gone..."
                    value={textMemory}
                    onChange={(event) => {
                      setTextMemory(event.target.value);
                      setSubmissionStatus("idle");
                      if (event.target.value.trim().length >= textMinLength) {
                        console.info("text_memory_written", { length: event.target.value.trim().length });
                      }
                    }}
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <p id="text-memory-help" className={textValidationMessage ? "text-[#9b3f37]" : "text-[#5c765f]"}>
                      {textValidationMessage || "This is enough to preview your first memory."}
                    </p>
                    <p id="text-memory-count" className="font-medium text-[#6f675d]">
                      {textMemory.length}/{textMaxLength}
                    </p>
                  </div>
                </div>
              )}

              {selectedMode === "video" && (
                <div
                  aria-labelledby="tab-video"
                  id="panel-video"
                  role="tabpanel"
                >
                  <RecorderControls
                    error={recordingError}
                    mediaSupported={canRecord}
                    mode="video"
                    recorderState={videoState}
                    elapsedSeconds={elapsedSeconds}
                    previewUrl={videoUrl}
                    onStart={() => startRecording("video")}
                    onStop={stopRecording}
                    onReset={() => resetMemory("video")}
                  />
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-[#d9c8ae] bg-[#f3eadc] p-4">
                <p className="flex gap-3 text-sm font-semibold text-[#211912]">
                  <span aria-hidden="true">Lock</span>
                  <span>Private by default. Nothing is posted publicly without your permission.</span>
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6f675d]">
                  You can delete it, keep it private, or build an archive around it later.
                </p>
              </div>
            </div>
          </div>

          <aside className="border-t border-[#d9c8ae] bg-[#211912] p-5 text-[#f8f1e7] sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div className="rounded-[1.5rem] border border-[#c9a45c]/25 bg-white/[0.04] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c9a45c]">
                Preview before email
              </p>
              {createdMemoryPreview ? (
                <div className="mt-4">
                  <h3 className="font-serif text-3xl leading-tight">
                    Your first memory is ready.
                  </h3>
                  <p className="mt-3 leading-7 text-[#efe3d1]/82">
                    This can become the first entry in your free Life Archive starter.
                  </p>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                    {selectedMode === "voice" && audioUrl && (
                      <audio className="w-full" controls src={audioUrl}>
                        Your browser does not support the audio element.
                      </audio>
                    )}
                    {selectedMode === "text" && (
                      <p className="max-h-72 overflow-auto whitespace-pre-wrap text-sm leading-7 text-[#f8f1e7]">
                        {textMemory.trim()}
                      </p>
                    )}
                    {selectedMode === "video" && videoUrl && (
                      <video className="aspect-video w-full rounded-xl bg-black" controls src={videoUrl}>
                        Your browser does not support the video element.
                      </video>
                    )}
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      className="rounded-full bg-[#c9a45c] px-5 py-3.5 text-sm font-bold text-[#11100e] transition hover:bg-[#e5cf9a] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/35"
                      type="button"
                      onClick={focusEmailForm}
                    >
                      Send This To Me
                    </button>
                    <button
                      className="rounded-full border border-white/20 px-5 py-3.5 text-sm font-semibold text-[#f8f1e7] transition hover:border-[#c9a45c] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/30"
                      type="button"
                      onClick={() => resetMemory()}
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <h3 className="font-serif text-3xl leading-tight">
                    Create first. Then we ask where to send it.
                  </h3>
                  <p className="mt-3 leading-7 text-[#efe3d1]/82">
                    Record, write, or film one memory. You will be able to preview it before entering your email.
                  </p>
                </div>
              )}
              {memoryError && (
                <p aria-live="polite" className="mt-4 rounded-2xl border border-[#b95b51]/40 bg-[#5f1f1a]/40 px-4 py-3 text-sm text-[#ffd7d2]">
                  {memoryError}
                </p>
              )}
            </div>

            <form
              className="mt-6 rounded-[1.5rem] border border-[#c9a45c]/25 bg-[#f8f1e7] p-5 text-[#211912]"
              id="legacy-email-capture"
              noValidate
              onSubmit={handleSubmit}
            >
              <h3 className="font-serif text-3xl leading-tight">
                Where should we save this for you?
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#5f554a]">
                We&apos;ll use this to follow up with your private copy and starter archive link as this beta opens.
              </p>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-sm font-semibold" htmlFor="legacy-email">
                    Email address
                  </label>
                  <input
                    aria-describedby={emailError ? "legacy-email-error" : undefined}
                    aria-invalid={Boolean(emailError)}
                    className="mt-2 w-full rounded-2xl border border-[#d7c5aa] bg-white px-4 py-3.5 text-base outline-none transition focus:border-[#9d7735] focus:ring-4 focus:ring-[#c9a45c]/25"
                    id="legacy-email"
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  {emailError && (
                    <p className="mt-2 text-sm text-[#9b3f37]" id="legacy-email-error">
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold" htmlFor="legacy-first-name">
                    First name <span className="font-normal text-[#6f675d]">(optional)</span>
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-[#d7c5aa] bg-white px-4 py-3.5 text-base outline-none transition focus:border-[#9d7735] focus:ring-4 focus:ring-[#c9a45c]/25"
                    id="legacy-first-name"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-[#d7c5aa] bg-white/70 p-4 text-sm leading-6 text-[#5f554a]">
                  <input
                    checked={wantsReminder}
                    className="mt-1 h-4 w-4 rounded border-[#9d7735] text-[#9d7735] focus:ring-[#c9a45c]"
                    type="checkbox"
                    onChange={(event) => setWantsReminder(event.target.checked)}
                  />
                  <span>I&apos;d like to receive a reminder to add more memories later.</span>
                </label>
              </div>

              <button
                className="mt-5 w-full rounded-full bg-[#211912] px-6 py-4 text-base font-bold text-[#f8f1e7] transition hover:bg-[#352a21] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/35 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={submissionStatus === "saving"}
                type="submit"
              >
                {submissionStatus === "saving" ? "Saving..." : "Send My Memory"}
              </button>

              <div aria-live="polite" className="mt-4">
                {submissionStatus === "success" && (
                  <div className="rounded-2xl border border-[#5c765f]/30 bg-[#eef5ec] p-4">
                    <p className="font-serif text-2xl text-[#2f5636]">Your memory is saved.</p>
                    <p className="mt-2 text-sm leading-6 text-[#435d47]">{successMessage}</p>
                  </div>
                )}
              </div>
            </form>
          </aside>
        </div>
      </div>
    </section>
  );
}

function RecorderControls({
  error,
  mediaSupported,
  mode,
  recorderState,
  elapsedSeconds,
  previewUrl,
  onStart,
  onStop,
  onReset
}: {
  error: string;
  mediaSupported: boolean | null;
  mode: "voice" | "video";
  recorderState: RecorderState;
  elapsedSeconds: number;
  previewUrl: string;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}) {
  const isVideo = mode === "video";
  const prompt = isVideo
    ? "Record a short message with your face and voice. Keep it simple. Speak like you are talking to someone you love."
    : "Record up to 60 seconds. Say one story, one lesson, or one message you want remembered.";

  return (
    <div>
      <h3 className="text-base font-semibold text-[#211912]">
        {isVideo ? "Record a short video" : "Record your voice"}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#6f675d]">{prompt}</p>

      <div className="mt-5 rounded-2xl border border-[#d9c8ae] bg-[#fffaf2] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8e6b2f]">
              {recorderState === "recording"
                ? "Recording"
                : recorderState === "requesting"
                  ? "Requesting permission"
                  : recorderState === "recorded"
                    ? "Preview ready"
                    : "Ready"}
            </p>
            <p aria-live="polite" className="mt-1 font-serif text-4xl text-[#211912]">
              {formatElapsed(elapsedSeconds)}
            </p>
          </div>
          <div
            aria-hidden="true"
            className={`h-14 w-14 rounded-full border ${
              recorderState === "recording"
                ? "border-[#9b3f37] bg-[#9b3f37]/20 motion-safe:animate-pulse"
                : "border-[#c9a45c]/50 bg-[#c9a45c]/15"
            }`}
          />
        </div>

        {mediaSupported === false && (
          <p className="mt-4 rounded-2xl border border-[#c9a45c]/30 bg-[#f3eadc] p-4 text-sm leading-6 text-[#5f554a]">
            This browser does not support recording. You can still write your story instead.
          </p>
        )}

        {error && (
          <p aria-live="polite" className="mt-4 rounded-2xl border border-[#b95b51]/35 bg-[#fff1ee] p-4 text-sm leading-6 text-[#9b3f37]">
            {error}
          </p>
        )}

        {previewUrl && (
          <div className="mt-4">
            {isVideo ? (
              <video className="aspect-video w-full rounded-xl bg-black" controls src={previewUrl}>
                Your browser does not support the video element.
              </video>
            ) : (
              <audio className="w-full" controls src={previewUrl}>
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {recorderState === "recording" ? (
            <button
              className="rounded-full bg-[#9b3f37] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#7d302a] focus:outline-none focus:ring-4 focus:ring-[#9b3f37]/30"
              type="button"
              onClick={onStop}
            >
              Stop Recording
            </button>
          ) : (
            <button
              className="rounded-full bg-[#211912] px-5 py-3.5 text-sm font-bold text-[#f8f1e7] transition hover:bg-[#352a21] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/35 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={mediaSupported !== true || recorderState === "requesting"}
              type="button"
              onClick={onStart}
            >
              {recorderState === "requesting"
                ? "Requesting..."
                : recorderState === "recorded"
                  ? "Re-record"
                  : isVideo
                    ? "Record Video"
                    : "Record My Answer"}
            </button>
          )}
          <button
            className="rounded-full border border-[#bda988] px-5 py-3.5 text-sm font-semibold text-[#352a21] transition hover:border-[#9d7735] focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/25"
            type="button"
            onClick={onReset}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
