/** Simplified SM-2 spaced repetition */

export const RATING = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
};

export function createEmptyProgress(wordId, library) {
  return {
    wordId,
    library,
    mastery: 0,
    ease: 2.5,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
    nextReviewAt: null,
    lastReviewedAt: null,
    history: [],
  };
}

/**
 * @param {object} progress existing progress record
 * @param {1|2|3|4} rating
 * @param {number} [now]
 */
export function applyRating(progress, rating, now = Date.now()) {
  const next = {
    ...progress,
    history: [
      ...(progress.history || []).slice(-49),
      { rating, at: now },
    ],
    lastReviewedAt: now,
    mastery: rating,
  };

  let { ease, intervalDays, reps, lapses } = progress;

  if (rating === RATING.AGAIN) {
    lapses += 1;
    reps = 0;
    intervalDays = 0;
    ease = Math.max(1.3, ease - 0.2);
    next.nextReviewAt = now + 10 * 60 * 1000; // 10 minutes
  } else {
    reps += 1;
    if (rating === RATING.HARD) {
      ease = Math.max(1.3, ease - 0.15);
      intervalDays = reps === 1 ? 1 : Math.max(1, Math.round(intervalDays * 1.2));
    } else if (rating === RATING.GOOD) {
      ease = ease + 0.0;
      intervalDays = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(intervalDays * ease);
    } else {
      ease = ease + 0.15;
      intervalDays = reps === 1 ? 2 : reps === 2 ? 5 : Math.round(intervalDays * ease * 1.3);
    }
    next.nextReviewAt = now + intervalDays * 24 * 60 * 60 * 1000;
  }

  next.ease = Math.round(ease * 100) / 100;
  next.intervalDays = intervalDays;
  next.reps = reps;
  next.lapses = lapses;
  return next;
}

export function isDue(progress, now = Date.now()) {
  if (!progress || !progress.nextReviewAt) return true;
  return progress.nextReviewAt <= now;
}

export function masteryLabel(mastery) {
  switch (mastery) {
    case 1:
      return "again";
    case 2:
      return "hard";
    case 3:
      return "good";
    case 4:
      return "easy";
    default:
      return "new";
  }
}
