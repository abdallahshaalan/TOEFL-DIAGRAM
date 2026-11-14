import generalBatches from "../data/vocabs";
import topicVocab from "../data/studyVocabularies";

function slug(word) {
  return String(word || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function normalizeGeneralEntry(raw, source, index) {
  const word = raw.word || "";
  return {
    id: `general_${slug(word)}_${source}_${index}`,
    library: "general",
    word,
    pos: raw.pos || raw.type || null,
    definitionEn: raw.definitionEn || raw.def || null,
    translationAr: raw.arabic || raw.translationAr || "",
    explanationEn: raw.explanationEn || null,
    exampleEn: raw.english || raw.exampleEn || raw.example || "",
    exampleAr: raw.arabic_example || raw.arabicExample || raw.exampleAr || "",
    synonyms: raw.synonyms || [],
    antonyms: raw.antonyms || [],
    wordFamily: raw.wordFamily || [],
    collocations: raw.collocations || [],
    difficulty: raw.level || raw.difficulty || null,
    categories: raw.categories || [source],
    skills: raw.skills || [],
    phonetic: raw.phonetic || null,
    provenance: raw.provenance || "legacy-general",
    batch: raw.batch || source,
  };
}

let _generalCache = null;

export function getGeneralVocabulary() {
  if (_generalCache) return _generalCache;
  const list = [];
  Object.entries(generalBatches).forEach(([batch, words]) => {
    (words || []).forEach((w, i) => {
      list.push(normalizeGeneralEntry({ ...w, batch }, batch, i));
    });
  });
  Object.entries(topicVocab).forEach(([topic, words]) => {
    (words || []).forEach((w, i) => {
      list.push(
        normalizeGeneralEntry(
          { ...w, categories: ["topic", topic] },
          `topic_${topic}`,
          i
        )
      );
    });
  });
  _generalCache = list;
  return list;
}

export function getGeneralUniqueByWord() {
  const map = new Map();
  for (const item of getGeneralVocabulary()) {
    const key = item.word.toLowerCase();
    if (!map.has(key)) map.set(key, item);
  }
  return Array.from(map.values());
}

export function getGeneralCategories() {
  const set = new Set();
  getGeneralVocabulary().forEach((w) => w.categories.forEach((c) => set.add(c)));
  return Array.from(set).sort();
}

export function getVocabularyByLibrary(library) {
  if (library === "toefl") {
    // lazy import avoided; caller should pass toefl list or import toefl module
    return null;
  }
  return getGeneralUniqueByWord();
}
