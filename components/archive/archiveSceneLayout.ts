import type React from "react";

export type ArchiveSceneZone = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const archiveSceneImageSize = {
  width: 1535,
  height: 1024,
  aspectRatio: "1535 / 1024"
} as const;

export const archiveSceneZones = {
  identity: {
    left: 41.2378,
    top: 3.125,
    width: 31.8567,
    height: 43.8477
  },
  portrait: {
    left: 18.0456,
    top: 7.9102,
    width: 15.6352,
    height: 34.7656
  },
  leftBookPage: {
    left: 25.7329,
    top: 51.7578,
    width: 21.6938,
    height: 35.6445
  },
  rightBookPage: {
    left: 51.5309,
    top: 51.8555,
    width: 21.8241,
    height: 35.7422
  }
} as const satisfies Record<string, ArchiveSceneZone>;

export const archiveBookZone = {
  left: archiveSceneZones.leftBookPage.left,
  top: archiveSceneZones.leftBookPage.top,
  width:
    archiveSceneZones.rightBookPage.left +
    archiveSceneZones.rightBookPage.width -
    archiveSceneZones.leftBookPage.left,
  height:
    Math.max(
      archiveSceneZones.leftBookPage.top + archiveSceneZones.leftBookPage.height,
      archiveSceneZones.rightBookPage.top + archiveSceneZones.rightBookPage.height
    ) - archiveSceneZones.leftBookPage.top
} as const satisfies ArchiveSceneZone;

export function getSceneZoneStyle(zone: ArchiveSceneZone): React.CSSProperties {
  return {
    left: `${zone.left}%`,
    top: `${zone.top}%`,
    width: `${zone.width}%`,
    height: `${zone.height}%`
  };
}
