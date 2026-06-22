import Link from "next/link";
import { getAccountContext } from "@/lib/account";
import { createArchiveAction } from "./actions";
import {
  archiveRelationshipLabels,
  archiveRelationships
} from "@/lib/archive-relationships";

type CreateArchivePageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function CreateArchivePage({
  searchParams
}: CreateArchivePageProps) {
  const account = await getAccountContext();
  const signInRequired = account.isConfigured && !account.user;

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-archive-ink">
            The Life Archive
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
            Create an Archive for Yourself or Another Loved One
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-archive-ink/72">
            An archive is a digital collection of someone&apos;s life story.
            It can be your story. It can be your mother&apos;s story. It can be a
            grandparent, spouse, child, friend, veteran, mentor, or someone
            who is no longer here to tell their story themselves. Each archive
            can contain photos, videos, voice recordings, journal entries, life
            lessons, favorite songs, and personal memories. When complete, the
            archive can be shared through a private link, QR card, memorial
            keychain, funeral keepsake, or family collection so future
            generations can continue discovering that person&apos;s story.
          </p>
        </section>

        <section className="rounded-2xl border border-archive-gold/20 bg-white/[0.035] p-5 text-archive-ivory shadow-luxury sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
            What is an Archive?
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-archive-ivory/72 sm:text-base sm:leading-8">
            An archive is a collection of memories centered around one person.
            You can create an archive for yourself or for someone you love.
            Each archive can hold photos, videos, stories, voice recordings,
            life lessons, and other meaningful memories that can be preserved
            and shared for future generations.
          </p>
        </section>

        {signInRequired ? (
          <section className="rounded-lg border border-archive-ink/10 bg-white/82 p-7 text-center shadow-soft sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-clay">
              Your story starts here
            </p>
            <h2 className="mt-3 font-serif text-3xl text-archive-ink">
              Sign in to create an archive.
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-archive-ink/70">
              Your account keeps your archives together and gives you a place to
              return as the story grows.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-archive-clay px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-archive-ink"
            >
              Sign In or Create an Account
            </Link>
          </section>
        ) : (
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
                  placeholder="Maya Rivera&apos;s Life Archive"
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
                  Who is this archive for?
                </span>
                <select
                  name="relationshipToOwner"
                  required
                  defaultValue="other"
                  className="rounded-md border border-archive-ink/15 bg-white px-4 py-3 outline-none ring-archive-clay/30 transition focus:ring-4"
                >
                  {archiveRelationships.map((value) => (
                    <option key={value} value={value}>
                      {archiveRelationshipLabels[value]}
                    </option>
                  ))}
                </select>
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
                  Profile photo link
                </span>
                <input
                  name="profilePhotoUrl"
                  type="url"
                  placeholder="Paste a link from Unsplash"
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
                  <option value="private">
                    Private - only you and authorized members can view
                  </option>
                  <option value="public">
                    Public - anyone can view; may appear on the homepage
                  </option>
                </select>
              </label>

              <label className="flex items-center justify-between gap-4 rounded-md border border-archive-ink/10 bg-archive-paper px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-archive-ink">
                    Remembrance language
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-archive-ink/64">
                    Use remembrance-focused wording throughout this archive.
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
                Create an Archive
              </button>
              <p className="text-sm leading-6 text-archive-ink/60">
                Next, you&apos;ll enter the archive and add its first memory.
              </p>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
