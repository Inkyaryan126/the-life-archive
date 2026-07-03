import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug } from "@/lib/archive-data";
import { generateQrSvg, getSiteUrl, svgToDataUri } from "@/lib/qr";
import { EditArchiveForm } from "@/components/EditArchiveForm";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { AccessPrompt } from "@/components/AccessPrompt";

export const dynamic = "force-dynamic";

type EditArchivePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditArchivePage({ params }: EditArchivePageProps) {
  const { slug } = await params;
  const account = await getAccountContext();
  const { user } = account;

  if (!user) {
    redirect(`/login?next=%2Farchive%2F${slug}%2Fedit`);
  }

  const archive = await getArchiveBySlug(slug);

  if (!archive) {
    notFound();
  }

  const isOwner = account.archives.some((item) => item.slug === archive.slug);

  if (!isOwner) {
    return (
      <AccessPrompt
        eyebrow="Access Denied"
        title="Unauthorized Admin Access."
        message="Only the archive owner can edit or configure this memorial keepsake."
        primaryHref="/dashboard"
        primaryLabel="Return to Dashboard"
      />
    );
  }

  const siteUrl = getSiteUrl();
  const archiveUrl = `${siteUrl}/archive/${archive.slug}`;
  const qrSvg = await generateQrSvg(archiveUrl);
  const qrSrc = svgToDataUri(qrSvg);

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-6 py-6 text-archive-ivory lg:px-12 xl:px-16 sm:py-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-[96rem]">
        {/* Navigation */}
        <nav className="flex flex-col gap-4 border-b border-archive-gold/20 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/">
            <SiteLogo width={240} height={60} />
          </Link>
          <div className="flex flex-wrap items-center gap-4 sm:justify-end sm:gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline sm:text-base"
            >
              Dashboard
            </Link>
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">
              Admin Keepsake Portal
            </span>
          </div>
        </nav>

        {/* Edit Form Shell */}
        <EditArchiveForm
          archive={archive}
          qrSrc={qrSrc}
          archiveUrl={archiveUrl}
        />
      </div>
    </main>
  );
}
