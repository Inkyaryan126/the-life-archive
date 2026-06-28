import Link from "next/link";
import { MemoryCard } from "@/components/MemoryCard";
import type { Memory } from "@/lib/types";

type RandomMemoryProps = {
  archiveSlug: string;
  canAddMemory: boolean;
  memory: Memory | null;
};

export function RandomMemory({
  archiveSlug,
  canAddMemory,
  memory
}: RandomMemoryProps) {
  if (!memory) {
    return (
      <section className="rounded-lg border border-archive-ink/10 bg-white/82 p-6 shadow-soft">
        <h2 className="font-serif text-3xl text-archive-ink">
          This archive is ready for its first memory
        </h2>
        <p className="mt-3 leading-7 text-archive-ink/72">
          Add a story, song, photo, voice note, or lesson so each scan has
          something meaningful to reveal.
        </p>
        {canAddMemory ? (
          <Link
            href={`/archive/${archiveSlug}/add-memory`}
            className="mt-5 inline-flex rounded-full bg-archive-clay px-5 py-3 text-sm font-semibold text-white"
          >
            Add Memory
          </Link>
        ) : (
          <p className="mt-5 text-sm font-semibold text-archive-sage">
            The archive keeper will add the first memory when it is ready.
          </p>
        )}
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
          Random memory
        </p>
        <Link
          href={`/archive/${archiveSlug}/random?exclude=${encodeURIComponent(memory.id)}`}
          className="rounded-full border border-archive-ink/15 bg-white/70 px-4 py-2 text-sm font-semibold text-archive-ink transition hover:bg-white"
          prefetch={false}
        >
          Reveal another memory
        </Link>
      </div>
      <MemoryCard memory={memory} />
    </section>
  );
}
