import type { DivineName } from "@/lib/content/names";
import type { ReviewRating } from "@/lib/srs/types";
import { countIntroducedOn, getDueCards, type CardsByName } from "./progress";
import { localDayKey } from "./dates";
import type { CardType, ReviewMode, UserPreferences } from "./types";

/**
 * Pure learning-session logic. Components render a SessionState and call
 * these functions; they never decide ordering or scheduling themselves.
 */

export type SessionStep =
  | { kind: "introduce"; nameId: string }
  | { kind: "recall"; nameId: string; cardType: CardType };

/** One card to review: which Name, and which direction of it. */
export interface ReviewTarget {
  nameId: string;
  cardType: CardType;
}

export type SessionMode = "learn" | "review";

export interface SessionState {
  mode: SessionMode;
  queue: SessionStep[];
  completed: number;
  introduced: string[];
  recalled: string[];
  ratings: Record<ReviewRating, number>;
}

/** Keeps sessions short and focused. */
export const REVIEW_SESSION_LIMIT = 20;

/**
 * A card whose next review falls within this window is shown again before the
 * session ends, so a forgotten Name is practised until it is recalled.
 */
export const LEARN_AHEAD_MS = 20 * 60_000;

const emptyRatings = (): Record<ReviewRating, number> => ({
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
});

/** Names not yet introduced, in list order. */
export function selectNewNames(
  names: readonly DivineName[],
  cards: CardsByName,
  limit: number,
): DivineName[] {
  if (limit <= 0) return [];
  return names.filter((name) => !cards.has(name.id)).slice(0, limit);
}

/** How many new Names the daily limit still allows today. */
export function remainingNewToday(
  cards: CardsByName,
  preferences: UserPreferences,
  now: Date,
): number {
  const learnedToday = countIntroducedOn(cards.values(), localDayKey(now));
  return Math.max(0, preferences.newNamesPerDay - learnedToday);
}

/**
 * Each Name is introduced, then recalled after the next introduction, so the
 * first retrieval happens soon but not immediately:
 * intro A, intro B, recall A, intro C, recall B, recall C.
 */
export function startLearnSession(nameIds: readonly string[]): SessionState {
  const queue: SessionStep[] = [];
  nameIds.forEach((nameId, i) => {
    queue.push({ kind: "introduce", nameId });
    if (i > 0) {
      queue.push({
        kind: "recall",
        nameId: nameIds[i - 1],
        cardType: "meaning",
      });
    }
  });
  if (nameIds.length > 0) {
    queue.push({
      kind: "recall",
      nameId: nameIds[nameIds.length - 1],
      cardType: "meaning",
    });
  }
  return {
    mode: "learn",
    queue,
    completed: 0,
    introduced: [],
    recalled: [],
    ratings: emptyRatings(),
  };
}

export function startReviewSession(
  targets: readonly ReviewTarget[],
): SessionState {
  return {
    mode: "review",
    queue: targets.map(({ nameId, cardType }) => ({
      kind: "recall",
      nameId,
      cardType,
    })),
    completed: 0,
    introduced: [],
    recalled: [],
    ratings: emptyRatings(),
  };
}

/** How many new name cards the daily limit still allows today. */
export function remainingNewNameCardsToday(
  nameCards: CardsByName,
  preferences: UserPreferences,
  now: Date,
): number {
  const startedToday = countIntroducedOn(nameCards.values(), localDayKey(now));
  return Math.max(0, preferences.newNamesPerDay - startedToday);
}

/**
 * Cards for a review session in the chosen mode. Due cards come first, most
 * overdue first. In "name" and "mixed" modes, introduced Names that have no
 * name card yet follow as seeds (the card is created when first answered),
 * limited by the daily new-card allowance.
 */
export function selectReviewSteps(
  cards: CardsByName,
  nameCards: CardsByName,
  mode: ReviewMode,
  preferences: UserPreferences,
  now: Date,
  limit = REVIEW_SESSION_LIMIT,
): ReviewTarget[] {
  const pool = [
    ...(mode === "name" ? [] : cards.values()),
    ...(mode === "meaning" ? [] : nameCards.values()),
  ];
  const due: ReviewTarget[] = getDueCards(pool, now).map((card) => ({
    nameId: card.nameId,
    cardType: card.cardType,
  }));
  if (mode === "meaning") return due.slice(0, limit);

  const seeds = [...cards.keys()]
    .filter((nameId) => !nameCards.has(nameId))
    .slice(0, remainingNewNameCardsToday(nameCards, preferences, now))
    .map((nameId): ReviewTarget => ({ nameId, cardType: "name" }));
  return [...due, ...seeds].slice(0, limit);
}

export function currentStep(state: SessionState): SessionStep | undefined {
  return state.queue[0];
}

export function isSessionComplete(state: SessionState): boolean {
  return state.queue.length === 0;
}

export function completeIntroduction(state: SessionState): SessionState {
  const [step, ...rest] = state.queue;
  if (step?.kind !== "introduce") return state;
  return {
    ...state,
    queue: rest,
    completed: state.completed + 1,
    introduced: [...state.introduced, step.nameId],
  };
}

export function shouldRepeatInSession(nextDue: Date, now: Date): boolean {
  return nextDue.getTime() - now.getTime() <= LEARN_AHEAD_MS;
}

export function completeRecall(
  state: SessionState,
  rating: ReviewRating,
  repeat: boolean,
): SessionState {
  const [step, ...rest] = state.queue;
  if (step?.kind !== "recall") return state;
  return {
    ...state,
    queue: repeat ? [...rest, step] : rest,
    completed: state.completed + 1,
    recalled: state.recalled.includes(step.nameId)
      ? state.recalled
      : [...state.recalled, step.nameId],
    ratings: { ...state.ratings, [rating]: state.ratings[rating] + 1 },
  };
}

/** Steps shown so far plus steps remaining, for the progress indicator. */
export function sessionLength(state: SessionState): number {
  return state.completed + state.queue.length;
}
