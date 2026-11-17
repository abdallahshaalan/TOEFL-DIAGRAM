/**
 * Verify every inventory word exists in businessVocabulary.js
 * Run: node scripts/verify-business-vocab.mjs
 */
import inventory from "./vocab/business/inventory.json" with { type: "json" };
import businessVocabulary from "../src/data/businessVocabulary.js";

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
for (const w of businessVocabulary) {
  const c = w.categories?.[0] || "unknown";
  hist[c] = (hist[c] || 0) + 1;
  if (!w.translationAr || !w.definitionEn || !w.exampleEn) incomplete += 1;
}

const report = {
  inventoryCount: inventory.count,
  bankTotal: businessVocabulary.length,
  recoveredInBank: recovered,
  curatedOnly: curated,
  missingFromBank: missing,
  incompleteFieldRows: incomplete,
  categoryDistribution: hist,
  ok: missing.length === 0 && incomplete === 0,
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) {
  console.error("VERIFY FAILED");
  process.exit(1);
}
console.log("VERIFY OK");
