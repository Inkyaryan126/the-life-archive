export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export type PhotoFrameType = "gold" | "wood" | "polaroid" | "corners";

export const photoFrameConfigs: Record<
  PhotoFrameType,
  {
    asset: string;
    label: string;
    aspectRatio: string;
    windowStyle: {
      left: string;
      top: string;
      width: string;
      height: string;
    };
  }
> = {
  gold: {
    asset: "/images/archive-assets/frames/ornate-gold-frame.png",
    label: "Ornate Gold Frame",
    aspectRatio: "aspect-square",
    windowStyle: {
      left: "23.8%",
      top: "21.3%",
      width: "52.2%",
      height: "57.7%"
    }
  },
  wood: {
    asset: "/images/archive-assets/frames/dark-wood-frame.png",
    label: "Dark Wood Frame",
    aspectRatio: "aspect-[1.5/1]",
    windowStyle: {
      left: "24.2%",
      top: "23.0%",
      width: "51.7%",
      height: "52.1%"
    }
  },
  polaroid: {
    asset: "/images/archive-assets/frames/polaroid-frame.png",
    label: "Polaroid Frame",
    aspectRatio: "aspect-square",
    windowStyle: {
      left: "18.8%",
      top: "18.3%",
      width: "62.6%",
      height: "53.9%"
    }
  },
  corners: {
    asset: "/images/archive-assets/frames/vintage-photo-corners.png",
    label: "Vintage Mounted Corners",
    aspectRatio: "aspect-[1.5/1]",
    windowStyle: {
      left: "20.6%",
      top: "23.5%",
      width: "59.4%",
      height: "50.7%"
    }
  }
};

const frameTypesList: PhotoFrameType[] = ["gold", "wood", "polaroid", "corners"];

export function getDeterministicPhotoFrame(memoryId: string): PhotoFrameType {
  const index = hashString(memoryId) % frameTypesList.length;
  return frameTypesList[index];
}

const tiltAngles = ["rotate-[-2deg]", "rotate-[-1deg]", "rotate-0", "rotate-[1deg]", "rotate-[2deg]"];

export function getDeterministicTilt(memoryId: string): string {
  const index = hashString(memoryId) % tiltAngles.length;
  return tiltAngles[index];
}

export function shouldSpanTwoColumns(memoryId: string, type: string): boolean {
  if (type === "journal" || type === "photo" || type === "video") {
    return hashString(memoryId) % 5 === 0;
  }
  return false;
}
