import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessPrompt } from "@/components/AccessPrompt";
import { canCurrentUserAddMemory, getAccountContext } from "@/lib/account";
import { getArchiveBySlug, memoryTypes } from "@/lib/archive-data";
import { prettifyType } from "@/lib/format";
import { addMemoryAction } from "./actions";

export const dynamic = "force-dynamic";

type AddMemoryPageProps = {
  params: {
    slug: string;
  };
  searchParams?: {
    error?: string;
  };
};

export default async function AddMemoryPage({
  params,
  searchParams
}: AddMemoryPageProps) {
  const [archive, account] = await Promise.all([
    getArchiveBySlug(params.slug),
    getAccountContext()
  ]);

  if (!archive) {
    if (account.isConfigured && !account.user) {
      const returnPath = `/archive/${params.slug}/add-memory`;

      return (
        <AccessPrompt
          eyebrow="Private archive"
          title="Sign in to add a memory."
          message="This archive is private. Sign in with an authorized account to continue."
          primaryHref={`/login?next=${encodeURIComponent(returnPath)}`}
          primaryLabel="Sign In"
        />
      );
    }

    notFound();
  }

  const canAddMemory = await canCurrentUserAddMemory(archive.slug, account);

  if (!account.user) {
    const returnPath = `/archive/${archive.slug}/add-memory`;

    return (
      <AccessPrompt
        eyebrow="Archive contribution"
        title="Sign in to add a memory."
        message="Only the archive owner and authorized editors can add to this story."
        primaryHref={`/login?next=${encodeURIComponent(returnPath)}`}
        primaryLabel="Sign In"
        secondaryHref={`/archive/${archive.slug}`}
        secondaryLabel="Back to Archive"
      />
    );
  }

  if (!canAddMemory) {
    return (
      <AccessPrompt
        eyebrow="Archive access"
        title="This archive is not open for contributions."
        message="Only the archive owner and authorized editors can add memories. You can still return to the archive and revisit its story."
        primaryHref={`/archive/${archive.slug}`}
        primaryLabel="Back to Archive"
        secondaryHref="/dashboard"
        secondaryLabel="Visit My Archives"
      />
    );
  }

  const saveMemory = addMemoryAction.bind(null, archive.slug);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <nav>
          <Link
            href={`/archive/${archive.slug}`}
            className="text-sm font-semibold text-archive-sage underline-offset-4 hover:underline"
          >
            Back to archive
          </Link>
        </nav>

        <header className="py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
            Add memory
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ink">
            Add something that should be remembered.
          </h1>
        </header>

        <form
          action={saveMemory}
          className="rounded-lg border border-archive-ink/10 bg-white/82 p-5 shadow-soft sm:p-7"
        >
          {searchParams?.error ? (
            <p className="mb-5 rounded-md border border-archive-clay/20 bg-archive-clay/10 px-4 py-3 text-sm font-semibold text-archive-clay">
              {searchParams.error}
            </p>
          ) : null}
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ink">
                Title
              </span>
              <input
                name="title"
                required
                placeholder="The kitchen table rule"
                className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ink">
                Type
              </span>
              <select
                name="type"
                className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
              >
                {memoryTypes.map((type) => (
                  <option key={type} value={type}>
                    {prettifyType(type)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ink">
                Memory
              </span>
              <textarea
                name="content"
                rows={6}
                placeholder="Write the memory, lesson, journal entry, or context for this media."
                className="resize-y rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ink">
                Unsplash photo or Spotify song link
              </span>
              <input
                name="mediaUrl"
                type="url"
                placeholder="Paste an Unsplash or Spotify link"
                className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
              />
              <span className="text-sm leading-6 text-archive-ink/58">
                Links currently support photos from Unsplash and songs from
                Spotify.
              </span>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ink">
                  Date
                </span>
                <input
                  name="date"
                  type="date"
                  className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ink">
                  Tags
                </span>
                <input
                  name="tags"
                  placeholder="family, lesson, home"
                  className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
                />
              </label>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-archive-clay px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-archive-ink"
            >
              Save Memory
            </button>
            <p className="text-sm leading-6 text-archive-ink/60">
              This memory will become part of their story.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
