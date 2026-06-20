import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { getArchiveBySlug } from "@/lib/archive-data";
import {
  generateQrSvg,
  getRandomMemoryUrl,
  getRequestSiteUrl,
  svgToDataUri
} from "@/lib/qr";

export const dynamic = "force-dynamic";

type QRPageProps = {
  params: {
    slug: string;
  };
};

export default async function QRPage({ params }: QRPageProps) {
  const archive = await getArchiveBySlug(params.slug);

  if (!archive) {
    notFound();
  }

  const requestHeaders = headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";
  const siteUrl = getRequestSiteUrl(host, protocol);
  const randomMemoryUrl = getRandomMemoryUrl(archive.slug, siteUrl);
  const qrSvg = await generateQrSvg(randomMemoryUrl);
  const qrSrc = svgToDataUri(qrSvg);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="no-print">
          <Link
            href={`/archive/${archive.slug}`}
            className="text-sm font-semibold text-archive-sage underline-offset-4 hover:underline"
          >
            Back to archive
          </Link>
        </nav>

        <header className="no-print py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
            {archive.archiveName}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ink">
            QR code for {archive.personName}
          </h1>
          <p className="mt-5 leading-7 text-archive-ink/72">
            Scan to reveal a random memory.
          </p>
        </header>

        <section className="no-print grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-archive-ink/10 bg-white/82 p-6 shadow-soft">
            <Image
              src={qrSrc}
              alt={`QR code for ${archive.personName}'s random memory page`}
              width={288}
              height={288}
              unoptimized
              className="mx-auto rounded-md bg-white p-4 ring-1 ring-archive-ink/10"
            />
          </div>

          <div className="rounded-lg border border-archive-ink/10 bg-white/82 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
              Shareable URL
            </p>
            <p className="mt-3 break-all rounded-md bg-archive-linen px-4 py-3 text-sm leading-6 text-archive-ink/74">
              {randomMemoryUrl}
            </p>
            <div className="mt-6 grid gap-3 text-sm leading-6 text-archive-ink/70">
              <p>
                Archive name:{" "}
                <span className="font-semibold text-archive-ink">
                  {archive.archiveName}
                </span>
              </p>
              <p>
                Person name:{" "}
                <span className="font-semibold text-archive-ink">
                  {archive.personName}
                </span>
              </p>
            </div>
            <PrintButton>Print QR Card</PrintButton>
          </div>
        </section>

        <section className="qr-print-card mt-10 rounded-lg border border-archive-ink/10 bg-white p-8 text-center shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
            Life Archive
          </p>
          <h2 className="mt-3 font-serif text-4xl text-archive-ink">
            {archive.personName}
          </h2>
          <p className="mt-2 text-base text-archive-ink/68">
            {archive.archiveName}
          </p>
          <Image
            src={qrSrc}
            alt={`Printable QR code for ${archive.personName}`}
            width={288}
            height={288}
            unoptimized
            className="mx-auto mt-7 bg-white p-3"
          />
          <p className="mt-5 text-lg font-semibold text-archive-ink">
            Scan to reveal a random memory.
          </p>
          <p className="mx-auto mt-3 max-w-md break-all text-xs leading-5 text-archive-ink/56">
            {randomMemoryUrl}
          </p>
        </section>
      </div>
    </main>
  );
}
