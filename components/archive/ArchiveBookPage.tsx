"use client";

import { forwardRef, type ReactNode } from "react";

type ArchiveBookPageProps = {
  children: ReactNode;
  className?: string;
};

export const ArchiveBookPage = forwardRef<HTMLDivElement, ArchiveBookPageProps>(
  function ArchiveBookPage({ children, className = "" }, ref) {
    return (
      <div
        ref={ref}
        className={`h-full w-full overflow-hidden bg-[#d8bd83] text-[#2b1c0d] shadow-[inset_0_0_34px_rgba(80,43,12,0.2)] ${className}`}
      >
        <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(255,246,206,0.7),transparent_38%),linear-gradient(115deg,rgba(113,72,27,0.18),transparent_28%,rgba(76,45,16,0.15)_100%)] px-[7%] py-[7%]">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[18%] bg-gradient-to-l from-black/10 to-transparent" />
          <div className="relative z-10 h-full">{children}</div>
        </div>
      </div>
    );
  }
);
