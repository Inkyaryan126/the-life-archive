import React from "react";
import Image from "next/image";

type MemoryPlaqueProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function MemoryPlaque({ title, subtitle, className = "" }: MemoryPlaqueProps) {
  return (
    <div className={`relative w-full max-w-[280px] mx-auto select-none ${className}`}>
      {/* Brass Plaque Asset */}
      <div className="relative aspect-[1.92/1] w-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
        <Image
          src="/images/archive-assets/labels/brass-memory-plaque.png"
          alt=""
          fill
          className="object-contain"
          sizes="280px"
        />
        {/* Live Engraved HTML Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
          <p className="line-clamp-1 font-serif text-[clamp(0.7rem,0.85vw,0.95rem)] font-bold tracking-wider text-[#3d2b12] uppercase drop-shadow-[0_1px_1px_rgba(255,235,180,0.4)]">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-0.5 line-clamp-1 font-mono text-[clamp(0.55rem,0.68vw,0.72rem)] font-medium uppercase tracking-[0.14em] text-[#59401d]/90">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
