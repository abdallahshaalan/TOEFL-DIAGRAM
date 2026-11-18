import { beforeEach, describe, expect, it } from "vitest";
import "fake-indexeddb/auto";
import { exportLearningData, getDb, importLearningData, rateWord } from "@/lib/db";
import { RATING } from "@/lib/srs";

describe("importLearningData", () => {
  beforeEach(async () => {
    // Reset idb between tests
    const db = await getDb();
    await Promise.all([
      db.clear("progress"),
      db.clear("bookmarks"),
      db.clear("activity"),
      db.clear("meta"),
    ]);
  });

  it("merges progress from a real backup payload", async () => {
    await rateWord("toefl", "toefl_analyze", RATING.GOOD);
    const backup = await exportLearningData();
    expect(backup.progress.length).toBeGreaterThan(0);

    await importLearningData(
      {
        progress: [
          {
            id: "business::biz_test",
            library: "business",
            wordId: "biz_test",
            mastery: 3,
            ease: 2.5,
            intervalDays: 1,
            reps: 1,
            lapses: 0,
            history: [{ rating: 3, at: Date.now() }],
          },
        ],
        bookmarks: [],
      },
      { overwrite: false }
    );

    const again = await exportLearningData();
    expect(again.progress.some((p) => p.wordId === "toefl_analyze")).toBe(true);
    expect(again.progress.some((p) => p.wordId === "biz_test")).toBe(true);
  });

  it("overwrite clears previous progress", async () => {
    await rateWord("general", "g1", RATING.HARD);
    await importLearningData(
      {
        progress: [
          {
            id: "toefl::only",
            library: "toefl",
            wordId: "only",
            mastery: 4,
            ease: 2.6,
            intervalDays: 2,
            reps: 1,
            lapses: 0,
            history: [],
          },
        ],
        bookmarks: [],
        activity: [],
        meta: [],
      },
      { overwrite: true }
    );
    const data = await exportLearningData();
    expect(data.progress).toHaveLength(1);
    expect(data.progress[0].wordId).toBe("only");
  });
});
