/**
 * Fill TOEFL phonetic only from verified map (no invented IPA).
 * Run: node scripts/fill-toefl-ipa.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import toeflVocabulary from "../src/data/toeflVocabulary.js";
import ipaMap from "./vocab/toefl-ipa.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, "../src/data/toeflVocabulary.js");

let filled = 0;
let already = 0;
let stillNull = 0;

const next = toeflVocabulary.map((w) => {
  if (w.phonetic) {
    already += 1;
    return w;
  }
  const key = String(w.word || "")
    .toLowerCase()
    .trim();
  const ipa = ipaMap[key];
  if (ipa) {
    filled += 1;
    return { ...w, phonetic: ipa };
  }
  stillNull += 1;
  return w;
});

const header = `/** Auto-generated / IPA-filled by scripts — do not invent phonetics by hand. */\n\n`;
const body = `const toeflVocabulary = ${JSON.stringify(next, null, 2)};\n\nexport default toeflVocabulary;\n`;
fs.writeFileSync(outPath, header + body, "utf8");
console.log(JSON.stringify({ total: next.length, already, filled, stillNull }, null, 2));
