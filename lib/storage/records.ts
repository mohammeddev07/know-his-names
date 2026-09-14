import * as z from "zod/mini";
import { NEW_NAMES_PER_DAY_OPTIONS } from "@/lib/learning/types";

/**
 * Runtime shapes of persisted and imported records. Everything read from
 * IndexedDB or a backup file passes through these before the app trusts it.
 */

const id = z.string().check(z.minLength(1), z.maxLength(200));
const isoDate = z.iso.datetime();
const nonNegative = z.number().check(z.gte(0));
const count = z.int().check(z.gte(0));

export const scheduleStateSchema = z.object({
  due: isoDate,
  stability: nonNegative,
  difficulty: nonNegative,
  elapsedDays: nonNegative,
  scheduledDays: nonNegative,
  learningSteps: count,
  reps: count,
  lapses: count,
  phase: z.enum(["new", "learning", "review", "relearning"]),
  lastReview: z.nullable(isoDate),
});

export const cardStateSchema = z.object({
  id,
  nameId: id,
  cardType: z.literal("meaning"),
  introducedAt: isoDate,
  schedule: scheduleStateSchema,
});

export const reviewEventSchema = z.object({
  id,
  cardId: id,
  reviewedAt: isoDate,
  rating: z.enum(["again", "hard", "good", "easy"]),
  previousState: scheduleStateSchema,
  resultingState: scheduleStateSchema,
});

export const preferencesSchema = z.object({
  newNamesPerDay: z.union(NEW_NAMES_PER_DAY_OPTIONS.map((n) => z.literal(n))),
  theme: z.enum(["system", "light", "dark"]),
  showTransliteration: z.boolean(),
});
