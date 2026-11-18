/** Preset TOEFL study packs → practice deep links. */
const toeflExamPacks = [
  {
    id: "reading-vocab",
    titleKey: "vocab.packReading",
    category: "reading-vocabulary",
    mode: "flashcards",
    count: 12,
    difficulties: [],
  },
  {
    id: "academic-verbs",
    titleKey: "vocab.packAcademicVerbs",
    category: "academic-verbs",
    mode: "quiz",
    count: 12,
    difficulties: [],
  },
  {
    id: "high-frequency",
    titleKey: "vocab.packHighFrequency",
    category: "high-frequency-academic",
    mode: "flashcards",
    count: 12,
    difficulties: [],
  },
  {
    id: "writing-vocab",
    titleKey: "vocab.packWriting",
    category: "writing-vocabulary",
    mode: "cloze",
    count: 10,
    difficulties: [],
  },
  {
    id: "advanced-vocab",
    titleKey: "vocab.packAdvanced",
    category: "advanced-vocabulary",
    mode: "recognition",
    count: 10,
    difficulties: ["C1"],
  },
];

export default toeflExamPacks;
