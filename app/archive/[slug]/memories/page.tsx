import { notFound } from "next/navigation";
import { DesignBackdrop } from "@/components/SiteDesign";
import { HashScroller } from "./HashScroller";
import { AuthenticatedMobileBottomNavigation } from "@/components/navigation/AuthenticatedMobileBottomNavigation";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug, getMemoriesByArchiveSlug } from "@/lib/archive-data";
import type { MemoryType } from "@/lib/types";
import { ArchiveMobileScene } from "@/components/archive-building/ArchiveBuildingShell";
import { archiveBuildingMobileScenes } from "@/lib/archive-building-scenes";
import { MemoryGallery } from "@/components/archive/memories/MemoryGallery";

export const dynamic = "force-dynamic";

type MemoriesPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    created?: string;
    deleted?: string;
    deleteError?: string;
    type?: string;
  }>;
};

function isMemoryType(value: string): value is MemoryType {
  return ["photo", "video", "voice", "journal", "lesson", "song"].includes(value);
}

export default async function MemoriesPage({ params, searchParams }: MemoriesPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const [archive, account] = await Promise.all([
    getArchiveBySlug(slug),
    getAccountContext()
  ]);

  if (!archive) {
    notFound();
  }

  const memories = await getMemoriesByArchiveSlug(slug);
  const selectedType =
    resolvedSearchParams?.type && isMemoryType(resolvedSearchParams.type)
      ? resolvedSearchParams.type
      : null;
  const isOwner = account.archives.some((item) => item.slug === archive.slug);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#0d0a08] bg-cover bg-top bg-no-repeat px-5 py-6 text-archive-ivory lg:px-12 xl:px-16 sm:py-8"
      style={{
        backgroundImage: "url('/images/archive-assets/background.png')",
        backgroundColor: "#0d0a08"
      }}
    >
      <ArchiveMobileScene
        image={{ ...archiveBuildingMobileScenes.library, priority: true }}
        sceneLabel="Preserved memories mobile library"
        title="PRESERVED MEMORIES"
        subtitle="Return to the moments that built a life."
        backgroundOnly
      />

      <DesignBackdrop />
      <HashScroller />

      <div className="relative z-10 mx-auto w-full max-w-[96rem]">
        <MemoryGallery
          archiveSlug={archive.slug}
          personName={archive.personName}
          memories={memories}
          isOwner={isOwner}
          initialTypeFilter={selectedType}
          createdSuccess={resolvedSearchParams?.created === "1"}
          deletedSuccess={resolvedSearchParams?.deleted === "1"}
          deleteError={resolvedSearchParams?.deleteError === "1"}
        />
      </div>

      {account.user ? (
        <AuthenticatedMobileBottomNavigation activeArchiveSlug={slug} />
      ) : null}
    </main>
  );
}
