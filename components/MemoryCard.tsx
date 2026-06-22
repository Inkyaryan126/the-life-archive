import Image from "next/image";
import Link from "next/link";
import { formatMemoryDate, prettifyType } from "@/lib/format";
import type { Memory } from "@/lib/types";

type MemoryCardProps = {
  memory: Memory;
};

export function MemoryCard({ memory }: MemoryCardProps) {
  const photoUrl = memory.type === "photo" ? memory.mediaUrl : undefined;
  const voiceUrl = memory.type === "voice" ? memory.mediaUrl : undefined;

  return (
    <article className="rounded-lg border border-archive-ink/10 bg-white/82 p-4 shadow-soft">
      {photoUrl ? (
        <div className="relative mb-4 aspect-[5/3] overflow-hidden rounded-md">
          <Image
            src={photoUrl}
            alt={memory.title}
            fill
          className="object-cover"
          sizes="(min-width: 768px) 420px, 100vw"
        />
      </div>
      ) : voiceUrl ? (
        <div className="mb-4 rounded-md border border-archive-ink/10 bg-archive-linen p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-archive-clay">
            Voice note
          </p>
          <audio controls preload="none" className="w-full" src={voiceUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-archive-clay">
        <span>{prettifyType(memory.type)}</span>
        <span aria-hidden="true">/</span>
        <time dateTime={memory.date}>{formatMemoryDate(memory.date)}</time>
      </div>
      <h3 className="mt-3 font-serif text-2xl text-archive-ink">
        {memory.title}
      </h3>
      <p className="mt-3 leading-7 text-archive-ink/72">{memory.content}</p>
      {memory.mediaUrl && !photoUrl && !voiceUrl ? (
        <Link
          href={memory.mediaUrl}
          className="mt-4 inline-flex text-sm font-semibold text-archive-sage underline-offset-4 hover:underline"
        >
          Open media link
        </Link>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {memory.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-archive-linen px-3 py-1 text-xs font-medium text-archive-ink/70"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
