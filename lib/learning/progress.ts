import type { DivineName } from "@/lib/content/names";
import { addDays, calendarDaysBetween, localDayKey } from "./dates";
import {
  LEARNING_STATUSES,
  getStatus,
  needsAttention,
  type LearningStatus,
} from "./status";
import type { CardState, ReviewEvent } from "./types";

/** Cards keyed by Name id. V1 has one card per Name. */
export type CardsByName = ReadonlyMap<string, CardState>;

export interface ProgressSummary {
  total: number;
  introduced: number;
  counts: Record<LearningStatus, number>;
  attention: number;
  dueNow: number;
}

export function summarizeProgress(
  names: readonly DivineName[],
  cards: CardsByName,
  now: Date,
): ProgressSummary {
  const counts = Object.fromEntries(
    LEARNING_STATUSES.map((status) => [status, 0]),
  ) as Record<LearningStatus, number>;
  let attention = 0;
  let dueNow = 0;
  for (const name of names) {
    const card = cards.get(name.id);
    counts[getStatus(card)] += 1;
    if (needsAttention(card)) attention += 1;
    if (card && isDue(card, now)) dueNow += 1;
  }
  return {
    total: names.length,
    introduced: names.length - counts["not-started"],
    counts,
    attention,
    dueNow,
  };
}

export function isDue(card: CardState, now: Date): boolean {
  return new Date(card.schedule.due).getTime() <= now.getTime();
}

/** Due cards, most overdue first. */
export function getDueCards(
  cards: Iterable<CardState>,
  now: Date,
): CardState[] {
  return [...cards]
    .filter((card) => isDue(card, now))
    .sort(
      (a, b) =>
        new Date(a.schedule.due).getTime() - new Date(b.schedule.due).getTime(),
    );
}

export function nextDueDate(cards: Iterable<CardState>): Date | null {
  let next: number | null = null;
  for (const card of cards) {
    const due = new Date(card.schedule.due).getTime();
    if (next === null || due < next) next = due;
  }
  return next === null ? null : new Date(next);
}

export function countIntroducedOn(
  cards: Iterable<CardState>,
  day: string,
): number {
  let count = 0;
  for (const card of cards) {
    if (localDayKey(new Date(card.introducedAt)) === day) count += 1;
  }
  return count;
}

export interface DayCount {
  day: string;
  date: Date;
  count: number;
}

/** Reviews per local day for the last `days` days, oldest first. */
export function reviewsByDay(
  events: readonly ReviewEvent[],
  days: number,
  now: Date,
): DayCount[] {
  const tally = new Map<string, number>();
  for (const event of events) {
    const key = localDayKey(new Date(event.reviewedAt));
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(now, i - days + 1);
    const day = localDayKey(date);
    return { day, date, count: tally.get(day) ?? 0 };
  });
}

/** Reviews falling due on each of the next `days` days. Today includes overdue. */
export function reviewForecast(
  cards: Iterable<CardState>,
  days: number,
  now: Date,
): DayCount[] {
  const counts = new Array<number>(days).fill(0);
  for (const card of cards) {
    const offset = Math.max(
      0,
      calendarDaysBetween(now, new Date(card.schedule.due)),
    );
    if (offset < days) counts[offset] += 1;
  }
  return counts.map((count, i) => {
    const date = addDays(now, i);
    return { day: localDayKey(date), date, count };
  });
}
