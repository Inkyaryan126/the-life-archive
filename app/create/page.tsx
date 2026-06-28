import Link from "next/link";
import { getAccountContext } from "@/lib/account";
import { createArchiveAction } from "./actions";
import {
  DesignBackdrop,
  SiteLogo
} from "@/components/SiteDesign";
import {
  archiveRelationshipLabels,
  archiveRelationships
} from "@/lib/archive-relationships";

type CreateArchivePageProps = {
  searchParams?: Promise<{
    error?: string;
    relationshipToOwner?: string;
  }>;
};

export default async function CreateArchivePage({
  searchParams
}: CreateArchivePageProps) {
  const resolvedSearchParams = await searchParams;
  const account = await getAccountContext();
  const signInRequired = account.isConfigured && !account.user;
  const requestedRelationship =
    resolvedSearchParams?.relationshipToOwner === "self" ? "self" : "other";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-12 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-3xl">
        <nav className="flex items-center justify-between pb-10">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <Link
            href="/archive/sari-rae"
            className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold"
          >
            Example archive
          </Link>
        </nav>

        <section className="pb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
            Create archive
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
            Create an Archive for Yourself or Another Loved One
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-archive-ivory/72">
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

        <section className="mb-10 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury sm:p-8">
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
          <section className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-7 text-center shadow-luxury sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-archive-gold">
              Your story starts here
            </p>
            <h2 className="mt-3 font-serif text-3xl text-archive-ivory">
              Sign in to create an archive.
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-archive-ivory/70">
              Your account keeps your archives together and gives you a place to
              return as the story grows.
            </p>
            <Link
              href="/login?next=%2Fcreate"
              className="mt-6 inline-flex rounded-full bg-archive-gold px-6 py-3 text-sm font-semibold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Sign In or Create an Account
            </Link>
          </section>
        ) : (
          <form
            action={createArchiveAction}
            encType="multipart/form-data"
            className="grid gap-6 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury"
          >
            {resolvedSearchParams?.error ? (
              <p className="rounded-md border border-archive-gold/20 bg-archive-gold/10 px-4 py-3 text-sm font-semibold text-archive-gold">
                {resolvedSearchParams.error}
              </p>
            ) : null}
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ivory">
                  Archive name
                </span>
                <input
                  name="archiveName"
                  required
                  placeholder="Sari Rae&apos;s Life Archive"
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ivory">
                  Person name
                </span>
                <input
                  name="personName"
                  required
                  placeholder="Sari Rae"
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ivory">
                  Who is this archive for?
                </span>
                <select
                  name="relationshipToOwner"
                  required
                  defaultValue={requestedRelationship}
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                >
                  {archiveRelationships.map((value) => (
                    <option key={value} value={value} className="bg-archive-obsidian">
                      {archiveRelationshipLabels[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ivory">
                  Short bio
                </span>
                <textarea
                  name="bio"
                  required
                  rows={5}
                  placeholder="A few warm sentences about their life, personality, and legacy."
                  className="resize-y rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                />
              </label>

              <div className="grid gap-4 rounded-lg border border-archive-gold/10 bg-white/[0.02] px-4 py-4">
                <p className="text-sm font-semibold text-archive-ivory">
                  Profile photo
                </p>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-archive-ivory/78">
                    Upload a photo
                  </span>
                  <input
                    name="profilePhotoFile"
                    type="file"
                    accept="image/*"
                    className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-sm text-archive-ivory outline-none ring-archive-gold/30 transition file:mr-4 file:rounded-full file:border-0 file:bg-archive-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-archive-obsidian focus:ring-4"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-archive-ivory/78">
                    Or paste a photo link
                  </span>
                  <input
                    name="profilePhotoUrl"
                    type="url"
                    placeholder="Paste an Unsplash photo link"
                    className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                  />
                </label>
                <p className="text-sm leading-6 text-archive-ivory/58">
                  Uploads are stored privately. A photo link still works as a
                  fallback.
                </p>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ivory">
                  Visibility
                </span>
                <select
                  name="visibility"
                  defaultValue="private"
                  className="rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3 text-archive-ivory outline-none ring-archive-gold/30 transition focus:ring-4"
                >
                  <option value="private" className="bg-archive-obsidian">
                    Private - only you and authorized members can view
                  </option>
                  <option value="public" className="bg-archive-obsidian">
                    Public - anyone can view; may appear on the homepage
                  </option>
                </select>
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-archive-gold/20 bg-white/[0.04] px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-archive-ivory">
                    Remembrance language
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-archive-ivory/64">
                    Use remembrance-focused wording throughout this archive.
                  </span>
                </span>
                <input
                  name="memorialMode"
                  type="checkbox"
                  className="size-5 accent-archive-gold"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-archive-gold px-6 py-3 text-sm font-semibold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
              >
                Begin Their Story
              </button>
              <p className="text-sm leading-6 text-archive-ivory/60">
                Next, you&apos;ll enter their story and add its first chapter.
              </p>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
