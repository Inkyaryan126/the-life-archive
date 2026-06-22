"use client";

import Link from "next/link";

type MemberCardActionsProps = {
  continueHref: string;
  continueLabel: string;
};

export function MemberCardActions({
  continueHref,
  continueLabel
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

  return (
    <div className="no-print flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => printCard()}
          className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-lg transition hover:bg-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
        >
          Print Both Sides
        </button>
        <button
          type="button"
          onClick={() => printCard("front")}
          className="rounded-full border border-archive-gold/55 bg-white/5 px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-archive-gold/20"
        >
          Print Front Only
        </button>
        <button
          type="button"
          onClick={() => printCard("back")}
          className="rounded-full border border-archive-gold/55 bg-white/5 px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-archive-gold/20"
        >
          Print Back Only
        </button>
      </div>
      <Link
        href={continueHref}
        className="rounded-full border border-archive-gold/55 bg-white/5 px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-archive-gold/20"
      >
        {continueLabel}
      </Link>
    </div>
  );
}
