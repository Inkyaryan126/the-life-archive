"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import type { ArchiveVisibility, LifeArchive } from "@/lib/types";
import { updateArchiveDetailsAction } from "@/app/archive/[slug]/actions";
import {
  getArchiveHeroImageStyle,
  normalizeHeroCropValues,
  type AspectRatioMode
} from "@/lib/archive-hero-image";

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

  // Crop & Focal position state
  const initialCrop = normalizeHeroCropValues({
    positionX: archive.heroImagePositionX,
    positionY: archive.heroImagePositionY,
    zoom: archive.heroImageZoom
  });

  const [positionX, setPositionX] = useState<number>(initialCrop.x);
  const [positionY, setPositionY] = useState<number>(initialCrop.y);
  const [zoom, setZoom] = useState<number>(initialCrop.zoom);
  const [previewAspect, setPreviewAspect] = useState<AspectRatioMode>("16/9");

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string>(archive.profilePhotoUrl);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const previewBoxRef = useRef<HTMLDivElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError("Hero photo must be smaller than 15 MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewPhotoUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handlePointerUpdate = (clientX: number, clientY: number) => {
    if (!previewBoxRef.current) return;
    const rect = previewBoxRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.round(Math.min(100, Math.max(0, rawX)));
    const clampedY = Math.round(Math.min(100, Math.max(0, rawY)));

    setPositionX(clampedX);
    setPositionY(clampedY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerUpdate(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handlePointerUpdate(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handlePointerUpdate(touch.clientX, touch.clientY);
    }
  };

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
    formData.append("heroImagePositionX", positionX.toString());
    formData.append("heroImagePositionY", positionY.toString());
    formData.append("heroImageZoom", zoom.toString());

    if (selectedFile) {
      formData.append("heroPhoto", selectedFile);
    }

    try {
      const result = await updateArchiveDetailsAction(archive.slug, formData);
      const actionError = "error" in result ? result.error : null;
      if (actionError) {
        setError(actionError);
      } else {
        setSuccess("Your archive details and hero photo crop have been successfully preserved.");
      }
    } catch {
      setError("Failed to update archive.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(archiveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const heroStyle = getArchiveHeroImageStyle(positionX, positionY, zoom);

  return (
    <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* Main Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="min-w-0 grid gap-6 rounded-[2rem] border border-archive-gold/20 bg-white/[0.035] p-6 shadow-luxury sm:p-8"
      >
        <div>
          <h2 className="font-serif text-2xl text-archive-ivory sm:text-3xl">
            Edit Archive &amp; Hero Photo Position
          </h2>
          <p className="mt-1 text-sm leading-6 text-archive-ivory/60">
            Reposition the portrait focal point, adjust zoom, upload a replacement hero photo, and update visibility.
          </p>
        </div>

        {error && (
          <p className="rounded-xl border border-archive-clay/30 bg-archive-clay/10 p-4 text-sm text-archive-clay font-medium">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-xl border border-archive-gold/30 bg-archive-gold/10 p-4 text-sm text-archive-gold font-medium">
            {success}
          </p>
        )}

        {/* Hidden crop form inputs for server action submission */}
        <input type="hidden" name="heroImagePositionX" value={positionX} />
        <input type="hidden" name="heroImagePositionY" value={positionY} />
        <input type="hidden" name="heroImageZoom" value={zoom} />

        {/* 1. HERO PHOTO INTERACTIVE CROP EDITOR */}
        <div className="grid gap-4 rounded-2xl border border-archive-gold/20 bg-archive-obsidian/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">
                Hero Photo Positioning &amp; Zoom
              </span>
              <p className="text-xs text-archive-ivory/60">
                Click or drag on the image preview below to set the face focal point.
              </p>
            </div>

            {/* Aspect Ratio Preview Selector */}
            <div className="flex items-center gap-1 rounded-full border border-archive-gold/25 bg-black/40 p-1 text-xs">
              {(["4/3", "16/9", "21/9"] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setPreviewAspect(ratio)}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    previewAspect === ratio
                      ? "bg-archive-gold text-archive-obsidian shadow-sm"
                      : "text-archive-ivory/70 hover:text-archive-ivory"
                  }`}
                >
                  {ratio === "4/3" ? "Mobile (4:3)" : ratio === "16/9" ? "Tablet (16:9)" : "Desktop (21:9)"}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Drag Box */}
          <div
            ref={previewBoxRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            className={`relative cursor-crosshair overflow-hidden rounded-xl border border-archive-gold/30 bg-black transition-all ${
              previewAspect === "4/3"
                ? "aspect-[4/3]"
                : previewAspect === "16/9"
                  ? "aspect-[16/9]"
                  : "aspect-[21/9]"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPhotoUrl}
              alt="Hero crop preview"
              className="h-full w-full pointer-events-none select-none"
              style={heroStyle}
            />

            {/* Focal Point Indicator Crosshair */}
            <div
              className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-archive-gold bg-black/40 shadow-luxury flex items-center justify-center backdrop-blur-xs"
              style={{ left: `${positionX}%`, top: `${positionY}%` }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-archive-gold" />
            </div>

            <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-mono text-archive-gold backdrop-blur-md">
              Focal: {positionX}% X / {positionY}% Y | Zoom: {zoom.toFixed(1)}x
            </div>
          </div>

          {/* Focal & Zoom Fine Controls */}
          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-archive-ivory/70">
                Focal X: {positionX}%
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={positionX}
                onChange={(e) => setPositionX(Number(e.target.value))}
                className="accent-archive-gold cursor-pointer"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-archive-ivory/70">
                Focal Y: {positionY}%
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={positionY}
                onChange={(e) => setPositionY(Number(e.target.value))}
                className="accent-archive-gold cursor-pointer"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-archive-ivory/70">
                Zoom: {zoom.toFixed(1)}x
              </span>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="accent-archive-gold cursor-pointer"
              />
            </label>
          </div>

          {/* Upload New Photo Input */}
          <div className="mt-2 border-t border-archive-gold/15 pt-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-archive-gold">
                Upload New Hero Photo (Optional)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-xs text-archive-ivory/80 file:mr-4 file:rounded-full file:border file:border-archive-gold/30 file:bg-archive-gold/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-archive-gold file:transition hover:file:bg-archive-gold/20"
              />
              <span className="text-[11px] text-archive-ivory/50">
                Leaves current image unchanged if left empty. Supported formats: JPG, PNG, WebP, AVIF (Max 15 MB).
              </span>
            </label>
          </div>
        </div>

        {/* 2. TEXT & METADATA INPUTS */}
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-archive-gold">
            Person&apos;s Name
          </span>
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            disabled={loading}
            required
            className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4 focus:border-archive-gold"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-archive-gold">
            Archive Page Title
          </span>
          <input
            type="text"
            value={archiveName}
            onChange={(e) => setArchiveName(e.target.value)}
            disabled={loading}
            required
            className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4 focus:border-archive-gold"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-archive-gold">
            Short Biography / Legacy Summary
          </span>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading}
            required
            className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4 focus:border-archive-gold"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-archive-gold">
            Archive Visibility
          </span>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as ArchiveVisibility)}
            disabled={loading}
            className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-4 py-3 text-sm text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4 focus:border-archive-gold"
          >
            <option value="public">Public Sanctuary (Discoverable by family &amp; visitors)</option>
            <option value="private">Private Sanctuary (Only accessible via direct link / pass)</option>
          </select>
        </label>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-archive-gold/15">
          <Link
            href={`/archive/${archive.slug}`}
            className="rounded-full border border-archive-gold/35 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:bg-white/10"
          >
            Cancel &amp; Return
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-archive-gold px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne disabled:opacity-50"
          >
            {loading ? "Preserving Changes..." : "Save Archive &amp; Hero Crop"}
          </button>
        </div>
      </form>

      {/* Sidebar Info & QR Card */}
      <aside className="min-w-0 self-start grid gap-6">
        <div className="rounded-[2rem] border border-archive-gold/20 bg-archive-obsidian/90 p-6 text-center shadow-luxury">
          <h3 className="font-serif text-lg text-archive-ivory">Archive QR Code</h3>
          <p className="mt-1 text-xs text-archive-ivory/60">
            Scan to open this archive directly on mobile devices.
          </p>
          <div className="my-4 flex justify-center p-3 bg-white rounded-2xl border border-archive-gold/30 max-w-[200px] mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt="Archive QR Code" className="h-40 w-40 shrink-0" />
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full rounded-full border border-archive-gold/30 bg-white/5 py-2 text-xs font-semibold text-archive-gold transition hover:bg-white/10"
          >
            {copied ? "Link Copied!" : "Copy Archive Link"}
          </button>
        </div>
      </aside>
    </div>
  );
}
