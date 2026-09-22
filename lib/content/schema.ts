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

/**
 * A documented check of one entry against its sources. It records evidence
 * and open issues for the reviewer. It is not a review, so it never changes
 * verificationStatus.
 */
/**
 * How directly the Name itself (not just a related act or attribute) is
 * attested, under a conservative rule: a restricted verb/construct form
 * does not by itself establish the unrestricted Name. See
 * docs/content-review.md "Evidence categories".
 *  - Q     direct Qur'anic nominal Name/predicate
 *  - QH    direct Qur'anic and independently verified authentic-hadith evidence
 *  - H     accepted/authentic-hadith nominal Name
 *  - M-Q   Qur'anic evidence only in construct/plural/restricted form
 *  - M-QH  same as M-Q, with hadith evidence too
 *  - E     exact standalone form rests on the disputed enumeration alone
 */
export const evidenceCategorySchema = z.enum([
  "Q",
  "QH",
  "H",
  "M-Q",
  "M-QH",
  "E",
]);

export const contentAuditSchema = z.strictObject({
  result: z.enum(["passed", "corrected", "needs-review"]),
  /** Where the Name or its attribute is attested, e.g. "Qur'an 59:23 (ٱلْجَبَّارُ)". */
  evidence: z.array(text).min(1),
  evidenceCategory: evidenceCategorySchema.optional(),
  /** Each change made, e.g. "shortMeaning: The Determiner → The Perfect in Power". */
  corrections: z.array(text).optional(),
  notes: text.optional(),
});

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
  audit: contentAuditSchema.optional(),
});

export const namesFileSchema = z.strictObject({
  version: text,
  /** Date of the last content change. */
  updated: z.iso.date(),
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
