import type { CardState } from "@/lib/learning/types";

export type ReviewRating = "again" | "hard" | "good" | "easy";

export const REVIEW_RATINGS = [
  "again",
  "hard",
  "good",
  "easy",
] as const satisfies readonly ReviewRating[];

export type SchedulePhase = "new" | "learning" | "review" | "relearning";

/**
 * Application-owned scheduling state. It mirrors the concepts FSRS needs but
 * does not depend on any FSRS package; the adapter maps to and from it.
 */
export interface ScheduleState {
  due: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  phase: SchedulePhase;
  lastReview: string | null;
}

export interface ReviewResult {
  cardId: string;
  rating: ReviewRating;
  reviewedAt: string;
  previous: ScheduleState;
  next: ScheduleState;
}

export type RatingPreview = Record<ReviewRating, Date>;

/** Application-owned scheduling contract. UI code never calls FSRS directly. */
export interface ReviewScheduler {
  getDueCards(now: Date): Promise<CardState[]>;
  /** Creates (or returns) the card for a Name the learner has just met. */
  introduce(nameId: string, now: Date): Promise<CardState>;
  recordReview(
    cardId: string,
    rating: ReviewRating,
    reviewedAt: Date,
  ): Promise<ReviewResult>;
  /** When the card would next be due for each rating. */
  preview(card: CardState, now: Date): RatingPreview;
}
