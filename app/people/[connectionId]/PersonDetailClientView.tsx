"use client";

import { useState } from "react";
import Link from "next/link";
import { RecipientHub } from "@/components/keepsakes/RecipientHub";
import { publishGiftConnectionAction } from "@/app/create/gift/actions";
import type { PersonDetailView } from "@/lib/tla2-people-dashboard";

export function PersonDetailClientView({ detail }: { detail: PersonDetailView }) {
  const { connection, memories: initialMemories, timeCapsules, keepsakes } = detail;
  const [memories, setMemories] = useState(initialMemories);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishedSuccessMessage, setPublishedSuccessMessage] = useState<string>("");

  const handlePublishDrafts = async () => {
    setIsPublishing(true);
    setPublishedSuccessMessage("");
    try {
      const res = await publishGiftConnectionAction(connection.id);
      if (res.ok) {
        setMemories((prev) =>
          prev.map((m) => ({ ...m, accessStatus: "released" as const }))
        );
        setPublishedSuccessMessage(`Published ${res.releasedCount} draft message${res.releasedCount !== 1 ? "s" : ""} to recipient experience.`);
      }
    } catch {
      // Non-blocking
    } finally {
      setIsPublishing(false);
    }
  };

  const draftCount = memories.filter((m) => m.accessStatus === "restricted").length;
  const releasedCount = memories.filter((m) => m.accessStatus === "released").length;

  return (
    <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-[#c5a059]/30 bg-white/[0.035] p-6 shadow-luxury backdrop-blur-md sm:p-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#c5a059]/20 font-serif text-2xl font-bold text-[#c5a059]">
              {connection.personName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-3xl font-normal text-[#fdfbf7] sm:text-4xl">
                  {connection.personName}
                </h1>
                <span className="rounded-full bg-[#c5a059]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#c5a059]">
                  {connection.relationshipType}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#fdfbf7]/65">
                Control Center &bull; Last updated {new Date(connection.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#c5a059]/40 bg-white/[0.04] px-5 text-xs font-semibold text-[#fdfbf7] hover:border-[#c5a059] hover:bg-white/[0.08]"
            >
              👁️ Preview What {connection.personName} Sees
            </button>
            <Link
              href={`/create/gift?connectionId=${connection.id}&name=${encodeURIComponent(connection.personName)}&rel=${connection.relationshipType}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#c5a059] px-5 text-xs font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37]"
            >
              + Add Something for {connection.personName}
            </Link>
          </div>
        </div>

        {/* Summary Metric Bar */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#c5a059]/15 pt-6 sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#c5a059]">Released Messages</p>
            <p className="font-serif text-2xl font-medium text-[#fdfbf7]">{releasedCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#c5a059]">Draft Messages</p>
            <p className="font-serif text-2xl font-medium text-[#fdfbf7]">{draftCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#c5a059]">Future Surprises</p>
            <p className="font-serif text-2xl font-medium text-[#c5a059]">{timeCapsules.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#c5a059]">Keepsake Status</p>
            <p className="font-serif text-sm font-medium text-[#fdfbf7]/90">{connection.keepsakeStatus}</p>
          </div>
        </div>
      </div>

      {publishedSuccessMessage ? (
        <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-center text-sm font-medium text-emerald-200">
          ✨ {publishedSuccessMessage}
        </div>
      ) : null}

      {/* Main Content Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Messages & Memories List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-4">
            <div>
              <h2 className="font-serif text-2xl font-normal text-[#fdfbf7]">
                Messages &amp; Recordings
              </h2>
              <p className="text-xs text-[#fdfbf7]/65">
                {memories.length} message{memories.length !== 1 ? "s" : ""} saved for {connection.personName}
              </p>
            </div>

            {draftCount > 0 ? (
              <button
                onClick={handlePublishDrafts}
                disabled={isPublishing}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#c5a059] px-4 text-xs font-bold text-[#0a0806] hover:bg-[#d4af37] disabled:opacity-50"
              >
                {isPublishing ? "Publishing..." : `Publish ${draftCount} Draft${draftCount !== 1 ? "s" : ""}`}
              </button>
            ) : null}
          </div>

          {memories.length === 0 ? (
            <div className="rounded-3xl border border-[#c5a059]/20 bg-white/[0.02] p-8 text-center">
              <span className="text-3xl">🎙️</span>
              <h3 className="mt-3 font-serif text-lg text-[#fdfbf7]">No messages saved yet</h3>
              <p className="mt-1 text-xs text-[#fdfbf7]/65">
                Leave a voice note, story, advice, or joke for {connection.personName}.
              </p>
              <Link
                href="/create/gift"
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#c5a059] px-5 text-xs font-bold text-[#0a0806]"
              >
                + Add First Message
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-medium text-[#fdfbf7]">
                      {mem.title}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        mem.accessStatus === "released"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {mem.accessStatus === "released" ? "RELEASED" : "DRAFT"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-[#fdfbf7]/75">
                    {mem.content}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    {mem.categories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-md border border-[#c5a059]/20 bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-[#c5a059]"
                      >
                        #{cat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Future Surprises & Keepsakes */}
        <div className="space-y-6">
          {/* Future Surprises Card */}
          <div className="rounded-3xl border border-[#c5a059]/20 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-3">
              <h3 className="font-serif text-lg font-medium text-[#fdfbf7]">Future Surprises</h3>
              <span className="text-xl">⏳</span>
            </div>

            {timeCapsules.length === 0 ? (
              <p className="mt-3 text-xs text-[#fdfbf7]/65">
                No future messages scheduled yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {timeCapsules.map((tc) => (
                  <div
                    key={tc.id}
                    className="rounded-xl border border-[#c5a059]/15 bg-black/40 p-3"
                  >
                    <p className="font-serif text-xs font-medium text-[#fdfbf7]">{tc.title}</p>
                    <p className="mt-0.5 text-[10px] text-[#c5a059]">
                      Unlocks {new Date(tc.deliverAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Link
              href={`/dashboard/time-capsules/new?connectionId=${connection.id}&archiveId=${connection.archiveId}&name=${encodeURIComponent(connection.personName)}`}
              className="mt-4 inline-flex min-h-9 w-full items-center justify-center rounded-full border border-[#c5a059]/30 bg-white/[0.04] text-xs font-semibold text-[#fdfbf7] hover:bg-white/[0.08]"
            >
              + Leave Something for Later
            </Link>
          </div>

          {/* Keepsakes Connected Card */}
          <div className="rounded-3xl border border-[#c5a059]/20 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-3">
              <h3 className="font-serif text-lg font-medium text-[#fdfbf7]">Physical Keepsakes</h3>
              <span className="text-xl">🎁</span>
            </div>

            {keepsakes.length === 0 ? (
              <div className="mt-3">
                <p className="text-xs text-[#fdfbf7]/65">
                  No physical keepsake connected to {connection.personName} yet.
                </p>
                <Link
                  href={`/keepsakes?connectionId=${connection.id}&name=${encodeURIComponent(connection.personName)}`}
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-[#c5a059] text-xs font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37]"
                >
                  Give {connection.personName} Something to Carry &rarr;
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {keepsakes.map((k) => (
                  <div
                    key={k.id}
                    className="rounded-xl border border-[#c5a059]/20 bg-black/40 p-3"
                  >
                    <p className="font-serif text-xs font-medium text-[#fdfbf7]">{k.title}</p>
                    <p className="mt-0.5 text-[10px] text-[#c5a059]">Code: {k.keepsakeCode}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Owner Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#c5a059]/30 bg-[#0a0806] p-6 shadow-luxury">
            <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c5a059]">
                  Preview &mdash; What {connection.personName} sees
                </span>
                <p className="text-[10px] text-[#fdfbf7]/60">
                  Your unpublished draft messages are included in this preview.
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-xs text-[#fdfbf7]/70 hover:text-white"
              >
                Close Preview &times;
              </button>
            </div>

            <RecipientHub
              personName={connection.personName}
              relationshipType={connection.relationshipType}
              subjectStatus={connection.subjectStatus}
              memories={memories.map((m) => ({
                id: m.id,
                title: m.title,
                type: m.type,
                content: m.content,
                mediaUrl: m.mediaUrl ?? null,
                date: m.date ?? null,
                categories: m.categories
              }))}
              timeCapsules={timeCapsules.map((tc) => ({
                id: tc.id,
                title: tc.title,
                deliverAt: tc.deliverAt,
                visibility: "teaser" as const,
                unlockMessage: "Unlocks soon"
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
