import { describe, expect, it } from "vitest";
import {
  applyRating,
  createEmptyProgress,
  isDue,
  isStable,
  retentionBucket,
  RATING,
} from "../srs";

describe("SRS applyRating", () => {
  it("schedules again on a short learning step and resets reps", () => {
    const base = createEmptyProgress("w1", "toefl");
    const afterGood = applyRating(base, RATING.GOOD, 1_000_000);
    const again = applyRating(afterGood, RATING.AGAIN, 2_000_000);
    expect(again.reps).toBe(0);
    expect(again.lapses).toBe(1);
    expect(again.nextReviewAt).toBe(2_000_000 + 1 * 60 * 1000);
    expect(again.mastery).toBe(RATING.AGAIN);
    expect(again.learningStep).toBe(0);
  });

  it("uses learning steps before graduating intervals", () => {
    let p = createEmptyProgress("w2", "toefl");
    p = applyRating(p, RATING.GOOD, 0);
    expect(p.learningStep).toBe(1);
    expect(p.intervalDays).toBe(0);
    expect(p.nextReviewAt).toBe(15 * 60 * 1000);
    p = applyRating(p, RATING.GOOD, 1);
    expect(p.reps).toBe(1);
    expect(p.intervalDays).toBe(1);
    p = applyRating(p, RATING.GOOD, 2);
    expect(p.intervalDays).toBe(3);
    p = applyRating(p, RATING.EASY, 3);
    expect(p.intervalDays).toBeGreaterThan(3);
    expect(p.mastery).toBe(RATING.EASY);
  });

  it("isDue excludes new/unseen and respects nextReviewAt", () => {
    const p = createEmptyProgress("w3", "general");
    expect(isDue(p, 100)).toBe(false);
    expect(isDue(null, 100)).toBe(false);
    const scheduled = {
      ...p,
      nextReviewAt: 500,
      lastReviewedAt: 1,
      history: [{ rating: 3, at: 1 }],
    };
    expect(isDue(scheduled, 400)).toBe(false);
    expect(isDue(scheduled, 600)).toBe(true);
    const noSchedule = {
      ...p,
      lastReviewedAt: 1,
      history: [{ rating: 3, at: 1 }],
      nextReviewAt: null,
    };
    expect(isDue(noSchedule, 1000)).toBe(false);
  });

  it("marks leeches and stable retention honestly", () => {
    const learning = applyRating(createEmptyProgress("a", "toefl"), RATING.GOOD, 0);
    expect(retentionBucket(learning)).toBe("learning");
    expect(isStable(learning)).toBe(false);

    const stable = {
      ...createEmptyProgress("b", "toefl"),
      reps: 5,
      intervalDays: 14,
      mastery: 3,
      lapses: 0,
      history: [{ rating: 3, at: 1 }],
    };
    expect(isStable(stable)).toBe(true);
    expect(retentionBucket(stable)).toBe("stable");

    const leech = applyRating(
      { ...createEmptyProgress("c", "toefl"), lapses: 3, history: [{ rating: 3, at: 1 }] },
      RATING.AGAIN,
      10
    );
    expect(leech.leech).toBe(true);
    expect(retentionBucket(leech)).toBe("leech");
  });
});
