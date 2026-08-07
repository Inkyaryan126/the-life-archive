import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { LifeArchive, Memory } from "@/lib/types";
import mainArchiveImage from "@/site-design/archive-building-design/main-archive.png";
import mobileArchiveImage from "@/site-design/mobile/mobile-main-archive.png";
import { ArchiveFlipBook } from "./ArchiveFlipBook";
import { ArchivePortrait } from "./ArchivePortrait";
import {
  archiveBookZone,
  archiveSceneImageSize,
  archiveSceneZones,
  getSceneZoneStyle
} from "./archiveSceneLayout";
import { trimArchiveText } from "./archiveBookModel";

type ArchiveCinematicSceneProps = {
  archive: LifeArchive;
  chapters: Memory[];
  isOwner: boolean;
  isLivingArchive: boolean;
  archiveStatusLabel: string;
  shareAction: ReactNode;
};

export function ArchiveCinematicScene({
  archive,
  chapters,
  isOwner,
  isLivingArchive,
  archiveStatusLabel,
  shareAction
}: ArchiveCinematicSceneProps) {
  const shortDescription = trimArchiveText(archive.bio, 190);

  return (
    <section aria-labelledby="archive-cinematic-title" className="relative">
      {isOwner ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y border-archive-gold/15 bg-black/[0.24] px-4 py-3 text-sm backdrop-blur">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-archive-gold">
              Owner Controls
            </p>
            <p className="text-archive-ivory/62">
              Private tools for maintaining this archive.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/archive/${archive.slug}/edit`}
              className="rounded-full border border-archive-gold/25 px-4 py-2 font-semibold text-archive-ivory transition hover:border-archive-gold hover:text-archive-gold"
            >
              Edit Archive
            </Link>
            {isLivingArchive ? (
              <Link
                href={`/archive/${archive.slug}/add-memory`}
                className="rounded-full bg-archive-gold px-4 py-2 font-bold text-archive-obsidian transition hover:bg-archive-champagne"
              >
                Add Chapter
              </Link>
            ) : null}
            <Link
              href={`/archive/${archive.slug}/legacy-instructions`}
              className="rounded-full border border-archive-gold/25 px-4 py-2 font-semibold text-archive-ivory transition hover:border-archive-gold hover:text-archive-gold"
            >
              Legacy Notes
            </Link>
          </div>
        </div>
      ) : null}

      <div className="hidden lg:block">
        <div
          className="relative mx-auto w-full max-w-[96rem] overflow-hidden rounded-[1.35rem] border border-archive-gold/20 bg-[#070604] shadow-[0_42px_120px_rgba(0,0,0,0.55)]"
          style={{ aspectRatio: archiveSceneImageSize.aspectRatio }}
        >
          <Image
            src={mainArchiveImage}
            alt=""
            fill
            priority
            sizes="(min-width: 1536px) 1536px, 100vw"
            className="object-cover"
            aria-hidden="true"
          />

          <div
            className="absolute overflow-hidden"
            style={getSceneZoneStyle(archiveSceneZones.portrait)}
          >
            <ArchivePortrait
              src={archive.profilePhotoUrl}
              alt={`${archive.personName} portrait`}
              positionX={archive.heroImagePositionX}
              positionY={archive.heroImagePositionY}
              zoom={archive.heroImageZoom}
            />
          </div>

          <div
            className="absolute flex flex-col justify-center"
            style={getSceneZoneStyle(archiveSceneZones.identity)}
          >
            <div className="max-w-[32rem] text-archive-ivory">
              <p className="inline-flex border border-archive-gold/35 bg-black/28 px-3 py-1 text-[clamp(0.62rem,0.8vw,0.78rem)] font-semibold uppercase tracking-[0.2em] text-archive-gold backdrop-blur">
                {archiveStatusLabel}
              </p>
              <h1
                id="archive-cinematic-title"
                className="mt-4 max-w-[12ch] font-serif text-[clamp(2.1rem,4.8vw,4.65rem)] leading-[0.95] text-archive-ivory"
              >
                {archive.personName}
              </h1>
              <p className="mt-3 font-serif text-[clamp(1rem,1.45vw,1.45rem)] italic text-archive-champagne">
                {archive.archiveName}
              </p>
              <p className="mt-4 max-w-[34rem] text-[clamp(0.82rem,1vw,1rem)] leading-relaxed text-archive-ivory/72">
                {shortDescription}
              </p>
              <dl className="mt-5 flex flex-wrap gap-3 text-[clamp(0.68rem,0.86vw,0.82rem)] uppercase tracking-[0.14em] text-archive-ivory/72">
                <div className="border-l border-archive-gold/45 pl-3">
                  <dt className="text-archive-gold">Chapters</dt>
                  <dd>{chapters.length}</dd>
                </div>
                <div className="border-l border-archive-gold/45 pl-3">
                  <dt className="text-archive-gold">Memories</dt>
                  <dd>{chapters.length}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/archive/${archive.slug}/memories`}
                  className="rounded-full bg-archive-gold px-5 py-2.5 text-sm font-bold text-archive-obsidian shadow-[0_0_28px_rgba(201,162,76,0.22)] transition hover:bg-archive-champagne"
                >
                  Explore Memories
                </Link>
                <Link
                  href={`/archive/${archive.slug}/random`}
                  className="rounded-full border border-archive-gold/35 bg-black/22 px-5 py-2.5 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:text-archive-gold"
                >
                  Random Chapter
                </Link>
                {shareAction}
              </div>
            </div>
          </div>

          <div
            className="absolute"
            style={getSceneZoneStyle(archiveBookZone)}
          >
            <ArchiveFlipBook
              archiveSlug={archive.slug}
              personName={archive.personName}
              biography={archive.bio}
              isLivingArchive={isLivingArchive}
              isOwner={isOwner}
              chapters={chapters}
            />
          </div>

          <div className="pointer-events-none absolute left-[26%] top-[20%] h-[17%] w-[10%] rounded-full bg-archive-gold/10 blur-2xl animate-[archiveCandleGlow_3.8s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute right-[19%] top-[32%] h-[12%] w-[7%] rounded-full bg-archive-gold/10 blur-xl animate-[archiveCandleGlow_4.6s_ease-in-out_infinite]" />
        </div>
      </div>

      <div className="lg:hidden">
        <div className="relative overflow-hidden rounded-[1.25rem] border border-archive-gold/18 bg-[#090806] p-4 shadow-luxury">
          <Image
            src={mobileArchiveImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.36]"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/86" />
          <div className="relative z-10">
            <div className="mx-auto w-full max-w-[22rem] overflow-hidden rounded-t-full border border-archive-gold/35 bg-black/40 p-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-full">
                <ArchivePortrait
                  src={archive.profilePhotoUrl}
                  alt={`${archive.personName} portrait`}
                  positionX={archive.heroImagePositionX}
                  positionY={archive.heroImagePositionY}
                  zoom={archive.heroImageZoom}
                />
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
                {archiveStatusLabel}
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory">
                {archive.personName}
              </h1>
              <p className="mt-2 font-serif text-lg italic text-archive-champagne">
                {archive.archiveName}
              </p>
              <p className="mt-4 text-sm leading-6 text-archive-ivory/72">
                {shortDescription}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs uppercase tracking-[0.15em] text-archive-ivory/72">
                <span>{chapters.length} Chapters</span>
                <span aria-hidden="true">|</span>
                <span>{chapters.length} Memories</span>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/archive/${archive.slug}/memories`}
                  className="rounded-full bg-archive-gold px-5 py-2.5 text-sm font-bold text-archive-obsidian"
                >
                  Explore Memories
                </Link>
                <Link
                  href={`/archive/${archive.slug}/random`}
                  className="rounded-full border border-archive-gold/35 px-5 py-2.5 text-sm font-semibold text-archive-ivory"
                >
                  Random Chapter
                </Link>
                {shareAction}
              </div>
            </div>
            <div className="mt-8 h-[34rem] overflow-hidden">
              <ArchiveFlipBook
                archiveSlug={archive.slug}
                personName={archive.personName}
                biography={archive.bio}
                isLivingArchive={isLivingArchive}
                isOwner={isOwner}
                chapters={chapters}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
