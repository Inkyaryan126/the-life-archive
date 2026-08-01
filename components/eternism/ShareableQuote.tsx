"use client";

import { useState } from "react";

type ShareableQuoteProps = {
  quoteText: string;
  expandedQuoteText?: string;
  author?: string;
  title?: string;
  expandedTitle?: string;
  className?: string;
};

export function ShareableQuote({
  quoteText,
  expandedQuoteText,
  author,
  title = "The Eternist Pledge",
  expandedTitle = "The Full Eternist Pledge",
  className = ""
}: ShareableQuoteProps) {
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [copiedExpanded, setCopiedExpanded] = useState(false);
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

  const handleCopyExpanded = async () => {
    if (!expandedQuoteText) return;
    try {
      const fullText = author ? `"${expandedQuoteText}"\n— ${author}` : expandedQuoteText;
      await navigator.clipboard.writeText(fullText);
      setCopiedExpanded(true);
      setTimeout(() => setCopiedExpanded(false), 3000);
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
    <div className={`space-y-8 ${className}`}>
      {/* Primary Visual Climax: Short Public Pledge */}
      <div className="rounded-[2.5rem] border border-archive-gold/35 bg-black/85 p-8 text-center shadow-luxury sm:p-12">
        {title ? (
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
            {title}
          </p>
        ) : null}

        <blockquote className="mt-4 whitespace-pre-line font-serif text-xl leading-relaxed text-archive-ivory sm:text-2xl lg:text-3xl">
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
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-archive-gold/40 bg-archive-gold/18 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-archive-champagne transition hover:border-archive-gold hover:bg-archive-gold/30 focus:outline-none focus:ring-2 focus:ring-archive-gold/60"
          >
            {copiedQuote ? "Pledge Copied! ✓" : "Copy Pledge"}
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-archive-gold/30 bg-white/[0.04] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory/80 transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-archive-gold/50"
          >
            {copiedLink ? "Link Copied! ✓" : "Share Link"}
          </button>
        </div>
      </div>

      {/* Optional Expanded Commitment: Full Eternist Pledge */}
      {expandedQuoteText ? (
        <div className="rounded-[2rem] border border-archive-gold/20 bg-black/60 p-6 text-center shadow-luxury sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold/85">
            {expandedTitle}
          </p>

          <blockquote className="mt-4 whitespace-pre-line font-serif text-base leading-relaxed text-archive-ivory/90 sm:text-lg">
            “{expandedQuoteText}”
          </blockquote>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleCopyExpanded}
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-archive-gold/30 bg-white/[0.04] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-archive-ivory/80 transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-archive-gold/50"
            >
              {copiedExpanded ? "Full Pledge Copied! ✓" : "Copy Full Pledge"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
