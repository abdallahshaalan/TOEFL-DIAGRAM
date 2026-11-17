/**
 * Inventory recoverable business vocabulary from existing project sources.
 * Run: node scripts/inventory-business-vocab.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vocabs from "../src/data/vocabs.js";
import topics from "../src/data/studyVocabularies.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "vocab", "business", "inventory.json");

const ALLOWLIST = new Set(
  [
    "allocate", "asset", "balance sheet", "budget", "capitalism", "capitalist",
    "cargo", "compromise", "contractor", "deficit", "discrimination", "dispute",
    "diversity", "economics", "enterprise", "entity", "entrepreneur", "exceed",
    "forecast", "gross", "investor", "maximize", "negotiation", "net",
    "nonprofit", "portfolio", "profitable", "proposition", "provision",
    "regulatory", "reliability", "rental", "revenue", "segment", "short-term",
    "speculate", "strategy", "tactic", "terminate", "venture", "workforce",
    "workplace", "warrant", "founder", "found", "finance", "liability",
    "equity", "merger", "acquisition", "stakeholder", "shareholder", "dividend",
    "audit", "invoice", "payroll", "overhead", "margin", "leverage", "liquidity",
    "collateral", "amortization", "depreciation", "inflation", "gdp", "currency",
    "supply", "demand", "market", "profit", "investment", "management",
    "startup", "brand", "consumer", "competitor", "outsourcing", "franchise",
    "monopoly", "oligopoly", "tariff", "export", "import", "subsidiary",
    "compliance", "governance", "fiduciary", "procurement", "logistics",
    "inventory", "kpi", "benchmark", "forecasting", "valuation", "bond",
    "equity", "stock", "share", "interest rate", "cash flow", "working capital",
  ].map((w) => w.toLowerCase())
);

function norm(word) {
  return String(word || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

const byWord = new Map();

function add(entry) {
  const key = norm(entry.word);
  if (!key) return;
  const existing = byWord.get(key);
  if (!existing) {
    byWord.set(key, entry);
    return;
  }
  // Prefer richer Arabic / example when merging
  byWord.set(key, {
    ...existing,
    ...entry,
    arabic: entry.arabic || existing.arabic,
    english: entry.english?.length > (existing.english?.length || 0) ? entry.english : existing.english,
    arabic_example: entry.arabic_example || existing.arabic_example,
    level: entry.level || existing.level,
    sources: [...new Set([...(existing.sources || []), ...(entry.sources || [])])],
  });
}

// batch39 — primary business corpus
for (const [i, w] of (vocabs.batch39 || []).entries()) {
  add({
    word: w.word,
    arabic: w.arabic || "",
    english: w.english || "",
    level: w.level || null,
    arabic_example: w.arabic_example || "",
    sources: [`batch39:${i}`],
    provenance: "recovered-general",
  });
}

// Business + Economics topics
for (const topic of ["Business", "Economics"]) {
  for (const [i, w] of (topics[topic] || []).entries()) {
    add({
      word: w.word,
      arabic: w.arabic || "",
      english: w.english || "",
      level: null,
      arabic_example: "",
      sources: [`topic_${topic}:${i}`],
      provenance: "recovered-general",
    });
  }
}

// Curated allowlist hits from other batches
for (const [batch, words] of Object.entries(vocabs)) {
  if (batch === "batch39" || !Array.isArray(words)) continue;
  words.forEach((w, i) => {
    if (!ALLOWLIST.has(norm(w.word))) return;
    add({
      word: w.word,
      arabic: w.arabic || "",
      english: w.english || "",
      level: w.level || null,
      arabic_example: w.arabic_example || "",
      sources: [`${batch}:${i}`],
      provenance: "recovered-general",
    });
  });
}

const items = Array.from(byWord.values()).sort((a, b) =>
  norm(a.word).localeCompare(norm(b.word))
);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: items.length,
      items,
    },
    null,
    2
  )
);

console.log(`Wrote ${items.length} inventory items → ${OUT}`);
