/* eslint-disable @next/next/no-img-element */
"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { submitLegacyQuestionEntryForm } from "@/app/legacy-question/actions";
import { SiteLogo } from "@/components/SiteDesign";
import { publicSupportEmail } from "@/lib/site-config";

export type MemoryChoiceType = "story" | "voice" | "lesson" | "photo" | "video" | "letter";
export type RecorderState = "idle" | "requesting" | "recording" | "recorded" | "error";
export type SubmissionStatus = "idle" | "saving" | "success";

const maxRecordingSeconds = 60;
const textMinLength = 20;
const textMaxLength = 2000;
const audioMimeCandidates = [
  "audio/mp4",
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg"
];

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getSupportedAudioMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }
  return audioMimeCandidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

function getAudioExtension(mimeType: string) {
  const normalized = mimeType.toLowerCase().split(";")[0].trim();
  if (normalized === "audio/mp4" || normalized === "audio/x-m4a") return "m4a";
  if (normalized === "audio/ogg") return "ogg";
  if (normalized === "audio/aac") return "aac";
  return "webm";
}

export function LegacyQuestionScrollScene({
  initialSource = "legacy_question_page",
  initialCardBatch = null
}: {
  initialSource?: string;
  initialCardBatch?: string | null;
}) {
  const [selectedType, setSelectedType] = useState<MemoryChoiceType>("story");
  const [textMemory, setTextMemory] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [wantsReminder, setWantsReminder] = useState(true);

  // Voice recording state
  const [audioState, setAudioState] = useState<RecorderState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [canRecord, setCanRecord] = useState<boolean | null>(null);
  const [recordingError, setRecordingError] = useState("");

  // Submission state
  const [emailError, setEmailError] = useState("");
  const [memoryError, setMemoryError] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");
  const [successMessage, setSuccessMessage] = useState("");

  // Element refs
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);

  const textValidationMessage = useMemo(() => {
    const trimmed = textMemory.trim();
    if (!trimmed) return "Write a memory first.";
    if (trimmed.length < textMinLength) {
      return `Add at least ${textMinLength - trimmed.length} more characters.`;
    }
    if (trimmed.length > textMaxLength) {
      return `Remove ${trimmed.length - textMaxLength} characters.`;
    }
    return "";
  }, [textMemory]);

  useEffect(() => {
    setCanRecord(
      Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined"
    );

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (autoStopRef.current) window.clearTimeout(autoStopRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

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

  function handleTypeSelect(type: MemoryChoiceType) {
    if (type === "photo") {
      setMemoryError("Photo upload for starter archives is coming soon. Please write a memory or record your voice.");
      return;
    }
    if (type === "video") {
      setMemoryError("Video recording for starter archives is coming soon. Please write a memory or record your voice.");
      return;
    }

    setSelectedType(type);
    setMemoryError("");
    setEmailError("");
    setSubmissionStatus("idle");
    setSuccessMessage("");
  }

  async function startVoiceRecording() {
    if (!canRecord) {
      setRecordingError("This browser does not support audio recording. You can write your story instead.");
      setAudioState("error");
      return;
    }

    try {
      setRecordingError("");
      setMemoryError("");
      setAudioState("requesting");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioMimeType = getSupportedAudioMimeType();
      const recorder = audioMimeType
        ? new MediaRecorder(stream, { mimeType: audioMimeType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      setElapsedSeconds(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const recordedBlob = new Blob(chunksRef.current, { type: mimeType });
        const recordedUrl = URL.createObjectURL(recordedBlob);
        const finalElapsed = Math.min(
          maxRecordingSeconds,
          Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
        );

        setElapsedSeconds(finalElapsed);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(recordedBlob);
        setAudioUrl(recordedUrl);
        setAudioState("recorded");
        stopTimer();
        stopStream();
      };

      recorder.start();
      setAudioState("recording");

      intervalRef.current = window.setInterval(() => {
        const nextElapsed = Math.min(
          maxRecordingSeconds,
          Math.floor((Date.now() - startedAtRef.current) / 1000)
        );
        setElapsedSeconds(nextElapsed);
      }, 250);

      autoStopRef.current = window.setTimeout(() => {
        stopVoiceRecording();
      }, maxRecordingSeconds * 1000);
    } catch {
      setRecordingError("We could not access your microphone. You can write your story instead.");
      setAudioState("error");
      stopTimer();
      stopStream();
    }
  }

  function stopVoiceRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      stopTimer();
      stopStream();
    }
  }

  function resetVoiceRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl("");
    setAudioState("idle");
    setElapsedSeconds(0);
    setRecordingError("");
  }

  const isFormValid =
    selectedType === "voice"
      ? Boolean(audioBlob)
      : !textValidationMessage;

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault();
    setEmailError("");
    setMemoryError("");
    setSuccessMessage("");

    if (selectedType === "voice" && !audioBlob) {
      setMemoryError("Record a voice memory first, then save your memory.");
      return;
    }

    if (selectedType !== "voice" && textValidationMessage) {
      setMemoryError(textValidationMessage);
      return;
    }

    if (!isEmail(email)) {
      setEmailError("Enter a valid email address.");
      emailInputRef.current?.focus();
      return;
    }

    setSubmissionStatus("saving");

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("firstName", firstName);
      formData.set("wantsReminders", String(wantsReminder));
      formData.set("entryType", selectedType === "voice" ? "voice" : "text");
      formData.set("textContent", selectedType === "voice" ? "" : textMemory.trim());
      formData.set("durationSeconds", selectedType === "voice" ? String(elapsedSeconds) : "");
      formData.set("source", initialSource);
      formData.set("cardBatch", initialCardBatch ?? "");

      if (selectedType === "voice" && audioBlob) {
        const mimeType = audioBlob.type || "audio/mp4";
        const audioFileBlob = audioBlob.type
          ? audioBlob
          : new Blob([audioBlob], { type: mimeType });
        formData.set("mediaMimeType", mimeType);
        formData.set(
          "audioFile",
          audioFileBlob,
          `legacy-question-voice.${getAudioExtension(mimeType)}`
        );
      }

      const result = await submitLegacyQuestionEntryForm(formData);

      if (!result.success) {
        setSubmissionStatus("idle");
        setMemoryError(result.message);
        return;
      }

      setSubmissionStatus("success");
      setSuccessMessage(result.message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We captured your memory, but the secure link could not be sent yet.";

      setSubmissionStatus("idle");
      setMemoryError(message);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#11100e] text-[#f8f1e7]">
      {/* Top Header Bar */}
      <header className="relative z-30 mx-auto flex w-full max-w-[1086px] items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Return to The Life Archive Grand Hall">
          <SiteLogo width={220} height={52} />
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-[#c9a45c]/35 bg-black/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f8f1e7] shadow-luxury transition hover:border-[#c9a45c] hover:bg-[#c9a45c]/10"
        >
          Log In
        </Link>
      </header>

      {/* Main Unified Baked-In Scroll Scene */}
      <main className="relative z-20 mx-auto w-full max-w-[1086px] px-2 py-2 sm:px-4 sm:py-6">
        <div className="relative mx-auto aspect-[1086/1448] w-full select-none overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
          {/* Background Artwork */}
          <img
            src="/images/legacy-question/legacy-question-page.png"
            alt="The Life Archive Legacy Question Baked Scroll"
            className="block h-full w-full object-contain"
          />

          {/* Interactive Responsive Overlay (Natural Dimensions: 1086 x 1448) */}
          <div className="absolute inset-0 h-full w-full">

            {/* CHOICE 1: Story / Written Memory */}
            <button
              type="button"
              role="radio"
              aria-checked={selectedType === "story"}
              aria-label="Choice: Story / Written Memory"
              onClick={() => handleTypeSelect("story")}
              className="absolute left-[25.5%] top-[23.5%] z-20 h-[3.8%] w-[19.5%] cursor-pointer rounded-lg transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#8e6b2f]/50"
            />
            {/* Box 1 X Indicator */}
            {selectedType === "story" ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[27.624%] top-[24.102%] z-25 flex h-[2.072%] w-[3.131%] items-center justify-center font-serif text-[clamp(14px,2vw,26px)] font-black text-[#1b1510]"
              >
                ✕
              </div>
            ) : null}

            {/* CHOICE 2: Voice Memory */}
            <button
              type="button"
              role="radio"
              aria-checked={selectedType === "voice"}
              aria-label="Choice: Voice Memory"
              onClick={() => handleTypeSelect("voice")}
              className="absolute left-[45.0%] top-[23.5%] z-20 h-[3.8%] w-[18.5%] cursor-pointer rounded-lg transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#8e6b2f]/50"
            />
            {/* Box 2 X Indicator */}
            {selectedType === "voice" ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[46.593%] top-[24.102%] z-25 flex h-[2.210%] w-[3.315%] items-center justify-center font-serif text-[clamp(14px,2vw,26px)] font-black text-[#1b1510]"
              >
                ✕
              </div>
            ) : null}

            {/* CHOICE 3: Lesson */}
            <button
              type="button"
              role="radio"
              aria-checked={selectedType === "lesson"}
              aria-label="Choice: Lesson"
              onClick={() => handleTypeSelect("lesson")}
              className="absolute left-[63.5%] top-[23.5%] z-20 h-[3.8%] w-[18.5%] cursor-pointer rounded-lg transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#8e6b2f]/50"
            />
            {/* Box 3 X Indicator */}
            {selectedType === "lesson" ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[64.641%] top-[24.102%] z-25 flex h-[2.210%] w-[3.223%] items-center justify-center font-serif text-[clamp(14px,2vw,26px)] font-black text-[#1b1510]"
              >
                ✕
              </div>
            ) : null}

            {/* CHOICE 4: Photo (Disabled) */}
            <button
              type="button"
              role="radio"
              aria-checked={false}
              aria-disabled="true"
              aria-label="Choice: Photo (Coming Soon)"
              onClick={() => handleTypeSelect("photo")}
              className="absolute left-[25.5%] top-[28.2%] z-20 h-[3.8%] w-[19.5%] cursor-not-allowed rounded-lg opacity-70 transition hover:bg-black/5 focus:outline-none"
            />

            {/* CHOICE 5: Video (Disabled) */}
            <button
              type="button"
              role="radio"
              aria-checked={false}
              aria-disabled="true"
              aria-label="Choice: Video (Coming Soon)"
              onClick={() => handleTypeSelect("video")}
              className="absolute left-[45.0%] top-[28.2%] z-20 h-[3.8%] w-[18.5%] cursor-not-allowed rounded-lg opacity-70 transition hover:bg-black/5 focus:outline-none"
            />

            {/* CHOICE 6: Letter / Journal */}
            <button
              type="button"
              role="radio"
              aria-checked={selectedType === "letter"}
              aria-label="Choice: Letter or Journal Entry"
              onClick={() => handleTypeSelect("letter")}
              className="absolute left-[63.5%] top-[28.2%] z-20 h-[3.8%] w-[18.5%] cursor-pointer rounded-lg transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#8e6b2f]/50"
            />
            {/* Box 6 X Indicator */}
            {selectedType === "letter" ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[64.549%] top-[28.867%] z-25 flex h-[2.210%] w-[3.315%] items-center justify-center font-serif text-[clamp(14px,2vw,26px)] font-black text-[#1b1510]"
              >
                ✕
              </div>
            ) : null}

            {/* MAIN MEMORY WRITING REGION (Region 7) */}
            <div className="absolute left-[26.703%] top-[35.359%] z-20 h-[9.392%] w-[54.236%]">
              {selectedType === "voice" ? (
                <div className="flex h-full w-full flex-col justify-between rounded-lg border border-[#8e6b2f]/30 bg-[#f4ead8]/90 p-2 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-[#211912]">
                    <span className="font-bold uppercase tracking-[0.12em] text-[#7a5a25]">
                      {audioState === "recording"
                        ? "Recording voice..."
                        : audioState === "recorded"
                          ? "Voice Memory Captured"
                          : "Voice Mode Selected"}
                    </span>
                    <span className="font-mono font-bold text-[#211912]">
                      {formatElapsed(elapsedSeconds)} / 01:00
                    </span>
                  </div>

                  {audioUrl ? (
                    <div className="my-1">
                      <audio controls src={audioUrl} className="h-8 w-full" />
                    </div>
                  ) : (
                    <p className="text-[clamp(10px,1.1vw,13px)] text-[#5c5247]">
                      {recordingError || "Press record to capture up to 60 seconds of voice."}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    {audioState === "recording" ? (
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="rounded-full bg-red-800 px-3 py-1 text-xs font-bold text-white transition hover:bg-red-900"
                      >
                        Stop Recording
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startVoiceRecording}
                        className="rounded-full bg-[#8e6b2f] px-3 py-1 text-xs font-bold text-white transition hover:bg-[#765723]"
                      >
                        {audioState === "recorded" ? "Re-record Voice" : "Start Voice Recording"}
                      </button>
                    )}
                    {audioBlob ? (
                      <button
                        type="button"
                        onClick={resetVoiceRecording}
                        className="text-xs font-medium text-[#7a5a25] underline hover:text-[#211912]"
                      >
                        Clear Recording
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="relative h-full w-full">
                  <textarea
                    id="legacy-memory-input"
                    aria-label="Write your memory"
                    maxLength={textMaxLength}
                    placeholder="Write a detail, a sound, a lesson, a laugh. Start small and make it true..."
                    value={textMemory}
                    onChange={(e) => {
                      setTextMemory(e.target.value);
                      setSubmissionStatus("idle");
                    }}
                    className="h-full w-full resize-none rounded-lg border-none bg-transparent p-1 font-serif text-[clamp(11px,1.3vw,17px)] leading-[1.35] text-[#211912] placeholder:text-[#73685c]/60 outline-none focus:ring-1 focus:ring-[#8e6b2f]/40"
                  />
                  {/* Character Counter */}
                  <span className="pointer-events-none absolute bottom-1 right-2 text-[clamp(9px,0.9vw,12px)] font-medium text-[#6f675d]">
                    {textMemory.length}/{textMaxLength}
                  </span>
                </div>
              )}
            </div>

            {/* FIRST NAME INPUT (Region 8) */}
            <div className="absolute left-[28.821%] top-[50.622%] z-20 h-[2.279%] w-[23.941%]">
              <input
                type="text"
                id="legacy-first-name"
                aria-label="First Name"
                value={firstName}
                maxLength={60}
                placeholder="First Name"
                onChange={(e) => setFirstName(e.target.value)}
                className="h-full w-full rounded-md border-none bg-transparent px-2 font-sans text-[clamp(11px,1.2vw,16px)] font-medium text-[#211912] placeholder:text-[#73685c]/60 outline-none focus:ring-1 focus:ring-[#8e6b2f]/40"
              />
            </div>

            {/* EMAIL ADDRESS INPUT (Region 9) */}
            <div className="absolute left-[57.551%] top-[50.622%] z-20 h-[2.348%] w-[23.204%]">
              <input
                type="email"
                id="legacy-email-address"
                ref={emailInputRef}
                required
                aria-label="Email Address"
                aria-invalid={Boolean(emailError)}
                value={email}
                placeholder="Email Address"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className="h-full w-full rounded-md border-none bg-transparent px-2 font-sans text-[clamp(11px,1.2vw,16px)] font-medium text-[#211912] placeholder:text-[#73685c]/60 outline-none focus:ring-1 focus:ring-[#8e6b2f]/40"
              />
            </div>

            {/* REMINDER CHECKBOX (Region 10) */}
            {/* Clickable Sentence Hit-Area */}
            <button
              type="button"
              role="checkbox"
              aria-checked={wantsReminder}
              aria-label="I'd like to receive a reminder to add more memories later."
              onClick={() => setWantsReminder((prev) => !prev)}
              className="absolute left-[25.5%] top-[53.2%] z-20 h-[3.2%] w-[52.0%] cursor-pointer rounded-lg transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#8e6b2f]/50"
            />
            {/* Box 10 X Indicator */}
            {wantsReminder ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[26.059%] top-[53.660%] z-25 flex h-[2.141%] w-[3.131%] items-center justify-center font-serif text-[clamp(14px,2vw,26px)] font-black text-[#1b1510]"
              >
                ✕
              </div>
            ) : null}

            {/* SAVE MY FIRST MEMORY BUTTON (Region 11) */}
            <button
              type="button"
              aria-label="Save My First Memory"
              disabled={submissionStatus === "saving" || audioState === "recording"}
              onClick={() => handleSubmit()}
              className="absolute left-[38.214%] top-[93.577%] z-20 h-[3.453%] w-[30.295%] cursor-pointer rounded-full bg-transparent text-transparent transition hover:bg-black/5 active:bg-black/10 focus:outline-none focus:ring-4 focus:ring-[#c9a45c]/50 disabled:cursor-not-allowed disabled:opacity-50"
            />

            {/* Feedback Banners overlaying bottom section if active */}
            {emailError || memoryError ? (
              <div className="absolute left-[26.0%] top-[46.0%] z-30 max-w-[55%] rounded-lg border border-red-800/40 bg-red-950/90 px-3 py-2 text-xs font-semibold text-red-100 shadow-luxury">
                {emailError || memoryError}
              </div>
            ) : null}

            {submissionStatus === "saving" ? (
              <div className="absolute left-[38.214%] top-[93.577%] z-30 flex h-[3.453%] w-[30.295%] items-center justify-center rounded-full bg-[#c9a45c] font-bold text-[#11100e] shadow-luxury">
                <span className="text-xs uppercase tracking-[0.14em]">Saving...</span>
              </div>
            ) : null}

            {submissionStatus === "success" ? (
              <div className="absolute left-[26.0%] top-[45.0%] z-30 max-w-[55%] rounded-xl border border-emerald-600/50 bg-[#16271a]/95 p-4 text-emerald-100 shadow-luxury">
                <p className="font-serif text-lg font-bold text-emerald-200">Your memory is saved.</p>
                <p className="mt-1 text-xs leading-5 text-emerald-100/90">{successMessage}</p>
              </div>
            ) : null}

          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="relative z-30 mx-auto max-w-[1086px] px-4 py-8 text-center text-xs text-[#efe3d1]/60">
        <p>© 2026 The Life Archive. All rights reserved.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-5 font-semibold text-[#efe3d1]/80">
          <Link href="/privacy" className="hover:text-[#c9a45c]">Privacy</Link>
          <Link href="/terms" className="hover:text-[#c9a45c]">Terms</Link>
          <Link href="/faq" className="hover:text-[#c9a45c]">FAQ</Link>
          <a href={`mailto:${publicSupportEmail}`} className="hover:text-[#c9a45c]">Contact</a>
        </div>
      </footer>
    </div>
  );
}
