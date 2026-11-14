/**
 * Lazy vocab catalog with Map(id → word) lookups.
 * Keeps heavy data files out of the shell/dashboard chunk.
 */

let toeflList = null;
let toeflMap = null;
let generalList = null;
let generalMap = null;
let toeflCategoryMeta = null;
let generalCategories = null;

let toeflPromise = null;
let generalPromise = null;

async function loadToefl() {
  if (toeflList) return toeflList;
  if (!toeflPromise) {
    toeflPromise = Promise.all([
      import("@/data/toeflVocabulary"),
      import("@/data/toeflCategories"),
    ]).then(([vocabMod, catMod]) => {
      toeflList = vocabMod.default;
      toeflMap = new Map(toeflList.map((w) => [w.id, w]));
      toeflCategoryMeta = catMod.default || [];
      return toeflList;
    });
  }
  return toeflPromise;
}

async function loadGeneral() {
  if (generalList) return generalList;
  if (!generalPromise) {
    generalPromise = import("@/lib/vocabAdapters").then((mod) => {
      generalList = mod.getGeneralUniqueByWord();
      generalMap = new Map(generalList.map((w) => [w.id, w]));
      generalCategories = mod
        .getGeneralCategories()
        .filter((c) => !String(c).startsWith("batch"))
        .slice(0, 60);
      return generalList;
    });
  }
  return generalPromise;
}

export async function ensureLibrary(library) {
  if (library === "toefl") return loadToefl();
  return loadGeneral();
}

export async function ensureAllLibraries() {
  await Promise.all([loadToefl(), loadGeneral()]);
}

export function getLibraryWordsSync(library) {
  return library === "toefl" ? toeflList : generalList;
}

export function getWordMapSync(library) {
  return library === "toefl" ? toeflMap : generalMap;
}

export function findWordById(library, wordId) {
  const map = getWordMapSync(library);
  return map?.get(wordId) || null;
}

export function getCategoriesSync(library) {
  if (library === "toefl") {
    return (toeflCategoryMeta || []).map((c) => c.id);
  }
  return generalCategories || [];
}

export function getToeflCategoryMetaSync() {
  return toeflCategoryMeta || [];
}

export async function getLibraryWords(library) {
  await ensureLibrary(library);
  return getLibraryWordsSync(library);
}

export async function getLibraryTotals() {
  await ensureAllLibraries();
  return {
    toeflTotal: toeflList.length,
    generalTotal: generalList.length,
  };
}
