"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  acceptedAudioFormatLabel,
  acceptedAudioMimeTypes,
  maxAudioUploadBytes,
  maxAudioUploadMegabytes
} from "@/lib/media-upload-constants";

type AddMemoryFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
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

export function AddMemoryForm({ action, children }: AddMemoryFormProps) {
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const type = formData.get("type");
    const mediaFile = formData.get("mediaFile");

    if (!(mediaFile instanceof File) || mediaFile.size === 0) {
      setErrorMessage("");
      return;
    }

    const isAudioUpload = typeof type === "string" && type === "voice";

    if (!isAudioUpload) {
      setErrorMessage("");
      return;
    }

    const message = getAudioPreflightError(mediaFile);

    if (!message) {
      setErrorMessage("");
      return;
    }

    event.preventDefault();
    setErrorMessage(message);
  }

  return (
    <form
      action={action}
      encType="multipart/form-data"
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury"
    >
      {errorMessage ? (
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
