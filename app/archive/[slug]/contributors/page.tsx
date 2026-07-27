import { notFound, redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import { getArchiveBySlug } from "@/lib/archive-data";
import { getArchiveContributorsList } from "@/lib/archive-contributors";
import { ContributorsManager } from "@/components/archive/ContributorsManager";
import { DesignBackdrop } from "@/components/SiteDesign";
import { AccessPrompt } from "@/components/AccessPrompt";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileArchiveHeader } from "@/components/archive-building/MobileArchiveHeader";
import {
  sendContributorInvitationAction,
  resendContributorInvitationAction,
  revokeContributorAccessAction
} from "./actions";

export const dynamic = "force-dynamic";

type ContributorsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ContributorsPage({ params }: ContributorsPageProps) {
  const { slug } = await params;
  const account = await getAccountContext();
  const { user } = account;

  if (!user) {
    redirect(`/login?next=%2Farchive%2F${slug}%2Fcontributors`);
  }

  const archive = await getArchiveBySlug(slug);

  if (!archive) {
    notFound();
  }

  const isOwner = account.archives.some((item) => item.slug === archive.slug);

  if (!isOwner) {
    return (
      <AccessPrompt
        eyebrow="Access Denied"
        title="Unauthorized Admin Access."
        message="Only the archive owner can view and manage contributors."
        primaryHref={`/archive/${archive.slug}`}
        primaryLabel="Return to Archive"
      />
    );
  }

  const contributors = await getArchiveContributorsList(archive.id, user.id);

  const boundSendAction = sendContributorInvitationAction.bind(null, archive.slug);
  const boundResendAction = resendContributorInvitationAction.bind(null, archive.slug);
  const boundRevokeAction = revokeContributorAccessAction.bind(null, archive.slug);

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-6 py-6 text-archive-ivory lg:px-12 xl:px-16 sm:py-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-[96rem] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <AppSidebar
          active="edit"
          archiveSlug={archive.slug}
          archiveName={archive.archiveName}
          archivePersonName={archive.personName}
        />

        <div className="min-w-0">
          <MobileArchiveHeader
            active="settings"
            archiveSlug={archive.slug}
            signedIn={true}
          />

          <div className="pt-8 sm:pt-12">
            <ContributorsManager
              archiveSlug={archive.slug}
              archiveName={archive.archiveName}
              contributors={contributors}
              sendAction={boundSendAction}
              resendAction={boundResendAction}
              revokeAction={boundRevokeAction}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
