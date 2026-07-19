import Link from "next/link";
import {
 notFound } from "next/navigation";
import { AccessPrompt } from "@/components/AccessPrompt";
import {
  ArchiveBuildingShell,
  ArchiveOverlayRegion,
  ArchiveSoftHighlight,
  ArchiveMobileScene
} from "@/components/archive-building/ArchiveBuildingShell";
import { canCurrentUserAddMemory, getAccountContext } from "@/lib/account";
import {
  archiveBuildingMobileScenes,
  archiveBuildingScenes
} from "@/lib/archive-building-scenes";
import { getArchiveBySlug, memoryTypes } from "@/lib/archive-data";
import { prettifyType } from "@/lib/format";
import type { MemoryType } from "@/lib/types";
import { addMemoryAction } from "./actions";
import {
  DesignBackdrop
} from "@/components/SiteDesign";
import { AddMemoryForm } from "./AddMemoryForm";
import {
  memoryTypesByMode,
  modeLabels,
  resolveAddMemoryMode,
  type AddMemoryMode
} from "./memory-mode";

export const dynamic = "force-dynamic";

type AddMemoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    content?: string;
    date?: string;
    error?: string;
    entrySubtype?: string;
    mediaUrl?: string;
    mode?: string;
    tags?: string;
    title?: string;
    type?: string;
  }>;
};

const navRegionsByMode: Record<AddMemoryMode, { left: number; top: number; width: number; height: number }> = {
  "voice-sound": { left: 2.28, top: 26.46, width: 13.81, height: 66.02 },
  "photo-video": { left: 2.02, top: 25.68, width: 13.8, height: 66.02 },
  "letter-journal": { left: 2.15, top: 27.05, width: 13.81, height: 67.09 }
};

const sceneByMode = {
  "voice-sound": archiveBuildingScenes.addVoiceSound,
  "photo-video": archiveBuildingScenes.addPhotoVideo,
  "letter-journal": archiveBuildingScenes.addLetterJournal
} as const;

const arrowHotspotRegionsByMode: Record<AddMemoryMode, { left: number; top: number; width: number; height: number }> = {
  "voice-sound": { left: 80.26, top: 0, width: 19.61, height: 16.11 },
  "photo-video": { left: 80.21, top: 0, width: 19.6, height: 16.02 },
  "letter-journal": { left: 81.56, top: 0, width: 18.05, height: 17.97 }
};

const archiveTitleRegionsByMode: Record<AddMemoryMode, { left: number; top: number; width: number; height: number }> = {
  "voice-sound": { left: 20.39, top: 1.56, width: 14.33, height: 7.03 },
  "photo-video": { left: 20.05, top: 1.56, width: 14.32, height: 7.03 },
  "letter-journal": { left: 19.93, top: 2.64, width: 14.33, height: 7.23 }
};

const voiceSoundFormRegion = { left: 34.79, top: 62.11, width: 20, height: 22.07 };
const photoVideoLeftRegion = { left: 32.95, top: 32.62, width: 21.65, height: 46.88 };
const photoVideoRightRegion = { left: 54.95, top: 32.52, width: 21.95, height: 46.98 };
const letterJournalWritingRegion = { left: 41.55, top: 35.94, width: 41.35, height: 36.72 };
const letterJournalFieldsRegion = { left: 39.1, top: 72.56, width: 34.6, height: 16.6 };

const compactInputClass =
  "w-full rounded-lg border border-[#8a6427]/36 bg-[#f4dfb7]/48 px-[clamp(0.55rem,0.8vw,0.9rem)] py-[clamp(0.45rem,0.65vw,0.72rem)] text-[clamp(0.76rem,0.9vw,1rem)] leading-tight text-[#24190d] outline-none ring-[#9e6f27]/25 placeholder:text-[#5c4326]/58 focus:ring-2";
const compactDarkInputClass =
  "w-full rounded-lg border border-archive-gold/30 bg-black/42 px-[clamp(0.55rem,0.8vw,0.9rem)] py-[clamp(0.45rem,0.65vw,0.72rem)] text-[clamp(0.76rem,0.9vw,1rem)] leading-tight text-archive-ivory outline-none ring-archive-gold/25 placeholder:text-archive-ivory/52 focus:ring-2";
const compactButtonClass =
  "rounded-lg bg-[#9e6f27] px-[clamp(0.9rem,1.25vw,1.35rem)] py-[clamp(0.55rem,0.78vw,0.85rem)] text-[clamp(0.66rem,0.78vw,0.88rem)] font-bold uppercase tracking-[0.12em] text-[#140f09] transition hover:bg-archive-champagne focus:outline-none focus:ring-2 focus:ring-archive-gold/70";
const compactFileInputClass =
  "w-full cursor-pointer rounded-xl border border-dashed border-[#8a6427]/48 bg-[#f4dfb7]/34 px-[clamp(0.55rem,0.8vw,0.9rem)] py-[clamp(0.55rem,0.8vw,0.9rem)] text-[clamp(0.7rem,0.82vw,0.92rem)] leading-tight text-[#3c2a17] outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-[#9e6f27] file:px-[clamp(0.65rem,0.95vw,1rem)] file:py-[clamp(0.42rem,0.6vw,0.66rem)] file:text-[clamp(0.62rem,0.72vw,0.82rem)] file:font-bold file:uppercase file:tracking-[0.08em] file:text-[#140f09] hover:bg-[#f4dfb7]/46 focus:ring-2 focus:ring-[#9e6f27]/30";

function isSupportedMemoryType(value?: string): value is MemoryType {
  return Boolean(value && memoryTypes.includes(value as MemoryType));
}

function getDefaultType(input: {
  mode: AddMemoryMode;
  requestedType?: MemoryType | null;
  requestedMode?: string;
}) {
  const modeTypes = memoryTypesByMode[input.mode];

  if (input.requestedType && modeTypes.includes(input.requestedType)) {
    return input.requestedType;
  }

  if (input.mode === "letter-journal" && !input.requestedMode) {
    return "journal";
  }

  return modeTypes[0];
}

function DesktopError({ message, dark = false }: { message?: string; dark?: boolean }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`rounded-md px-2 py-1.5 text-[0.62rem] leading-snug ${
        dark
          ? "bg-archive-gold/16 text-archive-ivory"
          : "bg-[#9e6f27]/18 text-[#2c1f12]"
      }`}
    >
      {message}
    </div>
  );
}

function getDefaultEntrySubtype(value?: string) {
  return value === "letter" || value === "journal-entry" ? value : "letter";
}

function AddRoomArrowHotspot({ region }: { region: { left: number; top: number; width: number; height: number } }) {
  return (
    <ArchiveOverlayRegion region={region} ariaLabel="Go to My Archives">
      <Link
        href="/dashboard"
        aria-label="Go to My Archives"
        className="group relative block h-full w-full rounded-full focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
      >
        <ArchiveSoftHighlight className="rounded-full bg-[radial-gradient(circle_at_center,rgba(232,207,136,0.5),rgba(232,207,136,0.18)_45%,transparent_78%)]" />
      </Link>
    </ArchiveOverlayRegion>
  );
}

function ActiveArchiveTitleFrame({
  region,
  title
}: {
  region: { left: number; top: number; width: number; height: number };
  title: string;
}) {
  const safeTitle = title || "My Archive";

  return (
    <ArchiveOverlayRegion
      region={region}
      ariaLabel="Active archive title"
      className="flex items-center justify-center px-2 text-center"
    >
      <p
        title={safeTitle}
        className="line-clamp-2 font-serif text-[clamp(0.7rem,0.95vw,1.15rem)] leading-tight text-archive-gold/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.75)]"
      >
        {safeTitle}
      </p>
    </ArchiveOverlayRegion>
  );
}

export default async function AddMemoryPage({
  params,
  searchParams
}: AddMemoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const [archive, account] = await Promise.all([
    getArchiveBySlug(slug),
    getAccountContext()
  ]);

  if (!archive) {
    if (account.isConfigured && !account.user) {
      const returnPath = `/archive/${slug}/add-memory`;

      return (
        <AccessPrompt
          eyebrow="Private archive"
          title="Sign in to add a memory."
          message="This archive is private. Sign in with an authorized account to continue."
          primaryHref={`/login?next=${encodeURIComponent(returnPath)}`}
          primaryLabel="Sign In"
        />
      );
    }

    notFound();
  }

  const canAddMemory = await canCurrentUserAddMemory(archive.slug, account);

  if (!account.user) {
    const returnPath = `/archive/${archive.slug}/add-memory`;

    return (
      <AccessPrompt
        eyebrow="Archive contribution"
        title="Sign in to add a memory."
        message="Only the archive owner and authorized editors can add to this story."
        primaryHref={`/login?next=${encodeURIComponent(returnPath)}`}
        primaryLabel="Sign In"
        secondaryHref={`/archive/${archive.slug}`}
        secondaryLabel="Back to Archive"
      />
    );
  }

  if (!canAddMemory) {
    return (
      <AccessPrompt
        eyebrow="Archive access"
        title="This archive is not open for contributions."
        message="Only the archive owner and authorized editors can add memories. You can still return to the archive and revisit its story."
        primaryHref={`/archive/${archive.slug}`}
        primaryLabel="Back to Archive"
        secondaryHref="/dashboard"
        secondaryLabel="Visit My Archives"
      />
    );
  }

  const saveMemory = addMemoryAction.bind(null, archive.slug);
  const requestedType = isSupportedMemoryType(resolvedSearchParams?.type)
    ? resolvedSearchParams.type
    : null;
  const addMode = resolveAddMemoryMode({
    mode: resolvedSearchParams?.mode,
    type: requestedType ?? undefined
  });
  const defaultType = getDefaultType({
    mode: addMode,
    requestedType,
    requestedMode: resolvedSearchParams?.mode
  });
  const desktopScene = sceneByMode[addMode];
  const desktopSceneLabel = `${modeLabels[addMode]} archive-building room`;
  const mobileSceneByMode = {
    "voice-sound": archiveBuildingMobileScenes.recording,
    "photo-video": archiveBuildingMobileScenes.study,
    "letter-journal": archiveBuildingMobileScenes.writing
  } as const;

  const mobileTitleByMode = {
    "voice-sound": "THE RECORDING ROOM",
    "photo-video": "THE STUDY",
    "letter-journal": "THE WRITING ROOM"
  } as const;

  const mobileSubtitleByMode = {
    "voice-sound": "Let them hear you in your own voice.",
    "photo-video": "Preserve the moments they will want to see.",
    "letter-journal": "Leave behind the words only you can write."
  } as const;

  const mobileScene = mobileSceneByMode[addMode];
  const mobileSceneTitle = mobileTitleByMode[addMode];
  const mobileSceneSubtitle = mobileSubtitleByMode[addMode];

  return (
    <>
      <ArchiveBuildingShell
        image={{ ...desktopScene, priority: true }}
        active={addMode}
        archiveSlug={archive.slug}
        archiveName={archive.archiveName}
        archivePersonName={archive.personName}
        showArchiveActions
        navRegion={navRegionsByMode[addMode]}
        sceneLabel={desktopSceneLabel}
      >
        <ActiveArchiveTitleFrame
          region={archiveTitleRegionsByMode[addMode]}
          title={archive.archiveName}
        />
        <AddRoomArrowHotspot region={arrowHotspotRegionsByMode[addMode]} />

        {addMode === "voice-sound" ? (
          <ArchiveOverlayRegion
            region={voiceSoundFormRegion}
            ariaLabel="Add voice and sound fields"
            className="overflow-hidden p-3 text-archive-ivory"
          >
            <div className="grid h-full grid-rows-2 gap-2 rounded-lg bg-black/18 p-2 backdrop-blur-[1px]">
              <AddMemoryForm action={saveMemory} className="grid min-h-0 content-start gap-1.5">
                <input type="hidden" name="mode" value="voice-sound" />
                <input type="hidden" name="type" value="voice" />
                <DesktopError message={resolvedSearchParams?.error} dark />
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-archive-gold">
                  Upload Voice or Audio
                </p>
                <input
                  name="title"
                  required
                  defaultValue={defaultType === "voice" ? resolvedSearchParams?.title ?? "" : ""}
                  placeholder="Title"
                  aria-label="Voice title"
                  className={compactDarkInputClass}
                />
                <input
                  name="mediaFile"
                  type="file"
                  accept="audio/*"
                  aria-label="Upload voice or audio file"
                  className="w-full text-[0.58rem] text-archive-ivory/78 file:mr-2 file:rounded-md file:border-0 file:bg-archive-gold file:px-2 file:py-1 file:text-[0.55rem] file:font-semibold file:text-archive-obsidian"
                />
                <input
                  name="date"
                  type="date"
                  defaultValue={defaultType === "voice" ? resolvedSearchParams?.date ?? "" : ""}
                  aria-label="Voice date"
                  className={compactDarkInputClass}
                />
                <button type="submit" className={compactButtonClass}>
                  Preserve Voice
                </button>
              </AddMemoryForm>

              <AddMemoryForm action={saveMemory} className="grid min-h-0 content-start gap-1.5">
                <input type="hidden" name="mode" value="voice-sound" />
                <input type="hidden" name="type" value="song" />
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-archive-gold">
                  Add Song or Sound Link
                </p>
                <input
                  name="title"
                  required
                  defaultValue={defaultType === "song" ? resolvedSearchParams?.title ?? "" : ""}
                  placeholder="Title"
                  aria-label="Song or sound title"
                  className={compactDarkInputClass}
                />
                <input
                  name="mediaUrl"
                  type="url"
                  defaultValue={defaultType === "song" ? resolvedSearchParams?.mediaUrl ?? "" : ""}
                  placeholder="Spotify song link"
                  aria-label="Spotify song link"
                  className={compactDarkInputClass}
                />
                <textarea
                  name="content"
                  rows={2}
                  defaultValue={defaultType === "song" ? resolvedSearchParams?.content ?? "" : ""}
                  placeholder="Why this sound matters"
                  aria-label="Song or sound context"
                  className={`${compactDarkInputClass} resize-none`}
                />
                <button type="submit" className={compactButtonClass}>
                  Preserve Sound
                </button>
              </AddMemoryForm>
            </div>
          </ArchiveOverlayRegion>
        ) : null}

        {addMode === "photo-video" ? (
          <>
            <ArchiveOverlayRegion
              region={photoVideoLeftRegion}
              ariaLabel="Photo upload fields"
              className="p-[clamp(1rem,1.4vw,1.5rem)] text-[#2a1c10]"
            >
              <AddMemoryForm action={saveMemory} className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)_auto_auto_auto] gap-[clamp(0.55rem,0.8vw,0.9rem)]">
                <input type="hidden" name="mode" value="photo-video" />
                <input type="hidden" name="type" value="photo" />
                <DesktopError message={resolvedSearchParams?.error} />
                <div>
                  <p className="text-[clamp(0.72rem,0.88vw,0.98rem)] font-bold uppercase tracking-[0.14em] text-[#5c3b19]">
                    Photo Upload
                  </p>
                  <p className="mt-1 line-clamp-2 text-[clamp(0.64rem,0.76vw,0.84rem)] leading-snug text-[#5c4326]/78">
                    Add the image and the story that belongs with it.
                  </p>
                </div>
                <input
                  name="title"
                  required
                  defaultValue={defaultType === "photo" ? resolvedSearchParams?.title ?? "" : ""}
                  placeholder="Title"
                  aria-label="Photo title"
                  className={compactInputClass}
                />
                <textarea
                  name="content"
                  rows={7}
                  defaultValue={defaultType === "photo" ? resolvedSearchParams?.content ?? "" : ""}
                  placeholder="Caption or story"
                  aria-label="Photo caption or story"
                  className={`${compactInputClass} min-h-0 resize-none leading-[1.5]`}
                />
                <input
                  name="mediaFile"
                  type="file"
                  accept="image/*"
                  aria-label="Upload photo file"
                  className={compactFileInputClass}
                />
                <input
                  name="mediaUrl"
                  type="url"
                  defaultValue={defaultType === "photo" ? resolvedSearchParams?.mediaUrl ?? "" : ""}
                  placeholder="Unsplash photo link"
                  aria-label="Unsplash photo link"
                  className={compactInputClass}
                />
                <button type="submit" className={compactButtonClass}>
                  Preserve Photo
                </button>
              </AddMemoryForm>
            </ArchiveOverlayRegion>
            <ArchiveOverlayRegion
              region={photoVideoRightRegion}
              ariaLabel="Video chapter fields"
              className="p-[clamp(1rem,1.4vw,1.5rem)] text-[#2a1c10]"
            >
              <AddMemoryForm action={saveMemory} className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-[clamp(0.55rem,0.8vw,0.9rem)]">
                <input type="hidden" name="mode" value="photo-video" />
                <input type="hidden" name="type" value="video" />
                <div>
                  <p className="text-[clamp(0.72rem,0.88vw,0.98rem)] font-bold uppercase tracking-[0.14em] text-[#5c3b19]">
                    Video Chapter
                  </p>
                  <p className="mt-1 line-clamp-3 text-[clamp(0.64rem,0.76vw,0.84rem)] leading-snug text-[#5c4326]/78">
                    Video upload is not available yet. Save where the video lives and why it matters.
                  </p>
                </div>
                <input
                  name="title"
                  required
                  defaultValue={defaultType === "video" ? resolvedSearchParams?.title ?? "" : ""}
                  placeholder="Title"
                  aria-label="Video title"
                  className={compactInputClass}
                />
                <textarea
                  name="content"
                  rows={10}
                  required
                  defaultValue={defaultType === "video" ? resolvedSearchParams?.content ?? "" : ""}
                  placeholder="Describe the video, where it lives, or why it matters"
                  aria-label="Video chapter context"
                  className={`${compactInputClass} min-h-0 resize-none leading-[1.5]`}
                />
                <button type="submit" className={compactButtonClass}>
                  Save Video Chapter
                </button>
              </AddMemoryForm>
            </ArchiveOverlayRegion>
          </>
        ) : null}

        {addMode === "letter-journal" ? (
          <AddMemoryForm action={saveMemory} className="contents">
            <input type="hidden" name="mode" value="letter-journal" />
            <input type="hidden" name="type" value="journal" />
            <ArchiveOverlayRegion
              region={letterJournalWritingRegion}
              ariaLabel="Letter or journal writing area"
              className="p-[clamp(1rem,1.45vw,1.6rem)] text-[#24190d]"
            >
              <textarea
                name="content"
                rows={12}
                required
                defaultValue={resolvedSearchParams?.content ?? ""}
                placeholder="Write the letter or journal entry here."
                aria-label="Letter or journal body"
                className="h-full w-full resize-none border-0 bg-transparent px-[clamp(0.5rem,0.9vw,1rem)] py-[clamp(0.45rem,0.8vw,0.9rem)] font-serif text-[clamp(1.08rem,1.32vw,1.45rem)] leading-[1.65] text-[#24190d] outline-none placeholder:text-[#5c4326]/50 focus:ring-2 focus:ring-[#9e6f27]/25"
              />
            </ArchiveOverlayRegion>
            <ArchiveOverlayRegion
              region={letterJournalFieldsRegion}
              ariaLabel="Letter or journal details"
              className="p-[clamp(0.7rem,1vw,1.1rem)] text-[#24190d]"
            >
              <div className="grid h-full content-center gap-[clamp(0.5rem,0.72vw,0.8rem)] rounded-xl border border-[#8a6427]/16 bg-[#f4dfb7]/16 px-[clamp(0.45rem,0.7vw,0.8rem)]">
                <DesktopError message={resolvedSearchParams?.error} />
                <div className="grid grid-cols-[1fr_0.78fr] gap-[clamp(0.45rem,0.7vw,0.8rem)]">
                  <input
                    name="title"
                    required
                    defaultValue={resolvedSearchParams?.title ?? ""}
                    placeholder="Title"
                    aria-label="Title"
                    className={compactInputClass}
                  />
                  <select
                    name="entrySubtype"
                    defaultValue={getDefaultEntrySubtype(resolvedSearchParams?.entrySubtype)}
                    aria-label="Writing type"
                    className={compactInputClass}
                  >
                    <option value="letter" className="bg-archive-obsidian text-archive-ivory">
                      Letter
                    </option>
                    <option value="journal-entry" className="bg-archive-obsidian text-archive-ivory">
                      Journal Entry
                    </option>
                  </select>
                </div>
                <div className="grid grid-cols-[0.85fr_1fr_auto] gap-[clamp(0.45rem,0.7vw,0.8rem)]">
                  <input
                    name="date"
                    type="date"
                    defaultValue={resolvedSearchParams?.date ?? ""}
                    aria-label="Date"
                    className={compactInputClass}
                  />
                  <input
                    name="tags"
                    defaultValue={resolvedSearchParams?.tags ?? ""}
                    placeholder="Tags"
                    aria-label="Tags"
                    className={compactInputClass}
                  />
                  <button type="submit" className={compactButtonClass}>
                    Preserve
                  </button>
                </div>
              </div>
            </ArchiveOverlayRegion>
          </AddMemoryForm>
        ) : null}
      </ArchiveBuildingShell>

      <ArchiveMobileScene
        image={{ ...mobileScene, priority: true }}
        sceneLabel="Add Memory mobile archive room"
        title={mobileSceneTitle}
        subtitle={mobileSceneSubtitle}
        className="px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))] sm:px-6"
      >
<div className="relative z-10 mx-auto max-w-3xl">
        <nav className="pb-10">
          <Link
            href={`/archive/${archive.slug}`}
            className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold"
          >
            Back to archive
          </Link>
        </nav>

        <header className="pb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
            Add a chapter
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory">
            Preserve something that should be remembered.
          </h1>
        </header>

        <AddMemoryForm action={saveMemory}>
          {resolvedSearchParams?.error ? (
            <div className="rounded-2xl border border-archive-gold/24 bg-archive-gold/10 px-4 py-4 text-archive-ivory">
              <p className="font-serif text-xl leading-tight text-archive-ivory">
                Your recording could not be uploaded
              </p>
              <p className="mt-2 text-sm leading-6 text-archive-ivory/70">
                {resolvedSearchParams.error}
              </p>
            </div>
          ) : null}
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Title
              </span>
              <input
                name="title"
                required
                defaultValue={resolvedSearchParams?.title ?? ""}
                placeholder="The kitchen table rule"
                className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Chapter Type
              </span>
              <select
                name="type"
                defaultValue={defaultType}
                className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
              >
                {memoryTypes.map((type) => (
                  <option key={type} value={type} className="bg-archive-obsidian">
                    {prettifyType(type)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                The Chapter Story
              </span>
              <textarea
                name="content"
                rows={6}
                defaultValue={resolvedSearchParams?.content ?? ""}
                placeholder="Write the memory, lesson, journal entry, or context for this media."
                className="resize-y rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
              />
            </label>

            <div className="grid gap-4 rounded-lg border border-archive-gold/10 bg-white/[0.02] px-4 py-4">
              <p className="text-sm font-semibold text-archive-ivory">
                Chapter media
              </p>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-archive-ivory/78">
                  Upload a photo or voice file
                </span>
                <input
                  name="mediaFile"
                  type="file"
                  accept="image/*,audio/*"
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-sm text-archive-ivory outline-none ring-archive-gold/30 transition file:mr-4 file:rounded-full file:border-0 file:bg-archive-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-archive-obsidian focus:ring-4"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-archive-ivory/78">
                  Or paste a photo, voice file, or Spotify link
                </span>
                <input
                  name="mediaUrl"
                  type="url"
                  defaultValue={resolvedSearchParams?.mediaUrl ?? ""}
                  placeholder="Paste an Unsplash photo link, a hosted voice file, or Spotify song link"
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                />
              </label>
              <span className="text-sm leading-6 text-archive-ivory/58">
                Photo memories can use an uploaded image or a photo link. Voice
                memories can use an uploaded audio file or a hosted voice link.
                Songs still use Spotify links.
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ivory">
                  Date
                </span>
                <input
                  name="date"
                  type="date"
                  defaultValue={resolvedSearchParams?.date ?? ""}
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ivory">
                  Tags
                </span>
                <input
                  name="tags"
                  defaultValue={resolvedSearchParams?.tags ?? ""}
                  placeholder="family, lesson, home"
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-archive-gold px-6 py-3 text-sm font-semibold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Preserve Chapter
            </button>
            <p className="text-sm leading-6 text-archive-ivory/60">
              This chapter will become part of their story.
            </p>
          </div>
        </AddMemoryForm>
      </div>
      </ArchiveMobileScene>
    </>
  );
}
