import { beforeEach, describe, expect, it } from "vitest";
import { createCard } from "@/lib/learning/cards";
import { DEFAULT_PREFERENCES, type ReviewEvent } from "@/lib/learning/types";
import { applyRating, createSchedule } from "@/lib/srs/fsrs-adapter";
import {
  BACKUP_FORMAT,
  BackupError,
  backupFileName,
  createBackup,
  MAX_BACKUP_BYTES,
  parseBackup,
  serializeBackup,
  type BackupErrorCode,
  type BackupFile,
} from "@/lib/storage/backup";
import { IndexedDbProgressRepository } from "@/lib/storage/indexeddb-progress-repository";
import type { ProgressSnapshot } from "@/lib/storage/progress-repository";

const now = new Date("2026-09-13T09:00:00.000Z");

function snapshot(): ProgressSnapshot {
  const fresh = createCard("ar-rahman", createSchedule(now), now);
  const next = applyRating(fresh.schedule, "good", now);
  const review: ReviewEvent = {
    id: "e1",
    cardId: fresh.id,
    reviewedAt: now.toISOString(),
    rating: "good",
    previousState: fresh.schedule,
    resultingState: next,
  };
  return {
    cards: [
      { ...fresh, schedule: next },
      createCard("ar-rahim", createSchedule(now), now),
    ],
    reviews: [review],
    preferences: { ...DEFAULT_PREFERENCES, newNamesPerDay: 5 },
  };
}

/**
 * A serialised backup, optionally tampered with. Invalid values are written
 * with Object.assign so the test can build files the types would forbid.
 */
function backupText(mutate: (backup: BackupFile) => void = () => {}) {
  const backup = JSON.parse(
    serializeBackup(createBackup(snapshot(), now)),
  ) as BackupFile;
  mutate(backup);
  return JSON.stringify(backup);
}

function errorCode(text: string): BackupErrorCode | undefined {
  try {
    parseBackup(text);
  } catch (error) {
    if (error instanceof BackupError) return error.code;
    throw error;
  }
  return undefined;
}

describe("backup serialisation", () => {
  it("includes format, version, export time, app version and all progress", () => {
    const backup = createBackup(snapshot(), now);
    expect(backup.format).toBe(BACKUP_FORMAT);
    expect(backup.schemaVersion).toBe(1);
    expect(backup.exportedAt).toBe(now.toISOString());
    expect(backup.app.contentVersion).toBeTruthy();
    expect(backup.data.cards).toHaveLength(2);
    expect(backup.data.reviews).toHaveLength(1);
    expect(backup.data.preferences.newNamesPerDay).toBe(5);
  });

  it("round-trips through a file without loss", () => {
    const text = serializeBackup(createBackup(snapshot(), now));
    const parsed = parseBackup(text);
    expect(parsed.snapshot).toEqual(snapshot());
    expect(parsed.summary).toMatchObject({
      exportedAt: now.toISOString(),
      namesIntroduced: 2,
      reviews: 1,
      unknownNames: 0,
    });
  });

  it("names files by local date", () => {
    expect(backupFileName(new Date(2026, 8, 3, 23, 30))).toBe(
      "know-his-names-backup-2026-09-03.json",
    );
  });
});

describe("backup validation", () => {
  it("rejects files that aren't JSON", () => {
    expect(errorCode("{ not json")).toBe("not-json");
    expect(errorCode("")).toBe("not-json");
  });

  it("rejects JSON that isn't a backup", () => {
    expect(errorCode("{}")).toBe("not-a-backup");
    expect(errorCode("[]")).toBe("not-a-backup");
    expect(errorCode('"text"')).toBe("not-a-backup");
    expect(
      errorCode(backupText((b) => Object.assign(b, { format: "other-app" }))),
    ).toBe("not-a-backup");
  });

  it("rejects unsupported versions, explaining newer ones", () => {
    expect(
      errorCode(backupText((b) => Object.assign(b, { schemaVersion: 0 }))),
    ).toBe("unsupported-version");
    expect(
      errorCode(backupText((b) => Object.assign(b, { schemaVersion: "1" }))),
    ).toBe("unsupported-version");
    expect(() =>
      parseBackup(backupText((b) => Object.assign(b, { schemaVersion: 2 }))),
    ).toThrow(/newer version/);
  });

  it("rejects damaged records", () => {
    const damaged: Array<(b: BackupFile) => void> = [
      (b) => (b.data.cards[0].schedule.reps = -1),
      (b) => Object.assign(b.data.reviews[0], { rating: "perfect" }),
      (b) => Object.assign(b.data.preferences, { newNamesPerDay: 100 }),
      (b) => Reflect.deleteProperty(b.data, "reviews"),
      (b) => (b.exportedAt = "yesterday"),
    ];
    for (const mutate of damaged) {
      expect(errorCode(backupText(mutate))).toBe("invalid-data");
    }
  });

  it("rejects inconsistent data", () => {
    const inconsistent: Array<(b: BackupFile) => void> = [
      (b) => b.data.cards.push(b.data.cards[0]),
      (b) => b.data.reviews.push(b.data.reviews[0]),
      (b) => (b.data.reviews[0].cardId = "al-malik:meaning"),
      (b) => (b.data.cards[0].id = "something-else"),
    ];
    for (const mutate of inconsistent) {
      expect(errorCode(backupText(mutate))).toBe("invalid-data");
    }
  });

  it("rejects oversized files before parsing", () => {
    expect(errorCode(" ".repeat(MAX_BACKUP_BYTES + 1))).toBe("too-large");
  });

  it("drops unexpected fields instead of trusting them", () => {
    const text = backupText((b) => {
      Object.assign(b.data.cards[0], {
        script: "<img src=x onerror=alert(1)>",
      });
      Object.assign(b, { extra: { nested: true } });
    });
    const parsed = parseBackup(text);
    expect(parsed.snapshot.cards[0]).not.toHaveProperty("script");
  });

  it("keeps Names this content version doesn't know, and reports them", () => {
    const text = backupText((b) => {
      b.data.cards[1].nameId = "future-name";
      b.data.cards[1].id = "future-name:meaning";
    });
    expect(parseBackup(text).summary).toMatchObject({
      namesIntroduced: 1,
      unknownNames: 1,
    });
  });
});

describe("backup restoration", () => {
  let repo: IndexedDbProgressRepository;

  beforeEach(() => {
    repo = new IndexedDbProgressRepository(`backup-${crypto.randomUUID()}`);
  });

  it("restores exported progress into an empty device", async () => {
    const source = new IndexedDbProgressRepository(
      `source-${crypto.randomUUID()}`,
    );
    const original = snapshot();
    await source.replaceAll(original);
    const file = serializeBackup(
      createBackup(await source.exportSnapshot(), now),
    );

    await repo.replaceAll(parseBackup(file).snapshot);
    expect(await repo.exportSnapshot()).toEqual({
      cards: expect.arrayContaining(original.cards),
      reviews: original.reviews,
      preferences: original.preferences,
    });
  });

  it("can undo an import", async () => {
    await repo.savePreferences({ ...DEFAULT_PREFERENCES, theme: "dark" });
    await repo.replaceAll(parseBackup(backupText()).snapshot);
    expect((await repo.getAllCardStates()).length).toBe(2);
    await repo.restoreRollback();
    expect(await repo.getAllCardStates()).toEqual([]);
    expect((await repo.getPreferences()).theme).toBe("dark");
  });
});
