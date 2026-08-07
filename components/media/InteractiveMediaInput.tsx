"use client";

import { useState } from "react";
import { InBrowserRecorder } from "./InBrowserRecorder";
import type { MediaRecorderMode } from "@/lib/hooks/useMediaRecorder";

type InteractiveMediaInputProps = {
  mode: MediaRecorderMode;
  onFileCaptured: (file: File | null) => void;
  darkTheme?: boolean;
  fileInputClass?: string;
  fileInputName?: string;
  accept?: string;
};

export function InteractiveMediaInput({
  mode,
  onFileCaptured,
  darkTheme = false,
  fileInputClass = "",
  fileInputName = "mediaFile",
  accept
}: InteractiveMediaInputProps) {
  const [inputSource, setInputSource] = useState<"record" | "upload">("record");

  function handleSourceChange(newSource: "record" | "upload") {
    setInputSource(newSource);
    onFileCaptured(null);
  }

  const tabActive = darkTheme
    ? "bg-archive-gold text-archive-obsidian font-bold"
    : "bg-[#9e6f27] text-white font-bold";

  const tabInactive = darkTheme
    ? "bg-white/5 text-archive-ivory/70 hover:bg-white/10 font-semibold"
    : "bg-white/50 text-[#3c2a17] hover:bg-white/70 font-semibold";

  return (
    <div className="grid gap-1.5 w-full max-w-full min-w-0 overflow-hidden box-border">
      <div className="flex flex-wrap items-center gap-1.5 text-[clamp(0.58rem,0.68vw,0.75rem)] uppercase tracking-wider w-full min-w-0">
        <button
          type="button"
          onClick={() => handleSourceChange("record")}
          className={`rounded-md px-2 py-0.5 transition ${
            inputSource === "record" ? tabActive : tabInactive
          }`}
        >
          Record Direct
        </button>
        <button
          type="button"
          onClick={() => handleSourceChange("upload")}
          className={`rounded-md px-2 py-0.5 transition ${
            inputSource === "upload" ? tabActive : tabInactive
          }`}
        >
          Upload File
        </button>
      </div>

      {inputSource === "record" ? (
        <InBrowserRecorder
          mode={mode}
          darkTheme={darkTheme}
          onCaptured={onFileCaptured}
          onFallbackToManualUpload={() => handleSourceChange("upload")}
        />
      ) : (
        <input
          name={fileInputName}
          type="file"
          accept={accept ?? (mode === "video" ? "video/*" : "audio/*")}
          aria-label={`Upload ${mode} file`}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            onFileCaptured(file);
          }}
          className={
            fileInputClass ||
            "w-full min-w-0 max-w-full box-border overflow-hidden text-ellipsis text-xs text-archive-ivory/78 file:mr-2 file:rounded-md file:border-0 file:bg-archive-gold file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-archive-obsidian"
          }
        />
      )}
    </div>
  );
}
