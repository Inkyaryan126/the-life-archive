"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  ContinuityProfile,
  PresentSelf,
  RefusedSelf,
  FutureSelf,
  ConsciousEvolution,
  ContinuityPractices,
  AnnualReview
} from "@/lib/continuity";

type ContinuityCapsuleFormProps = {
  archiveSlug: string;
  archiveId: string;
  userId: string;
  initialProfile: ContinuityProfile | null;
  userMemories?: Array<{ id: string; title: string; type: string; date: string }>;
};

type StageKey = "present" | "refused" | "future" | "evolution" | "practices" | "declaration" | "annual_review";

export function ContinuityCapsuleForm({
  archiveSlug,
  archiveId,
  userId,
  initialProfile,
  userMemories = []
}: ContinuityCapsuleFormProps) {
  const router = useRouter();

  const [activeStage, setActiveStage] = useState<StageKey>("present");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [presentSelf, setPresentSelf] = useState<PresentSelf>(
    initialProfile?.presentSelf ?? {}
  );
  const [refusedSelf, setRefusedSelf] = useState<RefusedSelf>(
    initialProfile?.refusedSelf ?? {}
  );
  const [futureSelf, setFutureSelf] = useState<FutureSelf>(
    initialProfile?.futureSelf ?? {}
  );
  const [consciousEvolution, setConsciousEvolution] = useState<ConsciousEvolution>(
    initialProfile?.consciousEvolution ?? {}
  );
  const [practices, setPractices] = useState<ContinuityPractices>(
    initialProfile?.continuityPractices ?? {}
  );
  const [evidenceMemoryIds, setEvidenceMemoryIds] = useState<string[]>(
    initialProfile?.evidenceMemoryIds ?? []
  );

  // Annual review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    year: new Date().getFullYear(),
    whoIWas: "",
    whoIBecame: "",
    whatChanged: "",
    whatIAchieved: "",
    whatIAbandoned: "",
    whatStillRulesMe: "",
    nextVersionRequirements: "",
    effectOnPeopleAround: "",
    embodiedChange: "",
    unconsciousAreas: ""
  });

  const [annualReviews, setAnnualReviews] = useState<AnnualReview[]>(
    initialProfile?.annualReviews ?? []
  );

  const declarationText =
    initialProfile?.continuityDeclaration ||
    `I am not a finished object.
I am a life under construction.

I will preserve the truth of who I have been without becoming imprisoned by it.

I will strengthen my body, sharpen my mind, create my values, and build toward the person I choose to become.

I leave behind ${refusedSelf.habitsToQuit || refusedSelf.fearsToRelease || "fear and hesitation"}.

I am becoming ${futureSelf.whoIAmBecoming || "my highest potential self"}.

I will not wait for humanity to become what I am unwilling to embody myself.${
      consciousEvolution.humanityChangeToEmbodyFirst
        ? ` I choose to first embody ${consciousEvolution.humanityChangeToEmbodyFirst}.`
        : ""
    }

I will not worship suffering, aging, or death simply because humanity has not yet defeated them.

I will leave evidence that I lived deliberately.`;

  const handleSave = async (isCompleted = false) => {
    setSaving(true);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/continuity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archiveId,
          userId,
          presentSelf,
          refusedSelf,
          futureSelf,
          consciousEvolution,
          continuityPractices: practices,
          evidenceMemoryIds,
          currentStage: activeStage,
          isCompleted
        })
      });

      if (!res.ok) {
        throw new Error("Failed to save Continuity Capsule.");
      }

      setSuccessMessage(isCompleted ? "Continuity Capsule completed and saved!" : "Progress saved.");
      setTimeout(() => setSuccessMessage(null), 4000);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAnnualReview = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/continuity/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archiveId,
          review: reviewForm
        })
      });

      if (!res.ok) {
        throw new Error("Failed to save Annual Review.");
      }

      const data = await res.json();
      if (data.profile?.annualReviews) {
        setAnnualReviews(data.profile.annualReviews);
      }
      setShowReviewModal(false);
      setSuccessMessage("Annual Review recorded successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving review");
    } finally {
      setSaving(false);
    }
  };

  const stages: { key: StageKey; label: string; number: string }[] = [
    { key: "present", label: "1. The Person I Am", number: "01" },
    { key: "refused", label: "2. What I Refuse to Remain", number: "02" },
    { key: "future", label: "3. The Person I Am Becoming", number: "03" },
    { key: "evolution", label: "4. Conscious Evolution", number: "04" },
    { key: "practices", label: "5. Continuity Practices", number: "05" },
    { key: "declaration", label: "6. Declaration & Evidence", number: "06" },
    { key: "annual_review", label: "Annual Review", number: "07" }
  ];

  return (
    <div className="space-y-8 text-archive-ivory">
      {/* Header */}
      <header className="rounded-3xl border border-archive-gold/22 bg-black/60 p-6 shadow-luxury sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
          Eternism Guided System
        </p>
        <h1 className="mt-2 font-serif text-2xl leading-tight text-archive-ivory sm:text-4xl">
          My Continuity Capsule
        </h1>
        <p className="mt-2 text-sm text-archive-ivory/76">
          Define who you are, what you are finished carrying, who you are becoming, and how you consciously evolve.
        </p>
      </header>

      {/* Success Notification */}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center text-sm font-semibold text-emerald-300">
          {successMessage}
        </div>
      )}

      {/* Stage Navigation Pills */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-archive-gold/18 bg-archive-obsidian/80 p-2">
        {stages.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveStage(s.key)}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
              activeStage === s.key
                ? "border border-archive-gold/40 bg-archive-gold/20 text-archive-gold shadow-luxury"
                : "text-archive-ivory/70 hover:bg-white/[0.04]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STAGE 1: THE PERSON I AM */}
      {activeStage === "present" && (
        <section className="space-y-6 rounded-3xl border border-archive-gold/18 bg-black/55 p-6 sm:p-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">Stage 01</span>
            <h2 className="mt-1 font-serif text-2xl text-archive-champagne">The Person I Am Today</h2>
            <p className="mt-1 text-sm text-archive-ivory/70">An honest, grounded snapshot of your present reality.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-archive-gold">How would you describe yourself today?</label>
              <textarea
                value={presentSelf.description || ""}
                onChange={(e) => setPresentSelf({ ...presentSelf, description: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Current state of mind, role, season of life..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">What are your strongest qualities?</label>
              <textarea
                value={presentSelf.strongestQualities || ""}
                onChange={(e) => setPresentSelf({ ...presentSelf, strongestQualities: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Resilience, curiosity, empathy, discipline..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">What are your current weaknesses?</label>
              <textarea
                value={presentSelf.currentWeaknesses || ""}
                onChange={(e) => setPresentSelf({ ...presentSelf, currentWeaknesses: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Impatience, avoidance, boundary issues..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">What values currently guide you?</label>
              <textarea
                value={presentSelf.guidingValues || ""}
                onChange={(e) => setPresentSelf({ ...presentSelf, guidingValues: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Integrity, freedom, craftsmanship, family..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">What gives you energy vs drains you?</label>
              <textarea
                value={presentSelf.energySources || ""}
                onChange={(e) => setPresentSelf({ ...presentSelf, energySources: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="What recharges you vs what depletes you..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">What makes life worth living right now?</label>
              <textarea
                value={presentSelf.whatMakesLifeWorthLiving || ""}
                onChange={(e) => setPresentSelf({ ...presentSelf, whatMakesLifeWorthLiving: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Relationships, projects, moments of beauty..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="rounded-full border border-archive-gold/30 bg-archive-gold/15 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-champagne hover:bg-archive-gold/30"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => {
                handleSave(false);
                setActiveStage("refused");
              }}
              className="rounded-full bg-archive-gold px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-obsidian hover:bg-archive-champagne"
            >
              Next: What I Refuse
            </button>
          </div>
        </section>
      )}

      {/* STAGE 2: THE PERSON I REFUSE TO REMAIN */}
      {activeStage === "refused" && (
        <section className="space-y-6 rounded-3xl border border-archive-gold/18 bg-black/55 p-6 sm:p-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">Stage 02</span>
            <h2 className="mt-1 font-serif text-2xl text-archive-champagne">What Has Ruled You Long Enough?</h2>
            <p className="mt-1 text-sm text-archive-ivory/70">Identify the habits, fears, and excuses you refuse to carry into your future.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-archive-gold">Fears to Release</label>
              <textarea
                value={refusedSelf.fearsToRelease || ""}
                onChange={(e) => setRefusedSelf({ ...refusedSelf, fearsToRelease: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Fear of failure, rejection, vulnerability..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">Habits to Quit</label>
              <textarea
                value={refusedSelf.habitsToQuit || ""}
                onChange={(e) => setRefusedSelf({ ...refusedSelf, habitsToQuit: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Procrastination, doomscrolling, poor sleep..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">Self-Betrayals to Stop</label>
              <textarea
                value={refusedSelf.selfBetrayalsToStop || ""}
                onChange={(e) => setRefusedSelf({ ...refusedSelf, selfBetrayalsToStop: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Breaking promises to yourself, staying silent..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">Excuses to Abandon</label>
              <textarea
                value={refusedSelf.excusesToAbandon || ""}
                onChange={(e) => setRefusedSelf({ ...refusedSelf, excusesToAbandon: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Not enough time, too old, past mistakes..."
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveStage("present")}
              className="rounded-full border border-archive-gold/30 px-5 py-2 text-xs font-semibold text-archive-ivory"
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="rounded-full border border-archive-gold/30 bg-archive-gold/15 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-champagne hover:bg-archive-gold/30"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSave(false);
                  setActiveStage("future");
                }}
                className="rounded-full bg-archive-gold px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-obsidian hover:bg-archive-champagne"
              >
                Next: The Future Self
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 3: THE PERSON I AM BECOMING */}
      {activeStage === "future" && (
        <section className="space-y-6 rounded-3xl border border-archive-gold/18 bg-black/55 p-6 sm:p-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">Stage 03</span>
            <h2 className="mt-1 font-serif text-2xl text-archive-champagne">The Person I Am Becoming</h2>
            <p className="mt-1 text-sm text-archive-ivory/70">Define the standards, qualities, and contributions of your future self.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-archive-gold">Who are you becoming?</label>
              <textarea
                value={futureSelf.whoIAmBecoming || ""}
                onChange={(e) => setFutureSelf({ ...futureSelf, whoIAmBecoming: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="A wiser leader, disciplined creator, present parent..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">Non-Negotiable Standards</label>
              <textarea
                value={futureSelf.nonNegotiableStandards || ""}
                onChange={(e) => setFutureSelf({ ...futureSelf, nonNegotiableStandards: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Daily movement, radical honesty, high work quality..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">How do you treat your body under pressure?</label>
              <textarea
                value={futureSelf.bodyTreatment || ""}
                onChange={(e) => setFutureSelf({ ...futureSelf, bodyTreatment: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Prioritizing recovery, calm breathing, nourishment..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">What will you create and contribute?</label>
              <textarea
                value={futureSelf.creationsAndContributions || ""}
                onChange={(e) => setFutureSelf({ ...futureSelf, creationsAndContributions: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Books, business, mentorship, family sanctuary..."
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveStage("refused")}
              className="rounded-full border border-archive-gold/30 px-5 py-2 text-xs font-semibold text-archive-ivory"
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="rounded-full border border-archive-gold/30 bg-archive-gold/15 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-champagne hover:bg-archive-gold/30"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSave(false);
                  setActiveStage("evolution");
                }}
                className="rounded-full bg-archive-gold px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-obsidian hover:bg-archive-champagne"
              >
                Next: Conscious Evolution
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 4: CONSCIOUS EVOLUTION */}
      {activeStage === "evolution" && (
        <section className="space-y-6 rounded-3xl border border-archive-gold/18 bg-black/55 p-6 sm:p-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">Stage 04</span>
            <h2 className="mt-1 font-serif text-2xl text-archive-champagne">Conscious Evolution</h2>
            <p className="mt-1 text-sm text-archive-ivory/70">
              You do not awaken the species by waiting for humanity to change. You awaken the part of humanity that is you.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-archive-gold">What change in humanity are you willing to embody first?</label>
              <textarea
                value={consciousEvolution.humanityChangeToEmbodyFirst || ""}
                onChange={(e) => setConsciousEvolution({ ...consciousEvolution, humanityChangeToEmbodyFirst: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Patience, integrity, courage, forgiveness..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">Where are you still making decisions from fear?</label>
              <textarea
                value={consciousEvolution.fearBasedDecisions || ""}
                onChange={(e) => setConsciousEvolution({ ...consciousEvolution, fearBasedDecisions: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Career choices, relationships, speaking truth..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">What would love choose here without becoming weak?</label>
              <textarea
                value={consciousEvolution.whatLoveWouldChoose || ""}
                onChange={(e) => setConsciousEvolution({ ...consciousEvolution, whatLoveWouldChoose: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Firm boundaries with deep empathy..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">What kind of human presence do you bring into a room?</label>
              <textarea
                value={consciousEvolution.presenceToBring || ""}
                onChange={(e) => setConsciousEvolution({ ...consciousEvolution, presenceToBring: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Calm strength, listening, clarity, encouragement..."
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveStage("future")}
              className="rounded-full border border-archive-gold/30 px-5 py-2 text-xs font-semibold text-archive-ivory"
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="rounded-full border border-archive-gold/30 bg-archive-gold/15 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-champagne hover:bg-archive-gold/30"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSave(false);
                  setActiveStage("practices");
                }}
                className="rounded-full bg-archive-gold px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-obsidian hover:bg-archive-champagne"
              >
                Next: Practices
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 5: MY CONTINUITY PRACTICES */}
      {activeStage === "practices" && (
        <section className="space-y-6 rounded-3xl border border-archive-gold/18 bg-black/55 p-6 sm:p-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">Stage 05</span>
            <h2 className="mt-1 font-serif text-2xl text-archive-champagne">My Continuity Practices</h2>
            <p className="mt-1 text-sm text-archive-ivory/70">Establish your practical personal-maintenance plan across key wellness domains.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-archive-gold">Sleep &amp; Rest</label>
              <input
                type="text"
                value={practices.sleep || ""}
                onChange={(e) => setPractices({ ...practices, sleep: e.target.value })}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="7-8 hrs, dark room, 10pm bedtime..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">Movement &amp; Strength</label>
              <input
                type="text"
                value={practices.movement || ""}
                onChange={(e) => setPractices({ ...practices, movement: e.target.value })}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="4x strength, 10k steps daily..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">Nutrition &amp; Hydration</label>
              <input
                type="text"
                value={practices.nutrition || ""}
                onChange={(e) => setPractices({ ...practices, nutrition: e.target.value })}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Whole foods, high protein, 3L water..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">Medical Care &amp; Prevention</label>
              <input
                type="text"
                value={practices.medicalCare || ""}
                onChange={(e) => setPractices({ ...practices, medicalCare: e.target.value })}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Annual checkups, bloodwork, dental..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">Emotional Regulation</label>
              <input
                type="text"
                value={practices.emotionalRegulation || ""}
                onChange={(e) => setPractices({ ...practices, emotionalRegulation: e.target.value })}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="Journaling, breathwork, silence..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-archive-gold">Learning &amp; Reading</label>
              <input
                type="text"
                value={practices.learning || ""}
                onChange={(e) => setPractices({ ...practices, learning: e.target.value })}
                className="mt-2 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-3 text-sm text-archive-ivory placeholder-archive-ivory/40 focus:border-archive-gold focus:outline-none"
                placeholder="30 mins reading, skill acquisition..."
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveStage("evolution")}
              className="rounded-full border border-archive-gold/30 px-5 py-2 text-xs font-semibold text-archive-ivory"
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="rounded-full border border-archive-gold/30 bg-archive-gold/15 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-champagne hover:bg-archive-gold/30"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSave(false);
                  setActiveStage("declaration");
                }}
                className="rounded-full bg-archive-gold px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-obsidian hover:bg-archive-champagne"
              >
                Next: Declaration
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 6: DECLARATION & EVIDENCE */}
      {activeStage === "declaration" && (
        <section className="space-y-8 rounded-3xl border border-archive-gold/18 bg-black/55 p-6 sm:p-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">Stage 06</span>
            <h2 className="mt-1 font-serif text-2xl text-archive-champagne">My Continuity Declaration</h2>
            <p className="mt-1 text-sm text-archive-ivory/70">Your personalized pledge of growth and deliberate living.</p>
          </div>

          <div className="rounded-2xl border border-archive-gold/30 bg-black/80 p-6 text-center font-serif text-lg leading-relaxed italic text-archive-ivory sm:p-8">
            <p className="whitespace-pre-line">{declarationText}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(declarationText)}
              className="rounded-full border border-archive-gold/30 bg-archive-gold/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-archive-champagne hover:bg-archive-gold/25"
            >
              Copy Declaration
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-archive-ivory hover:bg-white/[0.08]"
            >
              Print Declaration
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="rounded-full bg-archive-gold px-7 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-obsidian hover:bg-archive-champagne"
            >
              Complete Capsule
            </button>
          </div>

          {/* Evidence Memories Section */}
          <div className="border-t border-archive-gold/14 pt-8">
            <h3 className="font-serif text-xl text-archive-gold">Evidence of Becoming</h3>
            <p className="mt-1 text-xs text-archive-ivory/70">Link memories from your archive as proof of your transformation.</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/archive/${archiveSlug}/add-memory`}
                className="inline-flex min-h-9 items-center rounded-full border border-archive-gold/40 bg-archive-gold/10 px-4 text-xs font-bold text-archive-champagne hover:bg-archive-gold/20"
              >
                + Create Evidence Memory
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 7: ANNUAL REVIEW */}
      {activeStage === "annual_review" && (
        <section className="space-y-6 rounded-3xl border border-archive-gold/18 bg-black/55 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">Annual Process</span>
              <h2 className="mt-1 font-serif text-2xl text-archive-champagne">Continuity Reviews</h2>
              <p className="mt-1 text-sm text-archive-ivory/70">Compare who you were with who you are becoming across years.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="rounded-full bg-archive-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-archive-obsidian hover:bg-archive-champagne"
            >
              + Record Annual Review
            </button>
          </div>

          {showReviewModal && (
            <div className="rounded-2xl border border-archive-gold/30 bg-black/90 p-6 space-y-4">
              <h3 className="font-serif text-lg text-archive-gold">New Annual Review</h3>
              <div>
                <label className="block text-xs font-semibold">Year</label>
                <input
                  type="number"
                  value={reviewForm.year}
                  onChange={(e) => setReviewForm({ ...reviewForm, year: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-2.5 text-sm text-archive-ivory"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold">What change did you stop demanding from others and begin embodying yourself?</label>
                <textarea
                  value={reviewForm.embodiedChange}
                  onChange={(e) => setReviewForm({ ...reviewForm, embodiedChange: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-2.5 text-sm text-archive-ivory"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold">How did your growth affect the people around you?</label>
                <textarea
                  value={reviewForm.effectOnPeopleAround}
                  onChange={(e) => setReviewForm({ ...reviewForm, effectOnPeopleAround: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-2.5 text-sm text-archive-ivory"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold">Where are you still living unconsciously?</label>
                <textarea
                  value={reviewForm.unconsciousAreas}
                  onChange={(e) => setReviewForm({ ...reviewForm, unconsciousAreas: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-archive-gold/20 bg-white/[0.04] p-2.5 text-sm text-archive-ivory"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="rounded-full border border-archive-gold/30 px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddAnnualReview}
                  disabled={saving}
                  className="rounded-full bg-archive-gold px-5 py-2 text-xs font-bold text-archive-obsidian"
                >
                  Save Review
                </button>
              </div>
            </div>
          )}

          {/* Historical Reviews List */}
          <div className="space-y-4">
            {annualReviews.length === 0 ? (
              <p className="text-xs italic text-archive-ivory/50">No historical annual reviews recorded yet.</p>
            ) : (
              annualReviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl border border-archive-gold/14 bg-white/[0.02] p-5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-serif text-lg text-archive-gold">{rev.year} Review</span>
                    <span className="text-[10px] text-archive-ivory/50">{new Date(rev.reviewedAt).toLocaleDateString()}</span>
                  </div>
                  {rev.embodiedChange && <p className="text-xs text-archive-ivory/80"><strong className="text-archive-champagne">Embodied Change:</strong> {rev.embodiedChange}</p>}
                  {rev.effectOnPeopleAround && <p className="text-xs text-archive-ivory/80"><strong className="text-archive-champagne">Effect on Others:</strong> {rev.effectOnPeopleAround}</p>}
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
