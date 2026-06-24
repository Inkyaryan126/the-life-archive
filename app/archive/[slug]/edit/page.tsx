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
  params: {
    slug: string;
  };
};

export default async function EditArchivePage({ params }: EditArchivePageProps) {
  const account = await getAccountContext();
  const { user } = account;

  if (!user) {
    redirect(`/login?next=%2Farchive%2F${params.slug}%2Fedit`);
  }

  const archive = await getArchiveBySlug(params.slug);

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
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Navigation */}
        <nav className="flex items-center justify-between pb-10 border-b border-archive-gold/20">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
            >
              Dashboard
            </Link>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
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
