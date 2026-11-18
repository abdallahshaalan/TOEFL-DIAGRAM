import { openDB } from "idb";
import { localDateKey } from "./dateKey";
import {
  applyRating,
  buryUntilTimestamp,
  createEmptyProgress,
  isNewProgress,
} from "./srs";

export { localDateKey };

const DB_NAME = "toefl-companion";
const DB_VERSION = 1;

let dbPromise;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("progress")) {
          const store = db.createObjectStore("progress", { keyPath: "id" });
          store.createIndex("library", "library");
          store.createIndex("nextReviewAt", "nextReviewAt");
        }
        if (!db.objectStoreNames.contains("bookmarks")) {
          const store = db.createObjectStore("bookmarks", { keyPath: "id" });
          store.createIndex("library", "library");
        }
        if (!db.objectStoreNames.contains("activity")) {
          db.createObjectStore("activity", { keyPath: "date" });
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

function progressKey(library, wordId) {
  return `${library}::${wordId}`;
}

export async function getProgress(library, wordId) {
  const db = await getDb();
  return db.get("progress", progressKey(library, wordId));
}

export async function getAllProgress(library) {
  const db = await getDb();
  if (!library) return db.getAll("progress");
  return db.getAllFromIndex("progress", "library", library);
}

export async function saveProgress(record) {
  const db = await getDb();
  const id = progressKey(record.library, record.wordId);
  await db.put("progress", { ...record, id });
  return { ...record, id };
}

/**
 * Persist an SRS rating and bump honest activity counters.
 * Semantics:
 * - `ratings` / `reviews` = one SRS rating event (global)
 * - library `*Reviews` = rating events for that library (daily goal counter)
 * - Do NOT bump library `*Practiced` here (legacy field; avoid double-count)
 * - First rating of a new card bumps `newCardsIntroduced` for the day
 */
export async function rateWord(library, wordId, rating) {
  const existing =
    (await getProgress(library, wordId)) || createEmptyProgress(wordId, library);
  const wasNew = isNewProgress(existing);
  const previousSnapshot = { ...existing, history: [...(existing.history || [])] };
  const updated = applyRating(existing, rating);
  await saveProgress(updated);
  const delta = { reviews: 1, ratings: 1, ...libraryReviewsDelta(library, 1) };
  await bumpActivity(delta);
  let newCardBump = false;
  if (wasNew) {
    await bumpNewCardsIntroduced(library);
    newCardBump = true;
  }
  await setMeta("lastRatingUndo", {
    library,
    wordId,
    previousProgress: previousSnapshot,
    activityDelta: delta,
    newCardBump,
    at: Date.now(),
  });
  return updated;
}

/** Increment today's new-card intro count for a library (on first rating only). */
export async function bumpNewCardsIntroduced(library) {
  const today = localDateKey();
  const introMeta = (await getMeta("newCardsIntroduced", {})) || {};
  const byLibrary =
    introMeta.date === today
      ? { ...(introMeta.byLibrary || { toefl: 0, business: 0, general: 0 }) }
      : { toefl: 0, business: 0, general: 0 };
  byLibrary[library] = (byLibrary[library] || 0) + 1;
  await setMeta("newCardsIntroduced", { date: today, byLibrary });
  return byLibrary;
}

export async function getNewCardsIntroducedToday() {
  const today = localDateKey();
  const introMeta = (await getMeta("newCardsIntroduced", {})) || {};
  if (introMeta.date !== today) {
    return { toefl: 0, business: 0, general: 0 };
  }
  return introMeta.byLibrary || { toefl: 0, business: 0, general: 0 };
}

/** Default: hide draft-quality words from study queues. */
export async function getIncludeDrafts() {
  return Boolean(await getMeta("includeDrafts", false));
}

export async function setIncludeDrafts(value) {
  await setMeta("includeDrafts", Boolean(value));
  return Boolean(value);
}

async function decrementNewCardsIntroduced(library) {
  const today = localDateKey();
  const introMeta = (await getMeta("newCardsIntroduced", {})) || {};
  if (introMeta.date !== today) return;
  const byLibrary = { ...(introMeta.byLibrary || {}) };
  byLibrary[library] = Math.max(0, (byLibrary[library] || 0) - 1);
  await setMeta("newCardsIntroduced", { date: today, byLibrary });
}

/**
 * One-step undo of the last rateWord (restores progress + reverses activity/new-card bump).
 */
export async function undoLastRating() {
  const snap = await getMeta("lastRatingUndo", null);
  if (!snap?.library || !snap?.wordId || !snap?.previousProgress) return null;

  const db = await getDb();
  const id = progressKey(snap.library, snap.wordId);
  const prev = snap.previousProgress;

  if (isNewProgress(prev)) {
    await db.delete("progress", id);
  } else {
    await saveProgress({ ...prev, library: snap.library, wordId: snap.wordId });
  }

  const d = snap.activityDelta || {};
  await bumpActivity({
    reviews: -(d.reviews || 0),
    ratings: -(d.ratings || 0),
    toeflReviews: -(d.toeflReviews || 0),
    businessReviews: -(d.businessReviews || 0),
    generalReviews: -(d.generalReviews || 0),
  });

  if (snap.newCardBump) {
    await decrementNewCardsIntroduced(snap.library);
  }

  await setMeta("lastRatingUndo", null);
  return snap;
}

export async function buryWord(library, wordId, now = Date.now()) {
  const existing =
    (await getProgress(library, wordId)) || createEmptyProgress(wordId, library);
  const updated = {
    ...existing,
    buriedUntil: buryUntilTimestamp(now),
  };
  await saveProgress(updated);
  return updated;
}

export async function suspendWord(library, wordId) {
  const existing =
    (await getProgress(library, wordId)) || createEmptyProgress(wordId, library);
  const updated = { ...existing, suspended: true };
  await saveProgress(updated);
  return updated;
}

export async function unsuspendWord(library, wordId) {
  const existing = await getProgress(library, wordId);
  if (!existing) return null;
  const updated = { ...existing, suspended: false, buriedUntil: null };
  await saveProgress(updated);
  return updated;
}

/** Rating-event delta for library daily goals (not unique-word practiced). */
export function libraryReviewsDelta(library, reviews = 1) {
  if (library === "toefl") return { toeflReviews: reviews };
  if (library === "business") return { businessReviews: reviews };
  if (library === "general") return { generalReviews: reviews };
  return {};
}

/** @deprecated use libraryReviewsDelta — practiced no longer bumped on rate */
export function libraryActivityDelta(library, practiced = 0, reviews = 0) {
  const base = libraryReviewsDelta(library, reviews);
  if (!practiced) return base;
  if (library === "toefl") return { ...base, toeflPracticed: practiced };
  if (library === "business") return { ...base, businessPracticed: practiced };
  if (library === "general") return { ...base, generalPracticed: practiced };
  return base;
}

/** @deprecated Daily goals use libraryReviewsKey */
export function libraryPracticedKey(library) {
  return libraryReviewsKey(library);
}

/** Daily library goal counter key (SRS rating events). */
export function libraryReviewsKey(library) {
  if (library === "toefl") return "toeflReviews";
  if (library === "business") return "businessReviews";
  if (library === "general") return "generalReviews";
  return null;
}

/** Study schedule caps (IndexedDB meta). */
export const DEFAULT_NEW_CARDS_PER_DAY = 10;
export const DEFAULT_REVIEWS_PER_DAY = 50;
export const LEECH_LAPSES = 4;

export async function getStudyCaps() {
  const [newCards, reviews] = await Promise.all([
    getMeta("newCardsPerDay", DEFAULT_NEW_CARDS_PER_DAY),
    getMeta("reviewsPerDay", DEFAULT_REVIEWS_PER_DAY),
  ]);
  return {
    newCardsPerDay: Number(newCards) > 0 ? Number(newCards) : DEFAULT_NEW_CARDS_PER_DAY,
    reviewsPerDay: Number(reviews) > 0 ? Number(reviews) : DEFAULT_REVIEWS_PER_DAY,
  };
}

export async function setStudyCaps({ newCardsPerDay, reviewsPerDay } = {}) {
  if (newCardsPerDay != null) await setMeta("newCardsPerDay", Number(newCardsPerDay));
  if (reviewsPerDay != null) await setMeta("reviewsPerDay", Number(reviewsPerDay));
  return getStudyCaps();
}

export async function getBookmark(library, wordId) {
  const db = await getDb();
  return db.get("bookmarks", progressKey(library, wordId));
}

export async function getAllBookmarks(library) {
  const db = await getDb();
  if (!library) return db.getAll("bookmarks");
  return db.getAllFromIndex("bookmarks", "library", library);
}

export async function toggleBookmark(library, wordId, snapshot = {}) {
  const db = await getDb();
  const id = progressKey(library, wordId);
  const existing = await db.get("bookmarks", id);
  if (existing) {
    await db.delete("bookmarks", id);
    return false;
  }
  await db.put("bookmarks", {
    id,
    library,
    wordId,
    word: snapshot.word || wordId,
    translationAr: snapshot.translationAr || "",
    savedAt: Date.now(),
  });
  return true;
}

export const LIBRARY_DAILY_GOAL = 15;
/** @deprecated use LIBRARY_DAILY_GOAL */
export const BUSINESS_DAILY_GOAL = LIBRARY_DAILY_GOAL;
export const BUSINESS_MILESTONES = [50, 100, 250, 500];

const EMPTY_ACTIVITY = {
  reviews: 0,
  ratings: 0,
  quizzes: 0,
  practiced: 0,
  toeflPracticed: 0,
  toeflReviews: 0,
  businessPracticed: 0,
  businessReviews: 0,
  generalPracticed: 0,
  generalReviews: 0,
};

export async function bumpActivity(delta = {}) {
  const db = await getDb();
  const date = localDateKey();
  const current = (await db.get("activity", date)) || { date, ...EMPTY_ACTIVITY };
  const next = {
    ...current,
    reviews: current.reviews + (delta.reviews || 0),
    ratings: current.ratings + (delta.ratings || 0),
    quizzes: current.quizzes + (delta.quizzes || 0),
    practiced: current.practiced + (delta.practiced || 0),
    toeflPracticed: (current.toeflPracticed || 0) + (delta.toeflPracticed || 0),
    toeflReviews: (current.toeflReviews || 0) + (delta.toeflReviews || 0),
    businessPracticed: (current.businessPracticed || 0) + (delta.businessPracticed || 0),
    businessReviews: (current.businessReviews || 0) + (delta.businessReviews || 0),
    generalPracticed: (current.generalPracticed || 0) + (delta.generalPracticed || 0),
    generalReviews: (current.generalReviews || 0) + (delta.generalReviews || 0),
  };
  await db.put("activity", next);
  return next;
}

export async function getActivityRange(days = 14) {
  const db = await getDb();
  const all = await db.getAll("activity");
  const map = new Map(all.map((a) => [a.date, a]));
  const result = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    result.push(map.get(key) || { date: key, ...EMPTY_ACTIVITY });
  }
  return result;
}

/** Toast goal completion once per library per local day */
export async function maybeCelebrateLibraryGoal(library, todayCount) {
  if (todayCount < LIBRARY_DAILY_GOAL) return false;
  const today = localDateKey();
  const metaKey = `${library}GoalToastDate`;
  const already = await getMeta(metaKey, null);
  if (already === today) return false;
  await setMeta(metaKey, today);
  return true;
}

/** @deprecated use maybeCelebrateLibraryGoal("business", count) */
export async function maybeCelebrateBusinessGoal(todayCount) {
  return maybeCelebrateLibraryGoal("business", todayCount);
}

export async function unlockBusinessMilestones(practicedCount) {
  const unlocked = (await getMeta("businessMilestonesUnlocked", [])) || [];
  const newly = [];
  for (const m of BUSINESS_MILESTONES) {
    if (practicedCount >= m && !unlocked.includes(m)) {
      unlocked.push(m);
      newly.push(m);
    }
  }
  if (newly.length) await setMeta("businessMilestonesUnlocked", unlocked);
  return { unlocked, newly };
}

export async function getMeta(key, fallback = null) {
  const db = await getDb();
  const row = await db.get("meta", key);
  return row ? row.value : fallback;
}

export async function setMeta(key, value) {
  const db = await getDb();
  await db.put("meta", { key, value });
}

export async function exportLearningData() {
  const db = await getDb();
  const [progress, bookmarks, activity, meta] = await Promise.all([
    db.getAll("progress"),
    db.getAll("bookmarks"),
    db.getAll("activity"),
    db.getAll("meta"),
  ]);
  return {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    progress,
    bookmarks,
    activity,
    meta,
  };
}

export async function importLearningData(payload, { overwrite = false } = {}) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid backup file");
  }
  const db = await getDb();
  const tx = db.transaction(["progress", "bookmarks", "activity", "meta"], "readwrite");

  if (overwrite) {
    await Promise.all([
      tx.objectStore("progress").clear(),
      tx.objectStore("bookmarks").clear(),
      tx.objectStore("activity").clear(),
      tx.objectStore("meta").clear(),
    ]);
  }

  for (const row of payload.progress || []) {
    if (!row?.id && row?.library && row?.wordId) {
      row.id = progressKey(row.library, row.wordId);
    }
    if (row?.id) await tx.objectStore("progress").put(row);
  }
  for (const row of payload.bookmarks || []) {
    if (row?.id) await tx.objectStore("bookmarks").put(row);
  }
  for (const row of payload.activity || []) {
    if (row?.date) await tx.objectStore("activity").put(row);
  }
  for (const row of payload.meta || []) {
    if (row?.key) await tx.objectStore("meta").put(row);
  }

  await tx.done;
  return true;
}

/** Migrate legacy localStorage favorites into IndexedDB bookmarks once */
export async function migrateLegacyLocalStorage() {
  const done = await getMeta("legacyMigratedV1", false);
  if (done) return { migrated: false };

  const maps = [
    { key: "lovedVocabs", library: "general" },
    { key: "lovedVocabs2", library: "general" },
  ];

  let count = 0;
  for (const { key, library } of maps) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const items = JSON.parse(raw);
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        if (!item?.word) continue;
        const wordId = `general_${String(item.word).toLowerCase().replace(/\s+/g, "_")}`;
        const existing = await getBookmark(library, wordId);
        if (!existing) {
          await toggleBookmark(library, wordId, {
            word: item.word,
            translationAr: item.arabic || item.translationAr || "",
          });
          count += 1;
        }
      }
    } catch {
      /* ignore corrupt keys */
    }
  }

  await setMeta("legacyMigratedV1", true);
  return { migrated: true, count };
}

/**
 * Copy general progress/bookmarks onto matching business word IDs once.
 * Does not overwrite existing business records or delete general keys.
 */
export async function migrateBusinessProgressV1() {
  const done = await getMeta("businessProgressMigratedV1", false);
  if (done) return { migrated: false };

  const { ensureLibrary, getLibraryWordsSync } = await import("./vocabCatalog");
  await ensureLibrary("business");
  await ensureLibrary("general");

  const businessList = getLibraryWordsSync("business") || [];
  const generalList = getLibraryWordsSync("general") || [];

  const norm = (w) =>
    String(w || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

  const businessByWord = new Map(businessList.map((w) => [norm(w.word), w]));
  const generalByWord = new Map();
  for (const w of generalList) {
    const key = norm(w.word);
    if (!generalByWord.has(key)) generalByWord.set(key, w);
  }

  let progressCopied = 0;
  let bookmarksCopied = 0;

  for (const [key, bizWord] of businessByWord) {
    const genWord = generalByWord.get(key);
    if (!genWord) continue;

    const existingBizProgress = await getProgress("business", bizWord.id);
    if (!existingBizProgress) {
      const genProgress = await getProgress("general", genWord.id);
      if (genProgress) {
        await saveProgress({
          ...genProgress,
          id: undefined,
          library: "business",
          wordId: bizWord.id,
        });
        progressCopied += 1;
      }
    }

    const existingBizBm = await getBookmark("business", bizWord.id);
    if (!existingBizBm) {
      const genBm = await getBookmark("general", genWord.id);
      if (genBm) {
        await toggleBookmark("business", bizWord.id, {
          word: bizWord.word,
          translationAr: bizWord.translationAr || genBm.translationAr || "",
        });
        bookmarksCopied += 1;
      }
    }
  }

  await setMeta("businessProgressMigratedV1", true);
  return { migrated: true, progressCopied, bookmarksCopied };
}
