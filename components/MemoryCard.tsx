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
    <article className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury">
      {photoUrl ? (
        <div className="relative mb-4 aspect-[5/3] overflow-hidden rounded-2xl">
          <Image
            src={photoUrl}
            alt={memory.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 420px, 100vw"
          />
        </div>
      ) : voiceUrl ? (
        <div className="mb-4 rounded-2xl border border-archive-gold/18 bg-white/[0.04] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
            Voice note
          </p>
          <audio controls preload="none" className="w-full accent-archive-gold" src={voiceUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
        <span>{prettifyType(memory.type)}</span>
        <span aria-hidden="true" className="text-archive-ivory/20">/</span>
        <time dateTime={memory.date} className="text-archive-ivory/60">{formatMemoryDate(memory.date)}</time>
      </div>
      <h3 className="mt-3 font-serif text-2xl text-archive-ivory">
        {memory.title}
      </h3>
      <p className="mt-3 leading-7 text-archive-ivory/72">{memory.content}</p>
      {memory.mediaUrl && !photoUrl && !voiceUrl ? (
        <Link
          href={memory.mediaUrl}
          className="mt-4 inline-flex text-sm font-semibold text-archive-gold underline-offset-4 hover:underline"
        >
          Open media link
        </Link>
      ) : null}
    </article>
  );
}
