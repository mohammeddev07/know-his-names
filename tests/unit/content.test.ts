import { describe, expect, it } from "vitest";
import namesFile from "@/content/names/names.json";

describe("bundled content", () => {
  it("contains ninety-nine Names", () => {
    expect(namesFile.names).toHaveLength(99);
  });
});
