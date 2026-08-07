"use client";

import { useState } from "react";
import { AddMemoryForm } from "./AddMemoryForm";
import { InteractiveMediaInput } from "@/components/media/InteractiveMediaInput";

type VideoFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultTitle?: string;
  defaultContent?: string;
  defaultMediaUrl?: string;
  errorMessage?: string;
  compactInputClass: string;
  compactFileInputClass: string;
  compactButtonClass: string;
};

export function VideoForm({
  action,
  defaultTitle = "",
  defaultContent = "",
  defaultMediaUrl = "",
  errorMessage,
  compactInputClass,
  compactFileInputClass,
  compactButtonClass
}: VideoFormProps) {
  const [recordedFile, setRecordedFile] = useState<File | null>(null);

  return (
    <AddMemoryForm
      action={action}
      recordedFile={recordedFile}
      className="flex h-full flex-col justify-between gap-[clamp(0.35rem,0.55vw,0.65rem)] w-full min-w-0"
    >
      <input type="hidden" name="mode" value="photo-video" />
      <input type="hidden" name="type" value="video" />
      {errorMessage ? (
        <div className="shrink-0 rounded-md bg-[#9e6f27]/18 px-2 py-1 text-[0.62rem] leading-snug text-[#2c1f12]">
          {errorMessage}
        </div>
      ) : null}
      <div className="shrink-0">
        <p className="text-[clamp(0.72rem,0.84vw,0.95rem)] font-bold uppercase tracking-[0.14em] text-[#5c3b19]">
          Video Chapter
        </p>
        <p className="mt-0.5 text-[clamp(0.62rem,0.72vw,0.8rem)] leading-snug text-[#5c4326]/78">
          Record up to 60s directly, upload a video file, or link to where it lives.
        </p>
      </div>
      <input
        name="title"
        required
        defaultValue={defaultTitle}
        placeholder="Title"
        aria-label="Video title"
        className={`${compactInputClass} shrink-0`}
      />
      <textarea
        name="content"
        defaultValue={defaultContent}
        placeholder="Video description or context"
        aria-label="Video context"
        className={`${compactInputClass} flex-1 min-h-[3.8rem] max-h-[10rem] resize-none leading-[1.45] text-[#24190d]`}
      />
      <div className="shrink-0 grid gap-1.5 w-full min-w-0">
        <InteractiveMediaInput
          mode="video"
          darkTheme={false}
          onFileCaptured={setRecordedFile}
          accept="video/*"
          fileInputClass={compactFileInputClass}
        />
        <input
          name="mediaUrl"
          type="url"
          defaultValue={defaultMediaUrl}
          placeholder="Video link (YouTube, Vimeo, etc.)"
          aria-label="External video link"
          className={compactInputClass}
        />
      </div>
      <button type="submit" className={`${compactButtonClass} shrink-0 w-full`}>
        Preserve Video
      </button>
    </AddMemoryForm>
  );
}
