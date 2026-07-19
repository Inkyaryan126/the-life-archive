"use client";

import Link from "next/link";
import { useState } from "react";

type QRDesktopActionsProps = {
  archiveName: string;
  downloadHref: string;
  shareUrl: string;
};

const actionClass =
  "flex h-full min-w-0 items-center justify-center px-[clamp(0.25rem,0.7vw,0.8rem)] text-center text-[clamp(0.58rem,0.86vw,0.95rem)] font-semibold leading-none text-archive-ivory/88 transition hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-inset focus:ring-archive-gold/70";

function qrFileName(archiveName: string) {
  const slug = archiveName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "life-archive"}-qr.png`;
}

export function QRDesktopActions({
  archiveName,
  downloadHref,
  shareUrl
}: QRDesktopActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid h-full w-full grid-cols-[202fr_185fr_185fr_213fr] overflow-hidden rounded-[inherit]">
      <a
        href={downloadHref}
        download={qrFileName(archiveName)}
        className={`${actionClass} border-r border-archive-gold/20`}
      >
        Download PNG
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className={`${actionClass} border-r border-archive-gold/20`}
      >
        Print QR Card
      </button>
      <button
        type="button"
        onClick={copyLink}
        className={`${actionClass} border-r border-archive-gold/20`}
      >
        {copied ? "Copied" : "Copy Link"}
      </button>
      <Link href="/keepsakes" className={actionClass}>
        View Keepsakes
      </Link>
    </div>
  );
}
