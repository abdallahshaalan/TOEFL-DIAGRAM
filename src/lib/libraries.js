/** Shared library registry for vocab, nav, practice, and stats. */
import { BookOpen, Briefcase, GraduationCap, Languages } from "lucide-react";

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
    reviewsKey: "toeflReviews",
    todayKey: "dashboard.toeflToday",
    streakKey: "dashboard.toeflStreak",
    navIcon: GraduationCap,
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
    reviewsKey: "businessReviews",
    todayKey: "dashboard.businessToday",
    streakKey: "dashboard.businessStreak",
    navIcon: Briefcase,
  },
  {
    id: "everyday",
    route: "/vocab/everyday",
    navKey: "everydayVocab",
    titleKey: "vocab.everydayTitle",
    subtitleKey: "vocab.everydaySubtitle",
    labelKey: "vocab.libraryEveryday",
    badgeVariant: "everyday",
    practicedKey: "everydayPracticed",
    totalKey: "everydayTotal",
    learnedKey: "dashboard.everydayLearned",
    reviewsKey: "everydayReviews",
    todayKey: "dashboard.everydayToday",
    streakKey: "dashboard.everydayStreak",
    navIcon: Languages,
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
    reviewsKey: "generalReviews",
    todayKey: "dashboard.generalToday",
    streakKey: "dashboard.generalStreak",
    navIcon: BookOpen,
  },
];

export const LIBRARY_IDS = LIBRARIES.map((l) => l.id);

export function getLibraryMeta(id) {
  return LIBRARIES.find((l) => l.id === id) || null;
}

export function isValidLibrary(id) {
  return LIBRARY_IDS.includes(id);
}

/** Zeroed intro counters for every registered library. */
export function emptyIntroducedByLibrary() {
  return Object.fromEntries(LIBRARY_IDS.map((id) => [id, 0]));
}

export function libraryReviewsField(library) {
  const meta = getLibraryMeta(library);
  return meta?.reviewsKey || null;
}

export function libraryPracticedField(library) {
  const meta = getLibraryMeta(library);
  return meta?.practicedKey || null;
}
