"use client";

import { useState } from "react";
import type { LifeArchive } from "@/lib/types";
import { updateArchiveDetailsAction } from "@/app/archive/[slug]/actions";
import Link from "next/link";

type EditArchiveFormProps = {
  archive: LifeArchive;
  qrSrc: string;
  archiveUrl: string;
};

export function EditArchiveForm({ archive, qrSrc, archiveUrl }: EditArchiveFormProps) {
  const [personName, setPersonName] = useState(archive.personName);
  const [archiveName, setArchiveName] = useState(archive.archiveName);
  const [bio, setBio] = useState(archive.bio);
  const [visibility, setVisibility] = useState(archive.visibility);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !archiveName.trim() || !bio.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("personName", personName);
    formData.append("archiveName", archiveName);
    formData.append("bio", bio);
    formData.append("visibility", visibility);

    try {
      const result = await updateArchiveDetailsAction(archive.slug, formData);
      if (result.success) {
        setSuccess("Your keepsake page has been successfully updated and preserved.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update keepsake.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(archiveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start mt-8">
      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8 grid gap-5">
        <div>
          <h2 className="font-serif text-2xl text-archive-ivory sm:text-3xl">
            Edit Keepsake Details
          </h2>
          <p className="text-xs text-archive-ivory/50 mt-1">
            Update the public memorial text, names, and visibility configurations.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-archive-clay/20 bg-archive-clay/10 p-3 text-xs text-archive-clay">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg border border-archive-gold/20 bg-archive-gold/10 p-3 text-xs text-archive-gold">
            {success}
          </p>
        )}

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-archive-gold">
            Person&apos;s Name
          </span>
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4 text-sm"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-archive-gold">
            Keepsake Page Title
          </span>
          <input
            type="text"
            value={archiveName}
            onChange={(e) => setArchiveName(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4 text-sm"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-archive-gold">
            Tribute / Biography
          </span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading}
            rows={6}
            className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4 text-sm resize-none leading-7"
          />
        </label>

        <div className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-archive-gold">
            Visibility Setting
          </span>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`flex-1 rounded-lg border p-3 text-xs font-semibold transition ${
                visibility === "public"
                  ? "border-archive-gold bg-archive-gold/10 text-archive-gold"
                  : "border-white/10 bg-white/[0.02] text-archive-ivory/60"
              }`}
            >
              Public (Anyone can view)
            </button>
            <button
              type="button"
              onClick={() => setVisibility("private")}
              className={`flex-1 rounded-lg border p-3 text-xs font-semibold transition ${
                visibility === "private"
                  ? "border-archive-gold bg-archive-gold/10 text-archive-gold"
                  : "border-white/10 bg-white/[0.02] text-archive-ivory/60"
              }`}
            >
              Private (Owner only)
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-archive-gold px-6 py-3 text-xs font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne disabled:opacity-50"
          >
            {loading ? "Preserving..." : "Save Keepsake Changes"}
          </button>
          <Link
            href={`/archive/${archive.slug}`}
            className="rounded-full border border-white/10 bg-white/[0.02] px-6 py-3 text-xs font-semibold text-archive-ivory transition hover:bg-white/[0.06] flex items-center"
          >
            View Live Keepsake
          </Link>
        </div>
      </form>

      {/* QR Code and Share Links */}
      <aside className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold mb-3">
          MEMORIAL QR KEY
        </p>
        <h3 className="font-serif text-xl text-archive-ivory mb-2">QR Memorial Keepsake</h3>
        <p className="text-xs leading-5 text-archive-ivory/60 mb-6">
          This secure code connects physical plaques, urns, programs, or markers directly back to this digital sanctuary.
        </p>

        {/* QR Code Element */}
        <div className="rounded-2xl border border-archive-gold/15 bg-white p-4 inline-block shadow-luxury mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} alt="Memorial Keepsake QR Code" className="w-48 h-48 mx-auto" />
        </div>

        <div className="mt-8 grid gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full rounded-full bg-archive-gold px-5 py-3 text-xs font-bold text-archive-obsidian shadow-soft transition hover:bg-archive-champagne"
          >
            {copied ? "Copied to Clipboard!" : "Copy Shareable Link"}
          </button>
          <p className="text-[10px] leading-relaxed text-archive-ivory/45 break-all mt-2 max-w-[280px] mx-auto select-all">
            {archiveUrl}
          </p>
        </div>
      </aside>
    </div>
  );
}
