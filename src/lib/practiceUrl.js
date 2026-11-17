/** Build / parse Practice page deep-link query params. */

const VALID_LIBRARIES = new Set(["toefl", "business", "general"]);
const VALID_MODES = new Set([
  "flashcards",
  "quiz",
  "cloze",
  "recognition",
  "writing",
  "scenario",
  "spelling",
]);
const VALID_FOCUS = new Set(["", "struggling", "due", "bookmarked"]);

/**
 * @param {object} opts
 * @returns {string} path with query, e.g. /practice?library=business&...
 */
export function buildPracticeUrl(opts = {}) {
  const params = new URLSearchParams();
  if (opts.library && VALID_LIBRARIES.has(opts.library)) {
    params.set("library", opts.library);
  }
  if (opts.mode && VALID_MODES.has(opts.mode)) params.set("mode", opts.mode);
  if (opts.category) params.set("category", String(opts.category));
  if (opts.count != null && opts.count !== "") params.set("count", String(opts.count));
  if (opts.focus && VALID_FOCUS.has(opts.focus)) params.set("focus", opts.focus);
  if (opts.pack) params.set("pack", String(opts.pack));
  if (opts.autostart) params.set("autostart", "1");
  if (opts.difficulties?.length) params.set("difficulties", opts.difficulties.join(","));
  const q = params.toString();
  return q ? `/practice?${q}` : "/practice";
}

/**
 * @param {URLSearchParams|string} search
 */
export function parsePracticeSearch(search) {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;

  const libraryRaw = params.get("library") || "";
  const modeRaw = params.get("mode") || "";
  const focusRaw = params.get("focus") || "";
  const countRaw = params.get("count");
  const countNum = countRaw ? Number(countRaw) : NaN;

  return {
    library: VALID_LIBRARIES.has(libraryRaw) ? libraryRaw : null,
    mode: VALID_MODES.has(modeRaw) ? modeRaw : null,
    category: params.get("category") || "",
    count: Number.isFinite(countNum) && countNum >= 5 && countNum <= 50 ? String(countNum) : null,
    focus: VALID_FOCUS.has(focusRaw) ? focusRaw : "",
    pack: params.get("pack") || "",
    autostart: params.get("autostart") === "1",
    difficulties: (params.get("difficulties") || "")
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean),
  };
}

export function buildReviewUrl({ library } = {}) {
  if (library && VALID_LIBRARIES.has(library)) {
    return `/review?library=${encodeURIComponent(library)}`;
  }
  return "/review";
}

/** Normalize spelling answers for comparison */
export function normalizeHeadword(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
