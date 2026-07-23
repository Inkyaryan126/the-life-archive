"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, PlusIcon } from "@/components/dashboard/MobileDashboardIcons";
import type { Memory } from "@/lib/types";

export type MobileDashboardArchive = {
  slug: string;
  archiveName: string;
  personName: string;
  memorialMode?: boolean | null;
};

function formatStatNumber(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function MobileActiveArchiveCard({
  activeArchive,
  memories
}: {
  activeArchive: MobileDashboardArchive;
  memories: Memory[];
}) {
  const isMemorial = Boolean(activeArchive.memorialMode);
  const archiveTypeLabel = isMemorial ? "Memorial Archive" : "Living Archive";
  const archiveSubtitle = `${activeArchive.personName} · ${archiveTypeLabel}`;

  // Stat counts
  const totalCount = memories.length;
  const voiceCount = memories.filter((m) => m.type === "voice").length;
  const photoCount = memories.filter((m) => m.type === "photo").length;
  const videoCount = memories.filter((m) => m.type === "video").length;
  const writingCount = memories.filter(
    (m) => m.type === "journal" || m.type === "lesson"
  ).length;
  const songCount = memories.filter((m) => m.type === "song").length;

  const stats = [
    { label: "TOTAL", count: totalCount },
    { label: "VOICE", count: voiceCount },
    { label: "PHOTOS", count: photoCount },
    { label: "VIDEOS", count: videoCount },
    { label: "WRITING", count: writingCount },
    { label: "SONGS", count: songCount }
  ];

  const openArchiveHref = `/archive/${activeArchive.slug}`;
  const addMemoryHref = `/archive/${activeArchive.slug}/add-memory`;

  return (
    <section className="relative w-full max-w-full overflow-hidden rounded-3xl border border-[#c9a45c]/35 bg-[#0a0908]/85 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl box-border">
      {/* Top Header Row with Title & Emblem */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a45c]">
              ACTIVE ARCHIVE
            </span>
            {totalCount <= 2 ? (
              <span className="rounded-full border border-[#c9a45c]/40 bg-[#c9a45c]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#e8cf88]">
                NEW
              </span>
            ) : null}
          </div>

          <h2 className="mt-1.5 font-serif text-xl sm:text-2xl font-normal leading-tight text-[#f7f1e5] break-words">
            {activeArchive.archiveName}
          </h2>

          <p className="mt-1 text-xs text-[#c9a45c]/80 truncate">
            {archiveSubtitle}
          </p>
        </div>

        {/* Circular Gold Crest Emblem */}
        <div className="relative shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#c9a45c]/45 bg-gradient-to-b from-[#1c1813] via-[#120f0c] to-[#0a0908] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            <Image
              src="/images/site-design/book-logo.png"
              alt="Archive Seal"
              width={40}
              height={40}
              className="h-full w-full object-contain filter drop-shadow-[0_2px_4px_rgba(202,164,92,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-[#c9a45c]/20" />

      {/* Stats Grid Row */}
      <div className="grid grid-cols-6 gap-1 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center min-w-0">
            <span className="font-serif text-base sm:text-lg font-normal text-[#f7f1e5]">
              {formatStatNumber(stat.count)}
            </span>
            <span className="mt-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.12em] text-[#c9a45c]/75 truncate max-w-full">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-[#c9a45c]/20" />

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Link
          href={openArchiveHref}
          className="flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#c9a45c] via-[#e8cf88] to-[#c9a45c] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#0a0908] shadow-[0_4px_16px_rgba(202,164,92,0.3)] transition transform active:scale-98 hover:brightness-110"
        >
          <span>OPEN ARCHIVE</span>
          <ArrowRightIcon className="h-4 w-4 stroke-[2.5]" />
        </Link>

        <Link
          href={addMemoryHref}
          className="flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-[#c9a45c]/50 bg-black/50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#e8cf88] transition transform active:scale-98 hover:bg-[#c9a45c]/10 hover:border-[#c9a45c]"
        >
          <span>ADD MEMORY</span>
          <PlusIcon className="h-4 w-4 stroke-[2.5]" />
        </Link>
      </div>
    </section>
  );
}
