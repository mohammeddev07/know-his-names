import type { DivineName } from "@/lib/content/names";
import type { ReviewRating } from "@/lib/srs/types";

/** One correct Name plus up to three distractors. */
export const CHOICE_COUNT = 4;

/**
 * Options for a "which Name is this?" question: the correct Name and up to
 * three others the learner has already met, in shuffled order. Distractors
 * are the Name's paired Names first (they are easiest to confuse), then the
 * nearest Names by list order. Returns null when fewer than two options are
 * possible, so the caller can fall back to reveal-and-rate.
 */
export function buildChoices(
  correct: DivineName,
  introduced: readonly DivineName[],
  random: () => number = Math.random,
): DivineName[] | null {
  const others = introduced.filter((name) => name.id !== correct.id);
  const byId = new Map(others.map((name) => [name.id, name]));

  const partners = (correct.pairings ?? []).flatMap((pairing) => {
    const partner = pairing.withId ? byId.get(pairing.withId) : undefined;
    return partner ? [partner] : [];
  });
  const nearest = others
    .filter((name) => !partners.includes(name))
    .sort(
      (a, b) =>
        Math.abs(a.order - correct.order) - Math.abs(b.order - correct.order) ||
        a.order - b.order,
    );

  const distractors = [...partners, ...nearest].slice(0, CHOICE_COUNT - 1);
  if (distractors.length < 1) return null;
  return shuffle([correct, ...distractors], random);
}

/** Fisher–Yates, using the injected random function. */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** A tapped option is either right or wrong; there is no Hard or Easy. */
export function ratingForChoice(isCorrect: boolean): ReviewRating {
  return isCorrect ? "good" : "again";
}
