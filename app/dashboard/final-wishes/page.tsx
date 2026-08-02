import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug } from "@/lib/archive-data";
import { getFinalWishesByArchiveSlug } from "@/lib/final-wishes-data";
import { FinalWishesClient } from "@/components/final-wishes/FinalWishesClient";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    archive?: string;
  }>;
};

export default async function FinalWishesPage({ searchParams }: PageProps) {
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login");
  }

  // Filter ONLY archives owned by user and ONLY Living (not memorial)
  const eligibleArchives = account.archives.filter(
    (a) => !a.memorialMode && !a.isShared
  );

  const resolvedParams = await searchParams;
  const requestedSlug = resolvedParams?.archive;

  // Check if requested archive slug is among user's eligible Living archives
  const requestedIsEligible = requestedSlug
    ? eligibleArchives.some((a) => a.slug === requestedSlug)
    : false;

  // If user requested an ineligible archive (memorial, shared, or unowned)
  if (requestedSlug && !requestedIsEligible) {
    if (eligibleArchives.length > 0) {
      redirect(`/dashboard/final-wishes?archive=${encodeURIComponent(eligibleArchives[0].slug)}`);
    }
  }

  // Determine active archive
  const activeArchive = requestedIsEligible
    ? eligibleArchives.find((a) => a.slug === requestedSlug)!
    : eligibleArchives[0] || null;

  // If user has NO eligible Living archives owned by them
  if (!activeArchive) {
    return (
      <FinalWishesClient
        archives={[]}
        activeArchive={null}
        archiveDetails={null}
        initialWishes={null}
        userDisplayName={account.user.displayName || "Archive Owner"}
      />
    );
  }

  const archiveDetails = await getArchiveBySlug(activeArchive.slug);
  const initialWishes = await getFinalWishesByArchiveSlug(activeArchive.slug, account.user.id);

  return (
    <FinalWishesClient
      archives={eligibleArchives}
      activeArchive={activeArchive}
      archiveDetails={archiveDetails}
      initialWishes={initialWishes}
      userDisplayName={account.user.displayName || "Archive Owner"}
    />
  );
}
