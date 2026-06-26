import Link from "next/link";
import { createHash } from "crypto";
import { headers } from "next/headers";
import { MemberCard } from "@/components/MemberCard";
import { MemberCardActions } from "@/components/MemberCardActions";
import { DesignBackdrop } from "@/components/SiteDesign";
import {
  generateQrSvg,
  getRequestSiteUrl,
  svgToDataUri
} from "@/lib/qr";
import { getAccountContext } from "@/lib/account";
import { SuccessMessage } from "@/components/SuccessMessage";
import { AccessPrompt } from "@/components/AccessPrompt";

export const dynamic = "force-dynamic";

type MemberCardPageProps = {
  searchParams?: {
    confirmation?: string;
    welcome?: string;
  };
};

export default async function MemberCardPage({
  searchParams
}: MemberCardPageProps) {
  const account = await getAccountContext();
  const { user } = account;

  if (!user) {
    const confirmationPending = searchParams?.confirmation === "pending";

    return (
      <AccessPrompt
        eyebrow={confirmationPending ? "Check your email" : "Member Card"}
        title={
          confirmationPending
            ? "Confirm your account to continue."
            : "Sign in to view your Member Card."
        }
        message={
          confirmationPending
            ? "We sent you a confirmation link. After confirming your account, sign in to create an archive and prepare your card."
            : "Your Member Card is created from your real membership and archive details. Sign in or create an account to continue."
        }
        primaryHref="/login?next=%2Fmember-card"
        primaryLabel={confirmationPending ? "Return to Sign In" : "Sign In or Create an Account"}
      />
    );
  }

  const archiveSlug = account.defaultArchive?.slug ?? null;

  const requestHeaders = headers();
  const siteUrl = getRequestSiteUrl(
    requestHeaders.get("host"),
    requestHeaders.get("x-forwarded-proto") || "http"
  );
  const archivePath = archiveSlug ? `/archive/${archiveSlug}` : null;
  const hasArchive = Boolean(archivePath);
  const qrPath = archivePath || "/create";
  const qrSvg = await generateQrSvg(`${siteUrl}${qrPath}`);
  const continueHref = archivePath || "/create";
  const continueLabel = archivePath
    ? "Continue to My Archive"
    : "Create My Archive";
  const confirmationPending = searchParams?.confirmation === "pending";
  const isNewMember =
    searchParams?.welcome === "new" || searchParams?.welcome === "confirmed";
  const emailName = user.email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const memberName = account.defaultArchive?.personName ?? emailName;
  const archiveId = (account.defaultArchive as any)?.id || user.id;
  const hash = createHash("sha256").update(archiveId).digest("hex").toUpperCase();
  const accessCode = `${hash.slice(0, 4)}-${hash.slice(4, 8)}`;
  const createdYear = account.defaultArchive
    ? new Date(account.defaultArchive.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <main className="member-card-page relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8 sm:py-8">
      <DesignBackdrop />

      <div className="no-print relative mx-auto flex max-w-6xl items-center justify-between border-b border-archive-gold/20 pb-5">
        <Link
          href="/"
          className="font-serif text-lg tracking-wide text-archive-ivory"
        >
          The Life Archive Home
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
            >
              My Archives
            </Link>
          ) : null}
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
            Member Card
          </span>
        </div>
      </div>

      <section className="no-print relative mx-auto max-w-3xl pb-10 pt-14 text-center sm:pt-20">
        {isNewMember ? (
          <SuccessMessage
            eyebrow="Your membership begins here"
            message="Your place in The Life Archive is confirmed. This card is the first promise that your story can remain within reach."
          />
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
          {isNewMember ? "This card carries a promise" : "Keep their story within reach"}
        </p>
        <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">
          {isNewMember
            ? "A life should leave behind more than a name and two dates."
            : "Carry what matters with you."}
        </h1>
        <p className="mt-4 font-serif text-xl italic text-archive-champagne sm:text-2xl">
          {isNewMember
            ? "Your stories, voice, lessons, and love deserve a way home."
            : "A simple card can lead loved ones back to a lifetime of memories."}
        </p>
        <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-archive-ivory/68 sm:text-base sm:leading-8">
          {isNewMember
            ? "Once you create your archive, this card becomes a path back to what you chose to preserve. Print it. Carry it. Keep it where someone you love can find it. Years from now, one scan may open the door to the memories that still sound and feel like you."
            : "This card is intended to be printed and kept in your wallet. If something ever happens to you before you&apos;ve shared your archive with loved ones, this card can help them find the memories, stories, and legacy you chose to preserve."}
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
          memberName={memberName}
          qrSrc={svgToDataUri(qrSvg)}
          accessCode={accessCode}
          createdYear={createdYear}
        />
      </div>

      <div className="relative mx-auto mt-10 max-w-3xl">
        <MemberCardActions
          continueHref={continueHref}
          continueLabel={continueLabel}
        />
        <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-6 text-archive-ivory/55">
          If you want to print the card on both sides of one piece of paper,
          use Front Only and Back Only separately so you can match the two
          faces in your printer.
        </p>
        {account.defaultArchive ? (
          <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-6 text-archive-ivory/60">
            {account.defaultArchive.visibility === "public"
              ? "This card opens a public archive that anyone can view. Public archives may also appear on The Life Archive homepage."
              : "This card opens a private archive. Only you and authorized members can view it after signing in."}
          </p>
        ) : null}
      </div>

      <aside className="no-print relative mx-auto mt-16 max-w-4xl rounded-2xl border border-archive-gold/20 bg-white/[0.035] p-6 text-center sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
          Keep the story close
        </p>
        <h2 className="mt-3 font-serif text-2xl sm:text-3xl">
          Made to carry. Ready to share.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-archive-ivory/60">
          Print this card, keep it in a wallet, or share the archive link with
          the people who should always be able to find it.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs uppercase tracking-[0.15em] text-archive-champagne/75">
          <span className="rounded-full border border-archive-gold/20 px-4 py-2">
            Wallet card
          </span>
          <span className="rounded-full border border-archive-gold/20 px-4 py-2">
            Archive QR
          </span>
          <span className="rounded-full border border-archive-gold/20 px-4 py-2">
            Shareable link
          </span>
          <span className="rounded-full border border-archive-gold/20 px-4 py-2">
            A story kept close
          </span>
        </div>
      </aside>

      {/* Premium Metal Card Showcase */}
      <section className="no-print relative mx-auto mt-12 max-w-4xl border-t border-archive-gold/15 pt-12">
        <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 sm:p-10 shadow-luxury text-center relative overflow-hidden backdrop-blur-[2px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-archive-gold/5 blur-3xl rounded-full" />
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold mb-2">
            Prototype Phase · Coming Soon
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-archive-ivory leading-tight mb-4">
            The Engraved Brass Storykeeper Card
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-archive-ivory/68 mb-4">
            An optional premium metal Storykeeper Card designed for families who want a heavier, more permanent keepsake.
          </p>
          <p className="text-xs text-archive-gold/80 italic font-serif">
            &ldquo;Constructed to endure centuries of touch, holding your living legacy with physical weight.&rdquo;
          </p>
        </div>
      </section>
    </main>
  );
}
