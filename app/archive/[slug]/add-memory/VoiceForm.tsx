"use client";

import { useState } from "react";
import { AddMemoryForm } from "./AddMemoryForm";
import { InteractiveMediaInput } from "@/components/media/InteractiveMediaInput";

type VoiceFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultTitle?: string;
  defaultDate?: string;
  errorMessage?: string;
  compactDarkInputClass: string;
  compactButtonClass: string;
};

export function VoiceForm({
  action,
  defaultTitle = "",
  defaultDate = "",
  errorMessage,
  compactDarkInputClass,
  compactButtonClass
}: VoiceFormProps) {
  const [recordedFile, setRecordedFile] = useState<File | null>(null);

  return (
    <AddMemoryForm action={action} recordedFile={recordedFile} className="grid min-h-0 content-start gap-1.5">
      <input type="hidden" name="mode" value="voice-sound" />
      <input type="hidden" name="type" value="voice" />
      {errorMessage ? (
        <div className="rounded-md bg-archive-gold/16 px-2 py-1.5 text-[0.62rem] leading-snug text-archive-ivory">
          {errorMessage}
        </div>
      ) : null}
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-archive-gold">
        Voice Recording or Audio Upload
      </p>
      <input
        name="title"
        required
        defaultValue={defaultTitle}
        placeholder="Title"
        aria-label="Voice title"
        className={compactDarkInputClass}
      />
      <InteractiveMediaInput
        mode="voice"
        darkTheme
        onFileCaptured={setRecordedFile}
        accept="audio/*"
        fileInputClass="w-full text-[0.58rem] text-archive-ivory/78 file:mr-2 file:rounded-md file:border-0 file:bg-archive-gold file:px-2 file:py-1 file:text-[0.55rem] file:font-semibold file:text-archive-obsidian"
      />
      <input
        name="date"
        type="date"
        defaultValue={defaultDate}
        aria-label="Voice date"
        className={compactDarkInputClass}
      />
      <button type="submit" className={compactButtonClass}>
        Preserve Voice
      </button>
    </AddMemoryForm>
  );
}
