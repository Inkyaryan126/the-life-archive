"use client";

import { useState } from "react";
import type { RecentSiteVisit } from "@/lib/site-visit-utils";
import {
  formatVisitorAnalyticsDateTime,
  formatVisitorAnalyticsRelativeTime
} from "@/lib/site-visit-utils";

type AdminVisitorStreamProps = {
  visits: RecentSiteVisit[];
  currentAdminEmail?: string | null;
  currentAdminName?: string | null;
};

export function AdminVisitorStream({
  visits,
  currentAdminEmail,
  currentAdminName
}: AdminVisitorStreamProps) {
  const [filter, setFilter] = useState<"all" | "multipage" | "members" | "you">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredVisits = visits.filter((visit) => {
    // 1. Category Filter
    if (filter === "multipage" && !visit.isMultiPage && visit.journeySteps.length <= 1) {
      return false;
    }
    if (filter === "members" && !visit.userEmail) {
      return false;
    }
    if (filter === "you" && !visit.isCurrentUser) {
      return false;
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPath = visit.path.toLowerCase().includes(q);
      const matchName = visit.visitorDisplayName.toLowerCase().includes(q);
      const matchLoc = visit.location.toLowerCase().includes(q);
      const matchEmail = (visit.userEmail || "").toLowerCase().includes(q);
      const matchBrowser = visit.browser.toLowerCase().includes(q);
      return matchPath || matchName || matchLoc || matchEmail || matchBrowser;
    }

    return true;
  });

  const multiPageCount = visits.filter(
    (v) => v.isMultiPage || v.journeySteps.length > 1
  ).length;
  const membersCount = visits.filter((v) => Boolean(v.userEmail)).length;
  const youCount = visits.filter((v) => v.isCurrentUser).length;

  return (
    <section className="rounded-3xl border border-archive-gold/22 bg-[#171511]/90 p-6 shadow-luxury backdrop-blur-md sm:p-8">
      {/* Header & Live Pulse */}
      <div className="flex flex-col gap-4 border-b border-archive-gold/15 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-archive-gold">
              Live Visitor Movement Radar
            </p>
          </div>
          <h2 className="mt-2 font-serif text-3xl text-archive-ivory sm:text-4xl">
            Real-Time Site Activity & Journeys
          </h2>
          <p className="mt-1 text-xs leading-6 text-archive-ivory/60">
            Track visitors as they move across pages, measure page durations, and identify signed-in members.
          </p>
        </div>

        {/* Live Status Summary Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-200 shadow-soft">
            ● Active Stream
          </span>
          <span className="rounded-full border border-archive-gold/30 bg-archive-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-archive-gold shadow-soft">
            {visits.length} Human Sessions Recorded
          </span>
        </div>
      </div>

      {/* Control Toolbar: Filter Tabs + Search */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === "all"
                ? "bg-archive-gold text-archive-obsidian shadow-soft"
                : "border border-archive-gold/20 bg-white/[0.03] text-archive-ivory/80 hover:bg-white/[0.08]"
            }`}
          >
            All Activity ({visits.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("multipage")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === "multipage"
                ? "bg-archive-gold text-archive-obsidian shadow-soft"
                : "border border-archive-gold/20 bg-white/[0.03] text-archive-ivory/80 hover:bg-white/[0.08]"
            }`}
          >
            🔥 Multi-Page ({multiPageCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("members")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === "members"
                ? "bg-sky-400 text-archive-obsidian shadow-soft"
                : "border border-sky-400/20 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20"
            }`}
          >
            👤 Members ({membersCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("you")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === "you"
                ? "bg-amber-400 text-archive-obsidian shadow-soft"
                : "border border-amber-400/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20"
            }`}
          >
            ★ You ({youCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full max-w-xs sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search path, location, visitor..."
            className="w-full rounded-xl border border-archive-gold/25 bg-archive-obsidian px-4 py-2 text-xs text-archive-ivory placeholder-archive-ivory/40 outline-none focus:border-archive-gold focus:ring-1 focus:ring-archive-gold"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2 text-xs text-archive-ivory/50 hover:text-archive-ivory"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {/* Visitor Journey Stream Feed */}
      <div className="mt-6 grid gap-4">
        {filteredVisits.length > 0 ? (
          filteredVisits.map((visit) => {
            const isExpanded = expandedId === visit.id;
            const steps = visit.journeySteps && visit.journeySteps.length > 0
              ? visit.journeySteps
              : [
                  {
                    id: visit.id,
                    path: visit.path,
                    createdAt: visit.createdAt,
                    durationMs: null,
                    durationFormatted: "Active / Current page"
                  }
                ];
            const hasMultipleSteps = steps.length > 1;

            return (
              <article
                key={visit.id}
                className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                  visit.isCurrentUser
                    ? "border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-archive-obsidian to-archive-obsidian/80 shadow-luxury"
                    : visit.userEmail
                      ? "border-sky-400/30 bg-sky-950/20"
                      : "border-archive-gold/16 bg-white/[0.025] hover:border-archive-gold/35"
                }`}
              >
                {/* Main Row Information */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-2">
                    {/* Visitor Identity & Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {visit.isCurrentUser ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-400/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-200 shadow-soft">
                          ★ YOU ({currentAdminName || "Owner"})
                        </span>
                      ) : visit.userEmail ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-200">
                          👤 MEMBER
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-archive-gold/25 bg-archive-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-archive-champagne">
                          🌐 GUEST
                        </span>
                      )}

                      {visit.visitorStatus === "returning" ? (
                        <span className="rounded-full border border-sky-300/30 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-200">
                          Returning Visitor
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                          New Visitor
                        </span>
                      )}

                      {hasMultipleSteps ? (
                        <span className="rounded-full border border-archive-gold/40 bg-archive-gold/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-archive-gold animate-pulse">
                          🔥 {steps.length} Pages Visited
                        </span>
                      ) : null}
                    </div>

                    {/* Display Name & Email */}
                    <div>
                      <h3 className="font-serif text-xl font-medium text-archive-ivory sm:text-2xl">
                        {visit.visitorDisplayName}
                      </h3>
                      {visit.userEmail ? (
                        <p className="text-xs text-archive-champagne/90">
                          {visit.userEmail}
                        </p>
                      ) : null}
                    </div>

                    {/* Real Resolved Location */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-archive-ivory/65">
                      <span className="inline-flex items-center gap-1 font-semibold text-archive-gold/90">
                        📍 {visit.location}
                      </span>
                      <span>•</span>
                      <span>
                        {visit.deviceType.toUpperCase()} · {visit.browser}
                      </span>
                      <span>•</span>
                      <span className="text-archive-ivory/50">
                        Ref: {visit.referrerSource}
                      </span>
                    </div>
                  </div>

                  {/* Right Action & Page Info */}
                  <div className="flex flex-col gap-2 lg:items-end">
                    <div className="text-left lg:text-right">
                      <p className="font-mono text-xs font-bold text-archive-gold">
                        {formatVisitorAnalyticsRelativeTime(visit.createdAt)}
                      </p>
                      <p className="text-[11px] text-archive-ivory/48">
                        {formatVisitorAnalyticsDateTime(visit.createdAt)}
                      </p>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-archive-gold/20 bg-black/40 px-3 py-1 font-mono text-xs text-archive-champagne">
                        Current: {visit.path}
                      </span>
                      {hasMultipleSteps ? (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : visit.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-archive-gold/30 bg-archive-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-archive-gold hover:bg-archive-gold hover:text-archive-obsidian transition"
                        >
                          {isExpanded ? "Hide Journey ▲" : "View Journey Flow ▼"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Visitor Movement Journey Visualizer */}
                {isExpanded || hasMultipleSteps ? (
                  <div className="mt-5 border-t border-archive-gold/15 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-archive-gold">
                        Visitor Navigation Journey Path ({steps.length} Steps · Total: {visit.totalSessionDurationFormatted})
                      </p>
                      <span className="text-[10px] text-archive-ivory/50">
                        First Seen: {formatVisitorAnalyticsRelativeTime(visit.firstSeenAt || visit.createdAt)}
                      </span>
                    </div>

                    {/* Horizontal/Vertical Step Flow Nodes */}
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {steps.map((step, idx) => (
                        <div
                          key={step.id}
                          className="relative flex flex-col justify-between rounded-xl border border-archive-gold/18 bg-black/50 p-3 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-full bg-archive-gold/20 px-2 py-0.5 font-mono text-[10px] font-bold text-archive-gold">
                              Step #{idx + 1}
                            </span>
                            <span className="font-mono text-[11px] text-archive-ivory/50">
                              {formatVisitorAnalyticsDateTime(step.createdAt)}
                            </span>
                          </div>

                          <p className="mt-2 break-all font-mono font-semibold text-archive-champagne">
                            {step.path}
                          </p>

                          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px]">
                            <span className="text-archive-ivory/60">Time on page:</span>
                            <span
                              className={`font-bold ${
                                step.durationMs !== null
                                  ? "text-emerald-300"
                                  : "text-archive-gold animate-pulse"
                              }`}
                            >
                              ⏱️ {step.durationFormatted}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-archive-gold/15 bg-black/30 p-8 text-center">
            <p className="font-serif text-lg text-archive-ivory/70">
              No matching visitor activity found.
            </p>
            <p className="mt-2 text-xs text-archive-ivory/50">
              Try adjusting your filter tabs or search query.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
