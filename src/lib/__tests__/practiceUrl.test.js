import { describe, expect, it } from "vitest";
import {
  buildPracticeUrl,
  buildReviewUrl,
  normalizeHeadword,
  parsePracticeSearch,
} from "@/lib/practiceUrl";
import { buildBusinessCategoryStats } from "@/lib/businessCategoryStats";
import { findExamPack, getExamPacks } from "@/lib/examPacks";

describe("practiceUrl", () => {
  it("builds and parses practice deep links", () => {
    const url = buildPracticeUrl({
      library: "business",
      category: "accounting",
      mode: "scenario",
      count: 12,
      focus: "struggling",
      autostart: true,
    });
    expect(url).toContain("/practice?");
    const parsed = parsePracticeSearch(url.split("?")[1]);
    expect(parsed.library).toBe("business");
    expect(parsed.category).toBe("accounting");
    expect(parsed.mode).toBe("scenario");
    expect(parsed.count).toBe("12");
    expect(parsed.focus).toBe("struggling");
    expect(parsed.autostart).toBe(true);
  });

  it("builds coach CTAs for every library", () => {
    for (const library of ["toefl", "business", "general"]) {
      const url = buildPracticeUrl({
        library,
        mode: "flashcards",
        focus: "due",
        count: 10,
        autostart: true,
      });
      const parsed = parsePracticeSearch(url.split("?")[1]);
      expect(parsed.library).toBe(library);
      expect(parsed.focus).toBe("due");
      expect(parsed.autostart).toBe(true);
      expect(buildReviewUrl({ library })).toBe(`/review?library=${library}`);
    }
  });

  it("builds review url", () => {
    expect(buildReviewUrl({ library: "business" })).toBe("/review?library=business");
  });

  it("normalizes headwords for spelling", () => {
    expect(normalizeHeadword("  Cash   Flow ")).toBe("cash flow");
  });
});

describe("examPacks", () => {
  it("resolves packs across libraries", () => {
    expect(getExamPacks("toefl").length).toBeGreaterThan(0);
    expect(getExamPacks("general").length).toBeGreaterThan(0);
    expect(findExamPack("reading-vocab")?.library).toBe("toefl");
    expect(findExamPack("accounting-101")?.library).toBe("business");
    expect(findExamPack("topics-core")?.library).toBe("general");
  });
});

describe("businessCategoryStats", () => {
  it("computes practiced mastered struggling due", () => {
    const words = [
      { id: "a", categories: ["finance"] },
      { id: "b", categories: ["finance"] },
      { id: "c", categories: ["marketing"] },
    ];
    const meta = [
      { id: "finance", labelEn: "Finance", labelAr: "تمويل" },
      { id: "marketing", labelEn: "Marketing", labelAr: "تسويق" },
    ];
    const progressMap = new Map([
      [
        "business::a",
        {
          mastery: 4,
          reps: 5,
          intervalDays: 14,
          lapses: 0,
          history: [{ rating: 4, at: 1 }],
          lastReviewedAt: 1,
          nextReviewAt: Date.now() - 1000,
        },
      ],
      [
        "business::b",
        {
          mastery: 1,
          reps: 1,
          intervalDays: 1,
          history: [{ rating: 1, at: 1 }],
          lastReviewedAt: 1,
          nextReviewAt: Date.now() + 99999999,
        },
      ],
    ]);
    const stats = buildBusinessCategoryStats(words, meta, progressMap);
    const finance = stats.find((s) => s.id === "finance");
    expect(finance.count).toBe(2);
    expect(finance.practiced).toBe(2);
    expect(finance.mastered).toBe(1);
    expect(finance.struggling).toBe(1);
    expect(finance.due).toBe(1);
  });
});
