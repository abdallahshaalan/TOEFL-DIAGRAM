/** Business / TOEFL vocab content quality helpers (no invented definitions). */

const ARABIC_SCRIPT = /[\u0600-\u06FF]/;
const LATIN_LETTER = /[A-Za-z]/;
const TEMPLATE_PHRASES = [
  "sets rules or duties that guide lawful and ethical business conduct",
  "is a standard analytics term used in study and workplace practice",
  "regional leads compared",
  "standard analytics term",
  // TOEFL expand-bank filler templates
  "used to qualify claims with the quality of being",
  "when describing processes in academic papers",
  "carry out the action of",
  "your essay should",
  "the passage will",
  "high-frequency in awl",
  "awl reading and writing tasks",
];

const WEAK_SYNONYM_PAIR = new Set(["apply", "use"]);

export function hasArabicScript(text) {
  return ARABIC_SCRIPT.test(String(text || ""));
}

/** Latin-only gloss (no Arabic letters) — not a real AR translation. */
export function isLatinOnlyTranslation(text) {
  const s = String(text || "").trim();
  if (!s) return true;
  if (hasArabicScript(s)) return false;
  return LATIN_LETTER.test(s);
}

export function hitsTemplatePhrase(word) {
  const blob = `${word?.definitionEn || ""} ${word?.explanationEn || ""} ${word?.exampleEn || ""}`.toLowerCase();
  return TEMPLATE_PHRASES.some((p) => blob.includes(p));
}

export function isBoilerplateDefinition(word) {
  const def = String(word?.definitionEn || "").trim();
  const exp = String(word?.explanationEn || "").trim();
  const example = String(word?.exampleEn || "").trim();
  if (!def) return true;
  if (def && example && def === example) return true;
  if (def && exp && def === exp) {
    if (def.length < 48) return true;
    if (/^an?\s+.+\s+is a standard/i.test(def)) return true;
    if (/sets rules or duties/i.test(def)) return true;
  }
  return false;
}

/** Placeholder synonym pairs that appear on expand-bank filler rows. */
export function hasWeakSynonymPair(word) {
  const syns = (word?.synonyms || []).map((s) => String(s).toLowerCase().trim());
  if (syns.length < 2) return false;
  const set = new Set(syns);
  return [...WEAK_SYNONYM_PAIR].every((s) => set.has(s)) && syns.length <= 3;
}

/**
 * @returns {"ok"|"draft"}
 */
export function assessWordQuality(word) {
  if (!word) return "draft";
  if (isLatinOnlyTranslation(word.translationAr)) return "draft";
  if (!hasArabicScript(word.translationAr)) return "draft";
  if (hitsTemplatePhrase(word)) return "draft";
  if (isBoilerplateDefinition(word)) return "draft";
  if (hasWeakSynonymPair(word)) return "draft";
  if (!word.definitionEn || !word.exampleEn) return "draft";
  return "ok";
}

/** Eligible for Practice / Review new cards / exam packs. */
export function isStudyQualityOk(word) {
  if (!word) return false;
  if (word.quality === "draft" || word.quality === "legacy") return false;
  if (word.quality === "ok") return true;
  // Untagged curated rows: assess live
  return assessWordQuality(word) === "ok";
}

/** Safe for Arabic MCQ when translation contains Arabic script. */
export function isArabicAnswerSafe(word) {
  return hasArabicScript(word?.translationAr);
}

/** Prefer real Arabic labels; never present Latin translationAr as Arabic. */
export function arabicChoiceLabel(word) {
  if (hasArabicScript(word?.translationAr)) return word.translationAr;
  return word?.definitionEn || word?.word || "";
}

export function arabicChoiceRtl(word) {
  return hasArabicScript(word?.translationAr);
}
