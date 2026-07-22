import type { Metadata } from "next";
import { LegacyQuestionExperience } from "@/app/legacy-question/LegacyQuestionExperience";
import { LegacyQuestionScrollScene } from "@/components/legacy-question/LegacyQuestionScrollScene";

export const metadata: Metadata = {
  title: "Answer The Legacy Question | The Life Archive",
  description:
    "Share one private written or voice memory on the preserved scroll and begin your free Life Archive starter."
};

export default async function LegacyQuestionPage({
  searchParams
}: {
  searchParams?: Promise<{
    source?: string;
    batch?: string;
  }>;
}) {
  const params = await searchParams;
  const source = params?.source || "legacy_question_page";
  const cardBatch = params?.batch || null;

  return (
    <main className="min-h-screen bg-[#11100e] text-[#f8f1e7]">
      <LegacyQuestionExperience>
        <LegacyQuestionScrollScene initialSource={source} initialCardBatch={cardBatch} />
      </LegacyQuestionExperience>
    </main>
  );
}
