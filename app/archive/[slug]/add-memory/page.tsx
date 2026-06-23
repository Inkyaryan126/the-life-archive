import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessPrompt } from "@/components/AccessPrompt";
import { canCurrentUserAddMemory, getAccountContext } from "@/lib/account";
import { getArchiveBySlug, memoryTypes } from "@/lib/archive-data";
import { prettifyType } from "@/lib/format";
import { addMemoryAction } from "./actions";
import {
  DesignBackdrop,
  SiteLogo
} from "@/components/SiteDesign";

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
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-12 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-3xl">
        <nav className="pb-10">
          <Link
            href={`/archive/${archive.slug}`}
            className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold"
          >
            Back to archive
          </Link>
        </nav>

        <header className="pb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
            Add memory
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory">
            Add something that should be remembered.
          </h1>
        </header>

        <form
          action={saveMemory}
          encType="multipart/form-data"
          className="grid gap-6 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury"
        >
          {searchParams?.error ? (
            <p className="rounded-md border border-archive-gold/20 bg-archive-gold/10 px-4 py-3 text-sm font-semibold text-archive-gold">
              {searchParams.error}
            </p>
          ) : null}
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Title
              </span>
              <input
                name="title"
                required
                placeholder="The kitchen table rule"
                className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Type
              </span>
              <select
                name="type"
                className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
              >
                {memoryTypes.map((type) => (
                  <option key={type} value={type} className="bg-archive-obsidian">
                    {prettifyType(type)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-archive-ivory">
                Memory
              </span>
              <textarea
                name="content"
                rows={6}
                placeholder="Write the memory, lesson, journal entry, or context for this media."
                className="resize-y rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
              />
            </label>

            <div className="grid gap-4 rounded-lg border border-archive-gold/10 bg-white/[0.02] px-4 py-4">
              <p className="text-sm font-semibold text-archive-ivory">
                Memory media
              </p>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-archive-ivory/78">
                  Upload a photo or voice file
                </span>
                <input
                  name="mediaFile"
                  type="file"
                  accept="image/*,audio/*"
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-sm text-archive-ivory outline-none ring-archive-gold/30 transition file:mr-4 file:rounded-full file:border-0 file:bg-archive-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-archive-obsidian focus:ring-4"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-archive-ivory/78">
                  Or paste a photo, voice file, or Spotify link
                </span>
                <input
                  name="mediaUrl"
                  type="url"
                  placeholder="Paste an Unsplash photo link, a hosted voice file, or Spotify song link"
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                />
              </label>
              <span className="text-sm leading-6 text-archive-ivory/58">
                Photo memories can use an uploaded image or a photo link. Voice
                memories can use an uploaded audio file or a hosted voice link.
                Songs still use Spotify links.
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ivory">
                  Date
                </span>
                <input
                  name="date"
                  type="date"
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ivory">
                  Tags
                </span>
                <input
                  name="tags"
                  placeholder="family, lesson, home"
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-archive-gold px-6 py-3 text-sm font-semibold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Save Memory
            </button>
            <p className="text-sm leading-6 text-archive-ivory/60">
              This memory will become part of their story.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
