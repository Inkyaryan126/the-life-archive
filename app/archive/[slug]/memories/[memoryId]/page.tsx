import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteMemoryAction } from "@/components/DeleteMemoryAction";
import { DesignBackdrop } from "@/components/SiteDesign";
import { MemoryPhotoImage } from "@/components/media/MemoryPhotoImage";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug, getMemoriesByArchiveSlug } from "@/lib/archive-data";
import { formatMemoryDate, prettifyType } from "@/lib/format";
import { deleteMemoryAction } from "./actions";
import { ArchiveMobileScene } from "@/components/archive-building/ArchiveBuildingShell";
import { archiveBuildingMobileScenes } from "@/lib/archive-building-scenes";

export const dynamic = "force-dynamic";

type MemoryPageProps = {
  params: Promise<{
    slug: string;
    memoryId: string;
  }>;
  searchParams?: Promise<{
    deleteError?: string;
  }>;
};

export default async function MemoryPage({ params, searchParams }: MemoryPageProps) {
  const { slug, memoryId } = await params;
  const resolvedSearchParams = await searchParams;
  const [archive, account, memories] = await Promise.all([
    getArchiveBySlug(slug),
    getAccountContext(),
    getMemoriesByArchiveSlug(slug)
  ]);

  if (!archive) {
    notFound();
  }

  const memory = memories.find((item) => item.id === memoryId);

  if (!memory) {
    notFound();
  }

  const canEdit = account.archives.some((item) => item.slug === archive.slug);
  const photoUrl = memory.type === "photo" ? memory.mediaUrl : undefined;
  const voiceUrl = memory.type === "voice" ? memory.mediaUrl : undefined;
  const deleteFailed = resolvedSearchParams?.deleteError === "1";

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 text-archive-ivory sm:px-8">
        <ArchiveMobileScene
          image={{ ...archiveBuildingMobileScenes.study, priority: true }}
          sceneLabel="Memory detail mobile study"
          title={"A PRESERVED MEMORY"}
          subtitle="Some moments deserve to be entered slowly."
          backgroundOnly
        />

      <DesignBackdrop />

      <div className="relative z-10 mx-auto max-w-4xl">
        <nav className="flex items-center justify-between">
          <Link
            href={`/archive/${archive.slug}/memories`}
            className="text-sm font-semibold text-archive-ivory/80 underline-offset-4 hover:underline hover:text-archive-gold"
          >
            Back to chapters
          </Link>
          {canEdit ? (
            <Link
              href={`/dashboard?archive=${encodeURIComponent(archive.slug)}`}
              className="rounded-full border border-archive-gold/35 bg-white/5 px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/10"
            >
              Add Memory
            </Link>
          ) : null}
        </nav>

        <header className="py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
            {prettifyType(memory.type)}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
            {memory.title}
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.16em] text-archive-ivory/58">
            {formatMemoryDate(memory.date)}
          </p>
        </header>

        <article className="grid gap-6 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
          {deleteFailed ? (
            <div className="rounded-2xl border border-red-900/35 bg-red-950/15 p-5">
              <p className="text-sm font-semibold text-red-100">
                We could not delete this memory. Nothing else was changed.
                Please try again.
              </p>
            </div>
          ) : null}

          {photoUrl ? (
            <div className="mb-2">
              <MemoryPhotoImage
                src={photoUrl}
                alt={memory.title}
                priority
                sizes="(min-width: 768px) 720px, 100vw"
              />
            </div>
          ) : voiceUrl ? (
            <div className="rounded-2xl border border-archive-gold/18 bg-white/[0.04] p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
                Voice note
              </p>
              <audio controls preload="none" className="w-full accent-archive-gold" src={voiceUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
              Chapter
            </p>
            <p className="mt-3 whitespace-pre-line text-base leading-8 text-archive-ivory/78 sm:text-lg">
              {memory.content}
            </p>
          </div>

          {memory.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-t border-white/5 pt-5">
              {memory.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-archive-gold/18 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-archive-ivory/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </article>

        {canEdit ? (
          <section className="mt-6">
            <DeleteMemoryAction
              action={deleteMemoryAction}
              archiveSlug={archive.slug}
              memoryId={memory.id}
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}
