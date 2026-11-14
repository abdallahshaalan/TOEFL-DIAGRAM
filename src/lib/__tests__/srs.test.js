import { describe, expect, it } from "vitest";
import { applyRating, createEmptyProgress, isDue, RATING } from "../srs";

describe("SRS applyRating", () => {
  it("schedules again quickly and resets reps", () => {
    const base = createEmptyProgress("w1", "toefl");
    const afterGood = applyRating(base, RATING.GOOD, 1_000_000);
    const again = applyRating(afterGood, RATING.AGAIN, 2_000_000);
    expect(again.reps).toBe(0);
    expect(again.lapses).toBe(1);
    expect(again.nextReviewAt).toBe(2_000_000 + 10 * 60 * 1000);
    expect(again.mastery).toBe(RATING.AGAIN);
  });

  it("increases interval on good ratings", () => {
    let p = createEmptyProgress("w2", "toefl");
    p = applyRating(p, RATING.GOOD, 0);
    expect(p.intervalDays).toBe(1);
    p = applyRating(p, RATING.GOOD, 1);
    expect(p.intervalDays).toBe(3);
    p = applyRating(p, RATING.EASY, 2);
    expect(p.intervalDays).toBeGreaterThan(3);
    expect(p.mastery).toBe(RATING.EASY);
  });

  it("isDue respects nextReviewAt", () => {
    const p = createEmptyProgress("w3", "general");
    expect(isDue(p, 100)).toBe(true);
    const scheduled = { ...p, nextReviewAt: 500 };
    expect(isDue(scheduled, 400)).toBe(false);
    expect(isDue(scheduled, 600)).toBe(true);
  });
});
