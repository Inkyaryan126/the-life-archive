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
        setSuccess("Your archive has been successfully updated and preserved.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update archive.");
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
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="grid gap-5 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
        <div>
          <h2 className="font-serif text-2xl text-archive-ivory sm:text-3xl">
            Edit Archive Details
          </h2>
          <p className="mt-1 text-sm leading-6 text-archive-ivory/55">
            Update the public archive text, names, and visibility settings.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-archive-clay/20 bg-archive-clay/10 p-3 text-sm text-archive-clay">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg border border-archive-gold/20 bg-archive-gold/10 p-3 text-sm text-archive-gold">
            {success}
          </p>
        )}

        <label className="grid gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-archive-gold">
            Person&apos;s Name
          </span>
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-sm text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-archive-gold">
            Archive Page Title
          </span>
          <input
            type="text"
            value={archiveName}
            onChange={(e) => setArchiveName(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-sm text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-archive-gold">
            Tribute / Biography
          </span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading}
            rows={6}
            className="resize-none rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
          />
        </label>

        <div className="grid gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-archive-gold">
            Visibility Setting
          </span>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`flex-1 rounded-lg border p-3 text-sm font-semibold transition ${
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
              className={`flex-1 rounded-lg border p-3 text-sm font-semibold transition ${
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
            className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne disabled:opacity-50"
          >
            {loading ? "Preserving..." : "Save Archive Changes"}
          </button>
          <Link
            href={`/archive/${archive.slug}/contributors`}
            className="flex items-center rounded-full border border-archive-gold/30 bg-black/40 px-6 py-3 text-sm font-semibold text-archive-champagne transition hover:border-archive-gold hover:bg-white/[0.06]"
          >
            Manage Contributors
          </Link>
          <Link
            href={`/archive/${archive.slug}`}
            className="flex items-center rounded-full border border-white/10 bg-white/[0.02] px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:bg-white/[0.06]"
          >
            View Live Archive
          </Link>
        </div>
      </form>

      {/* QR Code and Share Links */}
      <aside className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 text-center shadow-luxury">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-archive-gold">
          QR CODE
        </p>
        <h3 className="mb-2 font-serif text-2xl text-archive-ivory">
          {archive.memorialMode ? "Memorial QR Code" : "Life Archive QR Code"}
        </h3>
        <p className="mb-6 text-sm leading-6 text-archive-ivory/62">
          {archive.memorialMode
            ? "This QR code connects cards, plaques, programs, and keepsakes back to this memorial archive."
            : "This QR code connects a Life Archive card or keepsake back to this living archive."}
        </p>

        {/* QR Code Element */}
        <div className="mx-auto inline-block rounded-2xl border border-archive-gold/15 bg-archive-obsidian/80 p-4 shadow-luxury">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt={archive.memorialMode ? "Memorial archive QR code" : "Life archive QR code"}
            className="mx-auto h-48 w-48"
          />
        </div>

        <div className="mt-8 grid gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian shadow-soft transition hover:bg-archive-champagne"
          >
            {copied ? "Copied to Clipboard!" : "Copy Shareable Link"}
          </button>
          <p className="mx-auto mt-2 max-w-[280px] break-all text-sm leading-relaxed text-archive-ivory/45 select-all">
            {archiveUrl}
          </p>
        </div>
      </aside>
    </div>
  );
}
