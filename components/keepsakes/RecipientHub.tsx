"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import type {
  ResolvedGuestMemory,
  ResolvedTimeCapsuleTeaser
} from "@/lib/tla2-foundation";

type RecipientHubProps = {
  personName: string;
  relationshipType: string;
  subjectStatus: string;
  memories: ResolvedGuestMemory[];
  timeCapsules: ResolvedTimeCapsuleTeaser[];
};

type CategoryOption = {
  slug: string;
  label: string;
  icon: string;
  description: string;
};

const CATEGORIES: CategoryOption[] = [
  {
    slug: "miss_you",
    label: "I Miss You",
    icon: "💖",
    description: "Messages to listen to when you miss me"
  },
  {
    slug: "bad_day",
    label: "Bad Day",
    icon: "☀️",
    description: "Encouragement when things are hard"
  },
  {
    slug: "love",
    label: "Tell Me You Love Me",
    icon: "✨",
    description: "Reminders of how deeply you are loved"
  },
  {
    slug: "make_me_laugh",
    label: "Make Me Laugh",
    icon: "😄",
    description: "Stories, jokes, and lighthearted moments"
  },
  {
    slug: "advice",
    label: "I Need Advice",
    icon: "🧭",
    description: "Wisdom and guidance for big moments"
  },
  {
    slug: "surprise",
    label: "Surprise Me",
    icon: "🎲",
    description: "An unexpected story or note chosen for you"
  }
];

export function RecipientHub({
  personName,
  relationshipType,
  subjectStatus,
  memories,
  timeCapsules
}: RecipientHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeMemoryIndex, setActiveMemoryIndex] = useState<number>(0);

  // Filter memories matching selected category or random surprise
  const categoryMemories = useMemo(() => {
    if (!selectedCategory) return [];

    if (selectedCategory === "surprise") {
      return [...memories].sort(() => 0.5 - Math.random());
    }

    return memories.filter((m) =>
      m.categories && m.categories.length > 0
        ? m.categories.includes(selectedCategory)
        : true
    );
  }, [selectedCategory, memories]);

  const activeMemory = categoryMemories[activeMemoryIndex] ?? null;

  const handleSelectCategory = (slug: string) => {
    setSelectedCategory(slug);
    setActiveMemoryIndex(0);
  };

  const handleNextMemory = () => {
    if (categoryMemories.length > 1) {
      setActiveMemoryIndex((prev) => (prev + 1) % categoryMemories.length);
    }
  };

  const currentCategoryObj = CATEGORIES.find((c) => c.slug === selectedCategory);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 text-[#fdfbf7]">
      {/* Recipient Header */}
      <header className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#c5a059]/40 bg-white/[0.04] text-3xl shadow-luxury backdrop-blur-md">
          <span className="font-serif font-bold text-[#c5a059]">
            {personName.charAt(0).toUpperCase()}
          </span>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#c5a059]">
          FROM THE KEEPSAKE OF
        </p>
        <h1 className="mt-1 font-serif text-3xl font-normal tracking-wide text-[#fdfbf7] sm:text-4xl">
          {personName}
        </h1>
        <p className="mt-1 text-xs text-[#fdfbf7]/60">
          {relationshipType !== "other" ? relationshipType.toUpperCase() : "PERSONAL KEEPSAKE"}
          {subjectStatus === "memorial" ? " • IN LOVING MEMORY" : ""}
        </p>
      </header>

      {/* Screen 1: Primary Need Selection */}
      {!selectedCategory ? (
        <main className="mt-10 space-y-8">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-normal text-[#fdfbf7] sm:text-3xl">
              What do you need right now?
            </h2>
            <p className="mt-2 text-sm text-[#fdfbf7]/65">
              Choose a feeling to unlock a message.
            </p>
          </div>

          {/* Emotional Need Category Cards */}
          <div className="grid gap-3.5 sm:gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleSelectCategory(cat.slug)}
                className="group relative flex items-center justify-between rounded-2xl border border-[#c5a059]/20 bg-white/[0.035] p-4 text-left shadow-luxury backdrop-blur-md transition-all hover:border-[#c5a059]/50 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-[#c5a059]/40 sm:p-5"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#c5a059]/15 bg-white/[0.04] text-2xl transition group-hover:scale-105">
                    {cat.icon}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#fdfbf7] group-hover:text-[#c5a059]">
                      {cat.label}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#fdfbf7]/60">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <span className="text-lg text-[#c5a059]/50 transition group-hover:translate-x-1 group-hover:text-[#c5a059]">
                  &rarr;
                </span>
              </button>
            ))}
          </div>

          {/* Time Capsules / Future Messages Section */}
          {timeCapsules.length > 0 ? (
            <section className="mt-10 border-t border-[#c5a059]/18 pt-8">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏳</span>
                <h3 className="font-serif text-xl text-[#fdfbf7]">
                  Future Messages
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#fdfbf7]/60">
                Messages scheduled to unlock on special future dates.
              </p>

              <div className="mt-4 space-y-3">
                {timeCapsules.map((tc) => {
                  const unlockDate = new Date(tc.deliverAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  });

                  return (
                    <div
                      key={tc.id}
                      className="rounded-2xl border border-[#c5a059]/15 bg-white/[0.025] p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-serif text-base text-[#fdfbf7]">
                            {tc.title ?? "A Future Message"}
                          </p>
                          <p className="mt-1 text-xs font-semibold tracking-wider text-[#c5a059] uppercase">
                            Unlocks on {unlockDate}
                          </p>
                        </div>
                        <span className="rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 px-3 py-1 text-xs font-medium text-[#c5a059]">
                          Locked
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </main>
      ) : (
        /* Screen 2: Single Focused Memory Viewer */
        <main className="mt-8">
          {/* Top Category Header & Back Button */}
          <div className="flex items-center justify-between border-b border-[#c5a059]/18 pb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c5a059] transition hover:text-[#fdfbf7]"
            >
              &larr; All Choices
            </button>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#fdfbf7]/60">
              {currentCategoryObj?.label}
            </span>
          </div>

          {activeMemory ? (
            <article className="mt-6 rounded-3xl border border-[#c5a059]/25 bg-white/[0.04] p-6 shadow-luxury backdrop-blur-md sm:p-8">
              <header className="border-b border-[#c5a059]/15 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c5a059]">
                  {activeMemory.type}
                  {activeMemory.date ? ` • ${activeMemory.date}` : ""}
                </span>
                <h2 className="mt-2 font-serif text-2xl font-normal leading-tight text-[#fdfbf7] sm:text-3xl">
                  {activeMemory.title}
                </h2>
              </header>

              {/* Memory Media / Audio / Video / Journal Content */}
              <div className="mt-6">
                {activeMemory.type === "voice" ||
                (activeMemory.mediaUrl &&
                  (activeMemory.mediaUrl.endsWith(".mp3") ||
                    activeMemory.mediaUrl.endsWith(".m4a") ||
                    activeMemory.mediaUrl.endsWith(".wav"))) ? (
                  <div className="rounded-2xl border border-[#c5a059]/20 bg-black/40 p-4 text-center">
                    <div className="mb-3 flex justify-center text-3xl">🎙️</div>
                    <audio controls src={activeMemory.mediaUrl ?? undefined} className="w-full" />
                  </div>
                ) : activeMemory.type === "video" && activeMemory.mediaUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-[#c5a059]/20 bg-black/50">
                    <video controls src={activeMemory.mediaUrl} className="max-h-[420px] w-full" />
                  </div>
                ) : activeMemory.mediaUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-[#c5a059]/20 bg-black/40">
                    <Image
                      src={activeMemory.mediaUrl}
                      alt={activeMemory.title}
                      width={800}
                      height={600}
                      unoptimized
                      className="h-auto max-h-[450px] w-full object-contain"
                    />
                  </div>
                ) : null}

                {activeMemory.content ? (
                  <p className="mt-6 whitespace-pre-wrap font-serif text-base leading-relaxed text-[#fdfbf7]/90 sm:text-lg">
                    {activeMemory.content}
                  </p>
                ) : null}
              </div>

              {/* Actions Footer */}
              <footer className="mt-8 flex flex-col gap-3 border-t border-[#c5a059]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                {categoryMemories.length > 1 ? (
                  <button
                    onClick={handleNextMemory}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#c5a059] px-6 text-sm font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37] sm:w-auto"
                  >
                    Another One &rarr;
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={() => setSelectedCategory(null)}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#c5a059]/35 bg-white/[0.04] px-6 text-sm font-semibold text-[#fdfbf7] transition hover:bg-white/[0.08] sm:w-auto"
                >
                  Explore Other Choices
                </button>
              </footer>
            </article>
          ) : (
            /* Empty State */
            <div className="mt-8 rounded-3xl border border-[#c5a059]/18 bg-white/[0.03] p-8 text-center backdrop-blur-md">
              <span className="text-3xl">💌</span>
              <h3 className="mt-3 font-serif text-xl text-[#fdfbf7]">
                No messages in this category yet
              </h3>
              <p className="mt-2 text-sm text-[#fdfbf7]/65">
                Select another choice to connect with {personName}.
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#c5a059] px-6 text-sm font-bold text-[#0a0806] transition hover:bg-[#d4af37]"
              >
                Back to Choices
              </button>
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="mt-14 text-center text-xs text-[#fdfbf7]/40">
        <p>The Life Archive &bull; Connected via Physical Keepsake</p>
      </footer>
    </div>
  );
}
