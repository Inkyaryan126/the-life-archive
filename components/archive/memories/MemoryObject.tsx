import React from "react";
import Link from "next/link";
import type { Memory } from "@/lib/types";
import { shouldSpanTwoColumns } from "@/lib/archive-memory-helpers";
import { PhotoMemoryObject } from "./PhotoMemoryObject";
import { VoiceMemoryObject } from "./VoiceMemoryObject";
import { JournalMemoryObject } from "./JournalMemoryObject";
import { VideoMemoryObject } from "./VideoMemoryObject";
import { SongMemoryObject } from "./SongMemoryObject";
import { LifeLessonMemoryObject } from "./LifeLessonMemoryObject";

type MemoryObjectProps = {
  memory: Memory;
  archiveSlug: string;
};

export function MemoryObject({ memory, archiveSlug }: MemoryObjectProps) {
  const spanTwo = shouldSpanTwoColumns(memory.id, memory.type);
  const href = `/archive/${archiveSlug}/memories/${memory.id}`;

  const renderContent = () => {
    switch (memory.type) {
      case "photo":
        return <PhotoMemoryObject memory={memory} />;
      case "voice":
        return <VoiceMemoryObject memory={memory} />;
      case "journal":
        return <JournalMemoryObject memory={memory} />;
      case "video":
        return <VideoMemoryObject memory={memory} />;
      case "song":
        return <SongMemoryObject memory={memory} />;
      case "lesson":
        return <LifeLessonMemoryObject memory={memory} />;
      default:
        return <JournalMemoryObject memory={memory} />;
    }
  };

  return (
    <div className={`memory-object-card ${spanTwo ? "md:col-span-2" : "col-span-1"}`}>
      <Link
        href={href}
        className="block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-archive-gold/80 rounded-2xl"
        aria-label={`View memory: ${memory.title}`}
      >
        {renderContent()}
      </Link>
    </div>
  );
}
