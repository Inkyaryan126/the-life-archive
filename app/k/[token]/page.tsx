import type { Metadata } from "next";
import Image from "next/image";
import { DesignBackdrop } from "@/components/SiteDesign";
import { resolveKeepsakeExperience } from "@/lib/tla2-keepsake-resolver";
import { RecipientHub } from "@/components/keepsakes/RecipientHub";
import { KeepsakeErrorState } from "@/components/keepsakes/KeepsakeErrorState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Physical Keepsake | The Life Archive",
  description: "One scan closer. Connect with moments, stories, and love notes.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    noimageindex: true
  }
};

type KeepsakePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function KeepsakePage({ params }: KeepsakePageProps) {
  const { token } = await params;
  const result = await resolveKeepsakeExperience(token);

  if (!result.ok) {
    return (
      <main className="relative min-h-screen bg-[#0a0806] px-5 py-8 text-[#fdfbf7]">
        <DesignBackdrop />
        <KeepsakeErrorState error={result.error} />
      </main>
    );
  }

  // Legacy Pass Mode: Render original read-only legacy guest memory pass
  if (result.experienceMode === "legacy_pass") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
        <DesignBackdrop />

        <div className="relative z-10 mx-auto max-w-3xl">
          <header className="border-b border-archive-gold/18 pb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
              Physical Keepsake Guest Pass
            </p>
            <h1 className="mt-3 font-serif text-3xl font-normal leading-tight text-archive-ivory sm:text-4xl">
              {result.personName}
            </h1>
          </header>

          <section className="mt-8 space-y-6">
            {result.memories.length === 0 ? (
              <div className="rounded-[1.5rem] border border-archive-gold/14 bg-white/[0.03] p-8 text-center">
                <p className="text-sm text-archive-ivory/60">
                  No memories are currently shared on this keepsake pass.
                </p>
              </div>
            ) : (
              result.memories.map((memory) => (
                <article
                  key={memory.id}
                  className="rounded-[1.5rem] border border-archive-gold/16 bg-white/[0.035] p-6 shadow-luxury backdrop-blur-[2px]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-serif text-xl text-archive-ivory">
                      {memory.title}
                    </h2>
                    {memory.date ? (
                      <time className="text-xs text-archive-gold/80">
                        {memory.date}
                      </time>
                    ) : null}
                  </div>

                  {memory.content ? (
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-archive-ivory/82">
                      {memory.content}
                    </p>
                  ) : null}

                  {memory.mediaUrl ? (
                    <div className="mt-5 overflow-hidden rounded-xl border border-archive-gold/12 bg-black/40">
                      {memory.type === "voice" || memory.mediaUrl.endsWith(".mp3") || memory.mediaUrl.endsWith(".m4a") ? (
                        <audio controls src={memory.mediaUrl} className="w-full p-2" />
                      ) : (
                        <Image
                          src={memory.mediaUrl}
                          alt={memory.title}
                          width={800}
                          height={600}
                          unoptimized
                          className="h-auto max-h-[500px] w-full object-contain"
                        />
                      )}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </section>

          <footer className="mt-12 text-center text-xs text-archive-ivory/40">
            <p>The Life Archive &bull; Shared via physical keepsake pass</p>
          </footer>
        </div>
      </main>
    );
  }

  // TLA 2.0 Modern Interactive Recipient Experience
  return (
    <main className="relative min-h-screen bg-[#0a0806] px-4 py-6 text-[#fdfbf7] sm:px-6">
      <DesignBackdrop />
      <div className="relative z-10">
        <RecipientHub
          personName={result.personName}
          relationshipType={result.relationshipType}
          subjectStatus={result.subjectStatus}
          memories={result.memories}
          timeCapsules={result.timeCapsules}
        />
      </div>
    </main>
  );
}
