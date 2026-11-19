import { beforeEach, describe, expect, it, vi } from "vitest";
import "fake-indexeddb/auto";

vi.mock("@/lib/vocabCatalog", () => ({
  getLibraryWordsSync: (library) => {
    if (library === "toefl") {
      return [
        { id: "toefl_a", word: "alpha", quality: "ok" },
        { id: "toefl_b", word: "beta", quality: "ok" },
        { id: "toefl_c", word: "gamma", quality: "draft" },
      ];
    }
    return [];
  },
  ensureLibrary: async () => [],
}));

import {
  buryWord,
  getDb,
  getMeta,
  getNewCardsIntroducedToday,
  rateWord,
  saveProgress,
  setStudyCaps,
} from "@/lib/db";
import { buildReviewQueue } from "@/lib/reviewQueue";
import { createEmptyProgress, RATING } from "@/lib/srs";

describe("buildReviewQueue new-card accounting", () => {
  beforeEach(async () => {
    const db = await getDb();
    await Promise.all([
      db.clear("progress"),
      db.clear("bookmarks"),
      db.clear("activity"),
      db.clear("meta"),
    ]);
    await setStudyCaps({ newCardsPerDay: 2, reviewsPerDay: 50 });
  });

  it("does not burn newCardsIntroduced when building the queue", async () => {
    const first = await buildReviewQueue("toefl", { includeDrafts: false });
    expect(first.queue.filter((c) => c.isNewCard).length).toBe(2);
    expect(await getMeta("newCardsIntroduced", null)).toBeNull();

    const second = await buildReviewQueue("toefl", { includeDrafts: false });
    expect(second.queue.filter((c) => c.isNewCard).length).toBe(2);
    expect(await getNewCardsIntroducedToday()).toEqual({
      toefl: 0,
      business: 0,
      everyday: 0,
      general: 0,
    });
  });

  it("counts new cards only on first rateWord", async () => {
    const { queue } = await buildReviewQueue("toefl", { includeDrafts: false });
    const news = queue.filter((c) => c.isNewCard);
    expect(news.length).toBe(2);

    await rateWord("toefl", news[0].wordId, RATING.GOOD);
    expect((await getNewCardsIntroducedToday()).toefl).toBe(1);

    const after = await buildReviewQueue("toefl", { includeDrafts: false });
    expect(after.queue.filter((c) => c.isNewCard).length).toBe(1);

    await rateWord("toefl", news[0].wordId, RATING.GOOD);
    expect((await getNewCardsIntroducedToday()).toefl).toBe(1);
  });

  it("hides drafts from new cards when includeDrafts is false", async () => {
    await setStudyCaps({ newCardsPerDay: 10, reviewsPerDay: 50 });
    const { queue } = await buildReviewQueue("toefl", { includeDrafts: false });
    const ids = queue.filter((c) => c.isNewCard).map((c) => c.wordId);
    expect(ids).toEqual(["toefl_a", "toefl_b"]);
  });

  it("re-includes bury shells as new after bury expires", async () => {
    await setStudyCaps({ newCardsPerDay: 10, reviewsPerDay: 50 });
    await buryWord("toefl", "toefl_a", Date.now());
    let { queue } = await buildReviewQueue("toefl", { includeDrafts: false });
    expect(queue.filter((c) => c.isNewCard).map((c) => c.wordId)).not.toContain("toefl_a");

    const shell = createEmptyProgress("toefl_a", "toefl");
    await saveProgress({ ...shell, buriedUntil: Date.now() - 1000 });
    ({ queue } = await buildReviewQueue("toefl", { includeDrafts: false }));
    expect(queue.filter((c) => c.isNewCard).map((c) => c.wordId)).toContain("toefl_a");
  });
});
