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
      console.error("Unable to copy to clipboard:", err);
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
    <div className="mt-6 grid gap-8">
      {/* Header & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-archive-gold/15 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-archive-ivory">Trackable Links &amp; Vector QR Codes ({links.length})</h2>
          <p className="text-xs text-archive-ivory/60">
            Real scannable QR codes encoding first-party short URLs (`/go/[slug]`). Standard PNG, 1800px Print PNG, SVG, and pure monochrome laser engraving vectors.
          </p>
        </div>

        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter links by name, campaign, material..."
          className="w-full sm:w-72 rounded-xl border border-archive-gold/25 bg-archive-obsidian px-4 py-2 text-xs text-archive-ivory outline-none placeholder-archive-ivory/40 focus:border-archive-gold"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        {filteredLinks.map((link) => {
          const shortUrl = `${siteUrl.replace(/\/$/, "")}/go/${link.slug}`;
          const isCopied = copiedSlug === link.slug;

          return (
            <article
              key={link.id}
              className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all ${
                link.isDisabled
                  ? "border-red-400/30 bg-red-950/10 opacity-70"
                  : "border-archive-gold/22 bg-[#171511]/90 shadow-luxury hover:border-archive-gold/40"
              }`}
            >
              <div className="grid gap-5 sm:grid-cols-12">
                {/* QR Preview Column (180-240px rendered) */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center gap-2">
                  <div className="relative flex h-52 w-52 items-center justify-center rounded-2xl border-2 border-archive-gold/30 bg-white p-3 shadow-luxury">
                    {link.qrSvgPreview ? (
                      <div
                        className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: link.qrSvgPreview }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-2 text-red-600">
                        <span className="text-2xl">⚠️</span>
                        <p className="mt-1 text-[11px] font-bold">QR Render Warning</p>
                      </div>
                    )}
                  </div>

                  <span className="font-mono text-[10px] font-bold text-archive-ivory/50">
                    High-Contrast Level H Vector
                  </span>
                </div>

                {/* Info Column */}
                <div className="sm:col-span-7 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {link.campaignName ? (
                        <span className="rounded-full border border-archive-gold/30 bg-archive-gold/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-archive-gold">
                          📢 {link.campaignName}
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-archive-ivory/50">
                          Unassigned Campaign
                        </span>
                      )}

                      {link.isDisabled ? (
                        <span className="rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-300">
                          🚫 Disabled
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                          Active
                        </span>
                      )}

                      {!link.hasQrRecord ? (
                        <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                          ⚠️ Missing QR Record
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-2 font-serif text-xl text-archive-ivory font-medium">
                      {link.linkName}
                    </h3>

                    {/* Physical Material */}
                    <p className="mt-1 text-xs text-archive-champagne">
                      📦 Material Target: <span className="font-semibold text-archive-ivory">{link.materialTarget || "Standard Digital / Paper"}</span>
                    </p>

                    {/* Short Redirect URL */}
                    <div className="mt-2 rounded-xl border border-archive-gold/20 bg-black/50 p-2.5 font-mono text-xs text-emerald-300 break-all flex items-center justify-between gap-2">
                      <span>{shortUrl}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(link.slug, shortUrl)}
                        className="rounded bg-archive-gold/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-archive-gold hover:bg-archive-gold hover:text-archive-obsidian transition"
                      >
                        {isCopied ? "✓ Copied" : "Copy"}
                      </button>
                    </div>

                    <p className="mt-2 text-[11px] text-archive-ivory/60">
                      Redirects to: <span className="font-mono text-archive-gold">{link.destinationPath}</span> · Source: {link.utmSource || "direct"} · Medium: {link.utmMedium || "qr"}
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono border-t border-archive-gold/15 pt-3">
                    <div>
                      <span className="text-archive-gold font-bold">{link.clickCount.toLocaleString()}</span>
                      <span className="text-archive-ivory/50 ml-1">Clicks</span>
                    </div>
                    <div>
                      <span className="text-emerald-300 font-bold">{link.conversionCount.toLocaleString()}</span>
                      <span className="text-archive-ivory/50 ml-1">Conversions</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="mt-5 border-t border-archive-gold/15 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-archive-gold/30 bg-white/[0.04] px-3 py-1.5 font-semibold text-archive-champagne hover:bg-white/[0.08] transition"
                  >
                    Open Link 🌐
                  </a>

                  <a
                    href={`/api/admin/advertising/qr/${link.slug}/png`}
                    download
                    className="rounded-lg border border-archive-gold/30 bg-archive-gold/10 px-3 py-1.5 font-semibold text-archive-gold hover:bg-archive-gold/20 transition"
                  >
                    PNG 📥
                  </a>

                  <a
                    href={`/api/admin/advertising/qr/${link.slug}/print`}
                    download
                    className="rounded-lg border border-archive-gold/30 bg-archive-gold/10 px-3 py-1.5 font-semibold text-archive-gold hover:bg-archive-gold/20 transition"
                  >
                    1800px Print PNG 🖨️
                  </a>

                  <a
                    href={`/api/admin/advertising/qr/${link.slug}/svg`}
                    download
                    className="rounded-lg border border-archive-gold/30 bg-archive-gold/10 px-3 py-1.5 font-semibold text-archive-gold hover:bg-archive-gold/20 transition"
                  >
                    SVG 📐
                  </a>

                  <a
                    href={`/api/admin/advertising/qr/${link.slug}/engraving`}
                    download
                    className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 font-semibold text-amber-200 hover:bg-amber-400/20 transition"
                  >
                    Laser Engraving SVG ⚡
                  </a>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLinkForModal(link)}
                    className="rounded-lg border border-archive-gold/30 bg-white/[0.04] px-3 py-1.5 font-semibold text-archive-ivory hover:bg-white/[0.08] transition"
                  >
                    Inspect 🔍
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleDisabled(link.id, link.isDisabled)}
                    className={`rounded-lg px-3 py-1.5 font-semibold transition ${
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-archive-gold/30 bg-[#171511] p-6 shadow-luxury">
            <div className="flex items-center justify-between border-b border-archive-gold/20 pb-4">
              <h3 className="font-serif text-2xl text-archive-ivory">Full-Size QR Asset Inspector</h3>
              <button
                type="button"
                onClick={() => setSelectedLinkForModal(null)}
                className="rounded-full border border-archive-gold/30 px-3 py-1 text-xs text-archive-ivory/70 hover:text-archive-ivory"
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
