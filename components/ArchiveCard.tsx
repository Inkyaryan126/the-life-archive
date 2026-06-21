import Image from "next/image";
import Link from "next/link";
import type { LifeArchive } from "@/lib/types";

type ArchiveCardProps = {
  archive: LifeArchive;
};

export function ArchiveCard({ archive }: ArchiveCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-archive-ink/10 bg-white/78 shadow-soft backdrop-blur">
      <div className="relative aspect-[4/3]">
        <Image
          src={archive.profilePhotoUrl}
          alt={archive.personName}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 360px, 100vw"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-2xl text-archive-ink">
            {archive.personName}
          </h3>
          <span className="rounded-full bg-archive-mist px-3 py-1 text-xs font-semibold uppercase tracking-wide text-archive-sage">
            Public · discoverable
          </span>
        </div>
        <p className="mt-3 line-clamp-3 leading-7 text-archive-ink/70">
          {archive.bio}
        </p>
        <Link
          href={`/archive/${archive.slug}`}
          className="mt-5 inline-flex rounded-full bg-archive-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-archive-clay"
        >
          Open archive
        </Link>
      </div>
    </article>
  );
}
