import { describe, expect, it } from "vitest";
import { NAMES } from "@/lib/content/names";
import { createCard } from "@/lib/learning/cards";
import {
  completeIntroduction,
  completeRecall,
  currentStep,
  isSessionComplete,
  LEARN_AHEAD_MS,
  remainingNewToday,
  REVIEW_SESSION_LIMIT,
  selectDueNameIds,
  selectNewNames,
  sessionLength,
  shouldRepeatInSession,
  startLearnSession,
  startReviewSession,
} from "@/lib/learning/session";
import { DEFAULT_PREFERENCES, type CardState } from "@/lib/learning/types";
import type { ScheduleState } from "@/lib/srs/types";

const now = new Date(2026, 8, 13, 12, 0);
const minutes = (n: number) => new Date(now.getTime() + n * 60_000);

function schedule(overrides: Partial<ScheduleState> = {}): ScheduleState {
  return {
    due: now.toISOString(),
    stability: 5,
    difficulty: 5,
    elapsedDays: 0,
    scheduledDays: 0,
    learningSteps: 0,
    reps: 1,
    lapses: 0,
    phase: "review",
    lastReview: now.toISOString(),
    ...overrides,
  };
}

function card(
  nameId: string,
  { introducedAt = now, due = now }: { introducedAt?: Date; due?: Date } = {},
): CardState {
  return createCard(nameId, schedule({ due: due.toISOString() }), introducedAt);
}

const cardsOf = (...cards: CardState[]) =>
  new Map(cards.map((c) => [c.nameId, c]));

describe("createCard", () => {
  it("creates a stable meaning card for a Name", () => {
    const created = card("ar-rahman");
    expect(created.id).toBe("ar-rahman:meaning");
    expect(created.cardType).toBe("meaning");
    expect(created.introducedAt).toBe(now.toISOString());
  });
});

describe("selectNewNames", () => {
  it("picks Names in list order", () => {
    const picked = selectNewNames(NAMES, new Map(), 3).map((n) => n.id);
    expect(picked).toEqual(["ar-rahman", "ar-rahim", "al-malik"]);
  });

  it("skips Names already introduced", () => {
    const cards = cardsOf(card("ar-rahman"), card("al-malik"));
    const picked = selectNewNames(NAMES, cards, 2).map((n) => n.id);
    expect(picked).toEqual(["ar-rahim", "al-quddus"]);
  });

  it("returns nothing when the limit is used up or all are learned", () => {
    expect(selectNewNames(NAMES, new Map(), 0)).toEqual([]);
    const all = cardsOf(...NAMES.map((n) => card(n.id)));
    expect(selectNewNames(NAMES, all, 3)).toEqual([]);
  });
});

describe("daily new-Name limit", () => {
  const yesterday = new Date(2026, 8, 12, 20, 0);

  it("allows the preferred number of new Names per day", () => {
    expect(remainingNewToday(new Map(), DEFAULT_PREFERENCES, now)).toBe(3);
    expect(
      remainingNewToday(
        new Map(),
        { ...DEFAULT_PREFERENCES, newNamesPerDay: 7 },
        now,
      ),
    ).toBe(7);
  });

  it("counts only Names introduced today", () => {
    const cards = cardsOf(
      card("a", { introducedAt: yesterday }),
      card("b", { introducedAt: now }),
    );
    expect(remainingNewToday(cards, DEFAULT_PREFERENCES, now)).toBe(2);
  });

  it("never goes below zero", () => {
    const cards = cardsOf(card("a"), card("b"), card("c"), card("d"));
    expect(remainingNewToday(cards, DEFAULT_PREFERENCES, now)).toBe(0);
  });

  it("resets on a new day", () => {
    const cards = cardsOf(card("a"), card("b"), card("c"));
    const tomorrow = new Date(2026, 8, 14, 7, 0);
    expect(remainingNewToday(cards, DEFAULT_PREFERENCES, tomorrow)).toBe(3);
  });
});

describe("learning sessions", () => {
  it("introduces each Name and recalls it after the next introduction", () => {
    const session = startLearnSession(["a", "b", "c"]);
    expect(session.queue.map((s) => `${s.kind}:${s.nameId}`)).toEqual([
      "introduce:a",
      "introduce:b",
      "recall:a",
      "introduce:c",
      "recall:b",
      "recall:c",
    ]);
  });

  it("recalls a single Name straight after meeting it", () => {
    const session = startLearnSession(["a"]);
    expect(session.queue.map((s) => s.kind)).toEqual(["introduce", "recall"]);
  });

  it("is complete immediately when there is nothing to learn", () => {
    expect(isSessionComplete(startLearnSession([]))).toBe(true);
  });

  it("progresses deterministically to completion", () => {
    let session = startLearnSession(["a", "b"]);
    session = completeIntroduction(session);
    session = completeIntroduction(session);
    expect(currentStep(session)).toEqual({ kind: "recall", nameId: "a" });
    session = completeRecall(session, "good", false);
    session = completeRecall(session, "easy", false);
    expect(isSessionComplete(session)).toBe(true);
    expect(session.introduced).toEqual(["a", "b"]);
    expect(session.recalled).toEqual(["a", "b"]);
    expect(session.ratings).toEqual({ again: 0, hard: 0, good: 1, easy: 1 });
    expect(session.completed).toBe(4);
  });

  it("ignores an action that doesn't match the current step", () => {
    const session = startLearnSession(["a"]);
    expect(completeRecall(session, "good", false)).toBe(session);
    const recall = startReviewSession(["a"]);
    expect(completeIntroduction(recall)).toBe(recall);
  });
});

describe("review sessions", () => {
  it("repeats a forgotten Name at the end of the session", () => {
    let session = startReviewSession(["a", "b"]);
    session = completeRecall(session, "again", true);
    expect(session.queue.map((s) => s.nameId)).toEqual(["b", "a"]);
    expect(sessionLength(session)).toBe(3);
    session = completeRecall(session, "good", false);
    session = completeRecall(session, "good", false);
    expect(isSessionComplete(session)).toBe(true);
    expect(session.recalled).toEqual(["a", "b"]);
    expect(session.ratings.again).toBe(1);
  });

  it("queues due Names, most overdue first, up to the session limit", () => {
    const cards = cardsOf(
      card("later", { due: minutes(30) }),
      card("recent", { due: minutes(-5) }),
      card("oldest", { due: minutes(-600) }),
    );
    expect(selectDueNameIds(cards, now)).toEqual(["oldest", "recent"]);

    const many = cardsOf(
      ...Array.from({ length: 30 }, (_, i) =>
        card(`n${i}`, { due: minutes(-i) }),
      ),
    );
    expect(selectDueNameIds(many, now)).toHaveLength(REVIEW_SESSION_LIMIT);
  });
});

describe("shouldRepeatInSession", () => {
  it("repeats only reviews due within the learn-ahead window", () => {
    expect(shouldRepeatInSession(minutes(1), now)).toBe(true);
    expect(
      shouldRepeatInSession(new Date(now.getTime() + LEARN_AHEAD_MS), now),
    ).toBe(true);
    expect(shouldRepeatInSession(minutes(60), now)).toBe(false);
  });
});
