import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import { getContinuityProfileForArchive } from "@/lib/continuity";
import { createClient } from "@/lib/supabase/server";
import { ContinuityCapsuleForm } from "@/components/dashboard/ContinuityCapsuleForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Continuity Capsule | The Life Archive",
  description: "Define who you are, what you refuse to remain, and who you are becoming."
};

export default async function DashboardContinuityPage() {
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login?next=%2Fdashboard%2Fcontinuity");
  }

  // Find living self-archive where relationshipToOwner === 'self' and memorialMode === false
  const livingArchive = account.archives.find(
    (a) => a.relationshipToOwner === "self" && !a.memorialMode
  );

  if (!livingArchive) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-archive-gold/20 bg-black/70 p-8 text-center text-archive-ivory shadow-luxury sm:p-12">
        <h1 className="font-serif text-3xl text-archive-champagne">Create Your Living Archive First</h1>
        <p className="text-sm leading-7 text-archive-ivory/76">
          Your Continuity Capsule is attached to your living self-archive. You currently don&apos;t have a living archive registered to yourself.
        </p>
        <div className="pt-4">
          <Link
            href="/create"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-archive-gold px-8 py-3 text-xs font-bold uppercase tracking-wider text-archive-obsidian hover:bg-archive-champagne"
          >
            Create Living Archive
          </Link>
        </div>
      </div>
    );
  }

  // Get Supabase UUID for the archive
  const supabase = await createClient();
  const { data: archiveRow } = await supabase
    .from("archives")
    .select("id")
    .eq("slug", livingArchive.slug)
    .single();

  const archiveId = archiveRow?.id ?? "";
  const initialProfile = archiveId ? await getContinuityProfileForArchive(archiveId) : null;

  // Fetch memories for evidence linking
  const { data: memoryRows } = await supabase
    .from("memories")
    .select("id, title, type, memory_date")
    .eq("archive_id", archiveId)
    .order("created_at", { ascending: false });

  const userMemories = (memoryRows ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    type: m.type,
    date: m.memory_date
  }));

  return (
    <div className="mx-auto w-full max-w-5xl">
      <ContinuityCapsuleForm
        archiveSlug={livingArchive.slug}
        archiveId={archiveId}
        userId={account.user.id}
        initialProfile={initialProfile}
        userMemories={userMemories}
      />
    </div>
  );
}
