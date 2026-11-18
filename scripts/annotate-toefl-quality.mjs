/**
 * Annotate toeflVocabulary.js with quality: "ok" | "draft".
 * Preserves all IDs; does not invent translations or IPA.
 * Run: node scripts/annotate-toefl-quality.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import toeflVocabulary from "../src/data/toeflVocabulary.js";
import {
  assessWordQuality,
  hasArabicScript,
  hitsTemplatePhrase,
} from "../src/lib/vocabQuality.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, "../src/data/toeflVocabulary.js");

let draft = 0;
let arabicOk = 0;
let templateHits = 0;
const annotated = toeflVocabulary.map((w) => {
  const quality = assessWordQuality(w);
  if (quality === "draft") draft += 1;
  if (hasArabicScript(w.translationAr)) arabicOk += 1;
  if (hitsTemplatePhrase(w)) templateHits += 1;
  return { ...w, quality };
});

const header = `/** Auto-annotated quality flags by scripts/annotate-toefl-quality.mjs — preserve IDs. IPA via fill-toefl-ipa.mjs. */\n\n`;
const body = `const toeflVocabulary = ${JSON.stringify(annotated, null, 2)};\n\nexport default toeflVocabulary;\n`;

fs.writeFileSync(outPath, header + body, "utf8");

const report = {
  total: annotated.length,
  draft,
  ok: annotated.length - draft,
  arabicOk,
  templateHits,
};
console.log(JSON.stringify(report, null, 2));
console.log("ANNOTATE OK →", outPath);
