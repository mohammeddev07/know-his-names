/*
 * DEVELOPMENT SAMPLE DATA (Phase 2 only).
 * A fixed, in-memory learner used to click through the UI before persistence
 * and FSRS exist. It is replaced by IndexedDB and FSRS in Phases 4–6.
 */
import { NAMES } from "@/lib/content/names";
import { addDays } from "@/lib/learning/dates";
import { cardIdFor, type CardState } from "@/lib/learning/types";
import type { ReviewRating, ScheduleState } from "@/lib/srs/types";

const HOUR = 3_600_000;

function sampleCard(
  nameId: string,
  now: Date,
  introducedDaysAgo: number,
  schedule: Partial<ScheduleState>,
): CardState {
  return {
    id: cardIdFor(nameId),
    nameId,
    cardType: "meaning",
    introducedAt: addDays(now, -introducedDaysAgo).toISOString(),
    schedule: {
      due: now.toISOString(),
      stability: 1,
      difficulty: 5,
      elapsedDays: 0,
      scheduledDays: 0,
      learningSteps: 0,
      reps: 1,
      lapses: 0,
      phase: "review",
      lastReview: now.toISOString(),
      ...schedule,
    },
  };
}

export function createSampleCards(now: Date): Map<string, CardState> {
  const ids = NAMES.slice(0, 17).map((name) => name.id);
  const cards: CardState[] = [
    ...ids.slice(0, 8).map((id, i) =>
      sampleCard(id, now, 30 - i, {
        stability: 25 + i * 4,
        reps: 6,
        due: new Date(now.getTime() + (i + 2) * 24 * HOUR).toISOString(),
      }),
    ),
    ...ids.slice(8, 13).map((id, i) =>
      sampleCard(id, now, 8 - i, {
        stability: 4 + i,
        reps: 3,
        due: new Date(now.getTime() - (i + 1) * HOUR).toISOString(),
      }),
    ),
    sampleCard(ids[13], now, 0, { phase: "learning", stability: 0.5 }),
    sampleCard(ids[14], now, 0, { phase: "learning", stability: 0.5 }),
    sampleCard(ids[15], now, 0, {
      phase: "relearning",
      lapses: 2,
      due: new Date(now.getTime() - HOUR).toISOString(),
    }),
    sampleCard(ids[16], now, 3, {
      phase: "relearning",
      lapses: 1,
      due: new Date(now.getTime() - 2 * HOUR).toISOString(),
    }),
  ];
  return new Map(cards.map((card) => [card.nameId, card]));
}

/** Placeholder intervals so the UI can be exercised. Not a scheduler. */
export const SAMPLE_INTERVALS: Record<ReviewRating, number> = {
  again: 60_000,
  hard: 24 * HOUR,
  good: 3 * 24 * HOUR,
  easy: 7 * 24 * HOUR,
};
