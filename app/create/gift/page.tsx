import type { Metadata } from "next";
import { getAccountContext } from "@/lib/account";
import { GiftCreationWizard } from "@/components/gift-creation/GiftCreationWizard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Make Something for Someone — The Life Archive",
  description: "Record voice messages, stories, advice, and memories connected to a physical keepsake for someone you care about."
};

export default async function CreateGiftPage({
  searchParams
}: {
  searchParams?: Promise<{ connectionId?: string; name?: string; rel?: string; occ?: string; key?: string }>;
}) {
  const account = await getAccountContext();
  const params = searchParams ? await searchParams : {};

  return (
    <main className="min-h-screen bg-[#0a0806] text-[#fdfbf7]">
      <GiftCreationWizard
        signedIn={Boolean(account.user)}
        initialConnectionId={params.connectionId}
        initialName={params.name}
        initialRel={params.rel}
        initialOcc={params.occ}
        initialKey={params.key}
      />
    </main>
  );
}
