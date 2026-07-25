import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAdminAccess } from "@/lib/admin";
import { getAdminArchivePreview } from "@/lib/admin-users";
import type { Memory } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

function formatDate(value: string | null) {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function typeLabel(type: Memory["type"]) {
  if (type === "voice") {
    return "Voice Note";
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function AdminDenied() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-3xl">
        <Link href="/">
          <SiteLogo width={160} height={40} />
        </Link>
        <section className="mt-16 rounded-2xl border border-archive-gold/18 bg-white/[0.035] p-8 shadow-luxury">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
            Admin
          </p>
          <h1 className="mt-4 font-serif text-4xl text-archive-ivory">
            Access not available.
          </h1>
          <p className="mt-4 text-sm leading-7 text-archive-ivory/68">
            This page is limited to emails listed in ADMIN_EMAILS.
          </p>
        </section>
      </div>
    </main>
  );
}

function MemoryCard({ memory }: { memory: Memory }) {
  return (
    <article className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-archive-gold/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-archive-champagne">
          {typeLabel(memory.type)}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-archive-ivory/45">
          {formatDate(memory.date)}
        </span>
      </div>
      <h3 className="mt-4 font-serif text-2xl text-archive-ivory">
        {memory.title}
      </h3>
      {memory.content ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-archive-ivory/68">
          {memory.content}
        </p>
      ) : null}
      {memory.mediaUrl ? (
        <p className="mt-4 break-all text-xs text-archive-ivory/45">
          Media: {memory.mediaUrl}
        </p>
      ) : null}
      {memory.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {memory.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-archive-gold/14 px-3 py-1 text-xs text-archive-ivory/58"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default async function AdminArchivePreviewPage({
  params
}: {
  params: Promise<{ archiveId: string }>;
}) {
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();

  if (!account.user) {
    redirect("/login?next=%2Fadmin%2Fusers");
  }

  if (!adminEmailsConfigured || !isAdmin) {
    return <AdminDenied />;
  }

  const { archiveId } = await params;

  if (!/^[0-9a-fA-F-]{36}$/.test(archiveId)) {
    notFound();
  }

  let preview = null;
  try {
    preview = await getAdminArchivePreview(archiveId);
  } catch (error) {
    console.error("Unable to load admin archive preview:", error);
  }

  if (!preview) {
    notFound();
  }

  const { archive, owner, memories } = preview;
  const archiveType = archive.memorialMode ? "Memorial Archive" : "Living Archive";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl">
        <nav className="flex flex-col gap-4 border-b border-archive-gold/18 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-archive-champagne">
            <Link href="/admin/users" className="underline-offset-4 hover:underline">
              Users & Archives
            </Link>
            <Link href="/admin" className="underline-offset-4 hover:underline">
              Admin Dashboard
            </Link>
          </div>
        </nav>

        <header className="py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            Admin archive preview
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-archive-ivory sm:text-6xl">
            {archive.archiveName}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-archive-ivory/68">
            Read-only owner-only preview. This page does not change public
            visibility, membership, or archive permissions.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-archive-gold/14 bg-archive-gold/8 p-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-archive-gold/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-archive-champagne">
              Admin-only
            </span>
            <span className="rounded-full border border-archive-gold/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-archive-champagne">
              {archiveType}
            </span>
            <span className="rounded-full border border-archive-gold/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-archive-champagne">
              {archive.visibility === "public" ? "Public" : "Private"}
            </span>
            <span className="rounded-full border border-archive-gold/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-archive-champagne">
              {archive.discoverable ? "Discoverable" : "Not Discoverable"}
            </span>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <article className="overflow-hidden rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] shadow-luxury">
            <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:h-[460px] lg:aspect-auto">
              <Image
                src={archive.profilePhotoUrl}
                alt={archive.personName}
                fill
                priority
                className="object-cover object-[center_25%]"
                sizes="(min-width: 1024px) 820px, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-archive-obsidian/88 via-archive-obsidian/30 to-transparent" />
              <div className="absolute bottom-0 p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">
                  {archiveType}
                </p>
                <h2 className="mt-3 font-serif text-4xl leading-tight text-white sm:text-5xl">
                  {archive.personName}
                </h2>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="whitespace-pre-line text-base leading-8 text-archive-ivory/74">
                {archive.bio || "No archive bio has been added yet."}
              </p>
            </div>
          </article>

          <aside className="grid gap-4">
            <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
                Owner
              </p>
              <p className="mt-3 font-serif text-2xl text-archive-ivory">
                {owner.displayName}
              </p>
              <p className="mt-2 break-all text-sm text-archive-ivory/66">
                {owner.email || "Email unavailable"}
              </p>
              <p className="mt-2 break-all text-xs text-archive-ivory/42">
                {owner.id}
              </p>
            </div>
            <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.025] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-archive-gold">
                Archive Details
              </p>
              <dl className="mt-3 grid gap-3 text-sm text-archive-ivory/66">
                <div>
                  <dt className="text-archive-ivory/42">Slug</dt>
                  <dd className="break-all">{archive.slug}</dd>
                </div>
                <div>
                  <dt className="text-archive-ivory/42">Created</dt>
                  <dd>{formatDate(archive.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-archive-ivory/42">Chapters</dt>
                  <dd>{memories.length}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </section>

        <section className="mt-8 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-5 shadow-luxury sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">
                Memory Chapters
              </p>
              <h2 className="mt-2 font-serif text-3xl text-archive-ivory">
                Preserved content
              </h2>
            </div>
            <p className="text-sm text-archive-ivory/55">
              {memories.length} total
            </p>
          </div>

          {memories.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {memories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-archive-gold/18 bg-white/[0.015] p-6 text-sm leading-7 text-archive-ivory/62">
              No memories have been added to this archive yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
