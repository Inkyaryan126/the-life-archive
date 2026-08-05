import QRCode from "qrcode";
import { getSiteUrl } from "./qr";

export type QrFormatType = "png" | "svg" | "print" | "engraving";

export type GeneratedQrAssets = {
  svg: string;
  pngDataUri: string;
  pngBuffer: Buffer;
  printPngBuffer: Buffer;
  engravingSvg: string;
};

export async function generateAdvertisingQrAssets(
  targetUrl: string
): Promise<GeneratedQrAssets> {
  // High contrast standard SVG (Margin 4, Level H)
  const svg = await QRCode.toString(targetUrl, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4,
    width: 600,
    color: {
      dark: "#11100e",
      light: "#ffffff"
    }
  });

  // Standard PNG Buffer (600px)
  const pngBuffer = await QRCode.toBuffer(targetUrl, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 4,
    width: 600,
    color: {
      dark: "#11100e",
      light: "#ffffff"
    }
  });

  // High-Resolution Print PNG Buffer (1800px) for physical signs & flyers
  const printPngBuffer = await QRCode.toBuffer(targetUrl, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 4,
    width: 1800,
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  });

  // Pure Monochrome SVG for laser & metal engraving
  const engravingSvg = await QRCode.toString(targetUrl, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4,
    width: 1200,
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  });

  // Data URI for instant browser preview
  const pngDataUri = `data:image/png;base64,${pngBuffer.toString("base64")}`;

  return {
    svg,
    pngDataUri,
    pngBuffer,
    printPngBuffer,
    engravingSvg
  };
}

export function buildShortTrackableUrl(slug: string, baseUrl?: string) {
  const host = (baseUrl || getSiteUrl()).replace(/\/$/, "");
  return `${host}/go/${encodeURIComponent(slug)}`;
}
