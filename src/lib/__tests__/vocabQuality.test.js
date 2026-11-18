import { describe, expect, it } from "vitest";
import {
  arabicChoiceLabel,
  arabicChoiceRtl,
  assessWordQuality,
  hasArabicScript,
  isArabicAnswerSafe,
} from "@/lib/vocabQuality";

describe("vocabQuality", () => {
  it("detects Arabic script", () => {
    expect(hasArabicScript("تمويل")).toBe(true);
    expect(hasArabicScript("Finance")).toBe(false);
  });

  it("marks Latin translationAr as draft", () => {
    expect(
      assessWordQuality({
        translationAr: "Cash Flow",
        definitionEn: "Money moving in and out of a business over time.",
        explanationEn: "Used in statements of liquidity.",
        exampleEn: "Free cash flow rose this quarter.",
      })
    ).toBe("draft");
  });

  it("marks template phrases as draft", () => {
    expect(
      assessWordQuality({
        translationAr: "قانون",
        definitionEn: "The antitrust regulation sets rules or duties that guide lawful and ethical business conduct.",
        explanationEn: "Other text",
        exampleEn: "Regional leads compared antitrust regulation across markets.",
      })
    ).toBe("draft");
  });

  it("never presents Latin as Arabic choice label", () => {
    const w = { translationAr: "NPV", definitionEn: "Net present value", word: "NPV" };
    expect(isArabicAnswerSafe(w)).toBe(false);
    expect(arabicChoiceLabel(w)).toBe("Net present value");
    expect(arabicChoiceRtl(w)).toBe(false);
  });

  it("marks AWL boilerplate and def=example clones as draft", () => {
    expect(
      assessWordQuality({
        translationAr: "يحلل",
        definitionEn: "To examine carefully.",
        explanationEn: "High-frequency in AWL reading and writing tasks.",
        exampleEn: "Scholars analyze the data.",
      })
    ).toBe("draft");
    expect(
      assessWordQuality({
        translationAr: "يحلل",
        definitionEn: "Scholars analyze the data carefully in every chapter.",
        explanationEn: "Other note",
        exampleEn: "Scholars analyze the data carefully in every chapter.",
      })
    ).toBe("draft");
  });
});
