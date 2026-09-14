import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";
import {
  ProgressContext,
  type ProgressContextValue,
} from "@/hooks/use-progress";
import { createCard } from "@/lib/learning/cards";
import { DEFAULT_PREFERENCES, type CardState } from "@/lib/learning/types";
import type { ScheduleState } from "@/lib/srs/types";

/** A ready learner with no progress; override any field per test. */
export function mockProgress(
  overrides: Partial<ProgressContextValue> = {},
): ProgressContextValue {
  return {
    status: "ready",
    cards: new Map(),
    preferences: DEFAULT_PREFERENCES,
    reviewsToday: 0,
    lastActivityAt: null,
    introduce: vi.fn(async () => {}),
    review: vi.fn(),
    preview: vi.fn(() => null),
    updatePreferences: vi.fn(async () => {}),
    loadHistory: vi.fn(async () => []),
    exportSnapshot: vi.fn(async () => ({
      cards: [],
      reviews: [],
      preferences: DEFAULT_PREFERENCES,
    })),
    replaceProgress: vi.fn(async () => {}),
    getRollbackSavedAt: vi.fn(async () => null),
    restoreRollback: vi.fn(async () => {}),
    ...overrides,
  };
}

export function renderWithProgress(
  ui: ReactElement,
  value: ProgressContextValue = mockProgress(),
) {
  return {
    value,
    ...render(<ProgressContext value={value}>{ui}</ProgressContext>),
  };
}

/** A card in the review phase; due now unless told otherwise. */
export function reviewCard(
  nameId: string,
  overrides: Partial<ScheduleState> = {},
): CardState {
  const now = new Date();
  return createCard(
    nameId,
    {
      due: now.toISOString(),
      stability: 5,
      difficulty: 5,
      elapsedDays: 0,
      scheduledDays: 3,
      learningSteps: 0,
      reps: 3,
      lapses: 0,
      phase: "review",
      lastReview: now.toISOString(),
      ...overrides,
    },
    new Date(now.getTime() - 3 * 86_400_000),
  );
}

export const cardsByName = (...cards: CardState[]) =>
  new Map(cards.map((card) => [card.nameId, card]));
