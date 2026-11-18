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
    const toeflProgress = ratedProgress.filter((p) => p.library === "toefl");
    const businessProgress = ratedProgress.filter((p) => p.library === "business");
    const generalProgress = ratedProgress.filter((p) => p.library === "general");
    const due = progress.filter((p) => isDue(p));
    const businessDue = due.filter((p) => p.library === "business");
    const difficult = ratedProgress.filter(
      (p) => retentionBucket(p) === "learning" && (p.mastery || 0) <= 2
    );
    const stable = progress.filter((p) => isStable(p));
    const leeches = progress.filter((p) => retentionBucket(p) === "leech");

    const today = activity[activity.length - 1];
    let streak = 0;
    for (let i = activity.length - 1; i >= 0; i -= 1) {
      const a = activity[i];
      if ((a.ratings || 0) + (a.reviews || 0) > 0) streak += 1;
      else if (i < activity.length - 1) break;
    }

    const toeflToday = today?.toeflReviews || 0;
    const businessToday = today?.businessReviews || 0;
    const generalToday = today?.generalReviews || 0;
    const toeflStreak = libraryDayStreak(activity, "toeflReviews");
    const businessStreak = libraryDayStreak(activity, "businessReviews");
    const generalStreak = libraryDayStreak(activity, "generalReviews");

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
      toeflTotal: totals.toeflTotal,
      businessTotal: totals.businessTotal,
      generalTotal: totals.generalTotal,
      // Lifetime "touched" = progress rows (any SRS history), not retention
      toeflPracticed: toeflProgress.length,
      businessPracticed: businessProgress.length,
      generalPracticed: generalProgress.length,
      dueCount: due.length,
      businessDueCount: businessDue.length,
      difficultCount: difficult.length,
      masteredCount: stable.length,
      stableCount: stable.length,
      leechCount: leeches.length,
      // Honest today: rating events only
      todayPracticed: today?.ratings || today?.reviews || 0,
      toeflToday,
      businessToday,
      generalToday,
      libraryGoal: LIBRARY_DAILY_GOAL,
      businessGoal: LIBRARY_DAILY_GOAL,
      toeflGoalDone: toeflToday >= LIBRARY_DAILY_GOAL,
      businessGoalDone: businessToday >= LIBRARY_DAILY_GOAL,
      generalGoalDone: generalToday >= LIBRARY_DAILY_GOAL,
      toeflStreak,
      businessStreak,
      generalStreak,
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
