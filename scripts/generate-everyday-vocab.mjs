/**
 * Generates src/data/everydayVocabulary.js from curated CEFR everyday tuples.
 * Run: node scripts/generate-everyday-vocab.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { assessWordQuality } from "../src/lib/vocabQuality.js";
import { THEMES } from "./vocab/everyday/themes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "src", "data", "everydayVocabulary.js");

const CAT_HINT = {
  travel: "travel and getting around",
  food: "food and eating",
  work: "work and daily routines",
  health: "health and self-care",
  home: "home life",
  news: "news and media",
  relationships: "people and relationships",
  shopping: "shopping and money",
  nature: "nature and weather",
  study: "study and school",
};

function slug(word) {
  return String(word)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function cap(w) {
  if (!w) return w;
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function pickSkills(pos) {
  if (pos === "verb" || pos === "phrase") return ["speaking", "writing", "listening"];
  if (pos === "adjective" || pos === "adverb") return ["reading", "writing", "speaking"];
  if (pos === "preposition" || pos === "conjunction") return ["reading", "writing"];
  return ["reading", "listening", "speaking"];
}

function definitionFor(category, word, pos, override) {
  if (override) return override;
  const hint = CAT_HINT[category] || "everyday life";
  const bare = word.replace(/-/g, " ");
  if (pos === "verb") return `To ${bare} means to do something common when talking about ${hint}.`;
  if (pos === "adjective") return `${cap(bare)} describes a familiar ${hint} situation.`;
  if (pos === "adverb") return `${cap(bare)} tells how something happens in a ${hint} context.`;
  if (pos === "phrase") return `${cap(bare)} is a short everyday phrase linked to ${hint}.`;
  if (pos === "preposition" || pos === "conjunction") return `${cap(bare)} links ideas in simple ${hint} sentences.`;
  return `A ${bare} is something people often mention when discussing ${hint}.`;
}

function exampleFor(category, word, override) {
  if (override) return override;
  const frames = [
    `During our ${category} practice, Lina used "${word}" in a short story.`,
    `The host said "${word}" twice while we listened to the dialogue.`,
    `I wrote "${word}" in my journal after a normal ${category} day.`,
    `Can you use "${word}" when you explain what you did last weekend?`,
    `Our group chose "${word}" for a role-play about ${category}.`,
  ];
  return frames[hash(word + category) % frames.length];
}

function exampleArFor(ar, word, category) {
  const frames = [
    `كتبتُ جملة قصيرة باستخدام «${ar}» بعد درس ${category}.`,
    `سمعتُ كلمة «${ar}» في حوار بسيط عن الحياة اليومية.`,
    `سألتُ زميلي عن معنى «${ar}» أثناء التمرين.`,
    `حاولتُ ترجمة جملة تحتوي على «${ar}» إلى الإنجليزية.`,
  ];
  return frames[hash(word + "ar") % frames.length];
}

function collocationsFor(word, pos) {
  if (pos === "verb") return [`${word} carefully`, `${word} today`];
  if (pos === "adjective") return [`very ${word}`, `feel ${word}`];
  return [`${word.replace(/-/g, " ")} basics`, `learn ${word.replace(/-/g, " ")}`];
}

function relatedFromPool(category, word, pool) {
  return pool.filter((w) => w !== word).slice(0, 4);
}

function synonymsFor(category, word, pos, pool) {
  const same = pool.filter((w) => w !== word && !w.includes(" "));
  const pick = same.slice(0, 3);
  if (pick.length >= 2) return pick;
  return [`${word} term`, `${category} word`].filter((s) => s !== word);
}

function buildEntry(theme, tuple, pool) {
  const [word, pos, difficulty, translationAr, defOverride, exOverride] = tuple;
  const definitionEn = definitionFor(theme.id, word, pos, defOverride);
  const exampleEn = exampleFor(theme.id, word, exOverride);
  const explanationEn = `Notice how "${word}" shows up in relaxed ${theme.id} chats, not only in grammar drills.`;
  const explanationAr = `«${translationAr}» تلائم موضوع ${theme.labelAr} في حديث يومي بسيط.`;

  const entry = {
    id: `everyday_${slug(word)}`,
    library: "everyday",
    word,
    pos,
    definitionEn,
    translationAr,
    explanationEn,
    explanationAr,
    exampleEn,
    exampleAr: exampleArFor(translationAr, word, theme.labelAr),
    synonyms: synonymsFor(theme.id, word, pos, pool),
    antonyms: [],
    relatedTerms: relatedFromPool(theme.id, word, pool),
    wordFamily: [],
    collocations: collocationsFor(word, pos),
    difficulty,
    categories: [theme.id],
    skills: pickSkills(pos),
    phonetic: null,
    provenance: "cefr-everyday",
    quality: assessWordQuality({
      definitionEn,
      translationAr,
      explanationEn,
      exampleEn,
      synonyms: synonymsFor(theme.id, word, pos, pool),
    }),
  };

  return entry;
}

const byWord = new Map();
const entries = [];

for (const theme of THEMES) {
  const pool = theme.words.map((t) => t[0]);
  for (const tuple of theme.words) {
    const key = tuple[0].toLowerCase();
    if (byWord.has(key)) continue;
    byWord.set(key, true);
    entries.push(buildEntry(theme, tuple, pool));
  }
}

const header = `/** Everyday English (CEFR A1–B1) — generated by scripts/generate-everyday-vocab.mjs */\n\n`;
const body = `const everydayVocabulary = ${JSON.stringify(entries, null, 2)};\n\nexport default everydayVocabulary;\n`;
fs.writeFileSync(OUT, header + body, "utf8");

const draft = entries.filter((e) => e.quality === "draft").length;
console.log(
  JSON.stringify(
    {
      total: entries.length,
      ok: entries.length - draft,
      draft,
      themes: THEMES.length,
    },
    null,
    2,
  ),
);
console.log("GENERATE OK →", OUT);