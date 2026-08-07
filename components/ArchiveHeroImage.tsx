import React from "react";
import Image from "next/image";
import {
  getArchiveHeroImageStyle,
  normalizeHeroCropValues,
  DEFAULT_HERO_IMAGE_POSITION_X,
  DEFAULT_HERO_IMAGE_POSITION_Y,
  DEFAULT_HERO_IMAGE_ZOOM,
  type AspectRatioMode
} from "@/lib/archive-hero-image";

export {
  getArchiveHeroImageStyle,
  normalizeHeroCropValues,
  DEFAULT_HERO_IMAGE_POSITION_X,
  DEFAULT_HERO_IMAGE_POSITION_Y,
  DEFAULT_HERO_IMAGE_ZOOM,
  type AspectRatioMode
};

type ArchiveHeroImageProps = {
  src: string;
  alt: string;
  positionX?: number | null;
  positionY?: number | null;
  zoom?: number | null;
  priority?: boolean;
  className?: string;
  sizes?: string;
  aspectRatio?: AspectRatioMode;
};

export function ArchiveHeroImage({
  src,
  alt,
  positionX,
  positionY,
  zoom,
  priority = false,
  className = "",
  sizes = "(min-width: 1280px) 1440px, 100vw",
  aspectRatio = "responsive"
}: ArchiveHeroImageProps) {
  const style = getArchiveHeroImageStyle(positionX, positionY, zoom);

  const aspectClass =
    aspectRatio === "responsive"
      ? "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
      : aspectRatio === "4/3"
        ? "aspect-[4/3]"
        : aspectRatio === "16/9"
          ? "aspect-[16/9]"
          : "aspect-[21/9]";

  return (
    <div className={`relative w-full overflow-hidden ${aspectClass}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`transition-transform duration-300 ${className}`}
        style={style}
        sizes={sizes}
      />
    </div>
  );
}
