/** Shared library registry for vocab, nav, practice, and stats. */
export const LIBRARIES = [
  {
    id: "toefl",
    route: "/vocab/toefl",
    navKey: "toeflVocab",
    titleKey: "vocab.toeflTitle",
    subtitleKey: "vocab.toeflSubtitle",
    labelKey: "vocab.libraryToefl",
    badgeVariant: "toefl",
    practicedKey: "toeflPracticed",
    totalKey: "toeflTotal",
    learnedKey: "dashboard.toeflLearned",
  },
  {
    id: "business",
    route: "/vocab/business",
    navKey: "businessVocab",
    titleKey: "vocab.businessTitle",
    subtitleKey: "vocab.businessSubtitle",
    labelKey: "vocab.libraryBusiness",
    badgeVariant: "business",
    practicedKey: "businessPracticed",
    totalKey: "businessTotal",
    learnedKey: "dashboard.businessLearned",
  },
  {
    id: "general",
    route: "/vocab/general",
    navKey: "generalVocab",
    titleKey: "vocab.generalTitle",
    subtitleKey: "vocab.generalSubtitle",
    labelKey: "vocab.libraryGeneral",
    badgeVariant: "general",
    practicedKey: "generalPracticed",
    totalKey: "generalTotal",
    learnedKey: "dashboard.generalLearned",
  },
];

export const LIBRARY_IDS = LIBRARIES.map((l) => l.id);

export function getLibraryMeta(id) {
  return LIBRARIES.find((l) => l.id === id) || null;
}
