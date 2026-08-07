"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import HTMLFlipBook from "react-pageflip";
import type { Memory } from "@/lib/types";
import { ArchiveBookPage } from "./ArchiveBookPage";
import { ArchiveChapterBookPage } from "./ArchiveChapterBookPage";
import { ArchiveTableOfContents } from "./ArchiveTableOfContents";
import {
  getArchiveBookPageCount,
  trimArchiveText
} from "./archiveBookModel";

type ArchiveFlipBookProps = {
  archiveSlug: string;
  personName: string;
  biography: string;
  isLivingArchive: boolean;
  isOwner: boolean;
  chapters: Memory[];
};

type FlipBookHandle = {
  pageFlip: () => {
    flip: (pageIndex: number) => void;
    flipNext: () => void;
    flipPrev: () => void;
    getCurrentPageIndex: () => number;
  };
};

export function ArchiveFlipBook({
  archiveSlug,
  personName,
  biography,
  isLivingArchive,
  isOwner,
  chapters
}: ArchiveFlipBookProps) {
  const bookRef = useRef<FlipBookHandle | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageCount = useMemo(() => getArchiveBookPageCount(chapters), [chapters]);

  const flipToPage = (pageIndex: number) => {
    bookRef.current?.pageFlip().flip(pageIndex);
    setCurrentPage(pageIndex);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-0 flex-1">
        <HTMLFlipBook
          ref={bookRef as never}
          width={332}
          height={365}
          size="stretch"
          minWidth={180}
          maxWidth={620}
          minHeight={220}
          maxHeight={760}
          drawShadow
          flippingTime={1020}
          maxShadowOpacity={0.52}
          usePortrait
          startZIndex={10}
          autoSize
          clickEventForward
          useMouseEvents
          mobileScrollSupport
          swipeDistance={24}
          showPageCorners
          disableFlipByClick={false}
          showCover={false}
          className="archive-cinematic-flipbook h-full w-full"
          style={{}}
          startPage={0}
          onFlip={(event: { data: number }) => setCurrentPage(event.data)}
        >
          <ArchiveBookPage>
            <div className="relative flex h-full flex-col">
              <p className="font-serif text-[clamp(0.7rem,1vw,0.9rem)] uppercase tracking-[0.18em] text-[#6f4a19]">
                {isLivingArchive ? "The Living Story" : "The Life Story"}
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.18rem,2vw,1.8rem)] leading-tight text-[#211408]">
                {personName}
              </h2>
              <p className="mt-[6%] whitespace-pre-line font-serif text-[clamp(0.74rem,1.12vw,1rem)] leading-relaxed text-[#33210e]">
                {trimArchiveText(biography, 720)}
              </p>
            </div>
          </ArchiveBookPage>

          <ArchiveBookPage>
            <ArchiveTableOfContents
              archiveSlug={archiveSlug}
              chapters={chapters}
              isOwner={isOwner}
              isLivingArchive={isLivingArchive}
              onSelectChapter={flipToPage}
            />
          </ArchiveBookPage>

          {chapters.map((chapter, index) => (
            <ArchiveBookPage key={chapter.id}>
              <ArchiveChapterBookPage
                archiveSlug={archiveSlug}
                chapter={chapter}
                pageNumber={index + 1}
              />
            </ArchiveBookPage>
          ))}
        </HTMLFlipBook>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 text-[0.65rem] uppercase tracking-[0.14em] text-archive-ivory/70">
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip().flipPrev()}
          className="rounded-full border border-archive-gold/25 bg-black/35 px-3 py-1.5 text-archive-ivory transition hover:border-archive-gold hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold"
          aria-label="Turn to previous archive page"
        >
          Prev
        </button>
        <span aria-live="polite">
          {Math.min(currentPage + 1, pageCount)} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip().flipNext()}
          className="rounded-full border border-archive-gold/25 bg-black/35 px-3 py-1.5 text-archive-ivory transition hover:border-archive-gold hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold"
          aria-label="Turn to next archive page"
        >
          Next
        </button>
        <Link
          href={`/archive/${archiveSlug}/memories`}
          className="rounded-full border border-archive-gold/25 bg-black/35 px-3 py-1.5 text-archive-ivory transition hover:border-archive-gold hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold"
        >
          All
        </Link>
      </div>
    </div>
  );
}
