import React from "react";
import Image from "next/image";
import type { Memory } from "@/lib/types";
import { getDeterministicTilt } from "@/lib/archive-memory-helpers";
import { MemoryPlaque } from "./MemoryPlaque";

type JournalMemoryObjectProps = {
  memory: Memory;
};

export function JournalMemoryObject({ memory }: JournalMemoryObjectProps) {
  const tiltClass = getDeterministicTilt(memory.id);

  return (
    <div className={`group relative flex flex-col items-center transition-all duration-300 hover:-translate-y-1.5 motion-reduce:transform-none ${tiltClass}`}>
      {/* Open Antique Journal Asset */}
      <div className="relative aspect-[1.55/1] w-full max-w-[420px] drop-shadow-[0_12px_28px_rgba(0,0,0,0.75)] transition-shadow duration-300 group-hover:drop-shadow-[0_18px_36px_rgba(202,164,92,0.35)]">
        <Image
          src="/images/archive-assets/books/open-antique-journal.png"
          alt=""
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 420px, 100vw"
        />

        {/* Double-Page Spread Live HTML Text Overlay */}
        <div className="absolute inset-[15%_10%_16%_10%] grid grid-cols-2 gap-4 px-3 py-2 pointer-events-none text-[#291b0c]">
          {/* Left Page (Title & Date) */}
          <div className="flex flex-col justify-start overflow-hidden text-left border-r border-[#6b4c23]/20 pr-3">
            <span className="font-mono text-[clamp(0.5rem,0.6vw,0.68rem)] font-bold uppercase tracking-[0.18em] text-[#704d20]">
              Journal Chapter
            </span>
            <h3 className="mt-1 font-serif text-[clamp(0.8rem,1.05vw,1.18rem)] font-bold leading-tight text-[#1c1207] line-clamp-3">
              {memory.title}
            </h3>
            {memory.date ? (
              <time className="mt-auto font-serif text-[clamp(0.55rem,0.65vw,0.72rem)] italic text-[#543b19]/80">
                {memory.date}
              </time>
            ) : null}
          </div>

          {/* Right Page (Story Excerpt) */}
          <div className="flex flex-col justify-start overflow-hidden text-left pl-1">
            <p className="font-serif text-[clamp(0.68rem,0.8vw,0.88rem)] leading-relaxed text-[#2b1d0d]/90 line-clamp-6">
              {memory.content}
            </p>
          </div>
        </div>
      </div>

      {/* Brass Plaque Label */}
      <div className="-mt-3 relative z-10 w-full px-2">
        <MemoryPlaque
          title={memory.title}
          subtitle={`Journal Entry • ${memory.date || "Written"}`}
        />
      </div>
    </div>
  );
}
