import React from "react";
import Image from "next/image";
import type { Memory } from "@/lib/types";
import { getDeterministicTilt } from "@/lib/archive-memory-helpers";
import { MemoryPlaque } from "./MemoryPlaque";

type VoiceMemoryObjectProps = {
  memory: Memory;
};

export function VoiceMemoryObject({ memory }: VoiceMemoryObjectProps) {
  const tiltClass = getDeterministicTilt(memory.id);

  return (
    <div className={`group relative flex flex-col items-center transition-all duration-300 hover:-translate-y-1.5 motion-reduce:transform-none ${tiltClass}`}>
      {/* Cassette Asset Shell */}
      <div className="relative aspect-[1.7/1] w-full max-w-[340px] drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)] transition-shadow duration-300 group-hover:drop-shadow-[0_18px_36px_rgba(202,164,92,0.35)]">
        <Image
          src="/images/archive-assets/audio/cassette-memory.png"
          alt=""
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 340px, 100vw"
        />

        {/* Live Cassette Tape Overlay Label */}
        <div className="absolute inset-[14%_12%_34%_12%] flex flex-col justify-center px-4 py-2 text-center pointer-events-none">
          <p className="line-clamp-1 font-mono text-[clamp(0.65rem,0.8vw,0.88rem)] font-bold tracking-wider text-[#24190d]">
            {memory.title}
          </p>
          <p className="mt-0.5 font-mono text-[clamp(0.52rem,0.64vw,0.7rem)] font-medium uppercase tracking-[0.16em] text-[#634825]">
            Voice Recording • {memory.date || "Audio"}
          </p>
        </div>

        {/* Play Icon Badge */}
        <div className="absolute bottom-[16%] right-[14%] flex items-center justify-center h-7 w-7 rounded-full bg-archive-gold text-archive-obsidian shadow-md transition-transform duration-300 group-hover:scale-110">
          <svg className="h-3.5 w-3.5 fill-current translate-x-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Brass Plaque Label */}
      <div className="-mt-2 relative z-10 w-full px-2">
        <MemoryPlaque
          title={memory.title}
          subtitle={`Voice Recording • ${memory.date || "Audio"}`}
        />
      </div>
    </div>
  );
}
