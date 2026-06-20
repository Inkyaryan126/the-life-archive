import Link from "next/link";
import { notFound } from "next/navigation";
import { MemoryCard } from "@/components/MemoryCard";
import { getArchiveBySlug, getMemoriesByArchiveSlug } from "@/lib/archive-data";

export const dynamic = "force-dynamic";

type MemoriesPageProps = {
  params: {
    slug: string;
  };
};

export default async function MemoriesPage({ params }: MemoriesPageProps) {
  const archive = await getArchiveBySlug(params.slug);

  if (!archive) {
    notFound();
  }

  const memories = await getMemoriesByArchiveSlug(params.slug);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between">
          <Link
            href={`/archive/${archive.slug}`}
            className="text-sm font-semibold text-archive-sage underline-offset-4 hover:underline"
          >
            Back to archive
          </Link>
          <Link
            href={`/archive/${archive.slug}/add-memory`}
            className="rounded-full bg-archive-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Add Memory
          </Link>
        </nav>

        <header className="py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
            Browse memories
          </p>
          <h1 className="mt-3 font-serif text-4xl text-archive-ink sm:text-5xl">
            {archive.personName}
          </h1>
        </header>

        {memories.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </section>
        ) : (
          <section className="rounded-lg border border-archive-ink/10 bg-white/82 p-6 shadow-soft">
            <h2 className="font-serif text-3xl text-archive-ink">
              No memories yet
            </h2>
            <p className="mt-3 leading-7 text-archive-ink/72">
              Start with one story, photo, song, voice note, or lesson. The
              archive will grow from there.
            </p>
            <Link
              href={`/archive/${archive.slug}/add-memory`}
              className="mt-5 inline-flex rounded-full bg-archive-clay px-5 py-3 text-sm font-semibold text-white"
            >
              Add Memory
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
