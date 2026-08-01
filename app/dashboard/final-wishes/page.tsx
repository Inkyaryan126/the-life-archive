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

  const { archives, defaultArchive } = account;

  if (archives.length === 0) {
    redirect("/create");
  }

  const resolvedParams = await searchParams;
  const requestedSlug = resolvedParams?.archive;
  const activeArchive =
    (requestedSlug ? archives.find((a) => a.slug === requestedSlug) : null) ??
    defaultArchive ??
    archives[0];

  const archiveDetails = await getArchiveBySlug(activeArchive.slug);
  const initialWishes = await getFinalWishesByArchiveSlug(activeArchive.slug);

  return (
    <FinalWishesClient
      archives={archives}
      activeArchive={activeArchive}
      archiveDetails={archiveDetails}
      initialWishes={initialWishes}
      userDisplayName={account.user.displayName || "Archive Owner"}
    />
  );
}
