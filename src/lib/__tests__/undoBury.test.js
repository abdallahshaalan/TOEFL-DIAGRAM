import { beforeEach, describe, expect, it } from "vitest";
import "fake-indexeddb/auto";
import {
  buryWord,
  getDb,
  getNewCardsIntroducedToday,
  getProgress,
  rateWord,
  saveProgress,
  suspendWord,
  undoLastRating,
} from "@/lib/db";
import { isDue, isBuriedOrSuspended, RATING, shouldRequeueInSession } from "@/lib/srs";

describe("undo / bury / suspend", () => {
  beforeEach(async () => {
    const db = await getDb();
    await Promise.all([
      db.clear("progress"),
      db.clear("bookmarks"),
      db.clear("activity"),
      db.clear("meta"),
    ]);
  });

  it("undo restores previous progress and new-card count", async () => {
    await rateWord("toefl", "w_new", RATING.GOOD);
    expect((await getNewCardsIntroducedToday()).toefl).toBe(1);
    expect(await getProgress("toefl", "w_new")).toBeTruthy();

    const snap = await undoLastRating();
    expect(snap).toBeTruthy();
    expect(await getProgress("toefl", "w_new")).toBeUndefined();
    expect((await getNewCardsIntroducedToday()).toefl).toBe(0);
  });

  it("bury excludes from isDue", async () => {
    await rateWord("toefl", "w_due", RATING.GOOD);
    let p = await getProgress("toefl", "w_due");
    await saveProgress({ ...p, nextReviewAt: Date.now() - 1000 });
    p = await getProgress("toefl", "w_due");
    expect(isDue(p)).toBe(true);

    p = await buryWord("toefl", "w_due");
    expect(isBuriedOrSuspended(p)).toBe(true);
    expect(isDue(p)).toBe(false);
  });

  it("suspend excludes from isDue", async () => {
    await rateWord("business", "w_s", RATING.HARD);
    let p = await getProgress("business", "w_s");
    await saveProgress({ ...p, nextReviewAt: Date.now() - 1000 });
    p = await suspendWord("business", "w_s");
    expect(p.suspended).toBe(true);
    expect(isDue(p)).toBe(false);
  });

  it("shouldRequeueInSession detects short learning steps", () => {
    const now = 1_000_000;
    expect(
      shouldRequeueInSession({ nextReviewAt: now + 5 * 60 * 1000 }, now)
    ).toBe(true);
    expect(
      shouldRequeueInSession({ nextReviewAt: now + 60 * 60 * 1000 }, now)
    ).toBe(false);
  });
});
