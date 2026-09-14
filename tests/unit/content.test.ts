import { describe, expect, it } from "vitest";
import namesFile from "@/content/names/names.json";
import sourcesFile from "@/content/sources/sources.json";
import {
  getAdjacentNames,
  getNameById,
  getNameOfTheDay,
  getSourcesFor,
  NAMES,
} from "@/lib/content/names";
import { arabicKey, latinKey, matchesQuery } from "@/lib/content/search";
import { assertValidContent, validateContent } from "@/lib/content/validate";

const clone = <T>(value: T): T => structuredClone(value);

function namesWith(mutate: (names: (typeof namesFile)["names"]) => void) {
  const file = clone(namesFile);
  mutate(file.names);
  return file;
}

function messages(namesInput: unknown, sourcesInput: unknown = sourcesFile) {
  return validateContent(namesInput, sourcesInput).map(
    (i) => `${i.path}: ${i.message}`,
  );
}

describe("bundled content", () => {
  it("passes validation", () => {
    expect(validateContent(namesFile, sourcesFile)).toEqual([]);
    expect(() => assertValidContent()).not.toThrow();
  });

  it("contains ninety-nine Names in order", () => {
    expect(NAMES).toHaveLength(99);
    expect(NAMES.map((n) => n.order)).toEqual(
      Array.from({ length: 99 }, (_, i) => i + 1),
    );
  });

  it("marks unreviewed content honestly", () => {
    for (const name of NAMES) {
      if (name.verificationStatus === "pending") {
        expect(
          name.explanation,
          `${name.id} has an unreviewed explanation`,
        ).toBeUndefined();
      }
    }
  });
});

describe("content validation", () => {
  it("catches duplicate ids", () => {
    const file = namesWith((n) => (n[1].id = n[0].id));
    expect(messages(file)).toContain('names: duplicate id "ar-rahman"');
  });

  it("catches duplicate order numbers", () => {
    const file = namesWith((n) => (n[1].order = 1));
    expect(messages(file)).toContain("names: duplicate order 1");
  });

  it("catches gaps in the order", () => {
    const file = namesWith((n) => (n[98].order = 100));
    expect(messages(file).some((m) => m.includes("expected order 99"))).toBe(
      true,
    );
  });

  it("catches missing Arabic, transliteration and meaning", () => {
    const file = namesWith((n) => {
      n[0].arabic = "";
      n[1].transliteration = "  ";
      delete (n[2] as Partial<(typeof n)[number]>).shortMeaning;
    });
    const found = messages(file);
    expect(found.some((m) => m.startsWith("names.names.0.arabic"))).toBe(true);
    expect(
      found.some((m) => m.startsWith("names.names.1.transliteration")),
    ).toBe(true);
    expect(found.some((m) => m.startsWith("names.names.2.shortMeaning"))).toBe(
      true,
    );
  });

  it("rejects Arabic fields without Arabic script", () => {
    const file = namesWith((n) => (n[0].arabic = "Ar-Rahman"));
    expect(messages(file)).toContain(
      "names.names.0.arabic: must contain Arabic script",
    );
  });

  it("catches invalid verification status", () => {
    const file = namesWith((n) => (n[0].verificationStatus = "approved"));
    expect(
      messages(file).some((m) =>
        m.startsWith("names.names.0.verificationStatus"),
      ),
    ).toBe(true);
  });

  it("catches malformed and unknown source references", () => {
    const unknown = namesWith((n) => (n[0].sourceIds = ["no-such-source"]));
    expect(messages(unknown)).toContain(
      'names.0.sourceIds: "ar-rahman" references unknown source "no-such-source"',
    );
    const empty = namesWith((n) => (n[0].sourceIds = []));
    expect(messages(empty)).toContain(
      "names.names.0.sourceIds: needs at least one source",
    );
  });

  it("rejects unexpected fields and remote audio", () => {
    const extra = namesWith((n) => Object.assign(n[0], { meaning: "x" }));
    expect(messages(extra).length).toBeGreaterThan(0);
    const remote = namesWith((n) =>
      Object.assign(n[0], { audioUrl: "https://example.com/a.mp3" }),
    );
    expect(messages(remote)).toContain(
      "names.names.0.audioUrl: must be a local /audio/ file",
    );
  });

  it("requires the enumeration source to exist", () => {
    const sources = clone(sourcesFile);
    sources.enumerationSourceId = "missing-source";
    expect(messages(namesFile, sources)).toContain(
      'sources.enumerationSourceId: unknown source "missing-source"',
    );
  });

  it("rejects non-https source links", () => {
    const sources = clone(sourcesFile);
    sources.sources[0].url = "javascript:alert(1)";
    expect(
      messages(namesFile, sources).some((m) =>
        m.startsWith("sources.sources.0.url"),
      ),
    ).toBe(true);
  });

  it("summarises every issue when asserting", () => {
    const file = namesWith((n) => (n[1].id = n[0].id));
    expect(() => assertValidContent(file, sourcesFile)).toThrow(/duplicate id/);
  });
});

describe("content accessors", () => {
  it("looks up Names and their sources", () => {
    const name = getNameById("ar-rahman");
    expect(name?.order).toBe(1);
    expect(getSourcesFor(name!).map((s) => s.id)).toEqual(name!.sourceIds);
    expect(getNameById("missing")).toBeUndefined();
  });

  it("finds neighbours at the edges of the list", () => {
    expect(getAdjacentNames(NAMES[0]).previous).toBeUndefined();
    expect(getAdjacentNames(NAMES[0]).next?.order).toBe(2);
    expect(getAdjacentNames(NAMES[98]).next).toBeUndefined();
  });

  it("picks one Name per calendar day", () => {
    const morning = new Date(2026, 8, 13, 6);
    const evening = new Date(2026, 8, 13, 22);
    const nextDay = new Date(2026, 8, 14, 6);
    expect(getNameOfTheDay(morning).id).toBe(getNameOfTheDay(evening).id);
    expect(getNameOfTheDay(nextDay).id).not.toBe(getNameOfTheDay(morning).id);
  });
});

describe("search", () => {
  const rahman = getNameById("ar-rahman")!;

  it("normalises transliteration", () => {
    expect(latinKey("Ar-Raḥmān")).toBe("arrahman");
    expect(latinKey("Al-ʿAzīz")).toBe("alaziz");
  });

  it("normalises Arabic vowel marks", () => {
    expect(arabicKey("الرَّحْمَٰنُ")).toBe("الرحمن");
  });

  it("matches transliteration, meaning, Arabic and number", () => {
    expect(matchesQuery(rahman, "rahman")).toBe(true);
    expect(matchesQuery(rahman, "Ar Rahman")).toBe(true);
    expect(matchesQuery(rahman, "compassion")).toBe(true);
    expect(matchesQuery(rahman, "الرحمن")).toBe(true);
    expect(matchesQuery(rahman, "1")).toBe(true);
    expect(matchesQuery(rahman, "11")).toBe(false);
    expect(matchesQuery(rahman, "king")).toBe(false);
    expect(matchesQuery(rahman, "  ")).toBe(true);
  });
});
