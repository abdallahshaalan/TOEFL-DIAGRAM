import { describe, expect, it } from "vitest";
import {
  buildPracticeUrl,
  buildReviewUrl,
  normalizeHeadword,
  parsePracticeSearch,
} from "@/lib/practiceUrl";
import { buildBusinessCategoryStats } from "@/lib/businessCategoryStats";

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

  it("builds review url", () => {
    expect(buildReviewUrl({ library: "business" })).toBe("/review?library=business");
  });

  it("normalizes headwords for spelling", () => {
    expect(normalizeHeadword("  Cash   Flow ")).toBe("cash flow");
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
      ["business::a", { mastery: 4, nextReviewAt: Date.now() - 1000 }],
      ["business::b", { mastery: 1, nextReviewAt: Date.now() + 99999999 }],
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
