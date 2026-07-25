import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import {
  ArchiveBuildingShell,
  ArchiveScene,
  ArchiveOverlayRegion,
  ArchiveMobileScene
} from "@/components/archive-building/ArchiveBuildingShell";
import { AuthenticatedMobileBottomNavigation } from "@/components/navigation/AuthenticatedMobileBottomNavigation";
import { getArchiveBySlug } from "@/lib/archive-data";
import { getAccountContext } from "@/lib/account";
import {
  archiveBuildingMobileScenes,
  archiveBuildingScenes
} from "@/lib/archive-building-scenes";
import {
  generateQrPngDataUri,
  generateQrSvg,
  getRandomMemoryUrl,
  getRequestSiteUrl,
  svgToDataUri
} from "@/lib/qr";
import { createClient } from "@/lib/supabase/server";
import { getPublicPassUrl } from "@/lib/share-passes";
import { AppSidebar } from "@/components/AppSidebar";
import { QRDesktopActions } from "./QRDesktopActions";

export const dynamic = "force-dynamic";

type QRPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const qrNavRegion = {
  left: 2.08,
  top: 22.29,
  width: 12.22,
  height: 69.4
};

const qrCodeRegion = {
  left: 44.02,
  top: 34.41,
  width: 19.51,
  height: 27.57
};

const qrIdentityRegion = {
  left: 42,
  top: 64.13,
  width: 24.38,
  height: 13.29
};

const qrActionsRegion = {
  left: 28.22,
  top: 84.46,
  width: 51.24,
  height: 8.7
};

const qrRightInfoRegion = {
  left: 78.15,
  top: 32.55,
  width: 17.95,
  height: 28.75
};

export default async function QRPage({ params }: QRPageProps) {
  const { slug } = await params;
  const archive = await getArchiveBySlug(slug);

  if (!archive) {
    notFound();
  }

  const account = await getAccountContext();
  const isOwner = account.archives.some((item) => item.slug === archive.slug);

  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";
  const siteUrl = getRequestSiteUrl(host, protocol);

  let targetUrl = getRandomMemoryUrl(archive.slug, siteUrl);
  let isPassTokenUrl = false;

  const supabase = await createClient();
  const { data: keepsake } = await supabase
    .from("keepsakes")
    .select("id, active_share_pass_id")
    .eq("archive_id", archive.id)
    .not("active_share_pass_id", "is", null)
    .maybeSingle();

  if (keepsake?.active_share_pass_id) {
    const { data: pass } = await supabase
      .from("archive_share_passes")
      .select("id, token_version, status")
      .eq("id", keepsake.active_share_pass_id)
      .eq("status", "active")
      .maybeSingle();

    if (pass) {
      try {
        targetUrl = getPublicPassUrl(pass.id, pass.token_version ?? 1, siteUrl);
        isPassTokenUrl = true;
      } catch {
        targetUrl = getRandomMemoryUrl(archive.slug, siteUrl);
      }
    }
  }

  const qrSvg = await generateQrSvg(targetUrl);
  const qrSrc = svgToDataUri(qrSvg);
  const qrPngSrc = await generateQrPngDataUri(targetUrl);

  const desktopImage = {
    ...archiveBuildingScenes.qrCode,
    alt: "The Life Archive QR code room",
    priority: true
  };

  const desktopQrContent = (
    <>
      <ArchiveOverlayRegion
        region={qrCodeRegion}
        ariaLabel="Live archive QR code"
        className="flex items-center justify-center overflow-hidden px-[clamp(0.45rem,1vw,1.15rem)] py-[clamp(0.45rem,1vw,1.15rem)]"
      >
        <Image
          src={qrSrc}
          alt={`QR code for ${archive.personName}`}
          width={288}
          height={288}
          unoptimized
          className="h-full max-h-full w-auto max-w-full rounded-[0.55rem] bg-white p-[clamp(0.35rem,0.75vw,0.8rem)] object-contain shadow-[0_14px_42px_rgba(0,0,0,0.34)] ring-1 ring-archive-gold/18"
        />
      </ArchiveOverlayRegion>

      <ArchiveOverlayRegion
        region={qrIdentityRegion}
        ariaLabel="Archive identity"
        className="flex items-center justify-center overflow-hidden px-[clamp(0.8rem,1.5vw,1.8rem)] py-[clamp(0.45rem,0.8vw,0.8rem)] text-center"
      >
        <p className="w-full truncate font-serif text-[clamp(1.05rem,2vw,2.35rem)] leading-tight text-archive-ivory drop-shadow-[0_3px_16px_rgba(0,0,0,0.55)]">
          {archive.archiveName}
        </p>
      </ArchiveOverlayRegion>

      <ArchiveOverlayRegion
        region={qrActionsRegion}
        ariaLabel="QR actions"
        className="overflow-hidden rounded-[0.9rem] bg-black/12"
      >
        <QRDesktopActions
          archiveName={archive.archiveName}
          downloadHref={qrPngSrc}
          shareUrl={targetUrl}
        />
      </ArchiveOverlayRegion>

      <ArchiveOverlayRegion
        region={qrRightInfoRegion}
        ariaLabel="QR sharing details"
        className="flex items-end overflow-hidden px-[clamp(0.8rem,1.25vw,1.35rem)] pb-[clamp(0.75rem,1.2vw,1.35rem)] text-archive-ivory"
      >
        <div className="max-h-full w-full overflow-hidden rounded-[0.6rem] border border-archive-gold/14 bg-black/34 px-[clamp(0.6rem,0.9vw,0.95rem)] py-[clamp(0.45rem,0.75vw,0.8rem)] shadow-[0_14px_42px_rgba(0,0,0,0.22)] backdrop-blur-[1px]">
          <p className="text-[clamp(0.58rem,0.76vw,0.8rem)] font-semibold uppercase tracking-[0.14em] text-archive-gold">
            {isPassTokenUrl ? "Tokenized Keepsake Guest Link" : "Share link"}
          </p>
          <p className="mt-[clamp(0.25rem,0.45vw,0.45rem)] max-h-[4.8em] overflow-hidden break-all text-[clamp(0.56rem,0.72vw,0.78rem)] leading-[1.35] text-archive-ivory/72">
            {targetUrl}
          </p>
        </div>
      </ArchiveOverlayRegion>
    </>
  );

  return (
    <>
      {isOwner ? (
        <ArchiveBuildingShell
          image={desktopImage}
          active="qr"
          archiveSlug={archive.slug}
          archiveName={archive.archiveName}
          archivePersonName={archive.personName}
          showArchiveActions
          signedIn
          sceneLabel="QR code archive room"
          navRegion={qrNavRegion}
        >
          {desktopQrContent}
        </ArchiveBuildingShell>
      ) : (
        <ArchiveScene image={desktopImage} sceneLabel="QR code archive room">
          {desktopQrContent}
        </ArchiveScene>
      )}

      <ArchiveMobileScene
        image={{ ...archiveBuildingMobileScenes.qrCode, priority: true }}
        sceneLabel="QR Code mobile archive room"
        title={"QR CODE"}
        subtitle={isPassTokenUrl ? "Tokenized physical keepsake pass." : "One scan can open a lifetime."}
        className="px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))] sm:px-6"
      >
        <div className={`relative z-10 mx-auto w-full max-w-[96rem] ${isOwner ? "lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8" : ""}`}>
          {isOwner ? (
            <AppSidebar
              active="qr"
              archiveSlug={archive.slug}
              archiveName={archive.archiveName}
              archivePersonName={archive.personName}
            />
          ) : null}

          <div className="min-w-0">
            <nav className="no-print">
              <Link
                href={`/archive/${archive.slug}`}
                className="text-sm font-semibold text-archive-ivory/80 underline-offset-4 hover:text-archive-gold sm:text-base"
              >
                Back to archive
              </Link>
            </nav>

            <header className="no-print py-12">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
                {archive.archiveName}
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
                QR code for {archive.personName}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-archive-ivory/78">
                {isPassTokenUrl
                  ? "Tokenized guest pass. Scanners will see only the specific memories approved for this keepsake."
                  : "Scan to reveal a random memory."}
              </p>
            </header>

            <section className="no-print grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury">
                <Image
                  src={qrSrc}
                  alt={`QR code for ${archive.personName}`}
                  width={288}
                  height={288}
                  unoptimized
                  className="mx-auto rounded-md bg-white p-4 ring-1 ring-archive-gold/10"
                />
              </div>

              <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
                  {isPassTokenUrl ? "Tokenized Guest Link" : "Share this link"}
                </p>
                <p className="mt-3 break-all rounded-md bg-archive-obsidian/70 px-4 py-3 text-sm leading-6 text-archive-ivory/74">
                  {targetUrl}
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
                <PrintButton>Print Free QR Card</PrintButton>
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
                {isPassTokenUrl ? "Scan to view keepsake memory pass." : "Scan to reveal a random memory."}
              </p>
              <p className="mx-auto mt-3 max-w-md break-all text-sm leading-6 text-archive-ivory/56">
                {targetUrl}
              </p>
            </section>
          </div>
        </div>
      </ArchiveMobileScene>

      {account.user ? (
        <AuthenticatedMobileBottomNavigation activeArchiveSlug={slug} />
      ) : null}
    </>
  );
}
