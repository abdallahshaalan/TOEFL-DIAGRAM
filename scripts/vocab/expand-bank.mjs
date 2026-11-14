/** Expand compact word-bank rows into full tuples with original academic phrasing. */

const POS_SKILL = {
  verb: ["reading", "writing", "speaking"],
  noun: ["reading", "listening", "writing"],
  adjective: ["reading", "writing"],
  adverb: ["writing", "reading"],
  connector: ["writing", "reading", "speaking"],
};

const POS_CAT_EXTRA = {
  verb: ["academic-verbs"],
  noun: ["academic-nouns"],
  adjective: ["academic-adjectives"],
  adverb: ["writing-vocabulary"],
  connector: ["academic-connectors"],
};

const VERB_DEFS = [
  "Carry out the action of {w} in a formal study setting",
  "Use {w} when describing processes in academic papers",
  "A core AWL verb: {w}",
];

const NOUN_DEFS = [
  "An academic noun referring to {w} in scholarly contexts",
  "A key term: {w}, common on university exams",
  "The concept of {w} appears across many disciplines",
];

const ADJ_DEFS = [
  "Describes something as {w} in analytical writing",
  "Academic adjective: {w}",
  "Used to qualify claims with the quality of being {w}",
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function exampleVerb(word) {
  const n = hashStr(word);
  const frames = [
    `Scholars often ${word} complex claims before accepting them.`,
    `The lecture explains how teams ${word} results in field studies.`,
    `Your essay should ${word} the main conflict in the passage.`,
    `Researchers ${word} variables that shape policy outcomes.`,
  ];
  return frames[n % frames.length];
}

function exampleArVerb(word, ar) {
  const frames = [
    `غالباً ما يستخدم الباحثون فعل «${ar}» في التحليل الأكاديمي.`,
    `يوضّح المقرر كيف نطبّق «${ar}» عند قراءة النصوص العلمية.`,
    `على الطالب أن يظهر قدرته على «${ar}» في الموضوعات المعقّدة.`,
  ];
  return frames[hashStr(word) % frames.length];
}

function exampleNoun(word) {
  const frames = [
    `The author defines ${word} early so readers share one meaning.`,
    `Class discussion focused on how ${word} affects the argument.`,
    `A clear grasp of ${word} helps with summary questions.`,
  ];
  return frames[hashStr(word) % frames.length];
}

function exampleArNoun(word, ar) {
  return `يُعدّ مفهوم «${ar}» مهماً لفهم الفقرات الأكاديمية حول ${word}.`;
}

function exampleAdj(word) {
  return `The reviewer called the evidence ${word}, but still asked for data.`;
}

function exampleArAdj(ar) {
  return `وصف النقّاد الدليل بأنه ${ar} مع طلب مزيد من التفاصيل.`;
}

function exampleConnector(word) {
  const frames = {
    however: "Costs rose; however, enrollment stayed stable.",
    therefore: "Samples were biased; therefore, results need caution.",
    furthermore: "The trial succeeded; furthermore, it saved time.",
    moreover: "The data are dated; moreover, the sample is small.",
    nevertheless: "Funding fell; nevertheless, the lab continued.",
    consequently: "Rules changed; consequently, scores shifted.",
    similarly: "Urban teens improved; similarly, rural scores rose.",
    whereas: "Group A gained skills, whereas Group B did not.",
    although: "Although the lecture was short, it raised new questions.",
    because: "Because the survey was random, variance was low.",
    since: "Since the model fit the data, we kept it.",
    while: "While the theory is old, it still predicts trends.",
    thus: "Thus, the campus adopted the new policy.",
    hence: "Hence, the team revised the protocol.",
    nonetheless: "Nonetheless, the pilot showed promise.",
    alternatively: "Alternatively, we could compare two cohorts.",
    specifically: "Specifically, the article targets first-year writers.",
    ultimately: "Ultimately, the board approved the grant.",
    accordingly: "Accordingly, deadlines were extended.",
    namely: "One factor mattered, namely teacher feedback.",
  };
  return (
    frames[word] ||
    `The passage links ideas; ${word}, the writer restates the thesis.`
  );
}

function exampleArConnector(ar) {
  return `تربط الفقرة الأفكار باستخدام «${ar}» لإبراز العلاقة المنطقية.`;
}

function defaultSynonyms(word, pos) {
  if (pos === "connector") return [word];
  const bank = {
    analyze: ["examine", "study"],
    assess: ["evaluate", "gauge"],
    support: ["bolster", "back"],
    significant: ["notable", "meaningful"],
    evidence: ["proof", "data"],
  };
  return bank[word] || (pos === "verb" ? ["apply", "use"] : ["concept", "term"]);
}

function defaultAntonyms(word) {
  const bank = { increase: ["decrease"], support: ["oppose"], valid: ["invalid"] };
  return bank[word] || [];
}

function wordFamily(word, pos) {
  if (pos === "verb" && word.endsWith("e")) return [word.slice(0, -1) + "ion", word + "ing"];
  if (pos === "verb") return [word + "ed", word + "ing"];
  if (pos === "adjective" && word.endsWith("ic")) return [word.slice(0, -2) + "ically"];
  if (pos === "noun" && word.endsWith("tion")) return [word.replace(/tion$/, "t")];
  return [word];
}

function collocations(word, pos) {
  if (pos === "verb") return [`${word} results`, `${word} data`];
  if (pos === "noun") return [`${word} of`, `academic ${word}`];
  if (pos === "adjective") return [`highly ${word}`, `relatively ${word}`];
  return [`${word},`];
}

/**
 * @param {{ word: string, pos: string, difficulty: string, translationAr: string, provenance?: string }} row
 */
export function bankToTuple(row) {
  const { word, pos, difficulty, translationAr } = row;
  const provenance = row.provenance || "academic-core";
  const h = hashStr(word + pos);
  let definitionEn;
  let explanationEn;
  let exampleEn;
  let exampleAr;

  if (pos === "verb") {
    definitionEn = pick(VERB_DEFS, h).replace("{w}", word);
    explanationEn = `High-frequency in AWL reading and writing tasks.`;
    exampleEn = exampleVerb(word);
    exampleAr = exampleArVerb(word, translationAr);
  } else if (pos === "noun") {
    definitionEn = pick(NOUN_DEFS, h).replace("{w}", word);
    explanationEn = `Often appears in lectures and long passages.`;
    exampleEn = exampleNoun(word);
    exampleAr = exampleArNoun(word, translationAr);
  } else if (pos === "adjective") {
    definitionEn = pick(ADJ_DEFS, h).replace("{w}", word);
    explanationEn = `Useful for describing trends and claims.`;
    exampleEn = exampleAdj(word);
    exampleAr = exampleArAdj(translationAr);
  } else if (pos === "connector") {
    definitionEn = `A linker word (${word}) that shows how ideas relate`;
    explanationEn = `Strengthens coherence in essays and spoken responses.`;
    exampleEn = exampleConnector(word);
    exampleAr = exampleArConnector(translationAr);
  } else {
    definitionEn = `An academic adverb: ${word}`;
    explanationEn = `Modifies verbs and adjectives in formal style.`;
    exampleEn = `The policy ${word} limits how grants are awarded.`;
    exampleAr = `يحدّ السياسة، ${translationAr}، كيفية منح المنح.`;
  }

  const categories = [
    "academic-vocabulary",
    "high-frequency-academic",
    ...(POS_CAT_EXTRA[pos] || []),
    difficulty === "C1" || difficulty === "C2" ? "advanced-vocabulary" : null,
    wordFamily(word, pos).length > 1 ? "word-families" : null,
  ].filter(Boolean);

  return [
    word,
    pos,
    difficulty,
    definitionEn,
    translationAr,
    explanationEn,
    exampleEn,
    exampleAr,
    defaultSynonyms(word, pos),
    defaultAntonyms(word),
    wordFamily(word, pos),
    collocations(word, pos),
    categories,
    POS_SKILL[pos] || ["reading", "writing"],
    null,
    provenance,
  ];
}