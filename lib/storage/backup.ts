import * as z from "zod/mini";
import { CONTENT_VERSION, getNameById } from "@/lib/content/names";
import { localDayKey } from "@/lib/learning/dates";
import { cardIdFor } from "@/lib/learning/types";
import { APP_VERSION } from "@/lib/site";
import type { ProgressSnapshot } from "./progress-repository";
import {
  cardStateSchema,
  preferencesSchema,
  reviewEventSchema,
} from "./records";

/**
 * Portable backup files. Imported files are untrusted: they are parsed as
 * JSON only, validated field by field, checked for internal consistency, and
 * never executed or rendered as HTML.
 */

export const BACKUP_FORMAT = "know-his-names-backup";
export const BACKUP_SCHEMA_VERSION = 1;
const SUPPORTED_SCHEMA_VERSIONS: readonly number[] = [1];
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

const backupSchemaV1 = z.object({
  format: z.literal(BACKUP_FORMAT),
  schemaVersion: z.literal(1),
  exportedAt: z.iso.datetime(),
  app: z.object({
    version: z.string().check(z.maxLength(50)),
    contentVersion: z.string().check(z.maxLength(50)),
  }),
  data: z.object({
    cards: z.array(cardStateSchema).check(z.maxLength(10_000)),
    reviews: z.array(reviewEventSchema).check(z.maxLength(1_000_000)),
    preferences: preferencesSchema,
  }),
});

export type BackupFile = z.infer<typeof backupSchemaV1>;

export type BackupErrorCode =
  | "too-large"
  | "not-json"
  | "not-a-backup"
  | "unsupported-version"
  | "invalid-data";

/** A backup that cannot be imported. `message` is safe to show to the learner. */
export class BackupError extends Error {
  constructor(
    readonly code: BackupErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BackupError";
  }
}

export interface BackupSummary {
  exportedAt: string;
  appVersion: string;
  namesIntroduced: number;
  reviews: number;
  /** Names in the backup that this version of the content doesn't include. */
  unknownNames: number;
}

export interface ParsedBackup {
  snapshot: ProgressSnapshot;
  summary: BackupSummary;
}

export function createBackup(
  snapshot: ProgressSnapshot,
  exportedAt: Date = new Date(),
): BackupFile {
  return {
    format: BACKUP_FORMAT,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: exportedAt.toISOString(),
    app: { version: APP_VERSION, contentVersion: CONTENT_VERSION },
    data: {
      cards: snapshot.cards,
      reviews: snapshot.reviews,
      preferences: snapshot.preferences,
    },
  };
}

export function serializeBackup(backup: BackupFile): string {
  return `${JSON.stringify(backup, null, 2)}\n`;
}

/** know-his-names-backup-YYYY-MM-DD.json, using the learner's local date. */
export function backupFileName(date: Date): string {
  return `know-his-names-backup-${localDayKey(date)}.json`;
}

const invalid = () =>
  new BackupError(
    "invalid-data",
    "This backup is damaged or incomplete, so it can't be imported. Your progress hasn't changed.",
  );

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasDuplicates(values: string[]) {
  return new Set(values).size !== values.length;
}

export function parseBackup(text: string): ParsedBackup {
  if (text.length > MAX_BACKUP_BYTES) {
    throw new BackupError(
      "too-large",
      "This file is too large to be a Know His Names backup.",
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupError(
      "not-json",
      "This file couldn't be read as a backup. Choose a file exported from Know His Names.",
    );
  }

  if (!isRecord(raw) || raw.format !== BACKUP_FORMAT) {
    throw new BackupError(
      "not-a-backup",
      "This file isn't a Know His Names backup. Choose a file exported from the app's Settings.",
    );
  }

  const version = raw.schemaVersion;
  if (
    typeof version !== "number" ||
    !SUPPORTED_SCHEMA_VERSIONS.includes(version)
  ) {
    throw new BackupError(
      "unsupported-version",
      typeof version === "number" && version > BACKUP_SCHEMA_VERSION
        ? "This backup was made by a newer version of the app. Update the app, then try again."
        : "This backup's format isn't supported by this version of the app.",
    );
  }

  const result = backupSchemaV1.safeParse(raw);
  if (!result.success) throw invalid();

  const { cards, reviews, preferences } = result.data.data;
  const cardIds = new Set(cards.map((card) => card.id));
  if (
    hasDuplicates(cards.map((card) => card.id)) ||
    hasDuplicates(reviews.map((review) => review.id)) ||
    cards.some((card) => card.id !== cardIdFor(card.nameId, card.cardType)) ||
    reviews.some((review) => !cardIds.has(review.cardId))
  ) {
    throw invalid();
  }

  const unknownNames = cards.filter((card) => !getNameById(card.nameId)).length;
  return {
    snapshot: { cards, reviews, preferences },
    summary: {
      exportedAt: result.data.exportedAt,
      appVersion: result.data.app.version,
      namesIntroduced: cards.length - unknownNames,
      reviews: reviews.length,
      unknownNames,
    },
  };
}
