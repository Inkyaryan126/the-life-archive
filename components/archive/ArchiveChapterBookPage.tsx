"use client";

import Image from "next/image";
import Link from "next/link";
import type { Memory } from "@/lib/types";
import { getMemoryTypeLabel, trimArchiveText } from "./archiveBookModel";

type ArchiveChapterBookPageProps = {
  archiveSlug: string;
  chapter: Memory;
  pageNumber: number;
};

export function ArchiveChapterBookPage({
  archiveSlug,
  chapter,
  pageNumber
}: ArchiveChapterBookPageProps) {
  const hasImagePreview = chapter.type === "photo" && chapter.mediaUrl;

  return (
    <article className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[clamp(0.58rem,0.84vw,0.72rem)] uppercase tracking-[0.16em] text-[#7e5a25]">
            Chapter {String(pageNumber).padStart(2, "0")}
          </p>
          <h3 className="mt-1 font-serif text-[clamp(1.08rem,1.9vw,1.7rem)] leading-tight text-[#241609]">
            {chapter.title}
          </h3>
        </div>
        <span className="shrink-0 border border-[#8d6428]/30 px-2 py-1 text-[clamp(0.52rem,0.74vw,0.65rem)] uppercase tracking-[0.14em] text-[#6f4a19]">
          {getMemoryTypeLabel(chapter.type)}
        </span>
      </div>

      {hasImagePreview ? (
        <div className="relative mt-[5%] aspect-[5/3] overflow-hidden bg-[#5d3d17]/20">
          <Image
            src={chapter.mediaUrl as string}
            alt={chapter.title}
            fill
            sizes="(min-width: 1024px) 18vw, 70vw"
            className="object-cover sepia-[0.18]"
          />
          <div className="absolute inset-0 shadow-[inset_0_0_28px_rgba(48,26,8,0.36)]" />
        </div>
      ) : null}

      <p className="mt-[5%] flex-1 overflow-hidden font-serif text-[clamp(0.76rem,1.15vw,1rem)] leading-relaxed text-[#33210e]">
        {trimArchiveText(chapter.content, hasImagePreview ? 260 : 520)}
      </p>

      <div className="mt-[5%] flex items-center justify-between gap-3 border-t border-[#8d6428]/25 pt-[4%]">
        <span className="font-mono text-[clamp(0.58rem,0.82vw,0.72rem)] text-[#765421]">
          {chapter.date}
        </span>
        <Link
          href={`/archive/${archiveSlug}/memories/${chapter.id}`}
          className="font-semibold uppercase tracking-[0.14em] text-[#6f4a19] transition hover:text-[#2a1909] focus:outline-none focus:ring-2 focus:ring-[#8d6428]/40"
        >
          Open Full Chapter
        </Link>
      </div>
    </article>
  );
}
