export type EternismDimensionKey =
  | "physical"
  | "mental"
  | "moral"
  | "creative"
  | "spiritual"
  | "conscious_evolution";

export type TrialQuestion = {
  id: string;
  dimension: EternismDimensionKey;
  prompt: string;
  reverse?: boolean;
};

export type ResultArchetype =
  | "The Unprotected Self"
  | "The Sleeping Giant"
  | "The Unfinished Builder"
  | "The Conscious Rebel"
  | "The Future Architect"
  | "The Formidable One";

export type ChallengeItem = {
  dimension: EternismDimensionKey;
  title: string;
  action: string;
  recommendedSection: string;
  relevantRoute: string;
};

export type AssessmentResult = {
  overallScore: number;
  dimensionScores: Record<EternismDimensionKey, number>;
  archetype: ResultArchetype;
  archetypeSummary: string;
  strongestDimension: EternismDimensionKey;
  growthDimension: EternismDimensionKey;
  uncomfortableTruth: string;
  challenge: ChallengeItem;
  disclaimer: string;
  createdAt: string;
};

export const DIMENSION_LABELS: Record<EternismDimensionKey, string> = {
  physical: "Physical Capacity",
  mental: "Mental Clarity",
  moral: "Moral Integrity",
  creative: "Creative Legacy",
  spiritual: "Spiritual Anchor",
  conscious_evolution: "Conscious Evolution"
};

export const DIMENSION_DESCRIPTIONS: Record<EternismDimensionKey, string> = {
  physical: "Preserving biological vitality, strength, and mobility to withstand physical strain.",
  mental: "Cognitive focus, emotional regulation, and adaptability when facing uncertainty.",
  moral: "Alignment between core standards and actions, especially when unobserved.",
  creative: "Building tangible work, ideas, and artifacts that outlive temporary presence.",
  spiritual: "Rootedness in meaning, mortality awareness, and purpose beyond consumption.",
  conscious_evolution: "Embodying the changes demanded of humanity and acting with self-awareness."
};

export const TRIAL_QUESTIONS: TrialQuestion[] = [
  // 1. PHYSICAL (5 questions, Q5 reverse)
  {
    id: "p1",
    dimension: "physical",
    prompt: "My current sleep patterns support the vitality and focus I say I want."
  },
  {
    id: "p2",
    dimension: "physical",
    prompt: "I regularly train or move my body in ways that preserve strength and mobility."
  },
  {
    id: "p3",
    dimension: "physical",
    prompt: "I address health concerns promptly instead of postponing or ignoring them."
  },
  {
    id: "p4",
    dimension: "physical",
    prompt: "My daily nutrition and habits increase rather than drain my physical capacity."
  },
  {
    id: "p5",
    dimension: "physical",
    prompt: "Under stress, I routinely sacrifice basic physical needs like food, rest, and care.",
    reverse: true
  },

  // 2. MENTAL (5 questions, Q10 reverse)
  {
    id: "m1",
    dimension: "mental",
    prompt: "I can recognize when fear or anxiety is beginning to drive my decisions."
  },
  {
    id: "m2",
    dimension: "mental",
    prompt: "I can change my mind willingly when new evidence challenges my beliefs."
  },
  {
    id: "m3",
    dimension: "mental",
    prompt: "I recover from setback and criticism without letting them define my identity."
  },
  {
    id: "m4",
    dimension: "mental",
    prompt: "I can maintain deep focus long enough to complete complex, challenging work."
  },
  {
    id: "m5",
    dimension: "mental",
    prompt: "I repeatedly repeat emotional reactions even when I know they harm me.",
    reverse: true
  },

  // 3. MORAL (5 questions, Q15 reverse)
  {
    id: "mo1",
    dimension: "moral",
    prompt: "My ethical standards remain present when nobody else is watching."
  },
  {
    id: "mo2",
    dimension: "moral",
    prompt: "I accept responsibility for mistakes without reaching for immediate excuses."
  },
  {
    id: "mo3",
    dimension: "moral",
    prompt: "I can set firm boundaries with people without becoming cruel or punitive."
  },
  {
    id: "mo4",
    dimension: "moral",
    prompt: "I have consciously chosen my core values rather than merely inheriting them."
  },
  {
    id: "mo5",
    dimension: "moral",
    prompt: "I frequently compromise my stated values whenever convenience demands it.",
    reverse: true
  },

  // 4. CREATIVE (5 questions, Q20 reverse)
  {
    id: "c1",
    dimension: "creative",
    prompt: "I am actively building or preserving something that did not exist before me."
  },
  {
    id: "c2",
    dimension: "creative",
    prompt: "I finish meaningful projects instead of only imagining or discussing them."
  },
  {
    id: "c3",
    dimension: "creative",
    prompt: "I preserve my core ideas, lessons, and creative output in enduring formats."
  },
  {
    id: "c4",
    dimension: "creative",
    prompt: "I continue creating despite embarrassment, imperfect conditions, or self-doubt."
  },
  {
    id: "c5",
    dimension: "creative",
    prompt: "I spend far more time consuming other people's creations than building my own.",
    reverse: true
  },

  // 5. SPIRITUAL (5 questions, Q25 reverse)
  {
    id: "s1",
    dimension: "spiritual",
    prompt: "I have deeply examined what gives my life enduring meaning and purpose."
  },
  {
    id: "s2",
    dimension: "spiritual",
    prompt: "I can experience awe, gratitude, and reverence without needing rigid certainty."
  },
  {
    id: "s3",
    dimension: "spiritual",
    prompt: "I take mortality seriously without allowing fear of death to paralyze me."
  },
  {
    id: "s4",
    dimension: "spiritual",
    prompt: "My sense of self-worth extends beyond external approval, status, and consumption."
  },
  {
    id: "s5",
    dimension: "spiritual",
    prompt: "I avoid reflecting on mortality or deeper purpose because it makes me uncomfortable.",
    reverse: true
  },

  // 6. CONSCIOUS EVOLUTION (5 questions, Q30 reverse)
  {
    id: "ce1",
    dimension: "conscious_evolution",
    prompt: "I embody at least some of the positive changes I demand from humanity."
  },
  {
    id: "ce2",
    dimension: "conscious_evolution",
    prompt: "I regularly examine whether my choices stem from fear or deliberate intent."
  },
  {
    id: "ce3",
    dimension: "conscious_evolution",
    prompt: "I stay mindful of how my moods and behavior affect those around me."
  },
  {
    id: "ce4",
    dimension: "conscious_evolution",
    prompt: "I can choose compassion and understanding without surrendering my boundaries."
  },
  {
    id: "ce5",
    dimension: "conscious_evolution",
    prompt: "I harbor frustration toward societal problems while refusing to examine my own role.",
    reverse: true
  }
];

export const CHALLENGES: Record<EternismDimensionKey, ChallengeItem> = {
  physical: {
    dimension: "physical",
    title: "Physical Anchor Challenge",
    action: "Maintain a consistent sleep window and 20 minutes of daily physical movement for seven days.",
    recommendedSection: "Continuity Practices — Physical Health",
    relevantRoute: "/dashboard/continuity"
  },
  mental: {
    dimension: "mental",
    title: "Mental Focus Challenge",
    action: "Record one fear-driven impulse each day before acting on it, and complete 45 minutes of distraction-free work.",
    recommendedSection: "Present Self — Repeating Patterns & Energy Drains",
    relevantRoute: "/dashboard/continuity"
  },
  moral: {
    dimension: "moral",
    title: "Moral Alignment Challenge",
    action: "Select one personal standard you have compromised recently and uphold it without exception for seven days.",
    recommendedSection: "Future Self — Non-Negotiable Standards",
    relevantRoute: "/dashboard/continuity"
  },
  creative: {
    dimension: "creative",
    title: "Creative Preservation Challenge",
    action: "Write down or preserve one lesson, memory, or artifact every day for seven consecutive days.",
    recommendedSection: "Future Self — Creations & Contributions",
    relevantRoute: "/dashboard/continuity"
  },
  spiritual: {
    dimension: "spiritual",
    title: "Spiritual Reflection Challenge",
    action: "Spend ten minutes every evening reflecting on mortality, gratitude, and what made the day meaningful.",
    recommendedSection: "Present Self — What Makes Life Worth Living",
    relevantRoute: "/dashboard/continuity"
  },
  conscious_evolution: {
    dimension: "conscious_evolution",
    title: "Embodied Evolution Challenge",
    action: "Identify one behavioral change you wish others would make, and practice it yourself for seven days.",
    recommendedSection: "Conscious Evolution — Humanity Change to Embody First",
    relevantRoute: "/dashboard/continuity"
  }
};

export const UNCOMFORTABLE_TRUTHS: Record<EternismDimensionKey, string> = {
  physical: "Your ambition and ideals are limited by the physical vessel carrying them. Neglecting basic bodily maintenance threatens every future project you wish to build.",
  mental: "Undisciplined thoughts and unexamined emotional patterns will undermine even your best intentions when crisis strikes.",
  moral: "Stated values are meaningless without daily execution. When convenience overrides principle, trust slowly dissolves.",
  creative: "Ideas that remain inside your head do not exist to the future. Without tangible output, potential fades silently.",
  spiritual: "Avoiding mortality does not prevent it. A life built entirely around temporary distraction leaves you vulnerable when facing real loss.",
  conscious_evolution: "Demanding that the world change while holding onto your own reactive habits is a form of self-deception."
};

export function getArchetype(score: number): ResultArchetype {
  if (score >= 90) return "The Formidable One";
  if (score >= 75) return "The Future Architect";
  if (score >= 60) return "The Conscious Rebel";
  if (score >= 45) return "The Unfinished Builder";
  if (score >= 30) return "The Sleeping Giant";
  return "The Unprotected Self";
}

export function getArchetypeSummary(archetype: ResultArchetype): string {
  switch (archetype) {
    case "The Formidable One":
      return "You demonstrate exceptional alignment across physical, mental, moral, and conscious dimensions. Your task is not survival, but wise stewardship of your strength.";
    case "The Future Architect":
      return "You have constructed resilient habits and clear standards. You are actively building a legacy capable of enduring hardship.";
    case "The Conscious Rebel":
      return "You possess strong awareness and clear core values, though operational consistency under severe pressure remains your growth edge.";
    case "The Unfinished Builder":
      return "You have built meaningful foundations in key areas, but unexamined gaps leave parts of your structure vulnerable to stress.";
    case "The Sleeping Giant":
      return "Your potential is far greater than your current daily routines reflect. Awakening requires converting passive intent into non-negotiable action.";
    case "The Unprotected Self":
      return "Current habits leave you vulnerable across multiple dimensions. Recognizing this vulnerability is the necessary first step toward becoming harder to destroy.";
  }
}

/**
 * Calculates deterministic dimension scores and overall score.
 * Formula:
 * - Each dimension has 5 questions on a 1..5 scale.
 * - Reverse-scored items map: 1->5, 2->4, 3->3, 4->2, 5->1.
 * - Dimension Score (0..100) = Math.round(((dimensionSum - 5) / 20) * 100)
 * - Overall Score (0..100) = Arithmetic mean of the 6 equal dimension scores.
 */
export function calculateAssessmentResult(
  responses: Record<string, number>
): AssessmentResult {
  const dimensionSums: Record<EternismDimensionKey, number> = {
    physical: 0,
    mental: 0,
    moral: 0,
    creative: 0,
    spiritual: 0,
    conscious_evolution: 0
  };

  TRIAL_QUESTIONS.forEach((q) => {
    const rawVal = responses[q.id] ?? 3; // Default to neutral 3 if missing
    const clampedVal = Math.min(5, Math.max(1, Math.round(rawVal)));
    const scoredVal = q.reverse ? 6 - clampedVal : clampedVal;
    dimensionSums[q.dimension] += scoredVal;
  });

  const dimensionScores: Record<EternismDimensionKey, number> = {
    physical: 0,
    mental: 0,
    moral: 0,
    creative: 0,
    spiritual: 0,
    conscious_evolution: 0
  };

  const dimensions: EternismDimensionKey[] = [
    "physical",
    "mental",
    "moral",
    "creative",
    "spiritual",
    "conscious_evolution"
  ];

  let sumDimensionScores = 0;
  let strongestDim: EternismDimensionKey = "physical";
  let growthDim: EternismDimensionKey = "physical";
  let maxScore = -1;
  let minScore = 101;

  dimensions.forEach((dim) => {
    const rawSum = dimensionSums[dim];
    // rawSum ranges 5..25 -> convert to 0..100
    const normalized = Math.round(((rawSum - 5) / 20) * 100);
    const clampedScore = Math.min(100, Math.max(0, normalized));
    dimensionScores[dim] = clampedScore;
    sumDimensionScores += clampedScore;

    if (clampedScore > maxScore) {
      maxScore = clampedScore;
      strongestDim = dim;
    }
    if (clampedScore < minScore) {
      minScore = clampedScore;
      growthDim = dim;
    }
  });

  // Arithmetic mean of 6 equal dimensions
  const overallScore = Math.min(100, Math.max(0, Math.round(sumDimensionScores / 6)));
  const archetype = getArchetype(overallScore);
  const archetypeSummary = getArchetypeSummary(archetype);
  const uncomfortableTruth = UNCOMFORTABLE_TRUTHS[growthDim];
  const challenge = CHALLENGES[growthDim];

  return {
    overallScore,
    dimensionScores,
    archetype,
    archetypeSummary,
    strongestDimension: strongestDim,
    growthDimension: growthDim,
    uncomfortableTruth,
    challenge,
    disclaimer: "This score is a snapshot of your current habits and self-perception—not a measurement of your worth, destiny, health, or lifespan.",
    createdAt: new Date().toISOString()
  };
}
