"use client";

import { useState } from "react";

type ShareableQuoteProps = {
  quoteText: string;
  author?: string;
  title?: string;
  className?: string;
};

export function ShareableQuote({
  quoteText,
  author,
  title = "The Eternist Pledge",
  className = ""
}: ShareableQuoteProps) {
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyQuote = async () => {
    try {
      const fullText = author ? `"${quoteText}"\n— ${author}` : quoteText;
      await navigator.clipboard.writeText(fullText);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={`rounded-[2rem] border border-archive-gold/30 bg-black/80 p-8 text-center shadow-luxury sm:p-12 ${className}`}
    >
      {title ? (
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
          {title}
        </p>
      ) : null}

      <blockquote className="mt-4 font-serif text-xl leading-relaxed text-archive-ivory sm:text-2xl lg:text-3xl">
        “{quoteText}”
      </blockquote>

      {author ? (
        <cite className="mt-4 block font-serif text-sm italic text-archive-champagne/80">
          — {author}
        </cite>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleCopyQuote}
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-archive-gold/40 bg-archive-gold/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-archive-champagne transition hover:border-archive-gold hover:bg-archive-gold/25 focus:outline-none focus:ring-2 focus:ring-archive-gold/60"
        >
          {copiedQuote ? "Quote Copied!" : "Copy Pledge"}
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-archive-gold/30 bg-white/[0.04] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory/80 transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-archive-gold/50"
        >
          {copiedLink ? "Link Copied!" : "Share Link"}
        </button>
      </div>
    </div>
  );
}
