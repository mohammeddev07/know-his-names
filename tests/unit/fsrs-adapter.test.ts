import { describe, expect, it } from "vitest";
import {
  applyRating,
  createSchedule,
  fromFsrsCard,
  previewRatings,
  SchedulingError,
  toFsrsCard,
} from "@/lib/srs/fsrs-adapter";
import {
  REVIEW_RATINGS,
  type ReviewRating,
  type ScheduleState,
} from "@/lib/srs/types";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const start = new Date("2026-09-13T09:00:00.000Z");

const after = (schedule: ScheduleState, from: Date) =>
  new Date(schedule.due).getTime() - from.getTime();

/** Reviews a card with the same rating each time it falls due. */
function reviewRepeatedly(rating: ReviewRating, times: number) {
  let schedule = createSchedule(start);
  let now = start;
  const intervals: number[] = [];
  for (let i = 0; i < times; i++) {
    schedule = applyRating(schedule, rating, now);
    intervals.push(after(schedule, now));
    now = new Date(schedule.due);
  }
  return { schedule, intervals };
}

/** A card that has graduated to the review phase. */
function graduated(): { schedule: ScheduleState; now: Date } {
  let schedule = applyRating(createSchedule(start), "good", start);
  let now = new Date(schedule.due);
  schedule = applyRating(schedule, "good", now);
  now = new Date(schedule.due);
  return { schedule, now };
}

describe("FSRS adapter", () => {
  it("creates a new card that is due immediately", () => {
    const schedule = createSchedule(start);
    expect(schedule.phase).toBe("new");
    expect(schedule.due).toBe(start.toISOString());
    expect(schedule.reps).toBe(0);
    expect(schedule.lastReview).toBeNull();
  });

  it("maps app state to FSRS cards and back without loss", () => {
    const { schedule } = graduated();
    expect(fromFsrsCard(toFsrsCard(schedule))).toEqual(schedule);
  });

  it("uses short learning steps for a brand-new card", () => {
    const fresh = createSchedule(start);
    const again = applyRating(fresh, "again", start);
    const good = applyRating(fresh, "good", start);
    const easy = applyRating(fresh, "easy", start);
    expect(again.phase).toBe("learning");
    expect(after(again, start)).toBe(MINUTE);
    expect(good.phase).toBe("learning");
    expect(after(good, start)).toBe(10 * MINUTE);
    expect(easy.phase).toBe("review");
    expect(after(easy, start)).toBeGreaterThanOrEqual(DAY);
  });

  it("orders intervals Again < Hard < Good < Easy for a known card", () => {
    const { schedule, now } = graduated();
    const next = REVIEW_RATINGS.map((rating) =>
      after(applyRating(schedule, rating, now), now),
    );
    expect(next).toEqual([...next].sort((a, b) => a - b));
    expect(new Set(next).size).toBe(4);
  });

  it("returns forgotten Names soon and counts the lapse", () => {
    const { schedule, now } = graduated();
    const forgotten = applyRating(schedule, "again", now);
    expect(forgotten.phase).toBe("relearning");
    expect(forgotten.lapses).toBe(schedule.lapses + 1);
    expect(after(forgotten, now)).toBeLessThanOrEqual(10 * MINUTE);
    expect(forgotten.stability).toBeLessThan(schedule.stability);
  });

  it("spaces well-known Names further apart than difficult ones", () => {
    const easy = reviewRepeatedly("easy", 5);
    const good = reviewRepeatedly("good", 5);
    const hard = reviewRepeatedly("hard", 5);
    expect(easy.intervals.at(-1)!).toBeGreaterThan(good.intervals.at(-1)!);
    expect(good.intervals.at(-1)!).toBeGreaterThan(hard.intervals.at(-1)!);
    // Intervals grow as a Name keeps being remembered.
    const graduatedGood = good.intervals.slice(2);
    expect(graduatedGood).toEqual([...graduatedGood].sort((a, b) => a - b));
    expect(hard.schedule.difficulty).toBeGreaterThan(easy.schedule.difficulty);
  });

  it("previews the same dates a rating would produce", () => {
    const { schedule, now } = graduated();
    const preview = previewRatings(schedule, now);
    for (const rating of REVIEW_RATINGS) {
      expect(preview[rating].toISOString()).toBe(
        applyRating(schedule, rating, now).due,
      );
    }
  });

  it("is deterministic", () => {
    const { schedule, now } = graduated();
    expect(applyRating(schedule, "good", now)).toEqual(
      applyRating(schedule, "good", now),
    );
  });

  it("records the review time", () => {
    const next = applyRating(createSchedule(start), "good", start);
    expect(next.lastReview).toBe(start.toISOString());
    expect(next.reps).toBe(1);
  });

  it("reports scheduling failures without returning bad state", () => {
    const broken = { ...createSchedule(start), due: "not a date" };
    expect(() => applyRating(broken, "good", start)).toThrow(SchedulingError);
  });
});
