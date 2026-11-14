import { useCallback, useEffect, useState } from "react";
import {
  getActivityRange,
  getAllBookmarks,
  getAllProgress,
  migrateLegacyLocalStorage,
} from "@/lib/db";
import { isDue } from "@/lib/srs";
import { getLibraryTotals } from "@/lib/vocabCatalog";

export function useLearningStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    await migrateLegacyLocalStorage();
    const [progress, bookmarks, activity, totals] = await Promise.all([
      getAllProgress(),
      getAllBookmarks(),
      getActivityRange(14),
      getLibraryTotals(),
    ]);

    const toeflProgress = progress.filter((p) => p.library === "toefl");
    const generalProgress = progress.filter((p) => p.library === "general");
    const due = progress.filter((p) => isDue(p));
    const difficult = progress.filter((p) => p.mastery === 1 || p.mastery === 2);
    const mastered = progress.filter((p) => p.mastery === 4);

    const today = activity[activity.length - 1];
    let streak = 0;
    for (let i = activity.length - 1; i >= 0; i -= 1) {
      const a = activity[i];
      if ((a.practiced || 0) + (a.reviews || 0) + (a.quizzes || 0) > 0) streak += 1;
      else if (i < activity.length - 1) break;
    }

    const masteryDist = [0, 1, 2, 3, 4].map((level) => ({
      level: String(level),
      count: progress.filter((p) => (p.mastery || 0) === level).length,
    }));

    setStats({
      progress,
      bookmarks,
      activity,
      toeflTotal: totals.toeflTotal,
      generalTotal: totals.generalTotal,
      toeflPracticed: toeflProgress.length,
      generalPracticed: generalProgress.length,
      dueCount: due.length,
      difficultCount: difficult.length,
      masteredCount: mastered.length,
      todayPracticed: (today?.practiced || 0) + (today?.reviews || 0) + (today?.quizzes || 0),
      streak,
      masteryDist,
      due,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, stats, refresh };
}
