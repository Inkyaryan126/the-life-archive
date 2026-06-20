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
};

export async function QRPreview({ archiveSlug, label }: QRPreviewProps) {
  const requestHeaders = headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";
  const siteUrl = getRequestSiteUrl(host, protocol);
  const target = getRandomMemoryUrl(archiveSlug, siteUrl);
  const qrSvg = await generateQrSvg(target);

  return (
    <div className="rounded-lg border border-archive-ink/10 bg-white/82 p-5 shadow-soft">
      <Image
        src={svgToDataUri(qrSvg)}
        alt={label || "QR code for random memory"}
        width={192}
        height={192}
        unoptimized
        className="mx-auto rounded-md bg-white p-3 ring-1 ring-archive-ink/10"
      />
      <p className="mt-5 text-sm font-semibold text-archive-ink">
        QR destination
      </p>
      <p className="mt-2 break-all rounded-md bg-archive-linen px-3 py-2 text-sm text-archive-ink/72">
        {target}
      </p>
    </div>
  );
}
