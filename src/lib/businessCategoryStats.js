import { isDue } from "@/lib/srs";

/**
 * Build per-discipline stats for the business library.
 * @param {object[]} words business word list
 * @param {object[]} categoryMeta from businessCategories
 * @param {Map<string, object>} progressMap keys `${library}::${wordId}`
 * @param {string} [library="business"]
 */
export function buildBusinessCategoryStats(
  words,
  categoryMeta,
  progressMap,
  library = "business"
) {
  return (categoryMeta || []).map((meta) => {
    const inCat = (words || []).filter((w) => (w.categories || []).includes(meta.id));
    let practiced = 0;
    let struggling = 0;
    let mastered = 0;
    let due = 0;

    for (const w of inCat) {
      const p = progressMap.get(`${library}::${w.id}`);
      if (!p) continue;
      practiced += 1;
      const m = p.mastery || 0;
      if (m <= 2) struggling += 1;
      if (m === 4) mastered += 1;
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

export function summarizeBusinessProgress(words, progressMap, library = "business") {
  let practiced = 0;
  let struggling = 0;
  let due = 0;
  let mastered = 0;
  for (const w of words || []) {
    const p = progressMap.get(`${library}::${w.id}`);
    if (!p) continue;
    practiced += 1;
    if ((p.mastery || 0) <= 2) struggling += 1;
    if ((p.mastery || 0) === 4) mastered += 1;
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
