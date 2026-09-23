import type { EvidenceCategory } from "./schema";

/**
 * A short, honest note for Names whose exact standalone form is
 * methodology-dependent, shown next to the sources on the Name detail page.
 * Names with direct Qur'anic/hadith nominal evidence (Q, QH, H) need no note.
 * See docs/content-review.md "Evidence categories".
 */
export function evidenceNote(
  category: EvidenceCategory | undefined,
): string | undefined {
  switch (category) {
    case "E":
      return "This Name's exact wording rests on the traditional enumeration; it is not independently attested as a standalone Name in the Qur'an or an authenticated hadith.";
    case "M-Q":
    case "M-QH":
      return "This Name occurs in the Qur'an only in a construct or restricted grammatical form; scholars differ on whether that establishes the standalone Name.";
    default:
      return undefined;
  }
}
