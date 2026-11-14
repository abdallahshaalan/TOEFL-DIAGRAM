import { openDB } from "idb";
import { applyRating, createEmptyProgress } from "./srs";

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
          const store = db.createObjectStore("activity", { keyPath: "date" });
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

export async function rateWord(library, wordId, rating) {
  const existing =
    (await getProgress(library, wordId)) || createEmptyProgress(wordId, library);
  const updated = applyRating(existing, rating);
  await saveProgress(updated);
  await bumpActivity({ reviews: 1, ratings: 1 });
  return updated;
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

export async function bumpActivity(delta = {}) {
  const db = await getDb();
  const date = new Date().toISOString().slice(0, 10);
  const current = (await db.get("activity", date)) || {
    date,
    reviews: 0,
    ratings: 0,
    quizzes: 0,
    practiced: 0,
  };
  const next = {
    ...current,
    reviews: current.reviews + (delta.reviews || 0),
    ratings: current.ratings + (delta.ratings || 0),
    quizzes: current.quizzes + (delta.quizzes || 0),
    practiced: current.practiced + (delta.practiced || 0),
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
    const key = d.toISOString().slice(0, 10);
    result.push(
      map.get(key) || { date: key, reviews: 0, ratings: 0, quizzes: 0, practiced: 0 }
    );
  }
  return result;
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
