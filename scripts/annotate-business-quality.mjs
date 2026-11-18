/**
 * Annotate businessVocabulary.js with quality: "ok" | "draft".
 * Preserves all IDs; does not invent translations.
 * Run: node scripts/annotate-business-quality.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import businessVocabulary from "../src/data/businessVocabulary.js";
import {
  assessWordQuality,
  hasArabicScript,
  hitsTemplatePhrase,
} from "../src/lib/vocabQuality.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, "../src/data/businessVocabulary.js");

let draft = 0;
let arabicOk = 0;
let templateHits = 0;
const annotated = businessVocabulary.map((w) => {
  const quality = assessWordQuality(w);
  if (quality === "draft") draft += 1;
  if (hasArabicScript(w.translationAr)) arabicOk += 1;
  if (hitsTemplatePhrase(w)) templateHits += 1;
  return { ...w, quality };
});

const header = `/** Auto-annotated quality flags by scripts/annotate-business-quality.mjs — preserve IDs. */\n\n`;
const body = `const businessVocabulary = ${JSON.stringify(annotated, null, 2)};\n\nexport default businessVocabulary;\n`;

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
