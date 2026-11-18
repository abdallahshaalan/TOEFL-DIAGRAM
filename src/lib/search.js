import Fuse from "fuse.js";
import { isDue, isNewProgress } from "@/lib/srs";

const OPTIONS = {
  keys: [
    { name: "word", weight: 0.35 },
    { name: "translationAr", weight: 0.25 },
    { name: "definitionEn", weight: 0.15 },
    { name: "explanationEn", weight: 0.1 },
    { name: "exampleEn", weight: 0.05 },
    { name: "synonyms", weight: 0.05 },
    { name: "categories", weight: 0.05 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  includeScore: true,
};

const indexCache = new WeakMap();

export function createVocabIndex(words) {
  let fuse = indexCache.get(words);
  if (!fuse) {
    fuse = new Fuse(words, OPTIONS);
    indexCache.set(words, fuse);
  }
  return fuse;
}

export function searchVocabulary(words, query, filters = {}) {
  const q = (query || "").trim();
  let results = words;

  if (q) {
    results = createVocabIndex(words).search(q).map((r) => r.item);
  }

  if (filters.library) {
    results = results.filter((w) => w.library === filters.library);
  }
  if (filters.pos) {
    results = results.filter(
      (w) => (w.pos || "").toLowerCase() === filters.pos.toLowerCase()
    );
  }
  if (filters.difficulty) {
    results = results.filter((w) => w.difficulty === filters.difficulty);
  }
  if (filters.category) {
    results = results.filter((w) =>
      (w.categories || []).some(
        (c) => String(c).toLowerCase() === filters.category.toLowerCase()
      )
    );
  }
  if (filters.masteryBucket && filters.masteryMap) {
    results = results.filter((w) => {
      const p = filters.masteryMap.get(`${w.library}::${w.id}`);
      const m = p?.mastery ?? 0;
      switch (filters.masteryBucket) {
        case "new":
          return isNewProgress(p);
        case "struggling":
          return !isNewProgress(p) && (m === 1 || m === 2);
        case "good":
          return m === 3;
        case "easy":
          return m === 4;
        default:
          return true;
      }
    });
  }
  if (filters.mastery !== undefined && filters.mastery !== null && filters.mastery !== "" && filters.masteryMap) {
    results = results.filter((w) => {
      const p = filters.masteryMap.get(`${w.library}::${w.id}`);
      const m = p?.mastery ?? 0;
      return m === Number(filters.mastery);
    });
  }
  if (filters.dueOnly && filters.masteryMap) {
    const now = Date.now();
    results = results.filter((w) => {
      const p = filters.masteryMap.get(`${w.library}::${w.id}`);
      return isDue(p, now);
    });
  }
  if (filters.excludeDraft) {
    results = results.filter((w) => w.quality !== "draft");
  }
  if (filters.draftOnly) {
    results = results.filter((w) => w.quality === "draft");
  }
  if (filters.leechOnly && filters.masteryMap) {
    results = results.filter((w) => {
      const p = filters.masteryMap.get(`${w.library}::${w.id}`);
      return p?.leech || (p?.lapses || 0) >= 4;
    });
  }
  if (filters.bookmarkedOnly && filters.bookmarkSet) {
    results = results.filter((w) => filters.bookmarkSet.has(w.id));
  }

  return results;
}
