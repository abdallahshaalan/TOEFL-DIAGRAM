import { getStudyCaps, getMeta, getAllProgress, getIncludeDrafts, localDateKey } from "@/lib/db";
import { isBuriedOrSuspended, isDue, isEligibleAsNewCard, isNewProgress } from "@/lib/srs";
import { getLibraryWordsSync } from "@/lib/vocabCatalog";

/**
 * Build a review queue: due cards first (capped), then new cards up to daily new cap.
 * Does NOT burn newCardsIntroduced — that happens on first rateWord of a new card.
 * @param {"all"|"toefl"|"business"|"general"} filter
 * @param {{ includeDrafts?: boolean }} [opts]
 */
export async function buildReviewQueue(filter = "all", opts = {}) {
  const caps = await getStudyCaps();
  const includeDrafts =
    opts.includeDrafts != null ? opts.includeDrafts : await getIncludeDrafts();
  const today = localDateKey();
  const introMeta = (await getMeta("newCardsIntroduced", {})) || {};
  const introducedToday =
    introMeta.date === today
      ? introMeta.byLibrary || { toefl: 0, business: 0, general: 0 }
      : { toefl: 0, business: 0, general: 0 };

  const allProgress = await getAllProgress();
  const progressById = new Map(allProgress.map((p) => [`${p.library}::${p.wordId}`, p]));
  const now = Date.now();

  let progress = allProgress;
  if (filter && filter !== "all") {
    progress = allProgress.filter((p) => p.library === filter);
  }

  const due = progress
    .filter(
      (p) =>
        !isNewProgress(p) &&
        !isBuriedOrSuspended(p, now) &&
        isDue(p, now)
    )
    .sort((a, b) => (a.nextReviewAt || 0) - (b.nextReviewAt || 0))
    .slice(0, caps.reviewsPerDay);

  const libraries =
    filter && filter !== "all" ? [filter] : ["toefl", "business", "general"];

  const news = [];
  const selectionIntroduced = { ...introducedToday };

  for (const library of libraries) {
    const remaining = Math.max(
      0,
      caps.newCardsPerDay - (selectionIntroduced[library] || 0)
    );
    if (remaining <= 0) continue;
    const words = getLibraryWordsSync(library) || [];
    let fresh = words.filter((w) => {
      const p = progressById.get(`${library}::${w.id}`);
      return isEligibleAsNewCard(p, now);
    });
    if (!includeDrafts) {
      fresh = fresh.filter((w) => w.quality !== "draft" && w.quality !== "legacy");
    } else {
      fresh = fresh.filter((w) => w.quality !== "legacy");
    }
    const preferred = [
      ...fresh.filter((w) => w.quality !== "draft"),
      ...fresh.filter((w) => w.quality === "draft"),
    ];
    for (const w of preferred.slice(0, remaining)) {
      news.push({
        library,
        wordId: w.id,
        word: w,
        mastery: 0,
        nextReviewAt: null,
        isNewCard: true,
      });
      selectionIntroduced[library] = (selectionIntroduced[library] || 0) + 1;
    }
  }

  return {
    queue: [...due.map((p) => ({ ...p, isNewCard: false })), ...news],
    caps,
    introducedToday,
  };
}
