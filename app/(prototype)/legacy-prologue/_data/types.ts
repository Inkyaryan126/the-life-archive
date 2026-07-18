export type LegacyPrologueOverlay = "rain" | "window-rain" | "fog" | "amber" | "none";

export type LegacyPrologueImage = {
  desktopSrc: string;
  mobileSrc: string;
  fallbackSrc: string;
  alt: string;
  duration: number;
  caption?: string[];
  introCaption?: string;
  focalPoint?: string;
  motion?: "still" | "push" | "drift-left" | "drift-right";
};

export type LegacyPrologueScene = {
  id: "funeral" | "home" | "journey" | "mansion";
  label: string;
  images: LegacyPrologueImage[];
  duration: number;
  overlay?: LegacyPrologueOverlay;
};
