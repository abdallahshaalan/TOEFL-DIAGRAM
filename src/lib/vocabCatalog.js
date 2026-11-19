/**
 * Lazy vocab catalog with Map(id → word) lookups.
 * Registry supports toefl | business | everyday | general.
 */
import { LIBRARY_IDS } from "./libraries";

const cache = Object.fromEntries(
  LIBRARY_IDS.map((id) => [id, { list: null, map: null, categories: null, meta: null, promise: null }])
);

function loadToefl() {
  const c = cache.toefl;
  if (c.list) return Promise.resolve(c.list);
  if (!c.promise) {
    c.promise = Promise.all([
      import("@/data/toeflVocabulary"),
      import("@/data/toeflCategories"),
    ]).then(([vocabMod, catMod]) => {
      c.list = vocabMod.default;
      c.map = new Map(c.list.map((w) => [w.id, w]));
      c.meta = catMod.default || [];
      c.categories = c.meta.map((x) => x.id);
      return c.list;
    });
  }
  return c.promise;
}

function loadGeneral() {
  const c = cache.general;
  if (c.list) return Promise.resolve(c.list);
  if (!c.promise) {
    c.promise = import("@/lib/vocabAdapters").then((mod) => {
      c.list = mod.getGeneralUniqueByWord();
      c.map = new Map(c.list.map((w) => [w.id, w]));
      c.categories = mod
        .getGeneralCategories()
        .filter((x) => !String(x).startsWith("batch"))
        .slice(0, 60);
      c.meta = c.categories.map((id) => {
        const label = String(id)
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (ch) => ch.toUpperCase());
        return { id, labelEn: label, labelAr: label };
      });
      return c.list;
    });
  }
  return c.promise;
}

function loadBusiness() {
  const c = cache.business;
  if (c.list) return Promise.resolve(c.list);
  if (!c.promise) {
    c.promise = Promise.all([
      import("@/data/businessVocabulary"),
      import("@/data/businessCategories"),
    ]).then(([vocabMod, catMod]) => {
      c.list = vocabMod.default;
      c.map = new Map(c.list.map((w) => [w.id, w]));
      c.meta = catMod.default || [];
      c.categories = c.meta.map((x) => x.id);
      return c.list;
    });
  }
  return c.promise;
}

function loadEveryday() {
  const c = cache.everyday;
  if (c.list) return Promise.resolve(c.list);
  if (!c.promise) {
    c.promise = Promise.all([
      import("@/data/everydayVocabulary"),
      import("@/data/everydayCategories"),
    ]).then(([vocabMod, catMod]) => {
      c.list = vocabMod.default;
      c.map = new Map(c.list.map((w) => [w.id, w]));
      c.meta = catMod.default || [];
      c.categories = c.meta.map((x) => x.id);
      return c.list;
    });
  }
  return c.promise;
}

const LOADERS = {
  toefl: loadToefl,
  general: loadGeneral,
  business: loadBusiness,
  everyday: loadEveryday,
};

export async function ensureLibrary(library) {
  const loader = LOADERS[library] || loadGeneral;
  return loader();
}

export async function ensureAllLibraries() {
  await Promise.all(LIBRARY_IDS.map((id) => ensureLibrary(id)));
}

export function getLibraryWordsSync(library) {
  return cache[library]?.list || null;
}

export function getWordMapSync(library) {
  return cache[library]?.map || null;
}

export function findWordById(library, wordId) {
  const map = getWordMapSync(library);
  return map?.get(wordId) || null;
}

export function getCategoriesSync(library) {
  return cache[library]?.categories || [];
}

export function getCategoryMetaSync(library) {
  return cache[library]?.meta || [];
}

/** @deprecated use getCategoryMetaSync("toefl") */
export function getToeflCategoryMetaSync() {
  return getCategoryMetaSync("toefl");
}

export async function getLibraryWords(library) {
  await ensureLibrary(library);
  return getLibraryWordsSync(library);
}

export async function getLibraryTotals() {
  await ensureAllLibraries();
  const totals = {};
  for (const id of LIBRARY_IDS) {
    totals[`${id}Total`] = cache[id]?.list?.length || 0;
  }
  return totals;
}

/** Normalized headword → business word id for progress migration */
export function getBusinessWordIdByNormalizedWord(word) {
  const list = cache.business.list;
  if (!list) return null;
  const key = String(word || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
  const hit = list.find(
    (w) =>
      String(w.word || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ") === key
  );
  return hit?.id || null;
}
