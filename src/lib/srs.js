/** Simplified SM-2 spaced repetition with learning steps + leech flag */

export const RATING = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
};

export const LEECH_LAPSES = 4;

/** Learning step delays (ms) before graduating to day intervals */
const LEARN_STEP_MS = {
  again: 1 * 60 * 1000,
  hard: 10 * 60 * 1000,
  good: 15 * 60 * 1000,
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
    learningStep: 0,
    leech: false,
    suspended: false,
    buriedUntil: null,
    nextReviewAt: null,
    lastReviewedAt: null,
    history: [],
  };
}

export function isLeech(progress) {
  if (!progress) return false;
  if (progress.leech) return true;
  return (progress.lapses || 0) >= LEECH_LAPSES;
}

/**
 * Stable retention: enough successful reps + multi-day interval + decent last rating.
 * Stored `mastery` remains last rating only.
 */
export function isStable(progress) {
  if (!progress || isLeech(progress)) return false;
  return (
    (progress.reps || 0) >= 3 &&
    (progress.intervalDays || 0) >= 7 &&
    (progress.mastery || 0) >= 3
  );
}

/** @returns {"new"|"learning"|"stable"|"leech"} */
export function retentionBucket(progress) {
  if (!progress || !(progress.reps || 0) && !(progress.history || []).length) {
    if (!progress || (!progress.lastReviewedAt && !progress.nextReviewAt)) return "new";
  }
  if (isLeech(progress)) return "leech";
  if (isStable(progress)) return "stable";
  if (!(progress.reps || 0) && !(progress.history || []).length) return "new";
  return "learning";
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
  let learningStep = progress.learningStep || 0;

  if (rating === RATING.AGAIN) {
    lapses += 1;
    reps = 0;
    intervalDays = 0;
    learningStep = 0;
    ease = Math.max(1.3, ease - 0.2);
    next.nextReviewAt = now + LEARN_STEP_MS.again;
  } else if (learningStep < 2 && rating !== RATING.EASY) {
    // Learning steps: short requeues before graduating to day intervals
    if (rating === RATING.HARD) {
      ease = Math.max(1.3, ease - 0.15);
      next.nextReviewAt = now + LEARN_STEP_MS.hard;
      learningStep = Math.max(0, learningStep);
    } else {
      learningStep += 1;
      if (learningStep < 2) {
        next.nextReviewAt = now + LEARN_STEP_MS.good;
      } else {
        reps += 1;
        intervalDays = 1;
        next.nextReviewAt = now + intervalDays * 24 * 60 * 60 * 1000;
      }
    }
  } else {
    reps += 1;
    learningStep = 2;
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
  next.learningStep = learningStep;
  next.leech = lapses >= LEECH_LAPSES;
  return next;
}

export function isNewProgress(progress) {
  return !progress || (!(progress.history || []).length && !progress.lastReviewedAt);
}

/**
 * Eligible as a "new" card in the review queue:
 * no progress row, or unrated shell that is not buried/suspended.
 */
export function isEligibleAsNewCard(progress, now = Date.now()) {
  if (!progress) return true;
  if (!isNewProgress(progress)) return false;
  return !isBuriedOrSuspended(progress, now);
}

/** True when card should be excluded from review/practice queues. */
export function isBuriedOrSuspended(progress, now = Date.now()) {
  if (!progress) return false;
  if (progress.suspended) return true;
  if (progress.buriedUntil && progress.buriedUntil > now) return true;
  return false;
}

/** Local 4:00 AM tomorrow (or next 4:00 if already past today's). */
export function buryUntilTimestamp(now = Date.now()) {
  const d = new Date(now);
  d.setHours(4, 0, 0, 0);
  if (d.getTime() <= now) d.setDate(d.getDate() + 1);
  return d.getTime();
}

/** Same-session learning requeue window (ms). */
export const SESSION_REQUEUE_MS = 20 * 60 * 1000;

export function shouldRequeueInSession(progress, now = Date.now()) {
  if (!progress?.nextReviewAt) return false;
  const delta = progress.nextReviewAt - now;
  return delta >= 0 && delta <= SESSION_REQUEUE_MS;
}

/**
 * Schedule-due: has study history AND a due nextReviewAt.
 * Unseen / new / buried / suspended / null nextReviewAt are NOT due.
 */
export function isDue(progress, now = Date.now()) {
  if (!progress || isNewProgress(progress)) return false;
  if (isBuriedOrSuspended(progress, now)) return false;
  if (!progress.nextReviewAt) return false;
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
