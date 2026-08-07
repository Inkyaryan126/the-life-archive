import React from "react";
import Image from "next/image";
import type { Memory } from "@/lib/types";
import { getDeterministicTilt } from "@/lib/archive-memory-helpers";
import { MemoryPlaque } from "./MemoryPlaque";

type SongMemoryObjectProps = {
  memory: Memory;
};

export function SongMemoryObject({ memory }: SongMemoryObjectProps) {
  const tiltClass = getDeterministicTilt(memory.id);

  return (
    <div className={`group relative flex flex-col items-center transition-all duration-300 hover:-translate-y-1.5 motion-reduce:transform-none ${tiltClass}`}>
      {/* Vinyl Record Disc Shell */}
      <div className="relative aspect-square w-full max-w-[300px] drop-shadow-[0_12px_28px_rgba(0,0,0,0.8)] transition-shadow duration-300 group-hover:drop-shadow-[0_18px_36px_rgba(202,164,92,0.35)]">
        <Image
          src="/images/archive-assets/music/vinyl-record.png"
          alt=""
          fill
          className="object-contain transition-transform duration-700 group-hover:rotate-6"
          sizes="(min-width: 1024px) 300px, 100vw"
        />

        {/* Live Vinyl Center Label Overlay */}
        <div className="absolute inset-[33%] rounded-full flex flex-col items-center justify-center p-3 text-center pointer-events-none">
          <p className="line-clamp-2 font-serif text-[clamp(0.65rem,0.8vw,0.9rem)] font-bold leading-tight text-archive-gold drop-shadow-md">
            {memory.title}
          </p>
          <p className="mt-0.5 font-mono text-[clamp(0.5rem,0.6vw,0.68rem)] font-semibold uppercase tracking-widest text-archive-ivory/80">
            Song / Music
          </p>
        </div>
      </div>

      {/* Brass Plaque Label */}
      <div className="-mt-3 relative z-10 w-full px-2">
        <MemoryPlaque
          title={memory.title}
          subtitle={`Song / Playlist • ${memory.date || "Music"}`}
        />
      </div>
    </div>
  );
}
