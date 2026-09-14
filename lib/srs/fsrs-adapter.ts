import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card,
  type Grade,
} from "ts-fsrs";
import {
  REVIEW_RATINGS,
  type RatingPreview,
  type ReviewRating,
  type SchedulePhase,
  type ScheduleState,
} from "./types";

/**
 * The only module that knows about ts-fsrs. It maps the app's ScheduleState
 * to and from the library's Card, so the library can be upgraded or replaced
 * without touching the rest of the app.
 *
 * Defaults: 90% target retention, learning steps of 1m and 10m, a 10m
 * relearning step, and no interval fuzz (so scheduling is deterministic).
 */
const scheduler = fsrs();

const GRADE: Record<ReviewRating, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

const PHASE_BY_STATE: Record<State, SchedulePhase> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
};

const STATE_BY_PHASE: Record<SchedulePhase, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

/** Raised when FSRS cannot schedule a card; nothing has been saved. */
export class SchedulingError extends Error {
  constructor(cause: unknown) {
    super("The review could not be scheduled.", { cause });
    this.name = "SchedulingError";
  }
}

export function toFsrsCard(schedule: ScheduleState): Card {
  return {
    due: new Date(schedule.due),
    stability: schedule.stability,
    difficulty: schedule.difficulty,
    elapsed_days: schedule.elapsedDays,
    scheduled_days: schedule.scheduledDays,
    learning_steps: schedule.learningSteps,
    reps: schedule.reps,
    lapses: schedule.lapses,
    state: STATE_BY_PHASE[schedule.phase],
    last_review: schedule.lastReview
      ? new Date(schedule.lastReview)
      : undefined,
  };
}

export function fromFsrsCard(card: Card): ScheduleState {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    phase: PHASE_BY_STATE[card.state],
    lastReview: card.last_review ? card.last_review.toISOString() : null,
  };
}

function checked(schedule: ScheduleState): ScheduleState {
  const numbers = [
    schedule.stability,
    schedule.difficulty,
    schedule.elapsedDays,
    schedule.scheduledDays,
  ];
  if (
    numbers.some((n) => !Number.isFinite(n)) ||
    Number.isNaN(Date.parse(schedule.due))
  ) {
    throw new SchedulingError(new Error("FSRS produced an invalid schedule"));
  }
  return schedule;
}

/** Scheduling state for a Name the learner has just met. */
export function createSchedule(now: Date): ScheduleState {
  return fromFsrsCard(createEmptyCard(now));
}

/** The card's next state after a review with the given rating. */
export function applyRating(
  schedule: ScheduleState,
  rating: ReviewRating,
  reviewedAt: Date,
): ScheduleState {
  try {
    const { card } = scheduler.next(
      toFsrsCard(checked(schedule)),
      reviewedAt,
      GRADE[rating],
    );
    return checked(fromFsrsCard(card));
  } catch (error) {
    throw error instanceof SchedulingError ? error : new SchedulingError(error);
  }
}

/** When the card would next be due for each possible rating. */
export function previewRatings(
  schedule: ScheduleState,
  now: Date,
): RatingPreview {
  const preview = scheduler.repeat(toFsrsCard(schedule), now);
  return Object.fromEntries(
    REVIEW_RATINGS.map((rating) => [rating, preview[GRADE[rating]].card.due]),
  ) as RatingPreview;
}
