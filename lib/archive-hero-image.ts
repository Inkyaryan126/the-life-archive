import type React from "react";

export const DEFAULT_HERO_IMAGE_POSITION_X = 50;
export const DEFAULT_HERO_IMAGE_POSITION_Y = 50;
export const DEFAULT_HERO_IMAGE_ZOOM = 1.0;

export function normalizeHeroCropValues(input?: {
  positionX?: number | null;
  positionY?: number | null;
  zoom?: number | null;
}) {
  const rawX = typeof input?.positionX === "number" ? input.positionX : DEFAULT_HERO_IMAGE_POSITION_X;
  const rawY = typeof input?.positionY === "number" ? input.positionY : DEFAULT_HERO_IMAGE_POSITION_Y;
  const rawZoom = typeof input?.zoom === "number" ? input.zoom : DEFAULT_HERO_IMAGE_ZOOM;

  const x = Number.isNaN(rawX) || !Number.isFinite(rawX) ? DEFAULT_HERO_IMAGE_POSITION_X : Math.min(100, Math.max(0, rawX));
  const y = Number.isNaN(rawY) || !Number.isFinite(rawY) ? DEFAULT_HERO_IMAGE_POSITION_Y : Math.min(100, Math.max(0, rawY));
  const zoom = Number.isNaN(rawZoom) || !Number.isFinite(rawZoom) ? DEFAULT_HERO_IMAGE_ZOOM : Math.min(3.0, Math.max(1.0, rawZoom));

  return { x, y, zoom };
}

export function getArchiveHeroImageStyle(
  positionX?: number | null,
  positionY?: number | null,
  zoom?: number | null
): React.CSSProperties {
  const { x, y, zoom: z } = normalizeHeroCropValues({
    positionX,
    positionY,
    zoom
  });

  return {
    objectFit: "cover",
    objectPosition: `${x}% ${y}%`,
    transformOrigin: `${x}% ${y}%`,
    transform: z !== 1.0 ? `scale(${z})` : undefined
  };
}

export type AspectRatioMode = "responsive" | "4/3" | "16/9" | "21/9";
