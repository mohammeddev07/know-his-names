import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_PREFERENCES,
  type CardState,
  type ReviewEvent,
} from "@/lib/learning/types";
import { IndexedDbProgressRepository } from "@/lib/storage/indexeddb-progress-repository";
import { StorageUnavailableError } from "@/lib/storage/progress-repository";
import type { ScheduleState } from "@/lib/srs/types";

let dbName: string;
let repo: IndexedDbProgressRepository;

const schedule = (overrides: Partial<ScheduleState> = {}): ScheduleState => ({
  due: "2026-09-14T08:00:00.000Z",
  stability: 3.2,
  difficulty: 5.1,
  elapsedDays: 0,
  scheduledDays: 1,
  learningSteps: 0,
  reps: 1,
  lapses: 0,
  phase: "review",
  lastReview: "2026-09-13T08:00:00.000Z",
  ...overrides,
});

const card = (
  nameId: string,
  overrides: Partial<ScheduleState> = {},
): CardState => ({
  id: `${nameId}:meaning`,
  nameId,
  cardType: "meaning",
  introducedAt: "2026-09-13T08:00:00.000Z",
  schedule: schedule(overrides),
});

const event = (
  id: string,
  cardId: string,
  reviewedAt: string,
): ReviewEvent => ({
  id,
  cardId,
  reviewedAt,
  rating: "good",
  previousState: schedule({ reps: 0, phase: "new" }),
  resultingState: schedule(),
});

beforeEach(() => {
  dbName = `test-${crypto.randomUUID()}`;
  repo = new IndexedDbProgressRepository(dbName);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("IndexedDbProgressRepository", () => {
  it("saves card state that survives a reload", async () => {
    await repo.saveCardState(card("ar-rahman"));
    const reopened = new IndexedDbProgressRepository(dbName);
    expect(await reopened.getCardState("ar-rahman:meaning")).toEqual(
      card("ar-rahman"),
    );
    expect(await reopened.getAllCardStates()).toHaveLength(1);
    expect(await reopened.getCardState("missing")).toBeNull();
  });

  it("saves a review and its event together", async () => {
    await repo.saveCardState(card("ar-rahman", { reps: 0 }));
    await repo.saveReview(
      card("ar-rahman", { reps: 1 }),
      event("e1", "ar-rahman:meaning", "2026-09-13T09:00:00.000Z"),
    );
    expect((await repo.getCardState("ar-rahman:meaning"))?.schedule.reps).toBe(
      1,
    );
    expect(await repo.getReviewHistory()).toHaveLength(1);
  });

  it("keeps review history append-only and atomic", async () => {
    await repo.saveReview(
      card("ar-rahman", { reps: 1 }),
      event("e1", "ar-rahman:meaning", "2026-09-13T09:00:00.000Z"),
    );
    // Reusing an event id must fail, and must not touch the card either.
    await expect(
      repo.saveReview(
        card("ar-rahman", { reps: 99 }),
        event("e1", "ar-rahman:meaning", "2026-09-13T10:00:00.000Z"),
      ),
    ).rejects.toBeTruthy();
    expect((await repo.getCardState("ar-rahman:meaning"))?.schedule.reps).toBe(
      1,
    );
    const history = await repo.getReviewHistory();
    expect(history.map((e) => e.reviewedAt)).toEqual([
      "2026-09-13T09:00:00.000Z",
    ]);
  });

  it("filters review history by card and date, oldest first", async () => {
    await repo.saveReview(
      card("a"),
      event("e3", "a:meaning", "2026-09-12T09:00:00.000Z"),
    );
    await repo.saveReview(
      card("b"),
      event("e2", "b:meaning", "2026-09-13T09:00:00.000Z"),
    );
    await repo.saveReview(
      card("a"),
      event("e1", "a:meaning", "2026-09-11T09:00:00.000Z"),
    );

    expect((await repo.getReviewHistory()).map((e) => e.id)).toEqual([
      "e1",
      "e3",
      "e2",
    ]);
    expect(
      (await repo.getReviewHistory({ cardId: "a:meaning" })).map((e) => e.id),
    ).toEqual(["e1", "e3"]);
    const since = await repo.getReviewHistory({
      since: new Date("2026-09-12T00:00:00.000Z"),
    });
    expect(since.map((e) => e.id)).toEqual(["e3", "e2"]);
  });

  it("returns default preferences until saved", async () => {
    expect(await repo.getPreferences()).toEqual(DEFAULT_PREFERENCES);
    const saved = {
      newNamesPerDay: 5,
      theme: "dark",
      showTransliteration: false,
    } as const;
    await repo.savePreferences(saved);
    expect(
      await new IndexedDbProgressRepository(dbName).getPreferences(),
    ).toEqual(saved);
  });

  it("refuses to write invalid records", async () => {
    await expect(
      repo.savePreferences({ ...DEFAULT_PREFERENCES, newNamesPerDay: 4 as 3 }),
    ).rejects.toBeTruthy();
    await expect(
      repo.saveCardState({ ...card("x"), introducedAt: "yesterday" }),
    ).rejects.toBeTruthy();
    expect(await repo.getAllCardStates()).toEqual([]);
  });

  it("skips corrupt records instead of failing", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await repo.saveCardState(card("good"));
    await rawPut(dbName, "cards", { id: "broken:meaning", nameId: "broken" });
    expect((await repo.getAllCardStates()).map((c) => c.nameId)).toEqual([
      "good",
    ]);
    expect(await repo.getCardState("broken:meaning")).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  it("falls back to defaults when stored preferences are corrupt", async () => {
    await repo.getPreferences(); // creates the database and its stores
    await rawPut(dbName, "meta", {
      key: "preferences",
      value: { newNamesPerDay: "lots" },
    });
    expect(await repo.getPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("replaces everything atomically and can roll back", async () => {
    await repo.saveReview(
      card("old"),
      event("old-1", "old:meaning", "2026-09-10T09:00:00.000Z"),
    );
    await repo.savePreferences({ ...DEFAULT_PREFERENCES, newNamesPerDay: 7 });
    expect(await repo.getRollbackSavedAt()).toBeNull();

    await repo.replaceAll({
      cards: [card("new")],
      reviews: [event("new-1", "new:meaning", "2026-09-12T09:00:00.000Z")],
      preferences: { ...DEFAULT_PREFERENCES, newNamesPerDay: 1 },
    });
    const replaced = await repo.exportSnapshot();
    expect(replaced.cards.map((c) => c.nameId)).toEqual(["new"]);
    expect(replaced.reviews.map((r) => r.id)).toEqual(["new-1"]);
    expect(replaced.preferences.newNamesPerDay).toBe(1);
    expect(await repo.getRollbackSavedAt()).toEqual(expect.any(String));

    await repo.restoreRollback();
    const restored = await repo.exportSnapshot();
    expect(restored.cards.map((c) => c.nameId)).toEqual(["old"]);
    expect(restored.reviews.map((r) => r.id)).toEqual(["old-1"]);
    expect(restored.preferences.newNamesPerDay).toBe(7);
    expect(await repo.getRollbackSavedAt()).toBeNull();
  });

  it("leaves progress untouched when a replacement is invalid", async () => {
    await repo.saveCardState(card("keep"));
    await expect(
      repo.replaceAll({
        cards: [{ ...card("bad"), schedule: { ...schedule(), reps: -1 } }],
        reviews: [],
        preferences: DEFAULT_PREFERENCES,
      }),
    ).rejects.toBeTruthy();
    expect((await repo.getAllCardStates()).map((c) => c.nameId)).toEqual([
      "keep",
    ]);
    expect(await repo.getRollbackSavedAt()).toBeNull();
  });

  it("reports unavailable storage clearly", async () => {
    const original = globalThis.indexedDB;
    // @ts-expect-error simulate a browser without IndexedDB
    delete globalThis.indexedDB;
    try {
      await expect(
        new IndexedDbProgressRepository("x").getAllCardStates(),
      ).rejects.toBeInstanceOf(StorageUnavailableError);
    } finally {
      globalThis.indexedDB = original;
    }
  });
});

/** Writes a record directly, bypassing the repository's validation. */
function rawPut(name: string, store: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(name);
    open.onsuccess = () => {
      const tx = open.result.transaction(store, "readwrite");
      tx.objectStore(store).put(value);
      tx.oncomplete = () => {
        open.result.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
    open.onerror = () => reject(open.error);
  });
}
