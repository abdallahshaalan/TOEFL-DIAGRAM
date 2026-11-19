/**
 * Verify Everyday vocabulary quality gates (structural — does not invent content).
 * Run: node scripts/verify-everyday-vocab.mjs
 */
import everydayVocabulary from "../src/data/everydayVocabulary.js";
import {
  assessWordQuality,
  hasArabicScript,
  hitsTemplatePhrase,
  isBoilerplateDefinition,
} from "../src/lib/vocabQuality.js";

let incomplete = 0;
let draft = 0;
let arabicOk = 0;
let templateHits = 0;
let missingQuality = 0;
let phoneticNull = 0;
let okWithTemplate = 0;
const hist = {};

for (const w of everydayVocabulary) {
  const c = w.categories?.[0] || "unknown";
  hist[c] = (hist[c] || 0) + 1;
  if (!w.translationAr || !w.definitionEn || !w.exampleEn) incomplete += 1;
  if (!w.quality) missingQuality += 1;
  const q = w.quality || assessWordQuality(w);
  if (q === "draft") draft += 1;
  if (hasArabicScript(w.translationAr)) arabicOk += 1;
  if (hitsTemplatePhrase(w) || isBoilerplateDefinition(w)) templateHits += 1;
  if (w.quality === "ok" && (hitsTemplatePhrase(w) || isBoilerplateDefinition(w))) {
    okWithTemplate += 1;
  }
  if (w.phonetic === null || w.phonetic === undefined) phoneticNull += 1;
}

const report = {
  total: everydayVocabulary.length,
  draft,
  ok: everydayVocabulary.length - draft,
  draftPct: Math.round((draft / Math.max(everydayVocabulary.length, 1)) * 100),
  arabicOk,
  templateHits,
  okWithTemplate,
  incompleteFieldRows: incomplete,
  missingQuality,
  phoneticNull,
  categoryDistribution: hist,
  okGate:
    everydayVocabulary.length >= 430 &&
    incomplete === 0 &&
    missingQuality === 0 &&
    okWithTemplate === 0,
};

console.log(JSON.stringify(report, null, 2));
if (!report.okGate) {
  console.error("VERIFY FAILED");
  process.exit(1);
}
console.log("VERIFY OK");