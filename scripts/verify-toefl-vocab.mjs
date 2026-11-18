/**
 * Verify TOEFL vocabulary quality gates (structural — does not invent content).
 * Run: node scripts/verify-toefl-vocab.mjs
 */
import toeflVocabulary from "../src/data/toeflVocabulary.js";
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

for (const w of toeflVocabulary) {
  if (!w.translationAr || !w.definitionEn || !w.exampleEn) incomplete += 1;
  if (!w.quality) missingQuality += 1;
  const q = w.quality || assessWordQuality(w);
  if (q === "draft") draft += 1;
  if (hasArabicScript(w.translationAr)) arabicOk += 1;
  if (hitsTemplatePhrase(w) || isBoilerplateDefinition(w)) templateHits += 1;
  if (w.quality === "ok" && hitsTemplatePhrase(w)) okWithTemplate += 1;
  if (!w.phonetic) phoneticNull += 1;
}

const report = {
  total: toeflVocabulary.length,
  draft,
  ok: toeflVocabulary.length - draft,
  draftPct: Math.round((draft / Math.max(toeflVocabulary.length, 1)) * 100),
  arabicOk,
  templateHits,
  okWithTemplate,
  incompleteFieldRows: incomplete,
  missingQuality,
  phoneticNull,
  phoneticFilled: toeflVocabulary.length - phoneticNull,
  okGate:
    toeflVocabulary.length >= 450 &&
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
