import { z } from "zod";

/**
 * Schemas for bundled religious content. Used at build time and in tests;
 * the client imports only the inferred types.
 */

const text = z.string().regex(/\S/, "must not be empty");
const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "must be a lowercase slug such as ar-rahman",
  );

export const verificationStatusSchema = z.enum([
  "pending",
  "reviewed",
  "verified",
]);

export const divineNameSchema = z.strictObject({
  id: slug,
  order: z.number().int().min(1),
  arabic: text.regex(/[؀-ۿ]/, "must contain Arabic script"),
  transliteration: text,
  shortMeaning: text,
  explanation: text.optional(),
  /** Local, reviewed recordings only, e.g. /audio/ar-rahman.mp3 */
  audioUrl: z
    .string()
    .regex(
      /^\/audio\/[a-z-]+\.(?:mp3|m4a|ogg|opus)$/,
      "must be a local /audio/ file",
    )
    .optional(),
  sourceIds: z.array(slug).min(1, "needs at least one source"),
  verificationStatus: verificationStatusSchema,
});

export const namesFileSchema = z.strictObject({
  version: text,
  names: z.array(divineNameSchema).min(1),
});

export const contentSourceSchema = z.strictObject({
  id: slug,
  title: text,
  kind: z.enum(["quran", "hadith", "scholarly", "secondary"]),
  citation: text,
  url: z.url({ protocol: /^https$/ }).optional(),
  usedFor: text,
  verificationStatus: verificationStatusSchema,
});

export const sourcesFileSchema = z.strictObject({
  /** The source whose list and order of Names the app follows. */
  enumerationSourceId: slug,
  sources: z.array(contentSourceSchema).min(1),
});

export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type DivineName = z.infer<typeof divineNameSchema>;
export type ContentSource = z.infer<typeof contentSourceSchema>;
