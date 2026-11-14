import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const text = fs.readFileSync(path.join(root, "src/data/vocabs.js"), "utf8");
const re =
  /\{\s*word:\s*"([^"]+)",\s*arabic:\s*"([^"]+)"(?:,\s*english:\s*"([^"]*)")?/g;
const map = new Map();
let m;
while ((m = re.exec(text))) {
  const w = m[1].toLowerCase();
  if (!map.has(w)) {
    map.set(w, {
      word: m[1],
      arabic: m[2],
      english: m[3] || "",
    });
  }
}
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "vocabs-map.json");
fs.writeFileSync(out, JSON.stringify(Object.fromEntries(map), null, 2));
console.log("Wrote", Object.keys(map).length, "entries to", out);