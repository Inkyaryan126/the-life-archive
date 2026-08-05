"use client";

import { useState } from "react";
import type { VisitorProfileGroup, VisitorSessionGroup } from "@/lib/site-visit-utils";
import { formatVisitorAnalyticsDateTime, formatVisitorAnalyticsRelativeTime } from "@/lib/site-visit-utils";
import { upsertVisitorNoteAction } from "@/app/admin/visitors/actions";

type AdminVisitorStreamProps = {
  profiles: VisitorProfileGroup[];
  currentAdminEmail?: string | null;
  currentAdminName?: string | null;
};

export function AdminVisitorStream({
  profiles,
  currentAdminEmail,
  currentAdminName
}: AdminVisitorStreamProps) {
  const [filter, setFilter] = useState<"all" | "humans" | "returning" | "bots" | "campaigns" | "you">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedVisitorId, setExpandedVisitorId] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [selectedVisitorForDrawer, setSelectedVisitorForDrawer] = useState<VisitorProfileGroup | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  const filteredProfiles = profiles.filter((profile) => {
    // 1. Classification & Category Filter
    if (filter === "humans" && (profile.botScore > 40 || profile.isIgnored)) {
      return false;
    }
    if (filter === "returning" && !profile.isReturningVisitor) {
      return false;
    }
    if (filter === "bots" && profile.botScore < 40) {
      return false;
    }
    if (filter === "campaigns" && !profile.knownCampaign && !profile.knownAdPlatform && !profile.knownQrCode) {
      return false;
    }
    if (filter === "you" && !profile.isCurrentUser) {
      return false;
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVisitorId = profile.visitorId.toLowerCase().includes(q) || profile.shortId.toLowerCase().includes(q);
      const matchName = profile.displayName.toLowerCase().includes(q);
      const matchLoc = profile.location.toLowerCase().includes(q);
      const matchCampaign = (profile.knownCampaign || "").toLowerCase().includes(q);
      const matchBrowser = profile.browser.toLowerCase().includes(q);
      const matchOS = profile.operatingSystem.toLowerCase().includes(q);
      const matchPath = profile.sessions.some((s) => s.journeySteps.some((st) => st.path.toLowerCase().includes(q)));
      return matchVisitorId || matchName || matchLoc || matchCampaign || matchBrowser || matchOS || matchPath;
    }

    return true;
  });

  const humanCount = profiles.filter((p) => p.botScore <= 40 && !p.isIgnored).length;
  const returningCount = profiles.filter((p) => p.isReturningVisitor).length;
  const botCount = profiles.filter((p) => p.botScore > 40).length;
  const campaignCount = profiles.filter((p) => p.knownCampaign || p.knownAdPlatform || p.knownQrCode).length;

  const handleSaveNoteAndTag = async (visitorId: string) => {
    try {
      const currentTags = selectedVisitorForDrawer?.tags || [];
      const newTags = tagInput.trim() ? Array.from(new Set([...currentTags, tagInput.trim()])) : currentTags;
      await upsertVisitorNoteAction({
        visitorId,
        note: noteInput || selectedVisitorForDrawer?.notes || "",
        tags: newTags
      });
      if (selectedVisitorForDrawer) {
        setSelectedVisitorForDrawer({
          ...selectedVisitorForDrawer,
          notes: noteInput || selectedVisitorForDrawer.notes,
          tags: newTags
        });
      }
      setTagInput("");
    } catch (err) {
      console.error("Unable to save note/tag:", err);
    }
  };

  const handleSetClassification = async (visitorId: string, classification: "human" | "bot" | "internal" | "ignored") => {
    try {
      await upsertVisitorNoteAction({
        visitorId,
        manualClassification: classification,
        isIgnored: classification === "ignored",
        isInternal: classification === "internal"
      });
      if (selectedVisitorForDrawer) {
        setSelectedVisitorForDrawer({
          ...selectedVisitorForDrawer,
          manualClassification: classification,
          isIgnored: classification === "ignored",
          isInternal: classification === "internal"
        });
      }
    } catch (err) {
      console.error("Unable to set classification:", err);
    }
  };

  return (
    <section className="rounded-3xl border border-archive-gold/22 bg-[#171511]/90 p-6 shadow-luxury backdrop-blur-md sm:p-8">
      {/* Header & Live Radar Pulse */}
      <div className="flex flex-col gap-4 border-b border-archive-gold/15 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-archive-gold">
              Executive Visitor Command Console
            </p>
          </div>
          <h2 className="mt-2 font-serif text-3xl text-archive-ivory sm:text-4xl">
            Grouped Visitor Intelligence ({filteredProfiles.length} Profiles)
          </h2>
          <p className="mt-1 text-xs leading-6 text-archive-ivory/60">
            Sessions grouped under stable visitor identities (`Visitor → Sessions → Journey Steps`). Analytics identities, not verified individuals.
          </p>
        </div>

        {/* Live Status Summary Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-200 shadow-soft">
            ● {humanCount} Real Human Visitors
          </span>
          <span className="rounded-full border border-archive-gold/30 bg-archive-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-archive-gold shadow-soft">
            {returningCount} Returning
          </span>
        </div>
      </div>

      {/* Toolbar: Category Tabs + Search */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: `All Visitors (${profiles.length})` },
            { id: "humans", label: `🟢 Humans (${humanCount})` },
            { id: "returning", label: `🔄 Returning (${returningCount})` },
            { id: "campaigns", label: `📢 Campaign Traffic (${campaignCount})` },
            { id: "bots", label: `🤖 Suspected Bots (${botCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as any)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filter === tab.id
                  ? "bg-archive-gold text-archive-obsidian shadow-soft"
                  : "border border-archive-gold/20 bg-white/[0.03] text-archive-ivory/80 hover:bg-white/[0.08]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search visitor ID, campaign, city..."
            className="w-full rounded-xl border border-archive-gold/25 bg-archive-obsidian px-4 py-2 text-xs text-archive-ivory placeholder-archive-ivory/40 outline-none focus:border-archive-gold focus:ring-1 focus:ring-archive-gold"
          />
        </div>
      </div>

      {/* Visitor Profile Hierarchy List */}
      <div className="mt-6 grid gap-4">
        {filteredProfiles.length > 0 ? (
          filteredProfiles.map((profile) => {
            const isExpanded = expandedVisitorId === profile.visitorId;

            return (
              <article
                key={profile.visitorId}
                className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                  profile.isCurrentUser
                    ? "border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-archive-obsidian to-archive-obsidian/80 shadow-luxury"
                    : profile.userEmail
                      ? "border-sky-400/30 bg-sky-950/20"
                      : "border-archive-gold/16 bg-white/[0.025] hover:border-archive-gold/35"
                }`}
              >
                {/* Visitor Header Summary Card */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-archive-gold/30 bg-archive-gold/15 px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-archive-gold">
                        ID: #{profile.shortId}
                      </span>

                      {profile.isCurrentUser ? (
                        <span className="rounded-full border border-amber-400/50 bg-amber-400/15 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-amber-200">
                          ★ YOU ({currentAdminName || "Owner"})
                        </span>
                      ) : profile.userEmail ? (
                        <span className="rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-200">
                          👤 MEMBER ACCOUNT
                        </span>
                      ) : (
                        <span className="rounded-full border border-archive-gold/25 bg-archive-gold/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-archive-champagne">
                          🌐 GUEST VISITOR
                        </span>
                      )}

                      {profile.isReturningVisitor ? (
                        <span className="rounded-full border border-sky-300/30 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-200">
                          🔄 Returning ({profile.totalSessions} Sessions)
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                          🌱 New Visitor
                        </span>
                      )}

                      {profile.knownCampaign ? (
                        <span className="rounded-full border border-purple-400/30 bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-200">
                          📢 Ad: {profile.knownCampaign}
                        </span>
                      ) : null}

                      {profile.botScore > 40 ? (
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          🤖 Bot Confidence {profile.botScore}% ({profile.botClassification})
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <h3 className="font-serif text-xl font-medium text-archive-ivory sm:text-2xl">
                        {profile.displayName}
                      </h3>
                      {profile.userEmail ? (
                        <p className="text-xs text-archive-champagne/90">{profile.userEmail}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-archive-ivory/65">
                      <span className="font-semibold text-archive-gold/90">📍 {profile.location}</span>
                      <span>•</span>
                      <span>{profile.deviceCategory.toUpperCase()} · {profile.browser} · {profile.operatingSystem}</span>
                      <span>•</span>
                      <span>First Seen: {formatVisitorAnalyticsRelativeTime(profile.firstSeenAt)}</span>
                    </div>
                  </div>

                  {/* Right Side Stats & Actions */}
                  <div className="flex flex-col gap-2 lg:items-end">
                    <div className="text-left lg:text-right">
                      <p className="font-mono text-xs font-bold text-archive-gold">
                        Active: {profile.totalActiveTimeFormatted}
                      </p>
                      <p className="text-[11px] text-archive-ivory/50">
                        {profile.totalPageViews} total page views across {profile.totalSessions} sessions
                      </p>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedVisitorForDrawer(profile)}
                        className="rounded-lg border border-archive-gold/30 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-archive-champagne hover:bg-white/[0.08] transition"
                      >
                        Inspect Drawer 🔍
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedVisitorId(isExpanded ? null : profile.visitorId)}
                        className="rounded-lg border border-archive-gold/30 bg-archive-gold/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-archive-gold hover:bg-archive-gold hover:text-archive-obsidian transition"
                      >
                        {isExpanded ? "Collapse Sessions ▲" : `View ${profile.sessions.length} Sessions ▼`}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Sessions Hierarchy */}
                {isExpanded ? (
                  <div className="mt-5 border-t border-archive-gold/15 pt-4 grid gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-archive-gold">
                      Sessions Hierarchy ({profile.sessions.length} recorded sessions)
                    </p>
                    {profile.sessions.map((sess) => {
                      const isSessExpanded = expandedSessionId === sess.sessionId;
                      return (
                        <div key={sess.sessionId} className="rounded-xl border border-archive-gold/18 bg-black/40 p-4 text-xs">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <span className="font-bold text-archive-champagne">Session #{sess.sessionNumber}</span>
                              <span className="ml-2 text-archive-ivory/50">· {formatVisitorAnalyticsDateTime(sess.startTime)} · Duration: {sess.durationFormatted}</span>
                              <p className="mt-1 text-[11px] text-archive-ivory/60">
                                Landing: <span className="font-mono text-archive-gold">{sess.landingPage}</span> → Exit: <span className="font-mono text-archive-gold">{sess.exitPage}</span> ({sess.pageCount} pages)
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedSessionId(isSessExpanded ? null : sess.sessionId)}
                              className="rounded-md border border-archive-gold/20 bg-archive-gold/10 px-3 py-1 font-mono text-[11px] font-bold text-archive-gold hover:bg-archive-gold/20 transition"
                            >
                              {isSessExpanded ? "Hide Flow ▲" : "View Flow Flow ▼"}
                            </button>
                          </div>

                          {/* Journey Timeline */}
                          {isSessExpanded ? (
                            <div className="mt-3 border-t border-white/5 pt-3 grid gap-2">
                              <p className="text-[10px] font-bold uppercase text-archive-gold">Chronological Page Journey</p>
                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {sess.journeySteps.map((step, idx) => (
                                  <div key={step.id} className="rounded-lg border border-white/10 bg-black/60 p-2.5">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-archive-gold font-bold">Step #{idx + 1}</span>
                                      <span className="text-archive-ivory/40">{formatVisitorAnalyticsRelativeTime(step.createdAt)}</span>
                                    </div>
                                    <p className="mt-1 font-mono font-bold text-archive-ivory break-all">{step.path}</p>
                                    <p className="mt-1 text-[10px] text-emerald-300 font-bold">Dwell: {step.durationFormatted}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-archive-gold/15 bg-black/30 p-8 text-center">
            <p className="font-serif text-lg text-archive-ivory/70">No matching visitor profiles found.</p>
          </div>
        )}
      </div>

      {/* Visitor Detail Drawer Modal */}
      {selectedVisitorForDrawer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm p-4">
          <div className="h-full w-full max-w-2xl overflow-y-auto rounded-3xl border border-archive-gold/30 bg-[#171511] p-6 shadow-luxury">
            <div className="flex items-center justify-between border-b border-archive-gold/20 pb-4">
              <h2 className="font-serif text-2xl text-archive-ivory">Visitor Intelligence Profile</h2>
              <button
                type="button"
                onClick={() => setSelectedVisitorForDrawer(null)}
                className="rounded-full border border-archive-gold/30 px-3 py-1 text-xs text-archive-ivory/70 hover:text-archive-ivory"
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 text-xs">
              <div className="rounded-2xl border border-archive-gold/18 bg-black/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-archive-gold">Plain English Intelligence Summary</p>
                <p className="mt-2 text-sm leading-6 text-archive-ivory/90 font-serif">
                  &ldquo;This visitor (#{selectedVisitorForDrawer.shortId}) first arrived from {selectedVisitorForDrawer.firstAttributionSource} on {formatVisitorAnalyticsDateTime(selectedVisitorForDrawer.firstSeenAt)}. They have visited {selectedVisitorForDrawer.totalSessions} times across {selectedVisitorForDrawer.totalPageViews} page views, spending a total of {selectedVisitorForDrawer.totalActiveTimeFormatted} exploring. Latest activity was on {selectedVisitorForDrawer.latestLandingPage}.&rdquo;
                </p>
              </div>

              {/* Classification Override Buttons */}
              <div className="rounded-2xl border border-archive-gold/18 bg-black/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-archive-gold mb-2">Admin Classification Override</p>
                <div className="flex flex-wrap gap-2">
                  {["human", "bot", "internal", "ignored"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleSetClassification(selectedVisitorForDrawer.visitorId, c as any)}
                      className={`rounded-lg px-3 py-1.5 font-bold uppercase text-[10px] transition ${
                        selectedVisitorForDrawer.manualClassification === c
                          ? "bg-archive-gold text-archive-obsidian"
                          : "border border-archive-gold/30 bg-white/[0.04] text-archive-ivory hover:bg-white/[0.08]"
                      }`}
                    >
                      Mark as {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Note & Tag */}
              <div className="rounded-2xl border border-archive-gold/18 bg-black/40 p-4 grid gap-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-archive-gold">Admin Notes &amp; Tags</p>
                <textarea
                  value={noteInput || selectedVisitorForDrawer.notes || ""}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add internal admin notes for this visitor..."
                  className="w-full rounded-xl border border-archive-gold/25 bg-archive-obsidian p-3 text-xs text-archive-ivory outline-none min-h-[80px]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag (e.g. VIP, Test, Agency)"
                    className="flex-1 rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2 text-xs text-archive-ivory outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveNoteAndTag(selectedVisitorForDrawer.visitorId)}
                    className="rounded-xl bg-archive-gold px-4 py-2 font-bold text-archive-obsidian hover:bg-archive-champagne transition"
                  >
                    Save Note / Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
