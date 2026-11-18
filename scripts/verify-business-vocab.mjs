/**
 * Verify inventory coverage + content quality gates for business vocabulary.
 * Run: node scripts/verify-business-vocab.mjs
 */
import inventory from "./vocab/business/inventory.json" with { type: "json" };
import businessVocabulary from "../src/data/businessVocabulary.js";
import {
  assessWordQuality,
  hasArabicScript,
  hitsTemplatePhrase,
  isBoilerplateDefinition,
} from "../src/lib/vocabQuality.js";

function norm(word) {
  return String(word || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

const bank = new Set(businessVocabulary.map((w) => norm(w.word)));
const missing = [];
for (const item of inventory.items) {
  if (!bank.has(norm(item.word))) missing.push(item.word);
}

const recovered = businessVocabulary.filter((w) => w.provenance === "recovered-general").length;
const curated = businessVocabulary.filter((w) => w.provenance === "curated-business").length;

const hist = {};
let incomplete = 0;
let draft = 0;
let arabicOk = 0;
let templateHits = 0;
let missingQuality = 0;
let okWithTemplate = 0;

for (const w of businessVocabulary) {
  const c = w.categories?.[0] || "unknown";
  hist[c] = (hist[c] || 0) + 1;
  if (!w.translationAr || !w.definitionEn || !w.exampleEn) incomplete += 1;
  if (!w.quality) missingQuality += 1;
  const q = w.quality || assessWordQuality(w);
  if (q === "draft") draft += 1;
  if (hasArabicScript(w.translationAr)) arabicOk += 1;
  if (hitsTemplatePhrase(w) || isBoilerplateDefinition(w)) templateHits += 1;
  if (w.quality === "ok" && hitsTemplatePhrase(w)) okWithTemplate += 1;
}

const report = {
  inventoryCount: inventory.count,
  bankTotal: businessVocabulary.length,
  recoveredInBank: recovered,
  curatedOnly: curated,
  missingFromBank: missing,
  incompleteFieldRows: incomplete,
  total: businessVocabulary.length,
  draft,
  ok: businessVocabulary.length - draft,
  draftPct: Math.round((draft / Math.max(businessVocabulary.length, 1)) * 100),
  arabicOk,
  templateHits,
  okWithTemplate,
  missingQuality,
  categoryDistribution: hist,
  okGate:
    missing.length === 0 &&
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
