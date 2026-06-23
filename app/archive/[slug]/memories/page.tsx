import Link from "next/link";
import { notFound } from "next/navigation";
import { MemoryCard } from "@/components/MemoryCard";
import { SuccessMessage } from "@/components/SuccessMessage";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug, getMemoriesByArchiveSlug } from "@/lib/archive-data";
import type { MemoryType } from "@/lib/types";
import { prettifyType } from "@/lib/format";

export const dynamic = "force-dynamic";

type MemoriesPageProps = {
  params: {
    slug: string;
  };
  searchParams?: {
    created?: string;
    type?: string;
  };
};

const memoryTypeLabels: Record<MemoryType, string> = {
  photo: "Photos",
  video: "Videos",
  voice: "Voice Notes",
  journal: "Journals",
  lesson: "Life Lessons",
  song: "Songs"
};

function isMemoryType(value: string): value is MemoryType {
  return ["photo", "video", "voice", "journal", "lesson", "song"].includes(
    value
  );
}

export default async function MemoriesPage({ params, searchParams }: MemoriesPageProps) {
  const [archive, account] = await Promise.all([
    getArchiveBySlug(params.slug),
    getAccountContext()
  ]);

  if (!archive) {
    notFound();
  }

  const memories = await getMemoriesByArchiveSlug(params.slug);
  const selectedType = searchParams?.type && isMemoryType(searchParams.type)
    ? searchParams.type
    : null;
  const filteredMemories = selectedType
    ? memories.filter((memory) => memory.type === selectedType)
    : memories;
  const isOwner = account.archives.some((item) => item.slug === archive.slug);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between">
          <Link
            href={`/archive/${archive.slug}`}
            className="text-sm font-semibold text-archive-sage underline-offset-4 hover:underline"
          >
            Back to archive
          </Link>
          {isOwner ? (
            <Link
              href={`/archive/${archive.slug}/add-memory`}
              className="rounded-full bg-archive-ink px-4 py-2 text-sm font-semibold text-white"
            >
              Add Memory
            </Link>
          ) : null}
        </nav>

        <header className="py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
            Browse memories
          </p>
          <h1 className="mt-3 font-serif text-4xl text-archive-ink sm:text-5xl">
            {archive.personName}
          </h1>
          {selectedType ? (
            <p className="mt-3 inline-flex rounded-full border border-archive-gold/20 bg-archive-gold/10 px-4 py-2 text-sm font-semibold text-archive-clay">
              {memoryTypeLabels[selectedType]}
            </p>
          ) : null}
        </header>

        {searchParams?.created === "1" ? (
          <SuccessMessage
            eyebrow="Memory preserved"
            message="This memory is now part of the archive and ready to be revisited."
          />
        ) : null}

        {filteredMemories.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2">
            {filteredMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </section>
        ) : (
          <section className="rounded-lg border border-archive-ink/10 bg-white/82 p-6 shadow-soft">
            <h2 className="font-serif text-3xl text-archive-ink">
              {selectedType ? `No ${prettifyType(selectedType)} memories yet` : "No memories yet"}
            </h2>
            <p className="mt-3 leading-7 text-archive-ink/72">
              {selectedType
                ? `This chapter does not have any ${memoryTypeLabels[selectedType].toLowerCase()} yet.`
                : "Start with one story, photo, song, voice note, or lesson. The archive will grow from there."}
            </p>
            {isOwner ? (
              <Link
                href={`/archive/${archive.slug}/add-memory`}
                className="mt-5 inline-flex rounded-full bg-archive-clay px-5 py-3 text-sm font-semibold text-white"
              >
                Add Memory
              </Link>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
