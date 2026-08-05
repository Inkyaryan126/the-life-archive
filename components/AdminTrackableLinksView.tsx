"use client";

import { useState } from "react";
import type { AdvertisingLinkJoined, AdvertisingCampaign } from "@/lib/advertising-campaigns";
import { toggleLinkDisabledAction } from "@/app/admin/visitors/actions";

type AdminTrackableLinksViewProps = {
  links: AdvertisingLinkJoined[];
  campaigns: AdvertisingCampaign[];
  siteUrl: string;
};

export function AdminTrackableLinksView({
  links,
  campaigns,
  siteUrl
}: AdminTrackableLinksViewProps) {
  const [selectedLinkForModal, setSelectedLinkForModal] = useState<AdvertisingLinkJoined | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const filteredLinks = links.filter((l) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      l.linkName.toLowerCase().includes(q) ||
      l.slug.toLowerCase().includes(q) ||
      (l.campaignName || "").toLowerCase().includes(q) ||
      (l.materialTarget || "").toLowerCase().includes(q) ||
      (l.utmSource || "").toLowerCase().includes(q)
    );
  });

  const handleCopyLink = async (slug: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch (err) {
      console.error("Unable to copy link to clipboard:", err);
    }
  };

  const handleToggleDisabled = async (linkId: string, currentDisabled: boolean) => {
    try {
      await toggleLinkDisabledAction(linkId, !currentDisabled);
      window.location.reload();
    } catch (err) {
      console.error("Unable to toggle link state:", err);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-archive-gold/15 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-wide text-archive-ivory">
            Trackable Links &amp; Vector QR Codes ({links.length})
          </h2>
          <p className="mt-1 text-xs text-archive-ivory/60">
            Real scannable QR codes encoding first-party short URLs (`/go/[slug]`). Standard PNG, 1800px Print PNG, SVG, and laser engraving vectors.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search links, campaigns, materials..."
            className="w-full rounded-xl border border-archive-gold/25 bg-archive-obsidian px-4 py-2.5 text-xs text-archive-ivory outline-none placeholder-archive-ivory/40 focus:border-archive-gold transition"
          />
        </div>
      </div>

      {/* Full-Width Horizontal Link Row Cards */}
      <div className="w-full space-y-5" data-testid="trackable-link-list">
        {filteredLinks.length === 0 ? (
          <div className="rounded-2xl border border-archive-gold/20 bg-[#14120e] p-8 text-center text-xs text-archive-ivory/60">
            No trackable links matched your filter.
          </div>
        ) : null}

        {filteredLinks.map((link) => {
          const shortUrl = `${siteUrl.replace(/\/$/, "")}/go/${link.slug}`;
          const isCopied = copiedSlug === link.slug;

          return (
            <article
              key={link.id}
              data-testid={`link-card-${link.slug}`}
              className={`w-full overflow-hidden rounded-2xl border p-6 transition-all duration-200 ${
                link.isDisabled
                  ? "border-red-500/30 bg-red-950/10 opacity-75"
                  : "border-archive-gold/20 bg-[#14120e]/95 shadow-luxury hover:border-archive-gold/40"
              }`}
            >
              {/* Row 1: Header (Left: Name & Badges, Right: Stats Counters) */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-archive-gold/15 pb-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Campaign Badge */}
                  {link.campaignName ? (
                    <span className="rounded-md border border-archive-gold/30 bg-archive-gold/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-archive-gold">
                      {link.campaignName}
                    </span>
                  ) : (
                    <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase text-archive-ivory/50">
                      Unassigned Campaign
                    </span>
                  )}

                  {/* Active / Disabled Status Badge */}
                  {link.isDisabled ? (
                    <span className="rounded-md border border-red-500/40 bg-red-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300">
                      Disabled
                    </span>
                  ) : (
                    <span className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                      Active
                    </span>
                  )}

                  {!link.hasQrRecord ? (
                    <span className="rounded-md border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-[11px] font-bold uppercase text-amber-300">
                      Missing QR Record
                    </span>
                  ) : null}

                  {/* Link Name */}
                  <h3 className="font-serif text-xl font-medium text-archive-ivory tracking-wide ml-1">
                    {link.linkName}
                  </h3>
                </div>

                {/* Header Stats Block */}
                <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                  <div className="rounded-lg border border-archive-gold/20 bg-black/40 px-3.5 py-1.5">
                    <span className="font-bold text-archive-gold">{link.clickCount.toLocaleString()}</span>
                    <span className="ml-1.5 text-archive-ivory/50 font-sans">Clicks</span>
                  </div>
                  <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 px-3.5 py-1.5">
                    <span className="font-bold text-emerald-300">{link.conversionCount.toLocaleString()}</span>
                    <span className="ml-1.5 text-archive-ivory/50 font-sans">Conversions</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Main Content (Desktop: 3-column horizontal grid: 180px fixed QR | minmax(0,1fr) details | 200px actions) */}
              <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[180px_minmax(0,1fr)_200px] items-start">
                {/* Column 1: QR Code Preview Box (Fixed 180px width) */}
                <div className="flex flex-col items-center justify-center w-[180px] mx-auto md:mx-0">
                  <div className="relative flex h-[170px] w-[170px] items-center justify-center rounded-xl border border-archive-gold/30 bg-white p-3 shadow-md">
                    {link.qrSvgPreview ? (
                      <div
                        className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: link.qrSvgPreview }}
                      />
                    ) : (
                      <div className="text-center text-xs text-red-600 p-2">
                        <span>⚠️</span>
                        <p className="font-bold mt-1">Render Error</p>
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-center text-[10px] font-mono font-bold uppercase tracking-wider text-archive-ivory/50 block">
                    High-Contrast Level H Vector
                  </span>
                </div>

                {/* Column 2: Short URL & Structured Metadata Grid */}
                <div className="flex flex-col justify-between gap-4 min-w-0">
                  {/* Short Redirect URL Row */}
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-archive-gold/25 bg-black/60 px-4 py-2.5 font-mono text-xs text-emerald-300 shadow-inner w-full">
                    <span className="truncate select-all text-xs font-semibold">{shortUrl}</span>
                    <button
                      type="button"
                      data-testid={`copy-btn-${link.slug}`}
                      onClick={() => handleCopyLink(link.slug, shortUrl)}
                      className="inline-flex items-center justify-center rounded-lg border border-archive-gold/40 bg-archive-gold/15 px-3 py-1.5 text-xs font-bold text-archive-gold hover:bg-archive-gold hover:text-archive-obsidian transition-colors shrink-0 whitespace-nowrap min-w-[75px]"
                    >
                      {isCopied ? "Copied" : "Copy Link"}
                    </button>
                  </div>

                  {/* Structured 2-Column Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl border border-archive-gold/12 bg-white/[0.02] p-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold/80 block">Destination</span>
                      <span className="font-mono text-archive-ivory truncate block mt-0.5">{link.destinationPath}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold/80 block">Source</span>
                      <span className="font-mono text-archive-ivory/90 truncate block mt-0.5">{link.utmSource || "direct"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold/80 block">Medium</span>
                      <span className="font-mono text-archive-ivory/90 truncate block mt-0.5">{link.utmMedium || "qr"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold/80 block">Physical Material</span>
                      <span className="font-semibold text-archive-ivory truncate block mt-0.5">{link.materialTarget || "Standard Paper / Digital"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold/80 block">Link ID</span>
                      <span className="font-mono text-archive-ivory/60 truncate block mt-0.5">{link.id}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold/80 block">QR Record ID</span>
                      <span className="font-mono text-archive-ivory/60 truncate block mt-0.5">{link.qrId || "None"}</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Action Buttons Panel (Fixed 200px Width) */}
                <div className="flex flex-col gap-2 w-full lg:w-[200px] shrink-0">
                  {/* Primary Actions */}
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center rounded-xl border border-archive-gold/40 bg-archive-gold/15 px-3.5 py-2 text-xs font-bold text-archive-gold hover:bg-archive-gold hover:text-archive-obsidian transition"
                  >
                    Open Link
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedLinkForModal(link)}
                    className="w-full rounded-xl border border-archive-gold/25 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-archive-ivory hover:bg-white/[0.08] transition"
                  >
                    Inspect Asset
                  </button>

                  {/* Download Actions Grid */}
                  <div className="grid grid-cols-2 gap-1.5 my-1">
                    <a
                      href={`/api/admin/advertising/qr/${link.slug}/png`}
                      download
                      className="text-center rounded-lg border border-archive-gold/20 bg-black/40 py-1.5 text-[11px] font-semibold text-archive-gold hover:bg-archive-gold/20 transition"
                    >
                      PNG
                    </a>
                    <a
                      href={`/api/admin/advertising/qr/${link.slug}/print`}
                      download
                      className="text-center rounded-lg border border-archive-gold/20 bg-black/40 py-1.5 text-[11px] font-semibold text-archive-gold hover:bg-archive-gold/20 transition"
                    >
                      Print PNG
                    </a>
                    <a
                      href={`/api/admin/advertising/qr/${link.slug}/svg`}
                      download
                      className="text-center rounded-lg border border-archive-gold/20 bg-black/40 py-1.5 text-[11px] font-semibold text-archive-gold hover:bg-archive-gold/20 transition"
                    >
                      SVG
                    </a>
                    <a
                      href={`/api/admin/advertising/qr/${link.slug}/engraving`}
                      download
                      className="text-center rounded-lg border border-amber-400/30 bg-amber-400/10 py-1.5 text-[11px] font-semibold text-amber-200 hover:bg-amber-400/20 transition"
                    >
                      Engraving
                    </a>
                  </div>

                  {/* Danger Action */}
                  <button
                    type="button"
                    onClick={() => handleToggleDisabled(link.id, link.isDisabled)}
                    className={`w-full rounded-xl py-2 text-xs font-bold transition ${
                      link.isDisabled
                        ? "border border-emerald-400/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                        : "border border-red-400/30 bg-red-500/15 text-red-200 hover:bg-red-500/25"
                    }`}
                  >
                    {link.isDisabled ? "Enable Link" : "Disable Link"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Full-Size QR Inspector Modal */}
      {selectedLinkForModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-archive-gold/30 bg-[#14120e] p-6 shadow-luxury">
            <div className="flex items-center justify-between border-b border-archive-gold/20 pb-4">
              <h3 className="font-serif text-2xl font-semibold text-archive-ivory">Full-Size QR Asset Inspector</h3>
              <button
                type="button"
                onClick={() => setSelectedLinkForModal(null)}
                className="rounded-full border border-archive-gold/30 px-3.5 py-1 text-xs text-archive-ivory/70 hover:text-archive-ivory transition"
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-12 text-xs">
              {/* Full Size Preview */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center gap-3">
                <div className="relative flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-archive-gold/40 bg-white p-4 shadow-luxury">
                  <div
                    className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: selectedLinkForModal.qrSvgPreview }}
                  />
                </div>
                <span className="font-mono text-xs text-archive-gold font-bold text-center">
                  Scannable 100% Vector Error Correction H
                </span>
              </div>

              {/* Detail Matrix */}
              <div className="sm:col-span-7 grid gap-3">
                <div className="rounded-xl border border-archive-gold/18 bg-black/50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold">Link Name</span>
                  <p className="mt-1 font-serif text-lg text-archive-ivory">{selectedLinkForModal.linkName}</p>
                </div>

                <div className="rounded-xl border border-archive-gold/18 bg-black/50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold">Campaign Assignment</span>
                  <p className="mt-1 text-sm font-semibold text-archive-ivory">
                    {selectedLinkForModal.campaignName || "Unassigned"}
                  </p>
                </div>

                <div className="rounded-xl border border-archive-gold/18 bg-black/50 p-3 font-mono">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold">Short Redirect URL</span>
                  <p className="mt-1 text-emerald-300 break-all">{siteUrl}/go/{selectedLinkForModal.slug}</p>
                </div>

                <div className="rounded-xl border border-archive-gold/18 bg-black/50 p-3 font-mono">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold">Destination Path</span>
                  <p className="mt-1 text-archive-champagne">{selectedLinkForModal.destinationPath}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-archive-gold/18 bg-black/50 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold">UTM Source</span>
                    <p className="mt-1 font-mono text-archive-ivory">{selectedLinkForModal.utmSource || "direct"}</p>
                  </div>
                  <div className="rounded-xl border border-archive-gold/18 bg-black/50 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold">UTM Medium</span>
                    <p className="mt-1 font-mono text-archive-ivory">{selectedLinkForModal.utmMedium || "qr"}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-archive-gold/18 bg-black/50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-archive-gold">Physical Material Target</span>
                  <p className="mt-1 font-semibold text-archive-ivory">{selectedLinkForModal.materialTarget || "Standard Paper / Digital"}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-archive-ivory/50">Link ID:</span>
                    <p className="text-archive-ivory/80 truncate">{selectedLinkForModal.id}</p>
                  </div>
                  <div>
                    <span className="text-archive-ivory/50">QR Record ID:</span>
                    <p className="text-archive-ivory/80 truncate">{selectedLinkForModal.qrId || "None"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Download Actions */}
            <div className="mt-6 border-t border-archive-gold/20 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href={`/api/admin/advertising/qr/${selectedLinkForModal.slug}/png`}
                  download
                  className="rounded-xl bg-archive-gold px-4 py-2 font-bold text-archive-obsidian hover:bg-archive-champagne transition"
                >
                  Download PNG
                </a>
                <a
                  href={`/api/admin/advertising/qr/${selectedLinkForModal.slug}/print`}
                  download
                  className="rounded-xl bg-archive-gold px-4 py-2 font-bold text-archive-obsidian hover:bg-archive-champagne transition"
                >
                  Download 1800px Print PNG
                </a>
                <a
                  href={`/api/admin/advertising/qr/${selectedLinkForModal.slug}/svg`}
                  download
                  className="rounded-xl border border-archive-gold/40 bg-white/[0.04] px-4 py-2 font-bold text-archive-gold hover:bg-white/[0.08] transition"
                >
                  Download SVG Vector
                </a>
                <a
                  href={`/api/admin/advertising/qr/${selectedLinkForModal.slug}/engraving`}
                  download
                  className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 font-bold text-amber-200 hover:bg-amber-400/20 transition"
                >
                  Download Laser Engraving Vector
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
