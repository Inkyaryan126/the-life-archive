import Link from "next/link";
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
import { AppSidebar } from "@/components/AppSidebar";
import {
  ArchiveBuildingShell,
  ArchiveOverlayRegion
} from "@/components/archive-building/ArchiveBuildingShell";
import { archiveBuildingScenes } from "@/lib/archive-building-scenes";

export const dynamic = "force-dynamic";

const memberCardSideNavRegion = {
  left: 2.67,
  top: 26.17,
  width: 12.96,
  height: 66.99
};

const memberCardFrontRegion = {
  left: 39.54,
  top: 30.08,
  width: 33.03,
  height: 26.07
};

const memberCardBackRegion = {
  left: 39.15,
  top: 56.84,
  width: 33.75,
  height: 26.86
};

const memberCardActionRegion = {
  left: 32.12,
  top: 87.6,
  width: 47.88,
  height: 6.93
};

type MemberCardPageProps = {
  searchParams?: Promise<{
    confirmation?: string;
    welcome?: string;
  }>;
};

type MemberCardSidePreviewProps = {
  side: "front" | "back";
  hasArchive: boolean;
  memberName: string;
  qrSrc: string;
  legacyActivationCode: string;
  createdYear: number;
};

function MemberCardSidePreview({
  side,
  hasArchive,
  memberName,
  qrSrc,
  legacyActivationCode,
  createdYear
}: MemberCardSidePreviewProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center overflow-hidden ${
        side === "front"
          ? "[&_.member-card-back]:hidden"
          : "[&_.member-card-front]:hidden"
      } [&_.member-card-face>img]:!object-contain [&_.member-card-face]:!h-full [&_.member-card-face]:!w-auto [&_.member-card-face]:!max-w-full [&_.member-card-face]:!rounded-[0.55rem] [&_.member-card-print-area]:!flex [&_.member-card-print-area]:!h-full [&_.member-card-print-area]:!w-full [&_.member-card-print-area]:!items-center [&_.member-card-print-area]:!justify-center [&_.member-card-print-area]:!gap-0`}
    >
      <MemberCard
        hasArchive={hasArchive}
        memberName={memberName}
        qrSrc={qrSrc}
        legacyActivationCode={legacyActivationCode}
        createdYear={createdYear}
      />
    </div>
  );
}

export default async function MemberCardPage({
  searchParams
}: MemberCardPageProps) {
  const resolvedSearchParams = await searchParams;
  const account = await getAccountContext();
  const { user } = account;

  if (!user) {
    const confirmationPending = resolvedSearchParams?.confirmation === "pending";

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

  const livingArchive =
    account.defaultArchive && !account.defaultArchive.memorialMode
      ? account.defaultArchive
      : null;
  const archiveSlug = livingArchive?.slug ?? null;

  const requestHeaders = await headers();
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
  const confirmationPending = resolvedSearchParams?.confirmation === "pending";
  const isNewMember =
    resolvedSearchParams?.welcome === "new" ||
    resolvedSearchParams?.welcome === "confirmed";
  const memberName = livingArchive?.personName ?? user.displayName;
  const legacyActivationCode =
    livingArchive?.legacyActivationCode ?? "CREATE-ARCHIVE";
  const createdYear = livingArchive
    ? new Date(livingArchive.createdAt).getFullYear()
    : new Date().getFullYear();

  if (!livingArchive) {
    return (
      <AccessPrompt
        eyebrow="Member Card"
        title="Member Cards are for Living Archives."
        message="Memorial Archives use memorial QR keepsakes instead. Create a Living Archive to generate a Member Card with a private Legacy Activation Code."
        primaryHref="/create?relationshipToOwner=self"
        primaryLabel="Create a Living Archive"
        secondaryHref="/dashboard"
        secondaryLabel="Return to Dashboard"
      />
    );
  }

  return (
    <>
      <ArchiveBuildingShell
        image={{ ...archiveBuildingScenes.memberCard, priority: true }}
        active="member-card"
        archiveSlug={livingArchive.slug}
        archiveName={livingArchive.archiveName}
        archivePersonName={livingArchive.personName}
        showArchiveActions={Boolean(livingArchive.slug)}
        navRegion={memberCardSideNavRegion}
        sceneLabel="Member Card archive-building scene"
      >
        <ArchiveOverlayRegion
          region={memberCardFrontRegion}
          className="flex items-center justify-center overflow-hidden p-3"
          ariaLabel="Member card front preview"
        >
          <MemberCardSidePreview
            side="front"
            hasArchive={hasArchive}
            memberName={memberName}
            qrSrc={svgToDataUri(qrSvg)}
            legacyActivationCode={legacyActivationCode}
            createdYear={createdYear}
          />
        </ArchiveOverlayRegion>

        <ArchiveOverlayRegion
          region={memberCardBackRegion}
          className="flex items-center justify-center overflow-hidden p-3"
          ariaLabel="Member card back preview"
        >
          <MemberCardSidePreview
            side="back"
            hasArchive={hasArchive}
            memberName={memberName}
            qrSrc={svgToDataUri(qrSvg)}
            legacyActivationCode={legacyActivationCode}
            createdYear={createdYear}
          />
        </ArchiveOverlayRegion>

        <ArchiveOverlayRegion
          region={memberCardActionRegion}
          className="flex items-center justify-center overflow-hidden"
          ariaLabel="Member card actions"
        >
          <div className="h-full w-full [&>div]:grid [&>div]:h-full [&>div]:w-full [&>div]:grid-cols-[167fr_197fr_197fr_174fr] [&>div]:gap-0 [&>div]:overflow-hidden [&>div>div]:contents [&_a]:flex [&_a]:h-full [&_a]:min-w-0 [&_a]:items-center [&_a]:justify-center [&_a]:whitespace-nowrap [&_a]:rounded-none [&_a]:border-0 [&_a]:px-1 [&_a]:py-0 [&_a]:text-[clamp(0.42rem,0.64vw,0.72rem)] [&_a]:tracking-[0.06em] [&_button]:h-full [&_button]:min-w-0 [&_button]:whitespace-nowrap [&_button]:rounded-none [&_button]:border-0 [&_button]:px-1 [&_button]:py-0 [&_button]:text-[clamp(0.42rem,0.64vw,0.72rem)] [&_button]:tracking-[0.06em]">
            <MemberCardActions
              continueHref={continueHref}
              continueLabel={continueLabel}
              variant="archive-building"
            />
          </div>
        </ArchiveOverlayRegion>
      </ArchiveBuildingShell>

      <main className="member-card-page relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8 sm:py-8 lg:hidden">
      <DesignBackdrop />

      <div className="no-print relative mx-auto w-full max-w-[96rem] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <AppSidebar
          active="member-card"
          archiveSlug={livingArchive.slug}
          archiveName={livingArchive.archiveName}
          archivePersonName={livingArchive.personName}
          showArchiveActions={Boolean(livingArchive.slug)}
        />

        <div className="min-w-0">
          <div className="no-print relative flex items-center justify-between border-b border-archive-gold/20 pb-5 lg:hidden">
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
              {isNewMember
                ? "This card carries a promise"
                : "Keep their story within reach"}
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
                : "This card is intended to be printed and kept in your wallet. If something ever happens to you before you’ve shared your archive with loved ones, it can help them find the memories, stories, and legacy you chose to preserve."}
            </p>

            {confirmationPending ? (
              <p className="mx-auto mt-6 max-w-xl rounded-xl border border-archive-gold/30 bg-archive-gold/10 px-5 py-4 text-sm leading-6 text-archive-champagne">
                Check your email to confirm your account. After confirmation,
                this card can connect directly to your archive.
              </p>
            ) : null}
          </section>

          <div className="member-card-print-shell relative mx-auto max-w-[34rem]">
            <MemberCard
              hasArchive={hasArchive}
              memberName={memberName}
              qrSrc={svgToDataUri(qrSvg)}
              legacyActivationCode={legacyActivationCode}
              createdYear={createdYear}
            />
          </div>

          <div className="no-print relative mx-auto mt-10 max-w-3xl">
            <MemberCardActions
              continueHref={continueHref}
              continueLabel={continueLabel}
            />
            <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-6 text-archive-ivory/55">
              If you want to print the card on both sides of one piece of
              paper, use Front Only and Back Only separately so you can match
              the two faces in your printer.
            </p>
            {livingArchive ? (
              <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-6 text-archive-ivory/60">
                {livingArchive.visibility === "public"
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
              Print this card, keep it in a wallet, or share the archive link
              with the people who should always be able to find it.
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

          <section className="no-print relative mx-auto mt-12 max-w-4xl border-t border-archive-gold/15 pt-12">
            <div className="relative overflow-hidden rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 text-center shadow-luxury backdrop-blur-[2px] sm:p-10">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-archive-gold/5 blur-3xl" />
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                Premium Keepsake Option
              </p>
              <h2 className="mb-4 font-serif text-2xl leading-tight text-archive-ivory sm:text-3xl">
                The Life Archive Memory Card
              </h2>
              <p className="mx-auto mb-4 max-w-2xl text-sm leading-7 text-archive-ivory/68">
                Order a heavier, more permanent card connected to this same
                archive. We confirm the QR, name treatment, and finish before
                production.
              </p>
              <Link
                href="/keepsakes"
                className="mb-5 inline-flex rounded-full border border-archive-gold/30 bg-white/[0.04] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
              >
                View Keepsake Store
              </Link>
              <p className="text-xs italic font-serif text-archive-gold/80">
                &ldquo;Constructed to endure centuries of touch, holding your
                living legacy with physical weight.&rdquo;
              </p>
            </div>
          </section>
        </div>
      </div>
      </main>
    </>
  );
}
