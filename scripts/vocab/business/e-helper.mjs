/** Shared compact entry builder for business vocab banks. */
export const e = (
  word,
  pos,
  difficulty,
  translationAr,
  definitionEn,
  explanationAr,
  exampleEn,
  exampleAr,
  synonyms = [],
  relatedTerms = [],
  phonetic = null
) => ({
  word,
  pos,
  difficulty,
  translationAr,
  definitionEn,
  explanationAr,
  exampleEn,
  exampleAr,
  synonyms,
  relatedTerms,
  phonetic,
});
