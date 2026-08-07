"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Memory } from "@/lib/types";
import {
  archiveSceneZones,
  getSceneZoneStyle
} from "./archiveSceneLayout";
import {
  archiveTocEntriesPerPage,
  getArchiveTocPageCount,
  getArchiveTocPageItems,
  getMemoryTypeLabel,
  trimArchiveText
} from "./archiveBookModel";

type ArchiveBookSpreadProps = {
  archiveSlug: string;
  personName: string;
  biography: string;
  portraitUrl: string;
  isLivingArchive: boolean;
  isOwner: boolean;
  chapters: Memory[];
  layout?: "desktop" | "mobile";
};

function PageWriting({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative h-full w-full overflow-hidden px-[8%] py-[8%] text-[#211509] ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_34%_18%,rgba(255,246,210,0.13),transparent_38%),linear-gradient(90deg,rgba(28,16,6,0.08),transparent_9%,transparent_91%,rgba(28,16,6,0.08))]" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export function ArchiveBookSpread({
  archiveSlug,
  personName,
  biography,
  portraitUrl,
  isLivingArchive,
  isOwner,
  chapters,
  layout = "desktop"
}: ArchiveBookSpreadProps) {
  const [tocPageIndex, setTocPageIndex] = useState(0);
  const pageCount = useMemo(() => getArchiveTocPageCount(chapters), [chapters]);
  const visibleChapters = useMemo(
    () => getArchiveTocPageItems(chapters, tocPageIndex),
    [chapters, tocPageIndex]
  );
  const firstChapterNumber = tocPageIndex * archiveTocEntriesPerPage + 1;
  const storyEyebrow = isLivingArchive ? "The Living Story" : "In Memory";

  const leftPage = (
    <PageWriting>
      <div className="relative flex h-full flex-col">
        <div className="pointer-events-none absolute bottom-[-8%] right-[-10%] h-[48%] w-[58%] opacity-[0.08] mix-blend-multiply">
          <Image
            src={portraitUrl}
            alt=""
            fill
            sizes="18vw"
            className="object-cover sepia"
            aria-hidden="true"
          />
        </div>
        <p className="font-serif text-[clamp(0.68rem,0.9vw,0.88rem)] uppercase tracking-[0.18em] text-[#6f4a19]">
          {storyEyebrow}
        </p>
        <h2 className="mt-[4%] font-serif text-[clamp(1.16rem,1.75vw,1.68rem)] leading-tight text-[#1e1308]">
          {personName}
        </h2>
        <p
          className="mt-[7%] flex-1 whitespace-pre-line font-serif text-[clamp(0.74rem,1.02vw,0.98rem)] leading-[1.56] text-[#2c1b0b]"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: layout === "mobile" ? 10 : 12,
            overflow: "hidden"
          }}
        >
          {trimArchiveText(biography, layout === "mobile" ? 720 : 900)}
        </p>
      </div>
    </PageWriting>
  );

  const rightPage = (
    <PageWriting className="pl-[7%] pr-[9%]">
      <div className="flex h-full flex-col">
        <p className="font-serif text-[clamp(0.68rem,0.9vw,0.88rem)] uppercase tracking-[0.18em] text-[#6f4a19]">
          Table of Contents
        </p>
        <div className="mt-[6%] min-h-0 flex-1 space-y-[4%] overflow-hidden">
          {chapters.length > 0 ? (
            visibleChapters.map((chapter, index) => (
              <Link
                key={chapter.id}
                href={`/archive/${archiveSlug}/memories/${chapter.id}`}
                className="group grid grid-cols-[2.1rem_1fr_1.1rem] gap-2 border-b border-[#7d571f]/20 pb-[3%] text-left transition duration-200 hover:border-[#8a681f]/55 focus:outline-none focus:ring-2 focus:ring-[#7d571f]/35"
              >
                <span className="font-mono text-[clamp(0.58rem,0.72vw,0.72rem)] text-[#6f4a19]">
                  {String(firstChapterNumber + index).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-serif text-[clamp(0.76rem,1.02vw,0.98rem)] leading-tight text-[#211509] transition duration-200 group-hover:translate-x-1 group-hover:text-archive-gold group-hover:[text-shadow:0_0_12px_rgba(135,104,31,0.18)] motion-reduce:transform-none">
                    {chapter.title}
                  </span>
                  <span className="mt-1 block text-[clamp(0.55rem,0.72vw,0.68rem)] uppercase tracking-[0.13em] text-[#604316]">
                    {getMemoryTypeLabel(chapter.type)}
                    {chapter.date ? ` / ${chapter.date}` : ""}
                  </span>
                  {chapter.content ? (
                    <span className="mt-1 block text-[clamp(0.56rem,0.76vw,0.7rem)] leading-snug text-[#33220f]/75">
                      {trimArchiveText(chapter.content, 84)}
                    </span>
                  ) : null}
                </span>
                <span className="pt-1 text-[#6f4a19] opacity-0 transition duration-200 group-hover:translate-x-1 group-hover:opacity-100 motion-reduce:transform-none">
                  →
                </span>
              </Link>
            ))
          ) : (
            <div className="mt-[14%] text-[clamp(0.76rem,0.96vw,0.92rem)] leading-relaxed text-[#2c1b0b]">
              <p>This archive does not have public chapters yet.</p>
              {isOwner && isLivingArchive ? (
                <Link
                  href={`/archive/${archiveSlug}/add-memory`}
                  className="mt-4 inline-flex font-semibold text-[#6f4a19] underline decoration-[#6f4a19]/30 underline-offset-4"
                >
                  Add your first chapter
                </Link>
              ) : null}
            </div>
          )}
        </div>

        {pageCount > 1 ? (
          <div className="mt-[5%] flex items-center justify-center gap-3 border-t border-[#7d571f]/20 pt-[4%] font-serif text-[clamp(0.64rem,0.78vw,0.76rem)] uppercase tracking-[0.14em] text-[#5d3f13]">
            <button
              type="button"
              onClick={() => setTocPageIndex((value) => Math.max(0, value - 1))}
              disabled={tocPageIndex === 0}
              className="px-2 transition hover:text-archive-gold disabled:opacity-35"
              aria-label="Show previous table of contents page"
            >
              ‹
            </button>
            <span>{tocPageIndex + 1} / {pageCount}</span>
            <button
              type="button"
              onClick={() => setTocPageIndex((value) => Math.min(pageCount - 1, value + 1))}
              disabled={tocPageIndex >= pageCount - 1}
              className="px-2 transition hover:text-archive-gold disabled:opacity-35"
              aria-label="Show next table of contents page"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </PageWriting>
  );

  if (layout === "mobile") {
    return (
      <div className="grid gap-4">
        <div className="min-h-[24rem] overflow-hidden rounded-sm bg-[#d8bd83]/10">{leftPage}</div>
        <div className="min-h-[28rem] overflow-hidden rounded-sm bg-[#d8bd83]/10">{rightPage}</div>
      </div>
    );
  }

  return (
    <>
      <div className="absolute" style={getSceneZoneStyle(archiveSceneZones.leftBookPage)}>
        {leftPage}
      </div>
      <div className="absolute" style={getSceneZoneStyle(archiveSceneZones.rightBookPage)}>
        {rightPage}
      </div>
    </>
  );
}
