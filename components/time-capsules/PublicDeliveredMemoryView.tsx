import Image from "next/image";
import { formatMemoryDate, prettifyType } from "@/lib/format";

type PublicDeliveredMemoryViewProps = {
  memory: {
    content: string;
    date: string | null;
    mediaUrl: string;
    title: string;
    type: string;
  };
};

function getMediaLabel(type: string) {
  if (type === "video") {
    return "Video";
  }

  return "Media";
}

export function PublicDeliveredMemoryView({
  memory
}: PublicDeliveredMemoryViewProps) {
  const photoUrl = memory.type === "photo" ? memory.mediaUrl : "";
  const voiceUrl = memory.type === "voice" ? memory.mediaUrl : "";
  const externalMediaUrl =
    memory.type !== "photo" && memory.type !== "voice" && memory.mediaUrl
      ? memory.mediaUrl
      : "";

  return (
    <article className="grid gap-6 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
      <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-archive-gold">
        <span>{prettifyType(memory.type)}</span>
        {memory.date ? (
          <>
            <span aria-hidden="true" className="text-archive-ivory/24">
              /
            </span>
            <time dateTime={memory.date} className="text-archive-ivory/64">
              {formatMemoryDate(memory.date)}
            </time>
          </>
        ) : null}
      </div>

      <h2 className="font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
        {memory.title}
      </h2>

      {photoUrl ? (
        <div className="relative aspect-[5/3] overflow-hidden rounded-2xl border border-archive-gold/12 bg-black">
          <Image
            src={photoUrl}
            alt={memory.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 720px, 100vw"
          />
        </div>
      ) : voiceUrl ? (
        <div className="rounded-2xl border border-archive-gold/18 bg-white/[0.04] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
            Voice memory
          </p>
          <audio
            controls
            preload="none"
            className="w-full accent-archive-gold"
            aria-label={`${memory.title} voice recording`}
            src={voiceUrl}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : externalMediaUrl ? (
        <div className="rounded-2xl border border-archive-gold/18 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
            {getMediaLabel(memory.type)}
          </p>
          <p className="mt-3 text-sm leading-7 text-archive-ivory/72">
            This memory includes a linked media item.
          </p>
          <a
            href={externalMediaUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex rounded-full border border-archive-gold/25 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
          >
            Open {getMediaLabel(memory.type)}
          </a>
        </div>
      ) : null}

      {memory.content ? (
        <p className="whitespace-pre-line text-base leading-8 text-archive-ivory/78 sm:text-lg">
          {memory.content}
        </p>
      ) : null}
    </article>
  );
}
