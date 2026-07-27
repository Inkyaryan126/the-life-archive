"use client";

import Link from "next/link";

type MemberCardActionsProps = {
  continueHref: string;
  continueLabel: string;
  variant?: "default" | "archive-building";
};

export function MemberCardActions({
  continueHref,
  continueLabel,
  variant = "default"
}: MemberCardActionsProps) {
  const printCard = (side?: "front" | "back") => {
    const root = document.documentElement;

    if (side) {
      root.dataset.memberCardPrintSide = side;
    } else {
      delete root.dataset.memberCardPrintSide;
    }

    const cleanup = () => {
      delete root.dataset.memberCardPrintSide;
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  const isArchiveBuilding = variant === "archive-building";

  // High-contrast, unambiguous button styles across all states and rendering contexts
  const primaryClassName = isArchiveBuilding
    ? "inline-flex items-center justify-center rounded-md bg-archive-gold px-3 py-1.5 text-[clamp(0.48rem,0.65vw,0.72rem)] font-bold uppercase tracking-[0.1em] text-archive-obsidian border border-archive-gold shadow-soft transition hover:bg-archive-champagne hover:border-archive-champagne focus:outline-none focus:ring-2 focus:ring-archive-gold active:scale-[0.98]"
    : "inline-flex items-center justify-center rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian border border-archive-gold shadow-luxury transition hover:bg-archive-champagne hover:border-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/40 active:scale-[0.98]";

  const secondaryClassName = isArchiveBuilding
    ? "inline-flex items-center justify-center rounded-md border border-archive-gold/50 bg-black/60 px-3 py-1.5 text-[clamp(0.48rem,0.65vw,0.72rem)] font-semibold uppercase tracking-[0.1em] text-archive-ivory transition hover:border-archive-gold hover:text-archive-gold hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-archive-gold/50 active:scale-[0.98]"
    : "inline-flex items-center justify-center rounded-full border border-archive-gold/50 bg-black/60 px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:text-archive-gold hover:bg-black/80 focus:outline-none focus:ring-4 focus:ring-archive-gold/30 active:scale-[0.98]";

  return (
    <div className={`no-print flex items-center justify-center ${isArchiveBuilding ? "w-full flex-wrap gap-2" : "flex-col gap-4"}`}>
      <div className={`flex flex-wrap items-center justify-center ${isArchiveBuilding ? "gap-2" : "gap-3"}`}>
        <button
          type="button"
          onClick={() => printCard()}
          className={primaryClassName}
          aria-label="Print Both Sides of the Member Card"
        >
          Print Both Sides
        </button>
        <button
          type="button"
          onClick={() => printCard("front")}
          className={secondaryClassName}
          aria-label="Print Front Only of the Member Card"
        >
          Print Front Only
        </button>
        <button
          type="button"
          onClick={() => printCard("back")}
          className={secondaryClassName}
          aria-label="Print Back Only of the Member Card"
        >
          Print Back Only
        </button>
      </div>
      <Link
        href={continueHref}
        className={secondaryClassName}
      >
        {continueLabel}
      </Link>
    </div>
  );
}
