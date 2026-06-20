import Link from "next/link";
import { notFound } from "next/navigation";
import { RandomMemory } from "@/components/RandomMemory";
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
  const archive = await getArchiveBySlug(params.slug);

  if (!archive) {
    notFound();
  }

  const memory = await getRandomMemory(params.slug);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-archive-ink">
            Life Archive
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

        <RandomMemory archiveSlug={archive.slug} memory={memory} />
      </div>
    </main>
  );
}
