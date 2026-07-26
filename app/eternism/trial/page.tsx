import type { Metadata } from "next";
import { getAccountContext } from "@/lib/account";
import { EternismPageShell } from "@/components/eternism/EternismPageShell";
import { EternismTrialClient } from "@/components/eternism/EternismTrialClient";

export const metadata: Metadata = {
  title: "How Hard Are You to Destroy? | The Eternism Trial",
  description:
    "Measure the six structures carrying you into the future: body, mind, values, creativity, meaning, and conscious evolution.",
  openGraph: {
    title: "How Hard Are You to Destroy? | The Eternism Trial",
    description:
      "Measure the six structures carrying you into the future: body, mind, values, creativity, meaning, and conscious evolution.",
    url: "https://thelifearchive.vip/eternism/trial",
    siteName: "The Life Archive",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "How Hard Are You to Destroy? | The Eternism Trial",
    description:
      "Measure the six structures carrying you into the future: body, mind, values, creativity, meaning, and conscious evolution."
  }
};

export default async function EternismTrialPage() {
  const account = await getAccountContext();
  const signedIn = Boolean(account.user);
  const selfArchive = account.archives.find((a) => a.relationshipToOwner === "self" && !a.memorialMode) ?? null;

  return (
    <EternismPageShell>
      <EternismTrialClient
        signedIn={signedIn}
        hasSelfArchive={Boolean(selfArchive)}
        archiveSlug={selfArchive?.slug ?? null}
      />
    </EternismPageShell>
  );
}
