"use client";

import Link from "next/link";
import type { Memory } from "@/lib/types";
import {
  getArchiveChapterPageIndex,
  getMemoryTypeLabel,
  trimArchiveText
} from "./archiveBookModel";

type ArchiveTableOfContentsProps = {
  archiveSlug: string;
  chapters: Memory[];
  isOwner: boolean;
  isLivingArchive: boolean;
  onSelectChapter: (pageIndex: number) => void;
};

export function ArchiveTableOfContents({
  archiveSlug,
  chapters,
  isOwner,
  isLivingArchive,
  onSelectChapter
}: ArchiveTableOfContentsProps) {
  return (
    <div className="flex h-full flex-col">
      <p className="font-serif text-[clamp(0.72rem,1.1vw,0.98rem)] uppercase tracking-[0.18em] text-[#6f4a19]">
        Table of Contents
      </p>
      <h3 className="mt-1 font-serif text-[clamp(1.05rem,1.8vw,1.55rem)] leading-tight text-[#2a1909]">
        Preserved Chapters
      </h3>

      {chapters.length > 0 ? (
        <div className="mt-[5%] flex-1 space-y-[2.3%] overflow-y-auto pr-2">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onSelectChapter(getArchiveChapterPageIndex(index))}
              className="group grid w-full grid-cols-[2.2rem_1fr] gap-2 rounded-none border-b border-[#8d6428]/25 pb-[2.2%] text-left transition duration-200 hover:translate-x-1 hover:border-[#6f4a19]/55 focus:outline-none focus:ring-2 focus:ring-[#8d6428]/40 motion-reduce:transform-none"
            >
              <span className="font-mono text-[clamp(0.62rem,0.9vw,0.78rem)] text-[#7e5a25]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="block font-serif text-[clamp(0.74rem,1.13vw,0.98rem)] leading-tight text-[#2a1909] group-hover:text-[#6f4a19]">
                  {chapter.title}
                </span>
                <span className="mt-1 block text-[clamp(0.58rem,0.82vw,0.72rem)] uppercase tracking-[0.14em] text-[#6d512a]">
                  {getMemoryTypeLabel(chapter.type)}
                  {chapter.date ? ` | ${chapter.date}` : ""}
                </span>
                {chapter.content ? (
                  <span className="mt-1 block text-[clamp(0.58rem,0.86vw,0.76rem)] leading-snug text-[#4e3518]/78">
                    {trimArchiveText(chapter.content, 92)}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-[10%] rounded-sm border border-[#8d6428]/25 bg-[#f1dfad]/25 p-4 text-[clamp(0.74rem,1.1vw,0.92rem)] leading-relaxed text-[#3b2811]">
          This archive does not have public chapters yet.
          {isOwner && isLivingArchive ? (
            <Link
              href={`/archive/${archiveSlug}/add-memory`}
              className="mt-3 inline-flex font-semibold text-[#6f4a19] underline decoration-[#6f4a19]/30 underline-offset-4"
            >
              Add your first chapter
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
