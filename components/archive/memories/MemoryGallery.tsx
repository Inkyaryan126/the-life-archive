"use client";

import { useState } from "react";
import Link from "next/link";
import type { Memory, MemoryType } from "@/lib/types";
import { MemoryObject } from "./MemoryObject";

type FilterCategory = "all" | "photo" | "voice" | "journal" | "video" | "song" | "lesson";

type MemoryGalleryProps = {
  archiveSlug: string;
  personName: string;
  memories: Memory[];
  isOwner: boolean;
  initialTypeFilter?: MemoryType | null;
  createdSuccess?: boolean;
  deletedSuccess?: boolean;
  deleteError?: boolean;
};

const filterTabs: Array<{ id: FilterCategory; label: string }> = [
  { id: "all", label: "ALL" },
  { id: "photo", label: "PHOTOS" },
  { id: "voice", label: "VOICE & SOUND" },
  { id: "journal", label: "JOURNALS" },
  { id: "video", label: "VIDEOS" },
  { id: "song", label: "SONGS" },
  { id: "lesson", label: "LIFE LESSONS" }
];

export function MemoryGallery({
  archiveSlug,
  personName,
  memories,
  isOwner,
  initialTypeFilter,
  createdSuccess,
  deletedSuccess,
  deleteError
}: MemoryGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>(
    initialTypeFilter && filterTabs.some((t) => t.id === initialTypeFilter)
      ? (initialTypeFilter as FilterCategory)
      : "all"
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Filter memories
  const filteredMemories = memories.filter((m) => {
    if (activeFilter === "all") return true;
    return m.type === activeFilter;
  });

  // Sort memories by date
  const sortedMemories = [...filteredMemories].sort((a, b) => {
    const timeA = new Date(a.date || 0).getTime();
    const timeB = new Date(b.date || 0).getTime();
    return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
  });

  const activeAddHref = `/dashboard?archive=${encodeURIComponent(archiveSlug)}`;

  return (
    <div className="w-full">
      {/* 1. ARCHIVE GALLERY TOP HEADER */}
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-archive-gold/20 pb-8">
        <div>
          <nav className="mb-3">
            <Link
              href={`/archive/${archiveSlug}`}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold/80 transition hover:text-archive-gold"
            >
              ← Back to Archive
            </Link>
          </nav>
          <h1 className="font-serif text-3xl sm:text-5xl text-archive-ivory leading-tight">
            {personName}
          </h1>
          <p className="mt-1.5 font-serif text-sm italic uppercase tracking-[0.24em] text-archive-champagne/90">
            The Preserved Memories
          </p>
        </div>

        {isOwner ? (
          <div className="shrink-0">
            <Link
              href={activeAddHref}
              className="inline-flex items-center gap-2 rounded-full bg-archive-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              <span>+ Preserve Another Memory</span>
            </Link>
          </div>
        ) : null}
      </header>

      {/* 2. SUCCESS / ALERT MESSAGES */}
      {createdSuccess && (
        <div className="mb-8 rounded-2xl border border-archive-gold/40 bg-archive-gold/10 p-5 text-archive-ivory shadow-luxury flex items-center justify-between gap-4">
          <div>
            <p className="font-serif text-lg text-archive-gold font-bold">A new chapter has been preserved</p>
            <p className="text-sm text-archive-ivory/80">This memory is now part of the sanctuary and ready to be revisited.</p>
          </div>
        </div>
      )}

      {deletedSuccess && (
        <div className="mb-8 rounded-2xl border border-archive-gold/40 bg-archive-gold/10 p-5 text-archive-ivory shadow-luxury">
          <p className="font-serif text-lg text-archive-champagne font-bold">Memory returned to silence</p>
          <p className="text-sm text-archive-ivory/80">The chapter has been successfully removed from this archive display.</p>
        </div>
      )}

      {deleteError && (
        <div className="mb-8 rounded-2xl border border-archive-clay/40 bg-archive-clay/15 p-5 text-archive-clay font-medium shadow-luxury">
          We could not delete this memory. Please try again.
        </div>
      )}

      {/* 3. FILTER TABS & SORT CONTROLS */}
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                activeFilter === tab.id
                  ? "bg-archive-gold text-archive-obsidian shadow-luxury"
                  : "border border-archive-gold/25 bg-black/40 text-archive-ivory/70 hover:border-archive-gold/50 hover:text-archive-ivory"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold/70">
            Sort:
          </span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="rounded-full border border-archive-gold/30 bg-archive-obsidian px-4 py-2 text-xs font-semibold text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-2"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* 4. MUSEUM COLLECTION GRID */}
      {sortedMemories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
          {sortedMemories.map((memory) => (
            <MemoryObject key={memory.id} memory={memory} archiveSlug={archiveSlug} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="my-16 rounded-[2.5rem] border border-archive-gold/20 bg-archive-obsidian/90 p-12 text-center shadow-luxury max-w-xl mx-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-archive-gold/30 bg-archive-gold/10 text-archive-gold mb-4">
            <span className="text-2xl">◇</span>
          </div>
          <h2 className="font-serif text-2xl text-archive-ivory sm:text-3xl">
            {activeFilter === "all"
              ? "No preserved memories yet"
              : `No ${filterTabs.find((t) => t.id === activeFilter)?.label.toLowerCase()} in this section`}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-archive-ivory/65">
            {activeFilter === "all"
              ? "Start with one photo, voice recording, journal entry, or life lesson. Every preserved memory becomes part of what remains."
              : "No memories have been added to this category yet."}
          </p>

          {isOwner ? (
            <div className="mt-8">
              <Link
                href={activeAddHref}
                className="inline-flex rounded-full bg-archive-gold px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
              >
                + Preserve First Memory
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
