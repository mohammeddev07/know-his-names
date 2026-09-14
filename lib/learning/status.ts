import type { CardState } from "./types";

export type LearningStatus =
  "not-started" | "learning" | "reviewing" | "strong";

export const LEARNING_STATUSES = [
  "not-started",
  "learning",
  "reviewing",
  "strong",
] as const satisfies readonly LearningStatus[];

export const STATUS_LABELS: Record<LearningStatus, string> = {
  "not-started": "Not started",
  learning: "Learning",
  reviewing: "Reviewing",
  strong: "Strong",
};

/**
 * Stability, in days, at which a Name counts as strong. FSRS stability is the
 * interval at which recall probability falls to about 90%, so three weeks
 * means the learner reliably remembers it well beyond short-term memory.
 */
export const STRONG_STABILITY_DAYS = 21;

export function getStatus(card: CardState | undefined): LearningStatus {
  if (!card) return "not-started";
  const { phase, stability } = card.schedule;
  if (phase !== "review") return "learning";
  return stability >= STRONG_STABILITY_DAYS ? "strong" : "reviewing";
}

/** Recently forgotten, or repeatedly forgotten and not yet strong. */
export function needsAttention(card: CardState | undefined): boolean {
  if (!card) return false;
  if (card.schedule.phase === "relearning") return true;
  return card.schedule.lapses >= 2 && getStatus(card) !== "strong";
}
