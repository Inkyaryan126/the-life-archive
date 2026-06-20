"use client";

import type { ReactNode } from "react";

type PrintButtonProps = {
  children: ReactNode;
};

export function PrintButton({ children }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-6 rounded-full bg-archive-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-archive-clay"
    >
      {children}
    </button>
  );
}
