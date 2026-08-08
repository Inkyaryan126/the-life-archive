"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RecipientHub } from "@/components/keepsakes/RecipientHub";
import type { PersonRelationshipType } from "@/lib/types";
import {
  createGiftConnectionAction,
  publishGiftConnectionAction,
  getGuidedPromptsAction
} from "@/app/create/gift/actions";
import type { GuidedPromptDefinition } from "@/lib/tla2-gift-creation";
import { trackEvent } from "@/lib/analytics";

const RELATIONSHIPS: Array<{ type: PersonRelationshipType; label: string; icon: string }> = [
  { type: "partner", label: "Partner / Spouse", icon: "💍" },
  { type: "child", label: "Child", icon: "👶" },
  { type: "parent", label: "Parent", icon: "🌿" },
  { type: "grandparent", label: "Grandparent", icon: "📜" },
  { type: "grandchild", label: "Grandchild", icon: "🧸" },
  { type: "friend", label: "Best Friend", icon: "🤝" },
  { type: "sibling", label: "Sibling", icon: "🤍" },
  { type: "other", label: "Other Special Connection", icon: "✨" }
];

const OCCASIONS = [
  { id: "birthday", label: "Birthday", icon: "🎂" },
  { id: "anniversary", label: "Anniversary", icon: "💍" },
  { id: "long-distance", label: "Long Distance", icon: "✈️" },
  { id: "college", label: "College / Moving Away", icon: "🎓" },
  { id: "deployment", label: "Deployment / Travel", icon: "🛡️" },
  { id: "just-because", label: "Just Because", icon: "💛" },
  { id: "keepsake", label: "Something They Can Keep", icon: "🎁" }
];

type DraftResponse = {
  promptText: string;
  suggestedMemoryType: string;
  content: string;
  mediaUrl?: string | null;
  defaultCategorySlugs: string[];
};

type GiftCreationWizardProps = {
  signedIn: boolean;
  initialConnectionId?: string;
  initialName?: string;
  initialRel?: string;
  initialOcc?: string;
  initialKey?: string;
};

export function GiftCreationWizard({
  signedIn,
  initialConnectionId,
  initialName,
  initialRel,
  initialOcc,
  initialKey
}: GiftCreationWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(initialName ? 4 : 1);
  const [personName, setPersonName] = useState<string>(initialName || "");
  const [nameError, setNameError] = useState<string>("");
  const [relationship, setRelationship] = useState<PersonRelationshipType>(
    (initialRel as PersonRelationshipType) || "partner"
  );
  const [occasion, setOccasion] = useState<string>(initialOcc || "just-because");
  const [creationKey] = useState<string>(
    () => initialKey || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "00000000-0000-4000-8000-000000000000")
  );

  // Prompts and responses state
  const [prompts, setPrompts] = useState<GuidedPromptDefinition[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);
  const [savedResponses, setSavedResponses] = useState<DraftResponse[]>([]);
  const [currentTextResponse, setCurrentTextResponse] = useState<string>("");
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [saveSuccessResult, setSaveSuccessResult] = useState<{ connectionId: string; archiveSlug: string } | null>(null);

  // Track gift_flow_started on initial mount
  useEffect(() => {
    trackEvent("gift_flow_started", { path: "/create/gift" });
  }, []);

  // Load prompts dynamically via Server Action when relationship or occasion changes
  useEffect(() => {
    getGuidedPromptsAction(relationship, occasion).then((p) => {
      setPrompts(p);
      setCurrentPromptIndex(0);
    });
  }, [relationship, occasion]);

  const activePrompt = prompts[currentPromptIndex] ?? prompts[0] ?? {
    id: "default",
    promptText: "A story about a moment together you'll never forget.",
    helperText: "Describe the day you realized how much they meant to you.",
    suggestedMemoryType: "voice",
    defaultCategorySlugs: ["love", "miss_you"]
  };

  const handleNextStep1 = () => {
    if (!personName.trim()) {
      setNameError("Please enter the name of the person you are making this for.");
      return;
    }
    setNameError("");
    setStep(2);
  };

  const handleSaveCurrentPromptResponse = () => {
    if (!currentTextResponse.trim()) return;

    const newResp: DraftResponse = {
      promptText: activePrompt.promptText,
      suggestedMemoryType: activePrompt.suggestedMemoryType,
      content: currentTextResponse.trim(),
      defaultCategorySlugs: activePrompt.defaultCategorySlugs
    };

    if (savedResponses.length === 0) {
      trackEvent("first_memory_captured", {
        suggested_type: activePrompt.suggestedMemoryType
      });
    }

    setSavedResponses((prev) => [...prev.filter((r) => r.promptText !== activePrompt.promptText), newResp]);
    setCurrentTextResponse("");

    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
    } else {
      setStep(5); // Progress summary & draft review step
    }
  };

  const handleSaveDrafts = async () => {
    setIsSaving(true);
    try {
      const result = await createGiftConnectionAction({
        creationKey,
        existingConnectionId: initialConnectionId,
        personName,
        relationshipType: relationship,
        occasion,
        responses: savedResponses,
        accessStatus: "restricted"
      });

      if ("connectionId" in result && result.ok) {
        setSaveSuccessResult({ connectionId: result.connectionId, archiveSlug: result.archiveSlug });
        trackEvent("keepsake_catalog_viewed", { from_wizard: true });
        setStep(6); // Move to publication & keepsake handoff step
      } else {
        alert("error" in result ? result.error : "Failed to save progress");
      }
    } catch {
      alert("Failed to save progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishAndPair = async () => {
    if (!saveSuccessResult) {
      router.push("/keepsakes");
      return;
    }
    setIsPublishing(true);
    try {
      await publishGiftConnectionAction(saveSuccessResult.connectionId);
    } catch {
      // Non-blocking
    } finally {
      setIsPublishing(false);
      router.push(`/keepsakes?connectionId=${saveSuccessResult.connectionId}&name=${encodeURIComponent(personName)}`);
    }
  };

  const previewMemories = savedResponses.map((r, i) => ({
    id: `draft-${i}`,
    title: r.promptText,
    type: r.suggestedMemoryType,
    content: r.content,
    mediaUrl: r.mediaUrl ?? null,
    date: new Date().toISOString().slice(0, 10),
    categories: r.defaultCategorySlugs
  }));

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 text-[#fdfbf7]">
      {/* Wizard Progress Bar */}
      <div className="mb-6 flex items-center justify-between border-b border-[#c5a059]/20 pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c5a059]">
          Step {step} of 6 &bull; Relationship Gift Wizard
        </span>
        {personName ? (
          <span className="text-xs font-serif text-[#fdfbf7]/60">
            For {personName}
          </span>
        ) : null}
      </div>

      {/* Step 1: Who is it for? */}
      {step === 1 && (
        <section className="space-y-6">
          <div className="text-center">
            <span className="text-4xl">🎁</span>
            <h1 className="mt-3 font-serif text-3xl font-normal text-[#fdfbf7] sm:text-4xl">
              Who are you making this for?
            </h1>
            <p className="mt-2 text-sm text-[#fdfbf7]/65">
              Enter their name or what you call them.
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="e.g. Sarah, Mom, Brian"
              className="w-full rounded-2xl border border-[#c5a059]/30 bg-white/[0.04] px-5 py-4 font-serif text-xl text-[#fdfbf7] placeholder-[#fdfbf7]/30 shadow-luxury outline-none focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/40"
            />
            {nameError ? (
              <p className="text-xs font-medium text-red-400">{nameError}</p>
            ) : null}
          </div>

          <button
            onClick={handleNextStep1}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#c5a059] px-6 text-sm font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37]"
          >
            Continue &rarr;
          </button>
        </section>
      )}

      {/* Step 2: Relationship */}
      {step === 2 && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-normal text-[#fdfbf7] sm:text-4xl">
              Who is {personName} to you?
            </h2>
            <p className="mt-2 text-sm text-[#fdfbf7]/65">
              Select your relationship connection.
            </p>
          </div>

          <div className="grid gap-3">
            {RELATIONSHIPS.map((rel) => (
              <button
                key={rel.type}
                onClick={() => setRelationship(rel.type)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                  relationship === rel.type
                    ? "border-[#c5a059] bg-[#c5a059]/15 text-[#fdfbf7]"
                    : "border-[#c5a059]/20 bg-white/[0.035] text-[#fdfbf7]/80 hover:border-[#c5a059]/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rel.icon}</span>
                  <span className="font-serif text-lg font-medium">{rel.label}</span>
                </div>
                {relationship === rel.type ? (
                  <span className="font-bold text-[#c5a059]">&check;</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="inline-flex min-h-12 w-1/3 items-center justify-center rounded-full border border-[#c5a059]/30 bg-white/[0.04] text-sm font-semibold text-[#fdfbf7]"
            >
              &larr; Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="inline-flex min-h-12 w-2/3 items-center justify-center rounded-full bg-[#c5a059] text-sm font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37]"
            >
              Next Step &rarr;
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Occasion */}
      {step === 3 && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-normal text-[#fdfbf7] sm:text-4xl">
              Why are you making this now?
            </h2>
            <p className="mt-2 text-sm text-[#fdfbf7]/65">
              Select the occasion or reason for this gift.
            </p>
          </div>

          <div className="grid gap-3">
            {OCCASIONS.map((occ) => (
              <button
                key={occ.id}
                onClick={() => setOccasion(occ.id)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                  occasion === occ.id
                    ? "border-[#c5a059] bg-[#c5a059]/15 text-[#fdfbf7]"
                    : "border-[#c5a059]/20 bg-white/[0.035] text-[#fdfbf7]/80 hover:border-[#c5a059]/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{occ.icon}</span>
                  <span className="font-serif text-lg font-medium">{occ.label}</span>
                </div>
                {occasion === occ.id ? (
                  <span className="font-bold text-[#c5a059]">&check;</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="inline-flex min-h-12 w-1/3 items-center justify-center rounded-full border border-[#c5a059]/30 bg-white/[0.04] text-sm font-semibold text-[#fdfbf7]"
            >
              &larr; Back
            </button>
            <button
              onClick={() => {
                trackEvent("person_selected_onboarding", {
                  relationship_type: relationship,
                  occasion
                });
                setStep(4);
              }}
              className="inline-flex min-h-12 w-2/3 items-center justify-center rounded-full bg-[#c5a059] text-sm font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37]"
            >
              Start Prompts &rarr;
            </button>
          </div>
        </section>
      )}

      {/* Step 4: Guided Prompt Recording & Writing */}
      {step === 4 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#c5a059]/18 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#c5a059]">
              Prompt {currentPromptIndex + 1} of {prompts.length || 1}
            </span>
            <span className="text-xs text-[#fdfbf7]/60 font-serif">
              Crafting for {personName}
            </span>
          </div>

          {/* Low-Friction Account Checkpoint for Anonymous Creators */}
          {!signedIn && (
            <div className="rounded-2xl border border-[#c5a059]/30 bg-[#c5a059]/10 p-4 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">
                Save this for {personName}
              </p>
              <p className="mt-1 text-xs text-[#fdfbf7]/80">
                Create a free account so nothing you record gets lost.
              </p>
              <Link
                href={`/login?next=${encodeURIComponent(`/create/gift?key=${creationKey}&name=${encodeURIComponent(personName)}&rel=${relationship}&occ=${occasion}`)}`}
                className="mt-3 inline-flex rounded-full bg-[#c5a059] px-4 py-1.5 text-xs font-bold text-[#0a0806]"
              >
                Sign In to Protect Your Recording
              </Link>
            </div>
          )}

          {/* Guided Prompt Card */}
          <div className="rounded-3xl border border-[#c5a059]/25 bg-white/[0.04] p-6 shadow-luxury backdrop-blur-md sm:p-8">
            <h2 className="font-serif text-2xl font-normal leading-tight text-[#fdfbf7] sm:text-3xl">
              &ldquo;{activePrompt.promptText}&rdquo;
            </h2>
            <p className="mt-3 text-sm text-[#fdfbf7]/70">
              {activePrompt.helperText}
            </p>

            <div className="mt-6 space-y-4">
              <textarea
                value={currentTextResponse}
                onChange={(e) => setCurrentTextResponse(e.target.value)}
                rows={4}
                placeholder={`Write a message for ${personName}...`}
                className="w-full rounded-2xl border border-[#c5a059]/30 bg-black/40 p-4 font-serif text-base text-[#fdfbf7] placeholder-[#fdfbf7]/30 outline-none focus:border-[#c5a059]"
              />

              {/* Natural Human Language Category Confirmation */}
              <div className="flex items-center gap-2 text-xs text-[#c5a059]">
                <span>💛 Added to the moments {personName} may need this most.</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleSaveCurrentPromptResponse}
                disabled={!currentTextResponse.trim()}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#c5a059] text-sm font-bold text-[#0a0806] transition hover:bg-[#d4af37] disabled:opacity-50"
              >
                Save &amp; Next Prompt &rarr;
              </button>

              {currentPromptIndex < prompts.length - 1 ? (
                <button
                  onClick={() => setCurrentPromptIndex((prev) => prev + 1)}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c5a059]/30 bg-white/[0.04] px-5 text-sm font-semibold text-[#fdfbf7]"
                >
                  Skip Prompt
                </button>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* Step 5: Draft Progress Review & Owner Preview */}
      {step === 5 && (
        <section className="space-y-6">
          <div className="text-center">
            <span className="text-3xl">✨</span>
            <h2 className="mt-2 font-serif text-3xl font-normal text-[#fdfbf7]">
              {savedResponses.length} message{savedResponses.length !== 1 ? "s" : ""} prepared for {personName}
            </h2>
            <p className="mt-2 text-sm text-[#fdfbf7]/65">
              These messages are saved privately in your draft collection.
            </p>
          </div>

          <div className="space-y-3">
            {savedResponses.map((resp, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.035] p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-serif text-base font-medium text-[#fdfbf7]">
                    {resp.promptText}
                  </p>
                  <span className="rounded-full bg-[#c5a059]/20 px-2 py-0.5 text-[10px] font-semibold text-[#c5a059]">
                    DRAFT
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-[#fdfbf7]/70">
                  {resp.content}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#c5a059]/40 bg-white/[0.06] px-6 text-sm font-semibold text-[#fdfbf7] shadow-luxury transition hover:bg-white/[0.1]"
            >
              👁️ Preview What {personName} Will Experience
            </button>

            <button
              onClick={handleSaveDrafts}
              disabled={isSaving}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#c5a059] px-6 text-sm font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37] disabled:opacity-50"
            >
              {isSaving ? "Saving Drafts..." : "Save Drafts & Continue →"}
            </button>
          </div>
        </section>
      )}

      {/* Step 6: Explicit Publication & Physical Keepsake Handoff */}
      {step === 6 && (
        <section className="space-y-6 text-center">
          <span className="text-4xl">💛</span>
          <h2 className="font-serif text-3xl font-normal text-[#fdfbf7] sm:text-4xl">
            You made something nobody else could make for {personName}.
          </h2>
          <p className="mt-2 text-sm text-[#fdfbf7]/70">
            Publish your prepared messages and choose a physical keepsake to carry them.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-4">
              <span className="text-2xl">📿</span>
              <p className="mt-2 font-serif text-sm">Keepsake Necklace</p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-4">
              <span className="text-2xl">🏷️</span>
              <p className="mt-2 font-serif text-sm">Engraved Dog Tag</p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-4">
              <span className="text-2xl">🔑</span>
              <p className="mt-2 font-serif text-sm">Keychain</p>
            </div>
            <div className="rounded-2xl border border-[#c5a059]/20 bg-white/[0.03] p-4">
              <span className="text-2xl">💳</span>
              <p className="mt-2 font-serif text-sm">Wallet Card</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handlePublishAndPair}
              disabled={isPublishing}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#c5a059] px-6 text-sm font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37] disabled:opacity-50"
            >
              {isPublishing ? "Publishing..." : "Publish & Choose a Keepsake →"}
            </button>

            <Link
              href="/dashboard/time-capsules/new"
              className="inline-flex min-h-11 w-full items-center justify-center text-xs font-semibold uppercase tracking-wider text-[#c5a059] hover:underline"
            >
              ⏳ Want to leave a message for a future date?
            </Link>
          </div>
        </section>
      )}

      {/* Owner-Authorized Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#c5a059]/30 bg-[#0a0806] p-6 shadow-luxury">
            <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c5a059]">
                Owner Gift Preview (Includes Drafts)
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-xs text-[#fdfbf7]/70 hover:text-white"
              >
                Close Preview &times;
              </button>
            </div>

            <RecipientHub
              personName={personName}
              relationshipType={relationship}
              subjectStatus="living"
              memories={previewMemories}
              timeCapsules={[]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
