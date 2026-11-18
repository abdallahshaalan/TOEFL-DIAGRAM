import businessExamPacks from "@/data/businessExamPacks";
import toeflExamPacks from "@/data/toeflExamPacks";
import generalExamPacks from "@/data/generalExamPacks";
import { isStudyQualityOk } from "@/lib/vocabQuality";

const BY_LIBRARY = {
  business: businessExamPacks,
  toefl: toeflExamPacks,
  general: generalExamPacks,
};

export function getExamPacks(library) {
  return BY_LIBRARY[library] || [];
}

export function findExamPack(packId) {
  if (!packId) return null;
  for (const [library, packs] of Object.entries(BY_LIBRARY)) {
    const pack = packs.find((p) => p.id === packId);
    if (pack) return { ...pack, library };
  }
  return null;
}

/** Filter pack candidate words to study-ok only (never draft/legacy/template). */
export function filterExamPackWords(words) {
  return (words || []).filter((w) => isStudyQualityOk(w));
}
