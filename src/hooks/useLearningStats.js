import { useCallback, useEffect, useState } from "react";
import {
  LIBRARY_DAILY_GOAL,
  getActivityRange,
  getAllBookmarks,
  getAllProgress,
  getMeta,
  migrateBusinessProgressV1,
  migrateLegacyLocalStorage,
  unlockBusinessMilestones,
} from "@/lib/db";
import { LIBRARIES, libraryReviewsField } from "@/lib/libraries";
import { isDue, isNewProgress, isStable, retentionBucket } from "@/lib/srs";
import { getLibraryTotals } from "@/lib/vocabCatalog";

function libraryDayStreak(activity, reviewsKey) {
  let streak = 0;
  for (let i = activity.length - 1; i >= 0; i -= 1) {
    const a = activity[i];
    if ((a[reviewsKey] || 0) > 0) streak += 1;
    else if (i < activity.length - 1) break;
  }
  return streak;
}

export function useLearningStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    await migrateLegacyLocalStorage();
    await migrateBusinessProgressV1();
    const [progress, bookmarks, activity, totals] = await Promise.all([
      getAllProgress(),
      getAllBookmarks(),
      getActivityRange(30),
      getLibraryTotals(),
    ]);

    const ratedProgress = progress.filter((p) => !isNewProgress(p));
    const due = progress.filter((p) => isDue(p));
    const businessDue = due.filter((p) => p.library === "business");
    const learning = ratedProgress.filter((p) => retentionBucket(p) === "learning");
    const stable = progress.filter((p) => isStable(p));
    const leeches = progress.filter((p) => retentionBucket(p) === "leech");

    const today = activity[activity.length - 1];
    let streak = 0;
    for (let i = activity.length - 1; i >= 0; i -= 1) {
      const a = activity[i];
      if ((a.ratings || 0) + (a.reviews || 0) > 0) streak += 1;
      else if (i < activity.length - 1) break;
    }

    const libraryStats = {};
    for (const lib of LIBRARIES) {
      const practiced = ratedProgress.filter((p) => p.library === lib.id).length;
      const reviewsKey = libraryReviewsField(lib.id);
      const todayCount = today?.[reviewsKey] || 0;
      libraryStats[`${lib.id}Practiced`] = practiced;
      libraryStats[`${lib.id}Total`] = totals[`${lib.id}Total`] || 0;
      libraryStats[`${lib.id}Today`] = todayCount;
      libraryStats[`${lib.id}Streak`] = libraryDayStreak(activity, reviewsKey);
      libraryStats[`${lib.id}GoalDone`] = todayCount >= LIBRARY_DAILY_GOAL;
    }

    const businessProgress = ratedProgress.filter((p) => p.library === "business");
    const { unlocked, newly } = await unlockBusinessMilestones(businessProgress.length);
    const previousToast = (await getMeta("businessMilestoneToastIds", [])) || [];
    const pendingToasts = newly.filter((m) => !previousToast.includes(m));

    const masteryDist = [0, 1, 2, 3, 4].map((level) => ({
      level: String(level),
      count: ratedProgress.filter((p) => (p.mastery || 0) === level).length,
    }));

    setStats({
      progress,
      bookmarks,
      activity,
      ...libraryStats,
      dueCount: due.length,
      businessDueCount: businessDue.length,
      difficultCount: learning.length,
      learningCount: learning.length,
      masteredCount: stable.length,
      stableCount: stable.length,
      leechCount: leeches.length,
      todayPracticed: today?.ratings || today?.reviews || 0,
      libraryGoal: LIBRARY_DAILY_GOAL,
      businessGoal: LIBRARY_DAILY_GOAL,
      businessMilestones: unlocked,
      businessMilestoneToasts: pendingToasts,
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
