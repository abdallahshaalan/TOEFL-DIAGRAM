/** IndexedDB-backed tool state with localStorage fallback + one-time migrate. */
import { getMeta, setMeta } from "@/lib/db";

const KEY_MAP = {
  lovedVocabs2: "toolLovedTopics",
  lovedAffixes_v2: "toolLovedAffixes",
  toeflPlan_v3: "toolStudyPlanV3",
};

export async function migrateToolLocalStorageOnce() {
  const done = await getMeta("toolsMigratedV1", false);
  if (done) return { migrated: false };

  for (const [lsKey, metaKey] of Object.entries(KEY_MAP)) {
    try {
      const raw = localStorage.getItem(lsKey);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const existing = await getMeta(metaKey, null);
      if (existing == null) await setMeta(metaKey, parsed);
    } catch {
      /* ignore */
    }
  }
  await setMeta("toolsMigratedV1", true);
  return { migrated: true };
}

export async function loadToolState(lsKey, fallback) {
  const metaKey = KEY_MAP[lsKey];
  if (metaKey) {
    const fromMeta = await getMeta(metaKey, null);
    if (fromMeta != null) return fromMeta;
  }
  try {
    const raw = localStorage.getItem(lsKey);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return fallback;
}

export async function saveToolState(lsKey, value) {
  const metaKey = KEY_MAP[lsKey];
  if (metaKey) await setMeta(metaKey, value);
  try {
    localStorage.setItem(lsKey, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}
