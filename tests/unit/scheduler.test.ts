import { beforeEach, describe, expect, it } from "vitest";
import { FsrsReviewScheduler } from "@/lib/srs/scheduler";
import { REVIEW_RATINGS } from "@/lib/srs/types";
import { IndexedDbProgressRepository } from "@/lib/storage/indexeddb-progress-repository";

let repo: IndexedDbProgressRepository;
let scheduler: FsrsReviewScheduler;
const start = new Date("2026-09-13T09:00:00.000Z");
const minutes = (n: number) => new Date(start.getTime() + n * 60_000);

beforeEach(() => {
  repo = new IndexedDbProgressRepository(`scheduler-${crypto.randomUUID()}`);
  scheduler = new FsrsReviewScheduler(repo);
});

describe("FsrsReviewScheduler", () => {
  it("introduces a Name once, as a card that is due now", async () => {
    const card = await scheduler.introduce("ar-rahman", start);
    expect(card.id).toBe("ar-rahman:meaning");
    expect(card.schedule.phase).toBe("new");
    expect(await scheduler.getDueCards(start)).toHaveLength(1);

    const again = await scheduler.introduce("ar-rahman", minutes(5));
    expect(again.introducedAt).toBe(start.toISOString());
    expect(await repo.getAllCardStates()).toHaveLength(1);
  });

  it("records each of the four ratings as persisted, append-only events", async () => {
    for (const [i, rating] of REVIEW_RATINGS.entries()) {
      const nameId = `name-${rating}`;
      const card = await scheduler.introduce(nameId, start);
      const result = await scheduler.recordReview(card.id, rating, minutes(i));
      expect(result.rating).toBe(rating);
      expect(result.previous).toEqual(card.schedule);
      expect((await repo.getCardState(card.id))?.schedule).toEqual(result.next);
    }
    const history = await repo.getReviewHistory();
    expect(history.map((e) => e.rating)).toEqual([...REVIEW_RATINGS]);
    for (const event of history) {
      expect(event.previousState.phase).toBe("new");
      expect(event.resultingState.reps).toBe(1);
    }
  });

  it("brings forgotten Names back sooner than remembered ones", async () => {
    const forgotten = await scheduler.introduce("forgotten", start);
    const remembered = await scheduler.introduce("remembered", start);
    const a = await scheduler.recordReview(forgotten.id, "again", start);
    const b = await scheduler.recordReview(remembered.id, "easy", start);
    expect(Date.parse(a.next.due)).toBeLessThan(Date.parse(b.next.due));

    const due = await scheduler.getDueCards(minutes(5));
    expect(due.map((c) => c.nameId)).toEqual(["forgotten"]);
  });

  it("builds up history across repeated reviews", async () => {
    const card = await scheduler.introduce("ar-rahim", start);
    let now = start;
    for (let i = 0; i < 4; i++) {
      const result = await scheduler.recordReview(card.id, "good", now);
      now = new Date(result.next.due);
    }
    const history = await repo.getReviewHistory({ cardId: card.id });
    expect(history).toHaveLength(4);
    // Each event starts where the previous one ended.
    for (let i = 1; i < history.length; i++) {
      expect(history[i].previousState).toEqual(history[i - 1].resultingState);
    }
  });

  it("previews next due dates for each rating", async () => {
    const card = await scheduler.introduce("al-malik", start);
    const preview = scheduler.preview(card, start);
    expect(Object.keys(preview)).toEqual([...REVIEW_RATINGS]);
    expect(preview.again.getTime()).toBeLessThan(preview.easy.getTime());
  });

  it("rejects reviews for unknown cards without writing anything", async () => {
    await expect(
      scheduler.recordReview("missing:meaning", "good", start),
    ).rejects.toThrow();
    expect(await repo.getReviewHistory()).toEqual([]);
  });
});
