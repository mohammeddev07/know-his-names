import { describe, expect, it } from "vitest";
import { NAMES } from "@/lib/content/names";
import { createCard } from "@/lib/learning/cards";
import {
  calendarDaysBetween,
  describeInterval,
  formatDue,
  formatInterval,
  localDayKey,
} from "@/lib/learning/dates";
import {
  countIntroducedOn,
  getDueCards,
  isDue,
  nextDueDate,
  reviewForecast,
  reviewsByDay,
  summarizeProgress,
} from "@/lib/learning/progress";
import { getStatus, needsAttention } from "@/lib/learning/status";
import type { CardState, ReviewEvent } from "@/lib/learning/types";
import type { ScheduleState } from "@/lib/srs/types";

const now = new Date(2026, 8, 13, 12, 0);
const at = (days: number, hours = 12) => new Date(2026, 8, 13 + days, hours, 0);

function card(
  nameId: string,
  overrides: Partial<ScheduleState> = {},
  introducedAt = now,
): CardState {
  return createCard(
    nameId,
    {
      due: now.toISOString(),
      stability: 5,
      difficulty: 5,
      elapsedDays: 0,
      scheduledDays: 3,
      learningSteps: 0,
      reps: 2,
      lapses: 0,
      phase: "review",
      lastReview: now.toISOString(),
      ...overrides,
    },
    introducedAt,
  );
}

function event(reviewedAt: Date): ReviewEvent {
  const state = card("x").schedule;
  return {
    id: reviewedAt.toISOString(),
    cardId: "x:meaning",
    reviewedAt: reviewedAt.toISOString(),
    rating: "good",
    previousState: state,
    resultingState: state,
  };
}

describe("learning status", () => {
  it("classifies each stage", () => {
    expect(getStatus(undefined)).toBe("not-started");
    expect(getStatus(card("a", { phase: "new" }))).toBe("learning");
    expect(getStatus(card("a", { phase: "learning" }))).toBe("learning");
    expect(getStatus(card("a", { phase: "relearning" }))).toBe("learning");
    expect(getStatus(card("a", { stability: 20.9 }))).toBe("reviewing");
    expect(getStatus(card("a", { stability: 21 }))).toBe("strong");
  });

  it("flags recently or repeatedly forgotten Names", () => {
    expect(needsAttention(undefined)).toBe(false);
    expect(needsAttention(card("a", { phase: "relearning" }))).toBe(true);
    expect(needsAttention(card("a", { lapses: 2 }))).toBe(true);
    expect(needsAttention(card("a", { lapses: 2, stability: 40 }))).toBe(false);
    expect(needsAttention(card("a", { lapses: 1 }))).toBe(false);
  });
});

describe("summarizeProgress", () => {
  it("counts every status across all Names", () => {
    const cards = new Map(
      [
        card(NAMES[0].id, { stability: 30, due: at(10).toISOString() }),
        card(NAMES[1].id, { stability: 4, due: at(-1).toISOString() }),
        card(NAMES[2].id, {
          phase: "relearning",
          due: at(0, 11).toISOString(),
        }),
      ].map((c) => [c.nameId, c]),
    );
    const summary = summarizeProgress(NAMES, cards, now);
    expect(summary).toEqual({
      total: 99,
      introduced: 3,
      counts: { "not-started": 96, learning: 1, reviewing: 1, strong: 1 },
      attention: 1,
      dueNow: 2,
    });
  });
});

describe("due cards", () => {
  const cards = [
    card("later", { due: at(2).toISOString() }),
    card("overdue", { due: at(-3).toISOString() }),
    card("now", { due: now.toISOString() }),
  ];

  it("treats a card due at this moment as due", () => {
    expect(isDue(cards[2], now)).toBe(true);
    expect(isDue(cards[0], now)).toBe(false);
  });

  it("orders due cards by how overdue they are", () => {
    expect(getDueCards(cards, now).map((c) => c.nameId)).toEqual([
      "overdue",
      "now",
    ]);
  });

  it("finds the next due date", () => {
    expect(nextDueDate(cards)?.toISOString()).toBe(at(-3).toISOString());
    expect(nextDueDate([])).toBeNull();
  });
});

describe("daily activity", () => {
  it("counts Names introduced on a local day", () => {
    const cards = [
      card("a", {}, at(0, 1)),
      card("b", {}, at(0, 23)),
      card("c", {}, at(-1, 23)),
    ];
    expect(countIntroducedOn(cards, localDayKey(now))).toBe(2);
  });

  it("groups reviews by day, oldest first, including empty days", () => {
    const days = reviewsByDay(
      [event(at(0, 8)), event(at(0, 9)), event(at(-2))],
      3,
      now,
    );
    expect(days.map((d) => d.count)).toEqual([1, 0, 2]);
    expect(days.at(-1)?.day).toBe(localDayKey(now));
  });

  it("forecasts upcoming reviews, counting overdue ones today", () => {
    const cards = [
      card("a", { due: at(-4).toISOString() }),
      card("b", { due: at(0, 18).toISOString() }),
      card("c", { due: at(2).toISOString() }),
      card("d", { due: at(30).toISOString() }),
    ];
    expect(reviewForecast(cards, 3, now).map((d) => d.count)).toEqual([
      2, 0, 1,
    ]);
  });
});

describe("date formatting", () => {
  it("measures whole calendar days", () => {
    expect(calendarDaysBetween(at(0, 23), at(1, 1))).toBe(1);
    expect(calendarDaysBetween(now, at(-2))).toBe(-2);
  });

  it("describes when something is due", () => {
    expect(formatDue(at(-1), now)).toBe("now");
    expect(formatDue(new Date(now.getTime() + 5 * 60_000), now)).toBe(
      "in 5 minutes",
    );
    expect(formatDue(at(0, 15), now)).toBe("in 3 hours");
    expect(formatDue(at(1, 9), now)).toBe("tomorrow");
    expect(formatDue(at(3), now)).toBe("in 3 days");
    expect(formatDue(at(60), now)).toBe("in 2 months");
    expect(formatDue(at(800), now)).toBe("in 2 years");
  });

  it("formats rating intervals compactly and in words", () => {
    const min = 60_000;
    const day = 24 * 60 * min;
    expect(formatInterval(min)).toBe("1m");
    expect(formatInterval(10 * min)).toBe("10m");
    expect(formatInterval(3 * 60 * min)).toBe("3h");
    expect(formatInterval(day)).toBe("1d");
    expect(formatInterval(90 * day)).toBe("3mo");
    expect(formatInterval(400 * day)).toBe("1y");
    expect(describeInterval(min)).toBe("1 minute");
    expect(describeInterval(12 * day)).toBe("12 days");
  });
});
