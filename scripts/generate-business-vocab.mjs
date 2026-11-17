/**
 * Generates src/data/businessVocabulary.js from inventory + curated banks.
 * Run: node scripts/generate-business-vocab.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CURATED_BANKS } from "./vocab/business/curated-banks.mjs";
import { CATEGORY_HINTS } from "./vocab/business/category-hints.mjs";
import inventory from "./vocab/business/inventory.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "src", "data", "businessVocabulary.js");

function slug(word) {
  return String(word)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function norm(word) {
  return String(word || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function guessPos(word, definition) {
  const w = norm(word);
  if (/\s/.test(w) || /framework|strategy|rate|point|model|plan/.test(w)) return "phrase";
  if (/^(is|are|means|refers|the process|the ability|the percentage)/i.test(definition || "")) {
    return "noun";
  }
  return "noun";
}

function mapLevel(level) {
  if (!level) return "B1";
  const L = String(level).toUpperCase();
  if (["A1", "A2", "B1", "B2", "C1", "C2"].includes(L)) return L === "A1" ? "A2" : L === "C2" ? "C1" : L;
  return "B1";
}

function hintCategory(word) {
  const key = norm(word);
  if (CATEGORY_HINTS[key]) return CATEGORY_HINTS[key];
  // keyword fallbacks
  if (/account|audit|depreci|ledger|invoice|payable|receivable|equity|asset|liabilit/.test(key))
    return "accounting";
  if (/invest|loan|capital|cash|interest|bond|stock|fund|financ|roi|valuation/.test(key))
    return "finance";
  if (/market|brand|customer|seo|ads|campaign|segment|funnel|churn|retention/.test(key))
    return "marketing";
  if (/econom|inflat|gdp|demand|supply|fiscal|monetary|elastic/.test(key)) return "economics";
  if (/startup|founder|venture|mvp|pitch|seed|bootstrapp|runway|angel/.test(key))
    return "entrepreneurship";
  if (/manage|leader|hr|team|delegat|organiz|workforce|motivat/.test(key)) return "management";
  if (/supply chain|logistic|inventor|procure|warehouse|ops|manufactur/.test(key))
    return "operations";
  if (/law|contract|compliance|ethic|fiduciary|liability|nda|intellectual/.test(key))
    return "law-ethics";
  if (/analytic|kpi|dashboard|data|forecast|benchmark|metric/.test(key)) return "analytics";
  if (/export|import|tariff|global|foreign|exchange|trade|multinational/.test(key))
    return "international";
  if (/email|meeting|negotiat|pitch|proposal|agenda|memo|communicat/.test(key))
    return "communication";
  return "fundamentals";
}

const byWord = new Map();

function upsert(entry) {
  const key = norm(entry.word);
  if (!key) return;
  const prev = byWord.get(key);
  if (!prev) {
    byWord.set(key, entry);
    return;
  }
  // Prefer curated content when recovering duplicates; keep recovered provenance flag
  const recovered = prev.provenance === "recovered-general" || entry.provenance === "recovered-general";
  const preferCurated = entry.provenance === "curated-business";
  const base = preferCurated ? entry : prev;
  const other = preferCurated ? prev : entry;
  byWord.set(key, {
    ...other,
    ...base,
    translationAr: base.translationAr || other.translationAr,
    definitionEn: base.definitionEn || other.definitionEn,
    explanationAr: base.explanationAr || other.explanationAr,
    exampleEn: base.exampleEn || other.exampleEn,
    exampleAr: base.exampleAr || other.exampleAr,
    synonyms: (base.synonyms?.length ? base.synonyms : other.synonyms) || [],
    relatedTerms: (base.relatedTerms?.length ? base.relatedTerms : other.relatedTerms) || [],
    phonetic: base.phonetic || other.phonetic || null,
    provenance: recovered ? "recovered-general" : base.provenance,
    categories: [...new Set([...(base.categories || []), ...(other.categories || [])])],
  });
}

function enrichRecoveredExample(word, definitionEn, arabicExample) {
  const w = word;
  // Prefer definition-shaped usage when it already contains the headword
  if (definitionEn && new RegExp(String(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(definitionEn)) {
    return {
      exampleEn: definitionEn.length < 180 ? definitionEn : `In practice, ${w} shapes how teams plan and decide.`,
      exampleAr: arabicExample || "",
    };
  }
  return {
    exampleEn: `The finance team reviewed ${w} before presenting the quarterly plan to leadership.`,
    exampleAr:
      arabicExample ||
      (word
        ? `راجعت فرق المالية «${w}» قبل عرض الخطة الربعية على الإدارة.`
        : ""),
  };
}

function relatedFromCategory(category, word) {
  const seeds = {
    accounting: ["asset", "liability", "revenue", "balance sheet"],
    finance: ["cash flow", "investment", "ROI", "interest rate"],
    marketing: ["brand", "segment", "campaign", "customer"],
    economics: ["demand", "supply", "inflation", "market"],
    entrepreneurship: ["startup", "MVP", "pitch", "funding"],
    management: ["leadership", "strategy", "team", "performance"],
    operations: ["inventory", "logistics", "supply chain", "quality"],
    "law-ethics": ["contract", "compliance", "liability", "ethics"],
    analytics: ["KPI", "dashboard", "forecast", "metric"],
    international: ["export", "tariff", "exchange rate", "trade"],
    communication: ["negotiation", "proposal", "meeting", "agenda"],
    fundamentals: ["stakeholder", "strategy", "organization", "governance"],
  };
  return (seeds[category] || seeds.fundamentals).filter(
    (r) => norm(r) !== norm(word)
  );
}

let recoveredEnriched = 0;

// 1) Seed recovered inventory
for (const item of inventory.items || []) {
  const primary = hintCategory(item.word);
  const definitionEn = item.english || `A business term used in study and workplace practice: ${item.word}.`;
  const examples = enrichRecoveredExample(item.word, definitionEn, item.arabic_example);
  recoveredEnriched += 1;
  upsert({
    id: `business_${slug(item.word)}`,
    library: "business",
    word: item.word,
    pos: guessPos(item.word, definitionEn),
    definitionEn,
    translationAr: item.arabic || "",
    explanationEn: definitionEn,
    explanationAr: item.arabic
      ? `في سياق الأعمال، يشير «${item.word}» إلى ${item.arabic}. يُستخدم في الدراسة والممارسة المهنية.`
      : "",
    exampleEn: examples.exampleEn,
    exampleAr: examples.exampleAr,
    synonyms: [],
    antonyms: [],
    relatedTerms: relatedFromCategory(primary, item.word),
    wordFamily: [],
    collocations: [],
    difficulty: mapLevel(item.level),
    categories: [primary],
    skills: ["reading", "writing", "speaking"],
    phonetic: null,
    provenance: "recovered-general",
    enriched: true,
  });
}

// 2) Overlay / add curated banks (enrich recovered + add new)
for (const [category, entries] of Object.entries(CURATED_BANKS)) {
  for (const row of entries) {
    upsert({
      id: `business_${slug(row.word)}`,
      library: "business",
      word: row.word,
      pos: row.pos || "noun",
      definitionEn: row.definitionEn,
      translationAr: row.translationAr,
      explanationEn: row.definitionEn,
      explanationAr: row.explanationAr || "",
      exampleEn: row.exampleEn,
      exampleAr: row.exampleAr || "",
      synonyms: row.synonyms || [],
      antonyms: [],
      relatedTerms: row.relatedTerms || [],
      wordFamily: [],
      collocations: [],
      difficulty: mapLevel(row.difficulty),
      categories: [category],
      skills: ["reading", "writing", "speaking"],
      phonetic: row.phonetic || null,
      provenance: "curated-business",
    });
  }
}

const list = Array.from(byWord.values()).sort((a, b) =>
  norm(a.word).localeCompare(norm(b.word))
);

// Ensure stable ids
for (const w of list) {
  w.id = `business_${slug(w.word)}`;
  w.library = "business";
}

const recovered = list.filter((w) => w.provenance === "recovered-general").length;
const curated = list.filter((w) => w.provenance === "curated-business").length;

const header = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Run: node scripts/generate-business-vocab.mjs
 * total=${list.length} recovered=${recovered} curatedOnly=${curated}
 */
`;

const body = `const businessVocabulary = ${JSON.stringify(list, null, 2)};\n\nexport default businessVocabulary;\n`;

fs.writeFileSync(OUT, header + body, "utf8");

const hist = {};
for (const w of list) {
  const c = w.categories?.[0] || "unknown";
  hist[c] = (hist[c] || 0) + 1;
}

console.log(
  JSON.stringify(
    {
      out: OUT,
      total: list.length,
      recovered,
      curatedOnly: curated,
      recoveredEnriched,
      categories: hist,
    },
    null,
    2
  )
);
