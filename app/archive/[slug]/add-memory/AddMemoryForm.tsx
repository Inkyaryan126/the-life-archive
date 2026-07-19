"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  acceptedAudioFormatLabel,
  acceptedAudioMimeTypes,
  acceptedVideoFormatLabel,
  acceptedVideoMimeTypes,
  maxAudioUploadBytes,
  maxAudioUploadMegabytes,
  maxVideoUploadBytes,
  maxVideoUploadMegabytes
} from "@/lib/media-upload-constants";

type AddMemoryFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
  recordedFile?: File | null;
};

function normalizeMimeType(value: string) {
  return value.toLowerCase().split(";")[0].trim();
}

function getAudioPreflightError(file: File) {
  const mimeType = normalizeMimeType(file.type);

  if (file.size > maxAudioUploadBytes) {
    return `This file is larger than the maximum allowed size of ${maxAudioUploadMegabytes} MB. Trim or compress the recording, then upload it again.`;
  }

  if (!acceptedAudioMimeTypes.includes(mimeType as (typeof acceptedAudioMimeTypes)[number])) {
    return `This audio format is not supported. Please upload ${acceptedAudioFormatLabel} audio.`;
  }

  return "";
}

function getVideoPreflightError(file: File) {
  const mimeType = normalizeMimeType(file.type);

  if (file.size > maxVideoUploadBytes) {
    return `This file is larger than the maximum allowed size of ${maxVideoUploadMegabytes} MB. Trim or compress the recording, then upload it again.`;
  }

  if (!acceptedVideoMimeTypes.includes(mimeType as (typeof acceptedVideoMimeTypes)[number])) {
    return `This video format is not supported. Please upload ${acceptedVideoFormatLabel} video.`;
  }

  return "";
}

export function AddMemoryForm({ action, children, className, recordedFile }: AddMemoryFormProps) {
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const rawFormData = new FormData(event.currentTarget);
    const type = rawFormData.get("type");
    let mediaFile = rawFormData.get("mediaFile");

    if (recordedFile && (!mediaFile || !(mediaFile instanceof File) || mediaFile.size === 0)) {
      rawFormData.set("mediaFile", recordedFile);
      mediaFile = recordedFile;
    }

    if (!(mediaFile instanceof File) || mediaFile.size === 0) {
      setErrorMessage("");
      if (recordedFile) {
        event.preventDefault();
        action(rawFormData);
      }
      return;
    }

    const isAudioUpload = typeof type === "string" && type === "voice";
    const isVideoUpload = typeof type === "string" && type === "video";

    let message = "";
    if (isAudioUpload) {
      message = getAudioPreflightError(mediaFile);
    } else if (isVideoUpload) {
      message = getVideoPreflightError(mediaFile);
    }

    if (message) {
      event.preventDefault();
      setErrorMessage(message);
      return;
    }

    setErrorMessage("");

    if (recordedFile) {
      event.preventDefault();
      action(rawFormData);
    }
  }

  return (
    <form
      action={action}
      encType="multipart/form-data"
      onSubmit={handleSubmit}
      className={className ?? "grid gap-6 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury"}
    >
      {errorMessage && className !== "contents" ? (
        <div className="rounded-2xl border border-archive-gold/24 bg-archive-gold/10 px-4 py-4 text-archive-ivory">
          <p className="font-serif text-xl leading-tight text-archive-ivory">
            Your recording could not be uploaded
          </p>
          <p className="mt-2 text-sm leading-6 text-archive-ivory/70">{errorMessage}</p>
        </div>
      ) : null}
      {children}
    </form>
  );
}

