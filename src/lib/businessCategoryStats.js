import {
  buildCategoryStats,
  summarizeLibraryProgress,
} from "@/lib/categoryStats";

/** @deprecated Prefer `@/lib/categoryStats` — kept for existing imports. */
export function buildBusinessCategoryStats(
  words,
  categoryMeta,
  progressMap,
  library = "business"
) {
  return buildCategoryStats(words, categoryMeta, progressMap, library);
}

/** @deprecated Prefer `@/lib/categoryStats` — kept for existing imports. */
export function summarizeBusinessProgress(words, progressMap, library = "business") {
  return summarizeLibraryProgress(words, progressMap, library);
}

export { buildCategoryStats, summarizeLibraryProgress };
