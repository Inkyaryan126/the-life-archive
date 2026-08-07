import React from "react";
import Image from "next/image";

type MemoryPlaqueProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function MemoryPlaque({ title, subtitle, className = "" }: MemoryPlaqueProps) {
  return (
    <div className={`relative w-full max-w-[310px] mx-auto select-none ${className}`}>
      {/* Brass Plaque Asset Housing */}
      <div className="relative aspect-[1.92/1] w-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">
        <Image
          src="/images/archive-assets/labels/brass-memory-plaque.png"
          alt=""
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 310px, 100vw"
        />
        {/* Bounded Safe Inner Text Zone (Strictly inside 16% left/right ornate borders) */}
        <div className="absolute inset-[14%_16%_14%_16%] flex flex-col items-center justify-center text-center pointer-events-none">
          <p
            title={title}
            className="line-clamp-2 font-serif text-[clamp(0.6rem,0.74vw,0.84rem)] font-bold leading-[1.15] tracking-wide text-[#3d2b12] uppercase drop-shadow-[0_1px_1px_rgba(255,235,180,0.4)]"
          >
            {title}
          </p>
          {subtitle ? (
            <p className="mt-0.5 line-clamp-1 font-mono text-[clamp(0.48rem,0.58vw,0.66rem)] font-semibold uppercase tracking-[0.12em] text-[#59401d]/90">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
