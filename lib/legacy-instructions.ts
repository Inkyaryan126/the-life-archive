import type { LegacyInstructionAccessLevel } from "@/lib/types";

export const legacyInstructionAccessLevels = [
  "owner_only",
  "released"
] as const satisfies readonly LegacyInstructionAccessLevel[];

export const legacyInstructionAccessLevelLabels: Record<
  LegacyInstructionAccessLevel,
  string
> = {
  owner_only: "Private draft",
  released: "Released"
};

export function isLegacyInstructionAccessLevel(
  value: string
): value is LegacyInstructionAccessLevel {
  return (legacyInstructionAccessLevels as readonly string[]).includes(value);
}

export function normalizeLegacyInstructionAccessLevel(
  value?: string | null
): LegacyInstructionAccessLevel {
  return value === "released" ? "released" : "owner_only";
}
