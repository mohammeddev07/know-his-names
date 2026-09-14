/*
 * DEVELOPMENT PLACEHOLDER (Phases 4–5 only).
 * Fixed intervals so persistence can be exercised before FSRS is wired in
 * Phase 6. This is not a scheduler and must not ship.
 */
import {
  REVIEW_RATINGS,
  type RatingPreview,
  type ReviewRating,
  type ScheduleState,
} from "@/lib/srs/types";

const HOUR = 3_600_000;
const INTERVALS: Record<ReviewRating, number> = {
  again: 60_000,
  hard: 24 * HOUR,
  good: 3 * 24 * HOUR,
  easy: 7 * 24 * HOUR,
};

export function createPlaceholderSchedule(now: Date): ScheduleState {
  return {
    due: now.toISOString(),
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    learningSteps: 0,
    reps: 0,
    lapses: 0,
    phase: "new",
    lastReview: null,
  };
}

export function applyPlaceholderRating(
  schedule: ScheduleState,
  rating: ReviewRating,
  now: Date,
): ScheduleState {
  return {
    ...schedule,
    due: new Date(now.getTime() + INTERVALS[rating]).toISOString(),
    phase: rating === "again" ? "relearning" : "review",
    reps: schedule.reps + 1,
    lapses: schedule.lapses + (rating === "again" ? 1 : 0),
    lastReview: now.toISOString(),
  };
}

export function previewPlaceholder(now: Date): RatingPreview {
  return Object.fromEntries(
    REVIEW_RATINGS.map((r) => [r, new Date(now.getTime() + INTERVALS[r])]),
  ) as RatingPreview;
}
