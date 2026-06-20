import Link from "next/link";
import { createArchiveAction } from "./actions";

type CreateArchivePageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function CreateArchivePage({
  searchParams
}: CreateArchivePageProps) {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-archive-ink">
            Life Archive
          </Link>
          <Link
            href="/archive/maya-rivera"
            className="text-sm font-semibold text-archive-sage underline-offset-4 hover:underline"
          >
            Example archive
          </Link>
        </nav>

        <section className="py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
            Create archive
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ink sm:text-5xl">
            Start with the person at the center.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-archive-ink/72">
            Create a local archive now. Supabase can replace the JSON store
            when the product is ready for accounts and cloud sync.
          </p>
        </section>

        <form
          action={createArchiveAction}
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
                Archive name
              </span>
              <input
                name="archiveName"
                required
                placeholder="Maya Rivera's Life Archive"
                className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ink">
                Person name
              </span>
              <input
                name="personName"
                required
                placeholder="Maya Rivera"
                className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ink">
                Short bio
              </span>
              <textarea
                name="bio"
                required
                rows={5}
                placeholder="A few warm sentences about their life, personality, and legacy."
                className="resize-y rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ink">
                Profile photo URL
              </span>
              <input
                name="profilePhotoUrl"
                type="url"
                placeholder="https://..."
                className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ink">
                Visibility
              </span>
              <select
                name="visibility"
                defaultValue="private"
                className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </label>

            <label className="flex items-center justify-between gap-4 rounded-md border border-archive-ink/10 bg-archive-paper px-4 py-3">
              <span>
                <span className="block text-sm font-semibold text-archive-ink">
                  Memorial mode
                </span>
                <span className="mt-1 block text-sm leading-6 text-archive-ink/64">
                  Adjust wording and presentation for remembrance pages.
                </span>
              </span>
              <input
                name="memorialMode"
                type="checkbox"
                className="size-5 accent-archive-clay"
              />
            </label>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-archive-clay px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-archive-ink"
            >
              Create Archive
            </button>
            <p className="text-sm leading-6 text-archive-ink/60">
              Saved locally to a JSON file for this MVP.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
