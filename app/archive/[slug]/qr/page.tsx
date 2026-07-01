import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { DesignBackdrop } from "@/components/SiteDesign";
import { getArchiveBySlug } from "@/lib/archive-data";
import {
  generateQrSvg,
  getRandomMemoryUrl,
  getRequestSiteUrl,
  svgToDataUri
} from "@/lib/qr";

export const dynamic = "force-dynamic";

type QRPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function QRPage({ params }: QRPageProps) {
  const { slug } = await params;
  const archive = await getArchiveBySlug(slug);

  if (!archive) {
    notFound();
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";
  const siteUrl = getRequestSiteUrl(host, protocol);
  const randomMemoryUrl = getRandomMemoryUrl(archive.slug, siteUrl);
  const qrSvg = await generateQrSvg(randomMemoryUrl);
  const qrSrc = svgToDataUri(qrSvg);

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 text-archive-ivory sm:px-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto max-w-5xl">
        <nav className="no-print">
          <Link
            href={`/archive/${archive.slug}`}
            className="text-sm font-semibold text-archive-ivory/80 underline-offset-4 hover:underline hover:text-archive-gold"
          >
            Back to archive
          </Link>
        </nav>

        <header className="no-print py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
            {archive.archiveName}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory">
            QR code for {archive.personName}
          </h1>
          <p className="mt-5 leading-7 text-archive-ivory/72">
            Scan to reveal a random memory.
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-archive-ivory/60">
            {archive.visibility === "public"
              ? "Anyone who scans this code can view the archive. Public archives may also appear on The Life Archive homepage."
              : "Only the archive owner and authorized members can open this private archive after signing in."}
          </p>
        </header>

        <section className="no-print grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury">
            <Image
              src={qrSrc}
              alt={`QR code for ${archive.personName}'s random memory page`}
              width={288}
              height={288}
              unoptimized
              className="mx-auto rounded-md bg-white p-4 ring-1 ring-archive-gold/10"
            />
          </div>

          <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
              Share this link
            </p>
            <p className="mt-3 break-all rounded-md bg-archive-obsidian/70 px-4 py-3 text-sm leading-6 text-archive-ivory/74">
              {randomMemoryUrl}
            </p>
            <div className="mt-6 grid gap-3 text-sm leading-6 text-archive-ivory/70">
              <p>
                Archive:{" "}
                <span className="font-semibold text-archive-ivory">
                  {archive.archiveName}
                </span>
              </p>
              <p>
                Preserving:{" "}
                <span className="font-semibold text-archive-ivory">
                  {archive.personName}
                </span>
              </p>
            </div>
            <PrintButton>Print QR Card</PrintButton>
          </div>
        </section>

        {/* Keepsake Upsell Block */}
        <section className="no-print mt-8 rounded-lg border border-archive-gold/22 bg-archive-obsidian p-6 text-archive-ivory shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
            The Life Archive Keepsakes
          </p>
          <h3 className="mt-2 font-serif text-2xl text-archive-ivory">
            Turn this archive into a physical keepsake.
          </h3>
          <p className="mt-2 text-sm leading-6 text-archive-ivory/70">
            Download your QR for free, or order a premium keychain, card, pendant, plaque, or tag connected to this archive.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/keepsakes"
              className="rounded-full bg-archive-gold px-5 py-2.5 text-xs font-bold text-archive-obsidian shadow transition hover:bg-archive-champagne"
            >
              View Keepsakes Portfolio
            </Link>
          </div>
        </section>

        <section className="qr-print-card mt-10 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 text-center shadow-luxury">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
            The Life Archive Home
          </p>
          <h2 className="mt-3 font-serif text-4xl text-archive-ivory">
            {archive.personName}
          </h2>
          <p className="mt-2 text-base text-archive-ivory/68">
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
          <p className="mt-5 text-lg font-semibold text-archive-ivory">
            Scan to reveal a random memory.
          </p>
          <p className="mx-auto mt-3 max-w-md break-all text-xs leading-5 text-archive-ivory/56">
            {randomMemoryUrl}
          </p>
        </section>
      </div>
    </main>
  );
}
