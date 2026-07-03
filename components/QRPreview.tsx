import Image from "next/image";
import { headers } from "next/headers";
import {
  getRandomMemoryUrl,
  generateQrSvg,
  getRequestSiteUrl,
  svgToDataUri
} from "@/lib/qr";

type QRPreviewProps = {
  archiveSlug: string;
  label?: string;
  archiveMode?: "memorial" | "living";
};

export async function QRPreview({ archiveSlug, label, archiveMode = "living" }: QRPreviewProps) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";
  const siteUrl = getRequestSiteUrl(host, protocol);
  const target = getRandomMemoryUrl(archiveSlug, siteUrl);
  const qrSvg = await generateQrSvg(target);
  const opensLabel = archiveMode === "memorial" ? "Where this memorial QR opens" : "Where this QR opens";
  const description =
    archiveMode === "memorial"
      ? "This QR opens the memorial archive and its preserved chapters."
      : "This QR opens the living archive and its current chapters.";

  return (
    <div className="rounded-[1.5rem] border border-archive-gold/18 bg-archive-obsidian/82 p-5 shadow-luxury">
      <Image
        src={svgToDataUri(qrSvg)}
        alt={label || "QR code for random memory"}
        width={220}
        height={220}
        unoptimized
        className="mx-auto rounded-md bg-archive-ivory p-3 ring-1 ring-archive-gold/10"
      />
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
        {opensLabel}
      </p>
      <p className="mt-2 text-sm leading-7 text-archive-ivory/68">
        {description}
      </p>
      <p className="mt-3 break-all rounded-md border border-archive-gold/18 bg-black/40 px-3 py-2 text-sm text-archive-ivory/72">
        {target}
      </p>
    </div>
  );
}
