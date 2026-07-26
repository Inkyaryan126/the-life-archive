"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TRIAL_QUESTIONS,
  DIMENSION_LABELS,
  DIMENSION_DESCRIPTIONS,
  calculateAssessmentResult,
  AssessmentResult,
  EternismDimensionKey
} from "@/lib/eternism-trial";
import { trackTrialEvent } from "@/lib/trial-analytics";

type EternismTrialClientProps = {
  signedIn: boolean;
  hasSelfArchive: boolean;
  archiveSlug: string | null;
};

const RESPONSE_OPTIONS = [
  { value: 1, label: "Never true" },
  { value: 2, label: "Rarely true" },
  { value: 3, label: "Sometimes true" },
  { value: 4, label: "Usually true" },
  { value: 5, label: "Consistently true" }
];

export function EternismTrialClient({
  signedIn,
  hasSelfArchive,
  archiveSlug
}: EternismTrialClientProps) {
  const [step, setStep] = useState<"intro" | "questions" | "results">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Restore saved progress from sessionStorage if available
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("eternism_trial_responses");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setResponses(parsed);
        }
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  const handleStart = () => {
    setStep("questions");
    setCurrentIndex(0);
    trackTrialEvent("trial_started");
  };

  const handleSelectOption = (value: number) => {
    const currentQ = TRIAL_QUESTIONS[currentIndex];
    const updated = { ...responses, [currentQ.id]: value };
    setResponses(updated);

    try {
      sessionStorage.setItem("eternism_trial_responses", JSON.stringify(updated));
    } catch (e) {
      // Ignore storage errors
    }

    if (currentIndex < TRIAL_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Complete trial
      const res = calculateAssessmentResult(updated);
      setResult(res);
      setStep("results");
      trackTrialEvent("trial_completed", {
        overallScore: res.overallScore,
        archetype: res.archetype
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSaveToArchive = async () => {
    if (!signedIn) return;
    setSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/eternism/trial/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses })
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveStatus(data.error || "Unable to save assessment.");
      } else {
        setSaveStatus("Assessment results successfully preserved in your profile!");
      }
    } catch (err) {
      setSaveStatus("Failed to save results. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleShareCardDownload = (format: "portrait" | "square" = "portrait") => {
    if (!result) return;
    trackTrialEvent("result_downloaded", { format });
    const url = `/api/eternism/trial/card?score=${result.overallScore}&archetype=${encodeURIComponent(
      result.archetype
    )}&strongest=${result.strongestDimension}&growth=${result.growthDimension}&format=${format}`;
    window.open(url, "_blank");
  };

  const handleCopySummary = async () => {
    if (!result) return;
    trackTrialEvent("result_shared", { method: "copy" });
    const text = `HOW HARD ARE YOU TO DESTROY?\nOverall Score: ${result.overallScore}/100\nArchetype: ${result.archetype}\nStrongest: ${DIMENSION_LABELS[result.strongestDimension]}\nGrowth Edge: ${DIMENSION_LABELS[result.growthDimension]}\n\nTake the Eternism Trial:\nhttps://thelifearchive.vip/eternism/trial`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (!result) return;
    trackTrialEvent("result_shared", { method: "native" });
    if (navigator.share) {
      try {
        await navigator.share({
          title: "How Hard Are You to Destroy? | Eternism Trial",
          text: `I scored ${result.overallScore}/100 on the Eternism Trial (${result.archetype}). Test your structure across the 6 dimensions:`,
          url: "https://thelifearchive.vip/eternism/trial"
        });
      } catch (e) {
        // Share cancelled
      }
    } else {
      handleCopySummary();
    }
  };

  const currentQ = TRIAL_QUESTIONS[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / TRIAL_QUESTIONS.length) * 100);

  return (
    <div className="mx-auto w-full max-w-4xl py-4 sm:py-8">
      {/* 1. INTRO SCREEN */}
      {step === "intro" && (
        <div className="space-y-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-archive-gold/30 bg-archive-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
            Eternism Assessment Chamber
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-archive-ivory sm:text-5xl sm:leading-tight">
            How Hard Are You to Destroy?
          </h1>

          <p className="mx-auto max-w-2xl text-base text-archive-ivory/80 sm:text-lg">
            Pressure does not expose one kind of weakness. It exposes the body, mind, values, purpose, creativity, and awareness carrying you into the future.
          </p>

          <div className="mx-auto max-w-2xl rounded-2xl border border-archive-gold/20 bg-archive-obsidian/60 p-6 text-left space-y-4">
            <p className="italic text-archive-gold/90 font-serif">
              “Everybody believes they are strong until pressure reaches the structure they neglected.”
            </p>
            <p className="text-sm text-archive-ivory/70 leading-relaxed">
              Eternism is the practice of becoming harder to destroy—physically, mentally, morally, creatively, spiritually, and consciously. This trial evaluates your structure across all six established dimensions.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-archive-ivory/60">
            <span>⏱️ Est. 3–5 minutes</span>
            <span>🔒 100% Private (No Account Required)</span>
            <span>⚖️ Reflective & Non-Diagnostic</span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto rounded-2xl border border-archive-gold bg-archive-gold/20 px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-archive-gold transition hover:bg-archive-gold/30 shadow-luxury focus:outline-none focus:ring-2 focus:ring-archive-gold"
            >
              Begin the Trial
            </button>
            <Link
              href="/eternism"
              className="w-full sm:w-auto rounded-2xl border border-archive-gold/20 bg-white/[0.04] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-archive-ivory/80 transition hover:bg-white/[0.08] hover:text-archive-ivory"
            >
              Learn What Eternism Means
            </Link>
          </div>

          <p className="text-[0.75rem] leading-normal text-archive-ivory/50 max-w-xl mx-auto pt-4">
            *This score is a snapshot of your current habits and self-perception—not a measurement of your worth, destiny, health, or lifespan.
          </p>
        </div>
      )}

      {/* 2. ACTIVE QUESTIONS SCREEN */}
      {step === "questions" && (
        <div className="space-y-6">
          {/* Header Progress */}
          <div className="flex items-center justify-between gap-4 border-b border-archive-gold/18 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                Dimension {Math.floor(currentIndex / 5) + 1} of 6: {DIMENSION_LABELS[currentQ.dimension]}
              </span>
              <p className="text-xs text-archive-ivory/60">
                Question {currentIndex + 1} of {TRIAL_QUESTIONS.length}
              </p>
            </div>
            <div className="w-32 sm:w-48 bg-archive-obsidian rounded-full h-2 overflow-hidden border border-archive-gold/20">
              <div
                className="bg-archive-gold h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-3xl border border-archive-gold/25 bg-archive-obsidian/80 p-6 sm:p-10 space-y-8">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold leading-snug text-archive-ivory">
              “{currentQ.prompt}”
            </h2>

            {/* Answer Option Buttons */}
            <div className="space-y-3" role="radiogroup" aria-label={`Question ${currentIndex + 1}: ${currentQ.prompt}`}>
              {RESPONSE_OPTIONS.map((opt) => {
                const isSelected = responses[currentQ.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectOption(opt.value)}
                    role="radio"
                    aria-checked={isSelected}
                    className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left text-sm sm:text-base font-medium transition focus:outline-none focus:ring-2 focus:ring-archive-gold ${
                      isSelected
                        ? "border-archive-gold bg-archive-gold/25 text-archive-gold shadow-luxury"
                        : "border-archive-gold/20 bg-white/[0.03] text-archive-ivory/85 hover:border-archive-gold/50 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-xs opacity-60 font-mono">[{opt.value}]</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-archive-gold/15">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="rounded-xl border border-archive-gold/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-archive-ivory/70 transition hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none"
              >
                ← Previous
              </button>
              <span className="text-xs text-archive-ivory/50">
                {TRIAL_QUESTIONS.length - currentIndex - 1} questions remaining
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. FULL UNLOCKED RESULTS SCREEN */}
      {step === "results" && result && (
        <div className="space-y-10">
          {/* Header Banner */}
          <div className="text-center space-y-4 rounded-3xl border border-archive-gold/30 bg-archive-obsidian/90 p-8 sm:p-12 shadow-luxury">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
              Eternism Trial Assessment Complete
            </span>

            <div className="relative mx-auto flex h-36 w-36 sm:h-44 sm:w-44 flex-col items-center justify-center rounded-full border-4 border-archive-gold/40 bg-archive-obsidian shadow-[0_0_30px_rgba(214,173,90,0.2)]">
              <span className="font-serif text-5xl sm:text-6xl font-bold text-archive-gold">{result.overallScore}</span>
              <span className="text-[0.65rem] uppercase tracking-[0.16em] text-archive-ivory/60 mt-1">/ 100 OVERALL</span>
            </div>

            <div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-archive-ivory tracking-wide">
                {result.archetype}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-archive-ivory/80 leading-relaxed">
                {result.archetypeSummary}
              </p>
            </div>

            {/* Mandatory Visible Statement */}
            <div className="rounded-xl border border-archive-gold/18 bg-archive-gold/10 p-3 max-w-2xl mx-auto mt-4">
              <p className="text-xs text-archive-gold/90 font-serif leading-normal">
                “{result.disclaimer}”
              </p>
            </div>
          </div>

          {/* Key Metrics: Strongest vs Growth Edge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                🛡️ Strongest Pillar
              </span>
              <h3 className="font-serif text-xl font-bold text-archive-ivory">
                {DIMENSION_LABELS[result.strongestDimension]}
              </h3>
              <p className="text-xs text-archive-ivory/70 leading-relaxed">
                {DIMENSION_DESCRIPTIONS[result.strongestDimension]}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
                ⚠️ Growth Edge (Vulnerable Structure)
              </span>
              <h3 className="font-serif text-xl font-bold text-archive-ivory">
                {DIMENSION_LABELS[result.growthDimension]}
              </h3>
              <p className="text-xs text-archive-ivory/70 leading-relaxed">
                {DIMENSION_DESCRIPTIONS[result.growthDimension]}
              </p>
            </div>
          </div>

          {/* Six Dimension Score Bars */}
          <div className="rounded-3xl border border-archive-gold/20 bg-archive-obsidian/70 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-archive-gold/15 pb-4">
              <h3 className="font-serif text-lg font-bold text-archive-ivory">
                Structure Breakdown Across 6 Dimensions
              </h3>
              <span className="text-xs text-archive-ivory/60">0 – 100 Scale</span>
            </div>

            <div className="space-y-5">
              {(Object.keys(result.dimensionScores) as EternismDimensionKey[]).map((dim) => {
                const score = result.dimensionScores[dim];
                return (
                  <div key={dim} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-archive-ivory">{DIMENSION_LABELS[dim]}</span>
                      <span className="font-mono font-bold text-archive-gold">{score} / 100</span>
                    </div>
                    <div className="h-3 w-full rounded-full border border-archive-gold/20 bg-archive-obsidian overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-archive-gold/60 to-archive-gold transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Uncomfortable Truth & 7-Day Challenge */}
          <div className="space-y-6 rounded-3xl border border-archive-gold/25 bg-archive-obsidian/80 p-6 sm:p-8">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-archive-gold">
                An Uncomfortable Truth
              </span>
              <p className="font-serif text-lg text-archive-ivory/90 italic leading-relaxed">
                “{result.uncomfortableTruth}”
              </p>
            </div>

            <div className="border-t border-archive-gold/15 pt-6 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-archive-gold">
                Practical 7-Day Challenge: {result.challenge.title}
              </span>
              <p className="text-sm text-archive-ivory/80 leading-relaxed">
                {result.challenge.action}
              </p>
              <div className="text-xs text-archive-gold/80">
                Recommended section: <span className="font-semibold">{result.challenge.recommendedSection}</span>
              </div>
            </div>
          </div>

          {/* Shareable Result Card Export Actions */}
          <div className="rounded-3xl border border-archive-gold/20 bg-archive-obsidian/70 p-6 sm:p-8 space-y-6 text-center">
            <h3 className="font-serif text-xl font-bold text-archive-ivory">
              Share Your Eternism Assessment Result
            </h3>
            <p className="text-xs text-archive-ivory/70 max-w-xl mx-auto">
              Export a privacy-safe portrait result card. No email, private responses, or personal data are included.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleShareCardDownload("portrait")}
                className="rounded-2xl border border-archive-gold bg-archive-gold/18 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-archive-gold transition hover:bg-archive-gold/30 focus:outline-none focus:ring-2 focus:ring-archive-gold"
              >
                Download Portrait Card (1080×1920)
              </button>

              <button
                onClick={handleNativeShare}
                className="rounded-2xl border border-archive-gold/25 bg-white/[0.04] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-archive-ivory transition hover:bg-white/[0.08]"
              >
                {copied ? "Link & Summary Copied! ✓" : "Share Result Link"}
              </button>
            </div>
          </div>

          {/* Signup & Continuity Capsule Funnel */}
          <div className="rounded-3xl border border-archive-gold/35 bg-gradient-to-b from-archive-obsidian via-archive-obsidian/95 to-archive-gold/10 p-8 text-center space-y-6 shadow-luxury">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
              Turn This Snapshot Into a Blueprint
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-archive-ivory">
              Build Your Continuity Capsule
            </h3>

            <p className="mx-auto max-w-xl text-sm text-archive-ivory/80 leading-relaxed">
              Your assessment score shows where you stand today. Your Continuity Capsule defines who you are becoming across all six dimensions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href={signedIn ? "/dashboard/continuity" : "/login?next=%2Fdashboard%2Fcontinuity"}
                onClick={() => trackTrialEvent("continuity_cta_clicked")}
                className="w-full sm:w-auto rounded-2xl border border-archive-gold bg-archive-gold px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-archive-obsidian transition hover:bg-archive-champagne focus:outline-none focus:ring-2 focus:ring-archive-gold"
              >
                Build My Continuity Capsule →
              </Link>

              {signedIn && hasSelfArchive && (
                <button
                  onClick={handleSaveToArchive}
                  disabled={saving}
                  className="w-full sm:w-auto rounded-2xl border border-archive-gold/30 bg-white/[0.05] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-archive-ivory transition hover:bg-white/[0.1] disabled:opacity-50"
                >
                  {saving ? "Preserving..." : "Preserve Results in Life Archive"}
                </button>
              )}
            </div>

            {saveStatus && (
              <p className="text-xs font-medium text-archive-gold mt-2">{saveStatus}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
