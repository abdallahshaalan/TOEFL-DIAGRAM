import { describe, expect, it } from "vitest";
import { localDateKey } from "../dateKey";
import { shouldRequeueInSession } from "../srs";

describe("localDateKey", () => {
  it("formats local calendar date", () => {
    const d = new Date(2026, 10, 18, 23, 30, 0); // Nov 18 local
    expect(localDateKey(d)).toBe("2026-11-18");
  });
});

describe("Good learning requeue window", () => {
  it("Good 15m step is within session requeue", () => {
    const now = 1_000_000;
    expect(shouldRequeueInSession({ nextReviewAt: now + 15 * 60 * 1000 }, now)).toBe(true);
  });
});
