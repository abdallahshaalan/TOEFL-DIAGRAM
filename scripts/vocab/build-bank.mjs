/**
 * Build scripts/vocab/word-bank.mjs from src/data/vocabs.js
 * Run once: node scripts/vocab/build-bank.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");
const vocabsPath = path.join(root, "src/data/vocabs.js");
const text = fs.readFileSync(vocabsPath, "utf8");

const CONNECTORS = new Set([
  "however", "therefore", "furthermore", "moreover", "nevertheless",
  "consequently", "similarly", "whereas", "although", "because", "since",
  "while", "thus", "hence", "nonetheless", "alternatively", "specifically",
  "ultimately", "accordingly", "namely", "indeed", "meanwhile", "otherwise",
  "instead", "besides", "regardless", "notwithstanding", "inasmuch",
  "provided", "unless", "whenever", "wherever", "afterward", "beforehand",
]);

const KNOWN_VERBS = new Set([
  "analyze","assess","assume","attribute","clarify","demonstrate","distinguish",
  "establish","evaluate","examine","illustrate","indicate","interpret","justify",
  "maintain","obtain","predict","require","suggest","support","acquire","achieve",
  "adapt","adopt","advocate","affect","allocate","alter","amend","apply","argue",
  "assert","ascertain","assemble","assign","assist","attain","broaden","calculate",
  "categorize","cease","challenge","characterize","cite","classify","compare",
  "compile","comprise","conclude","conduct","confirm","consider","constitute",
  "contrast","contribute","convey","create","decline","define","derive","describe",
  "determine","develop","differentiate","diminish","discuss","display","document",
  "dominate","emphasize","enable","enhance","ensure","entail","estimate","exclude",
  "expand","facilitate","formulate","generate","highlight","hypothesize","identify",
  "imply","impose","incorporate","increase","infer","influence","initiate","insert",
  "inspect","integrate","investigate","involve","justify","locate","manifest",
  "maximize","minimize","modify","monitor","motivate","observe","outline",
  "participate","perceive","perform","persuade","posit","precede","present",
  "preserve","proceed","promote","propose","prove","provide","pursue","qualify",
  "quantify","quote","react","recognize","recommend","record","reduce","refer",
  "reflect","refine","regard","reinforce","reject","relate","remain","render",
  "replace","report","represent","request","research","resolve","respond",
  "restrict","retain","retrieve","reveal","review","revise","select","separate",
  "signify","simplify","simulate","specify","state","stimulate","strengthen",
  "structure","submit","substitute","summarize","supplement","survey","sustain",
  "trace","transform","transmit","trigger","undermine","undertake","utilize",
  "validate","verify","yield","accumulate","accommodate","accompany","accomplish",
  "accord","account","acknowledge","adjust","administer","admit","advance",
  "anticipate","appreciate","approach","approve","approximate","arise","attach",
  "attempt","attend","attract","balance","bear","behave","belong","benefit",
  "brief","capture","carry","cause","claim","combine","commit","communicate",
  "compensate","compete","complain","complement","complete","complicate",
  "compose","compound","compute","conceive","concentrate","conclude","condemn",
  "configure","confine","conform","connect","consent","conserve","consist",
  "consolidate","construct","consult","consume","contact","contain","contemplate",
  "continue","contract","contradict","control","convert","cooperate","coordinate",
  "correct","correlate","correspond","cultivate","cycle","deal","decrease",
  "deduce","deduct","defend","delete","deliver","demand","denote","deny",
  "depend","depict","depress","deprive","derive","design","desire","destroy",
  "detect","deviate","devote","diagnose","dictate","differ","digress","direct",
  "disclose","discourage","discriminate","disperse","displace","dispose","dispute",
  "disrupt","dissolve","distort","distribute","diversify","divert","divide",
  "draft","drain","draw","drive","edit","educate","elaborate","elect","elevate",
  "eliminate","elicit","embed","embody","emerge","emit","emphasise","employ",
  "empower","enable","enact","encounter","encourage","endorse","enforce","engage",
  "enhance","enlarge","enlighten","enrich","ensure","entail","enter","entitle",
  "enumerate","equate","erase","erode","err","escalate","escape","establish",
  "estimate","evacuate","evaluate","evoke","evolve","exacerbate","exaggerate",
  "exceed","excel","exchange","excuse","execute","exemplify","exert","exhaust",
  "exhibit","exist","exit","expand","expect","expedite","expel","experience",
  "experiment","expire","explain","exploit","explore","export","expose","express",
  "extend","extract","fabricate","face","facilitate","fade","fail","fall",
  "familiarize","fashion","favor","fear","feature","feed","feel","fetch",
  "fight","figure","file","fill","filter","finance","find","finish","fit",
  "fix","flaw","float","flourish","flow","focus","fold","follow","force",
  "forecast","forget","form","format","foster","found","frame","free","freeze",
]);

function inferPos(word) {
  const w = word.toLowerCase();
  if (CONNECTORS.has(w)) return "connector";
  if (KNOWN_VERBS.has(w)) return "verb";
  if (w.endsWith("ly") && w.length > 4) return "adverb";
  if (/(tion|sion|ment|ness|ity|ism|ance|ence|ship|dom|hood|ure|age|al)$/.test(w))
    return "noun";
  if (/(able|ible|ive|ous|ent|ant|al|ic|ed|ful|less|ary|ory|ate|ine)$/.test(w))
    return "adjective";
  return "noun";
}

function normalizeLevel(level) {
  const L = (level || "B2").toUpperCase();
  if (["B1", "B2", "C1", "C2"].includes(L)) return L;
  if (L === "A2" || L === "A1") return "B1";
  return "B2";
}

const lineRe =
  /\{\s*word:\s*"([^"]+)"\s*,\s*arabic:\s*"([^"]+)"[^}]*level:\s*"([^"]+)"/g;

const rows = [];
const seen = new Set();
let m;
while ((m = lineRe.exec(text))) {
  const word = m[1];
  const key = word.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  rows.push({
    word,
    pos: inferPos(word),
    difficulty: normalizeLevel(m[3]),
    translationAr: m[2].split(/[,،]/)[0].trim(),
    provenance: "academic-core",
  });
}

rows.sort((a, b) => a.word.localeCompare(b.word));

const TARGET = 500;
const verbs = rows.filter((r) => r.pos === "verb");
const connectors = rows.filter((r) => r.pos === "connector");
const rest = rows.filter((r) => r.pos !== "verb" && r.pos !== "connector");
const picked = [];
const seenPick = new Set();
function pushUnique(list) {
  for (const r of list) {
    const k = r.word.toLowerCase();
    if (seenPick.has(k) || picked.length >= TARGET) continue;
    seenPick.add(k);
    picked.push(r);
  }
}
pushUnique(verbs);
pushUnique(connectors);
pushUnique(rest);

const outPath = path.join(__dirname, "word-bank.mjs");
const body = `/** Auto-built from vocabs.js — ${picked.length} curated rows */\nexport const WORD_BANK = ${JSON.stringify(picked, null, 2)};\n`;
fs.writeFileSync(outPath, body, "utf8");
console.log(`Wrote ${picked.length} bank rows → ${outPath}`);
console.log(
  "POS counts:",
  picked.reduce((acc, r) => {
    acc[r.pos] = (acc[r.pos] || 0) + 1;
    return acc;
  }, {})
);