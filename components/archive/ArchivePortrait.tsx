import Image from "next/image";
import { getArchiveHeroImageStyle } from "@/lib/archive-hero-image";

type ArchivePortraitProps = {
  src: string;
  alt: string;
  positionX?: number | null;
  positionY?: number | null;
  zoom?: number | null;
};

export function ArchivePortrait({
  src,
  alt,
  positionX,
  positionY,
  zoom
}: ArchivePortraitProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#130f0b]">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(min-width: 1024px) 18vw, 78vw"
        className="object-cover"
        style={{
          ...getArchiveHeroImageStyle(positionX, positionY, zoom),
          filter: "contrast(1.04) saturate(0.96) sepia(0.08)"
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_42%,rgba(30,18,8,0.22)_100%)]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_32px_rgba(0,0,0,0.45)]" />
    </div>
  );
}
