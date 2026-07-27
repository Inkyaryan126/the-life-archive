"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type ShareArchiveDialogProps = {
  archiveSlug: string;
  personName: string;
  qrDataUri: string;
  targetUrl: string;
  triggerLabel?: string;
  triggerClassName?: string;
};

export function ShareArchiveDialog({
  archiveSlug,
  personName,
  qrDataUri,
  targetUrl,
  triggerLabel = "Share Archive",
  triggerClassName = "rounded-full border border-archive-gold/35 bg-white/[0.04] px-6 py-3.5 text-base font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
}: ShareArchiveDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Focus close button on open
    setTimeout(() => closeButtonRef.current?.focus(), 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Return focus on close
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => triggerRef.current?.focus(), 50);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API unavailable
    }
  };

  const handleDownloadQr = () => {
    const a = document.createElement("a");
    a.href = qrDataUri;
    a.download = `life-archive-${archiveSlug}-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={triggerClassName}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {triggerLabel}
      </button>

      {/* Share Modal Dialog */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity motion-reduce:transition-none"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            aria-describedby="share-dialog-desc"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-archive-gold/25 bg-[#171511] p-6 text-archive-ivory shadow-luxury sm:p-8 motion-reduce:transform-none"
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-archive-gold/20 bg-black/40 text-archive-ivory/80 transition hover:border-archive-gold hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold"
              aria-label="Close share dialog"
            >
              ✕
            </button>

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                Share Archive
              </p>
              <h2
                id="share-dialog-title"
                className="mt-2 font-serif text-2xl text-archive-ivory sm:text-3xl"
              >
                {personName}&apos;s Story
              </h2>
              <p
                id="share-dialog-desc"
                className="mt-2 text-sm leading-6 text-archive-ivory/68"
              >
                Every scan opens a different memory or chapter.
              </p>

              {/* QR Code Display */}
              <div className="my-6 inline-block rounded-2xl border border-archive-gold/20 bg-white p-4 shadow-luxury">
                <Image
                  src={qrDataUri}
                  alt={`QR code for ${personName}'s archive`}
                  width={200}
                  height={200}
                  unoptimized
                  className="mx-auto h-48 w-48"
                />
              </div>

              {/* Target URL Display */}
              <div className="mb-6 rounded-xl border border-archive-gold/18 bg-black/40 p-3 text-left">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-archive-gold/80">
                  Random Memory Destination
                </p>
                <p className="mt-1 break-all text-xs font-mono text-archive-ivory/75">
                  {targetUrl}
                </p>
              </div>

              {/* Actions */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian shadow-soft transition hover:bg-archive-champagne focus:outline-none focus:ring-2 focus:ring-archive-gold"
                >
                  {copied ? "Copied to Clipboard!" : "Copy Link"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="w-full rounded-full border border-archive-gold/30 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-archive-gold"
                >
                  Download QR
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
