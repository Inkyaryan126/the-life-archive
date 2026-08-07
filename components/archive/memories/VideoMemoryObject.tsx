import React from "react";
import Image from "next/image";
import type { Memory } from "@/lib/types";
import { getDeterministicTilt } from "@/lib/archive-memory-helpers";
import { MemoryPlaque } from "./MemoryPlaque";

type VideoMemoryObjectProps = {
  memory: Memory;
};

export function VideoMemoryObject({ memory }: VideoMemoryObjectProps) {
  const tiltClass = getDeterministicTilt(memory.id);
  const thumbnailUrl = memory.mediaUrl || "/images/site-design/videos-button.jpg";

  return (
    <div className={`group relative flex flex-col items-center transition-all duration-300 hover:-translate-y-1.5 motion-reduce:transform-none ${tiltClass}`}>
      {/* Filmstrip Frame Asset Container */}
      <div className="relative aspect-[1.67/1] w-full max-w-[380px] drop-shadow-[0_12px_28px_rgba(0,0,0,0.8)] transition-shadow duration-300 group-hover:drop-shadow-[0_18px_36px_rgba(202,164,92,0.35)]">
        {/* Thumbnail Layer inside Filmstrip Opening */}
        <div className="absolute left-[20.2%] top-[23.7%] width-[43.3%] height-[51.6%] overflow-hidden bg-black rounded-sm"
             style={{ width: "43.3%", height: "51.6%", left: "20.2%", top: "23.7%" }}>
          <Image
            src={thumbnailUrl}
            alt={memory.title}
            fill
            className="object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 200px, 100vw"
          />
          {/* Play Icon Badge */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-archive-gold text-archive-obsidian shadow-lg transition-transform duration-300 group-hover:scale-110">
              <svg className="h-4 w-4 fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filmstrip Frame Asset Overlay */}
        <Image
          src="/images/archive-assets/video/filmstrip-frame.png"
          alt=""
          fill
          className="pointer-events-none object-contain"
          sizes="(min-width: 1024px) 380px, 100vw"
        />

        {/* Filmstrip Right Side Live Text Label */}
        <div className="absolute left-[66%] top-[24%] bottom-[24%] right-[10%] flex flex-col justify-center px-2 pointer-events-none text-left">
          <span className="font-mono text-[clamp(0.5rem,0.6vw,0.68rem)] font-bold uppercase tracking-[0.16em] text-archive-gold">
            Video Chapter
          </span>
          <p className="mt-0.5 font-serif text-[clamp(0.72rem,0.9vw,1.05rem)] font-bold leading-tight text-archive-ivory line-clamp-2">
            {memory.title}
          </p>
          <time className="mt-1 font-mono text-[clamp(0.5rem,0.6vw,0.68rem)] text-archive-ivory/60">
            {memory.date || "Filmstrip"}
          </time>
        </div>
      </div>

      {/* Brass Plaque Label */}
      <div className="-mt-2 relative z-10 w-full px-2">
        <MemoryPlaque
          title={memory.title}
          subtitle={`Video Chapter • ${memory.date || "Preserved"}`}
        />
      </div>
    </div>
  );
}
