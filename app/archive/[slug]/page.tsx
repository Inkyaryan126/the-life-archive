import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QRPreview } from "@/components/QRPreview";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug, getMemoriesByArchiveSlug } from "@/lib/archive-data";

export const dynamic = "force-dynamic";

type ArchivePageProps = {
  params: {
    slug: string;
  };
};

export default async function ArchivePage({ params }: ArchivePageProps) {
  const [archive, account] = await Promise.all([
    getArchiveBySlug(params.slug),
    getAccountContext()
  ]);

  if (!archive) {
    notFound();
  }

  const memories = await getMemoriesByArchiveSlug(params.slug);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-archive-ink">
            Life Archive
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            {account.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-archive-sage underline-offset-4 hover:underline"
                >
                  Dashboard
                </Link>
                <Link
                  href="/member-card"
                  className="hidden text-sm font-semibold text-archive-sage underline-offset-4 hover:underline sm:inline-flex"
                >
                  Member Card
                </Link>
              </>
            ) : null}
            <Link
              href={`/archive/${archive.slug}/qr`}
              className="text-sm font-semibold text-archive-sage underline-offset-4 hover:underline"
            >
              QR preview
            </Link>
          </div>
        </nav>

        <section className="grid gap-8 py-12 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="overflow-hidden rounded-lg border border-archive-ink/10 bg-white/82 shadow-soft">
            <div className="relative aspect-[16/10] sm:aspect-[16/7]">
              <Image
                src={archive.profilePhotoUrl}
                alt={archive.personName}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 760px, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-archive-ink/65 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white sm:p-8">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                    {archive.visibility}
                  </span>
                  {archive.memorialMode ? (
                    <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                      Memorial
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-4 font-serif text-5xl leading-tight">
                  {archive.personName}
                </h1>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="max-w-3xl text-lg leading-8 text-archive-ink/74">
                {archive.bio}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/archive/${archive.slug}/random`}
                  className="rounded-full bg-archive-clay px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-archive-ink"
                >
                  View Random Memory
                </Link>
                <Link
                  href={`/archive/${archive.slug}/memories`}
                  className="rounded-full border border-archive-ink/15 bg-white px-5 py-3 text-sm font-semibold text-archive-ink transition hover:bg-archive-linen"
                >
                  Browse Memories
                </Link>
                <Link
                  href={`/archive/${archive.slug}/add-memory`}
                  className="rounded-full border border-archive-ink/15 bg-white px-5 py-3 text-sm font-semibold text-archive-ink transition hover:bg-archive-linen"
                >
                  Add Memory
                </Link>
                <Link
                  href={`/archive/${archive.slug}/qr`}
                  className="rounded-full border border-archive-ink/15 bg-white px-5 py-3 text-sm font-semibold text-archive-ink transition hover:bg-archive-linen"
                >
                  QR Card
                </Link>
                <Link
                  href={`/archive/${archive.slug}/legacy-instructions`}
                  className="rounded-full border border-archive-ink/15 bg-white px-5 py-3 text-sm font-semibold text-archive-ink transition hover:bg-archive-linen"
                >
                  Legacy Instructions
                </Link>
              </div>
              {memories.length === 0 ? (
                <div className="mt-7 rounded-md border border-archive-ink/10 bg-archive-paper px-4 py-3 text-sm leading-6 text-archive-ink/68">
                  This archive is ready. Add the first memory to make the random
                  QR experience meaningful.
                </div>
              ) : null}
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-lg border border-archive-ink/10 bg-white/82 p-5 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
                Archive
              </p>
              <p className="mt-3 text-3xl font-semibold text-archive-ink">
                {memories.length}
              </p>
              <p className="mt-1 text-sm text-archive-ink/64">
                memories saved
              </p>
            </div>
            <QRPreview archiveSlug={archive.slug} />
          </aside>
        </section>
      </div>
    </main>
  );
}
