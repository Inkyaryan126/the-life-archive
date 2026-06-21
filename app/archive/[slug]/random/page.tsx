import Link from "next/link";
import { notFound } from "next/navigation";
import { RandomMemory } from "@/components/RandomMemory";
import { AccessPrompt } from "@/components/AccessPrompt";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug, getRandomMemory } from "@/lib/archive-data";

export const dynamic = "force-dynamic";

type RandomMemoryPageProps = {
  params: {
    slug: string;
  };
};

export default async function RandomMemoryPage({
  params
}: RandomMemoryPageProps) {
  const [archive, account] = await Promise.all([
    getArchiveBySlug(params.slug),
    getAccountContext()
  ]);

  if (!archive) {
    if (account.isConfigured && !account.user) {
      const returnPath = `/archive/${params.slug}/random`;

      return (
        <AccessPrompt
          eyebrow="Private archive"
          title="Sign in to reveal this memory."
          message="This archive is private. Only the archive owner and authorized members can view its memories."
          primaryHref={`/login?next=${encodeURIComponent(returnPath)}`}
          primaryLabel="Sign In"
        />
      );
    }

    notFound();
  }

  const memory = await getRandomMemory(params.slug);
  const canAddMemory = account.archives.some((item) => item.slug === archive.slug);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-archive-ink">
            The Life Archive
          </Link>
          <Link
            href={`/archive/${archive.slug}`}
            className="text-sm font-semibold text-archive-sage underline-offset-4 hover:underline"
          >
            Full archive
          </Link>
        </nav>

        <header className="py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
            {archive.personName}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ink sm:text-5xl">
            A memory from this life.
          </h1>
        </header>

        <RandomMemory
          archiveSlug={archive.slug}
          canAddMemory={canAddMemory}
          memory={memory}
        />
      </div>
    </main>
  );
}
