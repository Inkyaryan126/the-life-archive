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
  const primaryClassName = isArchiveBuilding
    ? "rounded-md bg-archive-gold/86 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-archive-obsidian transition hover:bg-archive-champagne focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
    : "rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-lg transition hover:bg-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/30";
  const secondaryClassName = isArchiveBuilding
    ? "rounded-md border border-archive-gold/34 bg-black/28 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-archive-ivory transition hover:border-archive-gold hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/55"
    : "rounded-full border border-archive-gold/55 bg-white/5 px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-archive-gold/20";

  return (
    <div className={`no-print flex items-center justify-center ${isArchiveBuilding ? "w-full flex-wrap gap-2" : "flex-col gap-4"}`}>
      <div className={`flex flex-wrap items-center justify-center ${isArchiveBuilding ? "gap-2" : "gap-3"}`}>
        <button
          type="button"
          onClick={() => printCard()}
          className={primaryClassName}
        >
          Print Both Sides
        </button>
        <button
          type="button"
          onClick={() => printCard("front")}
          className={secondaryClassName}
        >
          Print Front Only
        </button>
        <button
          type="button"
          onClick={() => printCard("back")}
          className={secondaryClassName}
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
