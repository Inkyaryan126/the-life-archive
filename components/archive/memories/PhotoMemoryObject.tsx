import React from "react";
import Image from "next/image";
import type { Memory } from "@/lib/types";
import {
  getDeterministicPhotoFrame,
  getDeterministicTilt,
  photoFrameConfigs
} from "@/lib/archive-memory-helpers";
import { MemoryPlaque } from "./MemoryPlaque";

type PhotoMemoryObjectProps = {
  memory: Memory;
};

export function PhotoMemoryObject({ memory }: PhotoMemoryObjectProps) {
  const frameType = getDeterministicPhotoFrame(memory.id);
  const tiltClass = getDeterministicTilt(memory.id);
  const config = photoFrameConfigs[frameType];
  const photoUrl = memory.mediaUrl || "/images/site-design/photos-button.jpg";

  return (
    <div className={`group relative flex flex-col items-center transition-all duration-300 hover:-translate-y-1.5 motion-reduce:transform-none ${tiltClass}`}>
      {/* Framed Photo Housing */}
      <div className={`relative w-full max-w-[340px] ${config.aspectRatio} overflow-hidden drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)] transition-shadow duration-300 group-hover:drop-shadow-[0_18px_36px_rgba(202,164,92,0.35)]`}>
        {/* Photo Image Layer (Positioned precisely in the transparent inner window) */}
        <div
          className="absolute overflow-hidden bg-archive-obsidian"
          style={config.windowStyle}
        >
          <Image
            src={photoUrl}
            alt={memory.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 340px, 100vw"
          />
        </div>

        {/* Decorative Frame Overlay */}
        <Image
          src={config.asset}
          alt=""
          fill
          className="pointer-events-none object-contain"
          sizes="(min-width: 1024px) 340px, 100vw"
        />
      </div>

      {/* Brass Plaque Label */}
      <div className="-mt-3 relative z-10 w-full px-2">
        <MemoryPlaque
          title={memory.title}
          subtitle={`Photo • ${memory.date || "Preserved"}`}
        />
      </div>
    </div>
  );
}
