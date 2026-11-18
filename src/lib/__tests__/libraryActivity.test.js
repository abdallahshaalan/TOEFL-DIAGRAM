import { describe, expect, it } from "vitest";
import { libraryActivityDelta, libraryPracticedKey, libraryReviewsDelta, libraryReviewsKey } from "@/lib/db";

describe("library-scoped activity helpers", () => {
  it("maps daily goal keys to reviews", () => {
    expect(libraryReviewsKey("toefl")).toBe("toeflReviews");
    expect(libraryReviewsKey("business")).toBe("businessReviews");
    expect(libraryReviewsKey("general")).toBe("generalReviews");
    // practiced key aliases to reviews for goal compatibility
    expect(libraryPracticedKey("toefl")).toBe("toeflReviews");
  });

  it("rateWord-style delta only bumps reviews", () => {
    expect(libraryReviewsDelta("business", 1)).toEqual({ businessReviews: 1 });
    expect(libraryReviewsDelta("toefl", 1)).toEqual({ toeflReviews: 1 });
  });

  it("legacy practiced+reviews delta still works", () => {
    expect(libraryActivityDelta("business", 1, 1)).toEqual({
      businessPracticed: 1,
      businessReviews: 1,
    });
  });
});
