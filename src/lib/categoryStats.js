import { isDue, isNewProgress, isStable } from "@/lib/srs";

/**
 * Build per-category stats for any library.
 * @param {object[]} words
 * @param {object[]} categoryMeta
 * @param {Map<string, object>} progressMap keys `${library}::${wordId}`
 * @param {string} library
 */
export function buildCategoryStats(words, categoryMeta, progressMap, library) {
  return (categoryMeta || []).map((meta) => {
    const inCat = (words || []).filter((w) => (w.categories || []).includes(meta.id));
    let practiced = 0;
    let struggling = 0;
    let mastered = 0;
    let due = 0;

    for (const w of inCat) {
      const p = progressMap.get(`${library}::${w.id}`);
      if (!p || isNewProgress(p)) continue;
      practiced += 1;
      const m = p.mastery || 0;
      if (m <= 2) struggling += 1;
      if (isStable(p)) mastered += 1;
      if (isDue(p)) due += 1;
    }

    const weak =
      inCat.length > 0 && practiced >= 3 && struggling / Math.max(practiced, 1) >= 0.4;

    return {
      ...meta,
      count: inCat.length,
      practiced,
      struggling,
      mastered,
      due,
      weak,
      progressPct: inCat.length ? Math.round((practiced / inCat.length) * 100) : 0,
    };
  });
}

export function summarizeLibraryProgress(words, progressMap, library) {
  let practiced = 0;
  let struggling = 0;
  let due = 0;
  let mastered = 0;
  for (const w of words || []) {
    const p = progressMap.get(`${library}::${w.id}`);
    if (!p || isNewProgress(p)) continue;
    practiced += 1;
    if ((p.mastery || 0) <= 2) struggling += 1;
    if (isStable(p)) mastered += 1;
    if (isDue(p)) due += 1;
  }
  return {
    total: words?.length || 0,
    practiced,
    struggling,
    due,
    mastered,
  };
}

/** @deprecated use buildCategoryStats */
export function buildBusinessCategoryStats(words, categoryMeta, progressMap, library = "business") {
  return buildCategoryStats(words, categoryMeta, progressMap, library);
}

/** @deprecated use summarizeLibraryProgress */
export function summarizeBusinessProgress(words, progressMap, library = "business") {
  return summarizeLibraryProgress(words, progressMap, library);
}
