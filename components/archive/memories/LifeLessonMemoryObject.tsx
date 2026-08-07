import React from "react";
import Image from "next/image";
import type { Memory } from "@/lib/types";
import { getDeterministicTilt } from "@/lib/archive-memory-helpers";
import { MemoryPlaque } from "./MemoryPlaque";

type LifeLessonMemoryObjectProps = {
  memory: Memory;
};

export function LifeLessonMemoryObject({ memory }: LifeLessonMemoryObjectProps) {
  const tiltClass = getDeterministicTilt(memory.id);

  return (
    <div className={`group relative flex flex-col items-center transition-all duration-300 hover:-translate-y-1.5 motion-reduce:transform-none ${tiltClass}`}>
      {/* Parchment Card Asset Container */}
      <div className="relative aspect-[1.6/1] w-full max-w-[360px] drop-shadow-[0_12px_28px_rgba(0,0,0,0.75)] transition-shadow duration-300 group-hover:drop-shadow-[0_18px_36px_rgba(202,164,92,0.35)]">
        <Image
          src="/images/archive-assets/cards/parchment-life-lesson.png"
          alt=""
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 360px, 100vw"
        />

        {/* Live Parchment Text Overlay */}
        <div className="absolute inset-[16%_12%_18%_12%] flex flex-col justify-start p-3 text-left pointer-events-none text-[#2d1e0f]">
          <span className="font-mono text-[clamp(0.52rem,0.64vw,0.72rem)] font-bold uppercase tracking-[0.2em] text-[#785122]">
            Life Lesson
          </span>
          <h3 className="mt-1 font-serif text-[clamp(0.82rem,1.05vw,1.25rem)] font-bold leading-snug text-[#1f1307] line-clamp-2">
            {memory.title}
          </h3>
          <p className="mt-2 font-serif text-[clamp(0.68rem,0.82vw,0.92rem)] leading-relaxed text-[#3b2713]/90 line-clamp-3 italic">
            &ldquo;{memory.content}&rdquo;
          </p>
        </div>
      </div>

      {/* Brass Plaque Label */}
      <div className="-mt-3 relative z-10 w-full px-2">
        <MemoryPlaque
          title={memory.title}
          subtitle={`Life Lesson • ${memory.date || "Wisdom"}`}
        />
      </div>
    </div>
  );
}
