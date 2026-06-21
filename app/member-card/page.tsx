import Link from "next/link";
import { headers } from "next/headers";
import { MemberCard } from "@/components/MemberCard";
import { MemberCardActions } from "@/components/MemberCardActions";
import {
  generateQrSvg,
  getRequestSiteUrl,
  svgToDataUri
} from "@/lib/qr";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MemberCardPageProps = {
  searchParams?: {
    confirmation?: string;
  };
};

export default async function MemberCardPage({
  searchParams
}: MemberCardPageProps) {
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const supabase = hasSupabaseConfig ? createClient() : null;
  const { data: userData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  const user = userData.user;

  let archiveSlug: string | null = null;

  if (supabase && user) {
    const { data: archive } = await supabase
      .from("archives")
      .select("slug")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    archiveSlug = archive?.slug ?? null;
  }

  const requestHeaders = headers();
  const siteUrl = getRequestSiteUrl(
    requestHeaders.get("host"),
    requestHeaders.get("x-forwarded-proto") || "http"
  );
  const archivePath = archiveSlug ? `/archive/${archiveSlug}` : null;
  const hasArchive = Boolean(archivePath);
  const qrPath = archivePath || "/create";
  const qrSvg = await generateQrSvg(`${siteUrl}${qrPath}`);
  const memberSince = String(
    user?.created_at
      ? new Date(user.created_at).getFullYear()
      : new Date().getFullYear()
  );
  const continueHref = archivePath || (user ? "/create" : "/login");
  const continueLabel = archivePath
    ? "Continue to My Archive"
    : user
      ? "Create My Archive"
      : "Sign In to View Card";
  const confirmationPending = searchParams?.confirmation === "pending";

  return (
    <main className="member-card-page min-h-screen overflow-hidden bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,161,91,0.16),transparent_30rem),radial-gradient(circle_at_bottom_right,rgba(198,161,91,0.08),transparent_34rem)]" />

      <div className="no-print relative mx-auto flex max-w-6xl items-center justify-between border-b border-archive-gold/20 pb-5">
        <Link
          href="/"
          className="font-serif text-lg tracking-wide text-archive-ivory"
        >
          The Life Archive
        </Link>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
          Official Member
        </span>
      </div>

      <section className="no-print relative mx-auto max-w-3xl pb-10 pt-14 text-center sm:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
          Membership begins here
        </p>
        <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">
          Welcome to The Life Archive.
        </h1>
        <p className="mt-4 font-serif text-xl italic text-archive-champagne sm:text-2xl">
          You are now part of something that matters.
        </p>
        <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-archive-ivory/68 sm:text-base sm:leading-8">
          This card is intended to be printed and kept in your wallet. If
          something ever happens to you before you&apos;ve shared your archive with
          loved ones, this card can help them find the memories, stories, and
          legacy you chose to preserve.
        </p>

        {confirmationPending ? (
          <p className="mx-auto mt-6 max-w-xl rounded-xl border border-archive-gold/30 bg-archive-gold/10 px-5 py-4 text-sm leading-6 text-archive-champagne">
            Check your email to confirm your account. After confirmation, this
            card can connect directly to your archive.
          </p>
        ) : null}
      </section>

      <div className="member-card-print-shell relative mx-auto max-w-[34rem]">
        <MemberCard
          hasArchive={hasArchive}
          memberSince={memberSince}
          qrSrc={svgToDataUri(qrSvg)}
        />
      </div>

      <div className="relative mx-auto mt-10 max-w-3xl">
        <MemberCardActions
          continueHref={continueHref}
          continueLabel={continueLabel}
        />
      </div>

      <aside className="no-print relative mx-auto mt-16 max-w-4xl rounded-2xl border border-archive-gold/20 bg-white/[0.035] p-6 text-center sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
          The card collection
        </p>
        <h2 className="mt-3 font-serif text-2xl sm:text-3xl">
          Made to carry. Built to endure.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-archive-ivory/60">
          Premium physical cards, engraved metal editions, and memorial
          keychains are planned for a future collection.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs uppercase tracking-[0.15em] text-archive-champagne/75">
          <span className="rounded-full border border-archive-gold/20 px-4 py-2">
            Premium cards
          </span>
          <span className="rounded-full border border-archive-gold/20 px-4 py-2">
            Metal editions
          </span>
          <span className="rounded-full border border-archive-gold/20 px-4 py-2">
            Engraved cards
          </span>
          <span className="rounded-full border border-archive-gold/20 px-4 py-2">
            Memorial keychains
          </span>
        </div>
      </aside>
    </main>
  );
}
