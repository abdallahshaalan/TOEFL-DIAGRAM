import { describe, expect, it } from "vitest";
import { searchVocabulary } from "../search";

const words = [
  {
    id: "toefl_analyze",
    library: "toefl",
    word: "analyze",
    translationAr: "يحلل",
    definitionEn: "Break into parts",
    synonyms: ["examine"],
    categories: ["academic-verbs"],
    difficulty: "B2",
    pos: "verb",
  },
  {
    id: "toefl_however",
    library: "toefl",
    word: "however",
    translationAr: "مع ذلك",
    definitionEn: "In contrast",
    synonyms: ["nevertheless"],
    categories: ["academic-connectors"],
    difficulty: "B1",
    pos: "connector",
  },
];

describe("searchVocabulary", () => {
  it("finds English words fuzzily", () => {
    const res = searchVocabulary(words, "analize");
    expect(res.some((w) => w.word === "analyze")).toBe(true);
  });

  it("finds Arabic translations", () => {
    const res = searchVocabulary(words, "يحلل");
    expect(res[0].word).toBe("analyze");
  });

  it("filters by category", () => {
    const res = searchVocabulary(words, "", { category: "academic-connectors" });
    expect(res).toHaveLength(1);
    expect(res[0].word).toBe("however");
  });
});
