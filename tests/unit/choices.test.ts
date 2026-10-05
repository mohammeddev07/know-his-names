import { describe, expect, it } from "vitest";
import { NAMES, getNameById } from "@/lib/content/names";
import {
  CHOICE_COUNT,
  buildChoices,
  ratingForChoice,
} from "@/lib/learning/choices";

const ids = (names: readonly { id: string }[]) => names.map((n) => n.id);
const sequence = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe("buildChoices", () => {
  it("includes the correct Name once and offers four distinct options", () => {
    const options = buildChoices(NAMES[0], NAMES.slice(0, 10))!;
    expect(options).toHaveLength(CHOICE_COUNT);
    expect(ids(options)).toContain(NAMES[0].id);
    expect(new Set(ids(options)).size).toBe(CHOICE_COUNT);
  });

  it("prefers pairing partners the learner has met", () => {
    const qabid = getNameById("al-qabid")!;
    for (const roll of [0, 0.3, 0.6, 0.99]) {
      const options = buildChoices(qabid, NAMES, () => roll)!;
      expect(ids(options)).toContain("al-basit");
    }
  });

  it("never offers a Name that has not been introduced", () => {
    const met = NAMES.slice(20, 24);
    const options = buildChoices(NAMES[0], met)!;
    const allowed = new Set(ids([NAMES[0], ...met]));
    expect(ids(options).every((id) => allowed.has(id))).toBe(true);
  });

  it("pads with the nearest introduced Names by order", () => {
    const index = NAMES.findIndex(
      (name, i) => i > 10 && i < 80 && !name.pairings,
    );
    const correct = NAMES[index];
    const options = buildChoices(correct, NAMES.slice(0, 100))!;
    // Distance 1 on both sides, then the lower of the two at distance 2.
    expect(new Set(ids(options))).toEqual(
      new Set(
        ids([
          NAMES[index],
          NAMES[index - 1],
          NAMES[index + 1],
          NAMES[index - 2],
        ]),
      ),
    );
  });

  it("offers fewer options when the learner has met few Names", () => {
    const options = buildChoices(NAMES[0], NAMES.slice(0, 2))!;
    expect(ids(options).sort()).toEqual(ids(NAMES.slice(0, 2)).sort());
  });

  it("returns null when fewer than two options are possible", () => {
    expect(buildChoices(NAMES[0], [])).toBeNull();
    expect(buildChoices(NAMES[0], [NAMES[0]])).toBeNull();
  });

  it("is deterministic for a given random function", () => {
    const run = () =>
      ids(
        buildChoices(NAMES[5], NAMES.slice(0, 20), sequence([0.1, 0.9, 0.4]))!,
      );
    expect(run()).toEqual(run());
  });
});

describe("ratingForChoice", () => {
  it("rates a right answer good and a wrong answer again", () => {
    expect(ratingForChoice(true)).toBe("good");
    expect(ratingForChoice(false)).toBe("again");
  });
});
