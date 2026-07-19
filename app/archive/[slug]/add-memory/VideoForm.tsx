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
    <AddMemoryForm action={action} recordedFile={recordedFile} className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)_auto_auto_auto] gap-[clamp(0.55rem,0.8vw,0.9rem)]">
      <input type="hidden" name="mode" value="photo-video" />
      <input type="hidden" name="type" value="video" />
      {errorMessage ? (
        <div className="rounded-md bg-[#9e6f27]/18 px-2 py-1.5 text-[0.62rem] leading-snug text-[#2c1f12]">
          {errorMessage}
        </div>
      ) : null}
      <div>
        <p className="text-[clamp(0.72rem,0.88vw,0.98rem)] font-bold uppercase tracking-[0.14em] text-[#5c3b19]">
          Video Chapter
        </p>
        <p className="mt-1 line-clamp-2 text-[clamp(0.64rem,0.76vw,0.84rem)] leading-snug text-[#5c4326]/78">
          Record up to 60s directly, upload a video file, or link to where it lives.
        </p>
      </div>
      <input
        name="title"
        required
        defaultValue={defaultTitle}
        placeholder="Title"
        aria-label="Video title"
        className={compactInputClass}
      />
      <textarea
        name="content"
        rows={4}
        defaultValue={defaultContent}
        placeholder="Video description or context"
        aria-label="Video context"
        className={`${compactInputClass} min-h-0 resize-none leading-[1.5]`}
      />
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
      <button type="submit" className={compactButtonClass}>
        Preserve Video
      </button>
    </AddMemoryForm>
  );
}
