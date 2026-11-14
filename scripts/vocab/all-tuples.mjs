import { VERB_TUPLES } from "./tuples-verbs.mjs";
import { VERB_TUPLES_EXTRA } from "./tuples-verbs-extra.mjs";
import { VERB_TUPLES_EXTRA2 } from "./tuples-verbs-extra2.mjs";
import { CONNECTOR_TUPLES } from "./tuples-connectors.mjs";
import { WORD_BANK } from "./word-bank.mjs";
import { bankToTuple } from "./expand-bank.mjs";

const RICH_TUPLES = [
  ...VERB_TUPLES,
  ...VERB_TUPLES_EXTRA,
  ...VERB_TUPLES_EXTRA2,
  ...CONNECTOR_TUPLES,
];

/** Rich manual tuples win over bank-generated ones (same word, case-insensitive). */
const richByWord = new Map();
for (const t of RICH_TUPLES) {
  richByWord.set(t[0].toLowerCase(), t);
}

const out = [];
const used = new Set();

for (const t of RICH_TUPLES) {
  const k = t[0].toLowerCase();
  if (used.has(k)) continue;
  used.add(k);
  out.push(t);
}

for (const row of WORD_BANK) {
  const k = row.word.toLowerCase();
  if (used.has(k)) continue;
  used.add(k);
  if (richByWord.has(k)) {
    out.push(richByWord.get(k));
  } else {
    out.push(bankToTuple(row));
  }
}

export const ALL_TUPLES = out;