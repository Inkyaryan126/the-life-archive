"use client";

import { useState } from "react";
import Image from "next/image";

type MemoryPhotoImageProps = {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  priority?: boolean;
  onPortraitDetected?: (isPortrait: boolean) => void;
};

export function MemoryPhotoImage({
  src,
  alt,
  className = "",
  containerClassName,
  sizes = "100vw",
  priority = false,
  onPortraitDetected
}: MemoryPhotoImageProps) {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  const defaultContainerClass = isPortrait
    ? "relative w-full aspect-[4/5] max-h-[480px] overflow-hidden rounded-2xl"
    : "relative w-full aspect-[5/3] overflow-hidden rounded-2xl";

  return (
    <div className={containerClassName ?? defaultContainerClass}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        onLoadingComplete={({ naturalWidth, naturalHeight }) => {
          const portrait = naturalHeight > naturalWidth;
          if (portrait) {
            setIsPortrait(true);
            if (onPortraitDetected) onPortraitDetected(true);
          }
        }}
        className={`object-cover ${className}`}
        style={{ objectPosition: isPortrait ? "center 15%" : "center 20%" }}
        sizes={sizes}
      />
    </div>
  );
}
