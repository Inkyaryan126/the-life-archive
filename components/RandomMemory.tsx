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
      <section className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury">
        <h2 className="font-serif text-3xl text-archive-ivory">
          This archive is ready for its first memory
        </h2>
        <p className="mt-3 leading-7 text-archive-ivory/72">
          Add a story, song, photo, voice note, or lesson so each scan has
          something meaningful to reveal.
        </p>
        {canAddMemory ? (
          <Link
            href={`/archive/${archiveSlug}/add-memory`}
            className="mt-5 inline-flex rounded-full bg-archive-gold px-5 py-3 text-sm font-semibold text-archive-obsidian transition hover:bg-archive-champagne"
          >
            Add Memory
          </Link>
        ) : (
          <p className="mt-5 text-sm font-semibold text-archive-ivory/60">
            The archive keeper will add the first memory when it is ready.
          </p>
        )}
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
          Random memory
        </p>
        <Link
          href={`/archive/${archiveSlug}/random?exclude=${encodeURIComponent(memory.id)}`}
          className="rounded-full border border-archive-gold/35 bg-white/5 px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/10"
          prefetch={false}
        >
          Reveal another memory
        </Link>
      </div>
      <MemoryCard memory={memory} />
    </section>
  );
}
