import { describe, expect, it } from "vitest";
import { getGeneralUniqueByWord, normalizeGeneralEntry } from "../vocabAdapters";

describe("vocabAdapters", () => {
  it("normalizes legacy entries without dropping fields", () => {
    const n = normalizeGeneralEntry(
      {
        word: "abundant",
        arabic: "وفير",
        english: "Resources are abundant.",
        level: "C1",
        arabic_example: "الموارد وفيرة.",
      },
      "batch1",
      0
    );
    expect(n.library).toBe("general");
    expect(n.translationAr).toBe("وفير");
    expect(n.exampleEn).toContain("abundant");
    expect(n.difficulty).toBe("C1");
    expect(n.id).toContain("general_abundant");
    expect(n.quality).toBe("legacy");
  });

  it("returns unique general words from seed data", () => {
    const unique = getGeneralUniqueByWord();
    expect(unique.length).toBeGreaterThan(2000);
    const set = new Set(unique.map((w) => w.word.toLowerCase()));
    expect(set.size).toBe(unique.length);
  });
});
