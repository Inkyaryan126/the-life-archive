import type { Metadata } from "next";
import { getAccountContext } from "@/lib/account";
import { DesignBackdrop } from "@/components/SiteDesign";
import { GiftCreationWizard } from "@/components/gift-creation/GiftCreationWizard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create a Relationship Memory Gift | The Life Archive",
  description: "Record voice notes, stories, and love notes for someone you care about.",
  robots: {
    index: true,
    follow: true
  }
};

export default async function GiftCreationPage() {
  const account = await getAccountContext();
  const signedIn = Boolean(account.user);

  return (
    <main className="relative min-h-screen bg-[#0a0806] px-4 py-8 text-[#fdfbf7] sm:px-6">
      <DesignBackdrop />
      <div className="relative z-10">
        <GiftCreationWizard signedIn={signedIn} />
      </div>
    </main>
  );
}
